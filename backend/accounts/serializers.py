from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'phone']
    
    def get_name(self, obj):
        return obj.get_full_name()


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration."""
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False)
    dob = serializers.CharField(required=False)
    gender = serializers.CharField(required=False)
    blood_group = serializers.CharField(required=False)
    region = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=['patient', 'doctor', 'admin'], default='patient')
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def create(self, validated_data):
        name_parts = validated_data['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role=validated_data.get('role', 'patient'),
            phone=validated_data.get('phone', ''),
        )
        
        # Store additional patient data in MongoDB if role is patient
        if user.role == 'patient':
            from healthiq.mongodb import get_collection, Collections
            patients_collection = get_collection(Collections.PATIENTS)
            patients_collection.insert_one({
                'user_id': user.id,
                'email': user.email,
                'name': validated_data['name'],
                'phone': validated_data.get('phone', ''),
                'dob': validated_data.get('dob', ''),
                'gender': validated_data.get('gender', ''),
                'blood_group': validated_data.get('blood_group', ''),
                'region': validated_data.get('region', ''),
            })
        elif user.role == 'doctor':
            from healthiq.mongodb import get_collection, Collections
            doctors_collection = get_collection(Collections.DOCTORS)
            doctors_collection.insert_one({
                'user_id': user.id,
                'email': user.email,
                'name': validated_data['name'],
                'phone': validated_data.get('phone', ''),
                'specialization': validated_data.get('specialization', 'General Medicine'),
                'region': validated_data.get('region', ''),
                'available_dates': [],
            })
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        data['user'] = user
        return data


class TokenSerializer(serializers.Serializer):
    """Serializer for JWT tokens."""
    access = serializers.CharField()
    refresh = serializers.CharField()


def get_tokens_for_user(user):
    """Generate JWT tokens for a user with custom claims."""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['email'] = user.email
    refresh['name'] = user.get_full_name()
    refresh['role'] = user.role
    
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
