from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from bson import ObjectId
from healthiq.mongodb import get_collection, Collections
from .serializers import (
    PatientProfileSerializer,
    MedicalRecordSerializer,
    CreateMedicalRecordSerializer,
    PatientDashboardSerializer
)


def serialize_mongo_doc(doc):
    """Convert MongoDB document to serializable format."""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def patient_profile(request):
    """Get or update patient profile."""
    if request.user.role != 'patient':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    patients = get_collection(Collections.PATIENTS)
    
    if request.method == 'GET':
        patient = patients.find_one({'user_id': request.user.id})
        if not patient:
            return Response({'message': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serialize_mongo_doc(patient))
    
    elif request.method == 'PUT':
        serializer = PatientProfileSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            update_data = {k: v for k, v in serializer.validated_data.items() if v}
            patients.update_one(
                {'user_id': request.user.id},
                {'$set': update_data}
            )
            patient = patients.find_one({'user_id': request.user.id})
            return Response(serialize_mongo_doc(patient))
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_history(request):
    """Get patient medical history."""
    if request.user.role != 'patient':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    records = get_collection(Collections.MEDICAL_RECORDS)
    patient_records = list(records.find({'patient_id': request.user.id}).sort('created_at', -1))
    
    return Response([serialize_mongo_doc(r) for r in patient_records])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_medical_record(request):
    """Add a new medical record."""
    if request.user.role != 'patient':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CreateMedicalRecordSerializer(data=request.data)
    if serializer.is_valid():
        records = get_collection(Collections.MEDICAL_RECORDS)
        patients = get_collection(Collections.PATIENTS)
        
        patient = patients.find_one({'user_id': request.user.id})
        patient_name = patient.get('name', '') if patient else ''
        patient_region = patient.get('region', '') if patient else ''
        
        record = {
            'patient_id': request.user.id,
            'patient_name': patient_name,
            'patient_region': patient_region,
            'diagnosis': serializer.validated_data['diagnosis'],
            'medication': serializer.validated_data['medication'],
            'hospital': serializer.validated_data['hospital'],
            'date': serializer.validated_data['date'],
            'status': 'pending',
            'created_at': datetime.utcnow(),
            'doctor_notes': ''
        }
        
        result = records.insert_one(record)
        record['_id'] = result.inserted_id
        
        # Create notification for doctors about new pending record
        notifications = get_collection(Collections.NOTIFICATIONS)
        # Notify all doctors (in production, would filter by region)
        from accounts.models import User
        doctors = User.objects.filter(role='doctor')
        for doctor in doctors:
            notifications.insert_one({
                'user_id': doctor.id,
                'type': 'record',
                'title': 'New medical record pending review',
                'message': f'A new medical record from {patient_name} requires approval.',
                'is_read': False,
                'created_at': datetime.utcnow(),
                'level': 'low'
            })
        
        return Response(serialize_mongo_doc(record), status=status.HTTP_201_CREATED)
    
    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_dashboard(request):
    """Get patient dashboard data."""
    if request.user.role != 'patient':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    patients = get_collection(Collections.PATIENTS)
    regional_stats = get_collection(Collections.REGIONAL_STATS)
    weather = get_collection(Collections.WEATHER_DATA)
    water = get_collection(Collections.WATER_QUALITY)
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    patient = patients.find_one({'user_id': request.user.id})
    region = patient.get('region', 'Chennai_South') if patient else 'Chennai_South'
    
    # Get latest regional stats
    latest_stat = regional_stats.find_one(
        {'region': region, 'disease': 'ALL'},
        sort=[('updated_at', -1)]
    )
    
    # Get weather data
    weather_data = weather.find_one({'region': region}, sort=[('date', -1)])
    
    # Get water quality
    water_data = water.find_one({'region': region}, sort=[('date', -1)])
    
    # Get risk trend (last 7 days)
    from datetime import timedelta
    trend_stats = list(regional_stats.find(
        {'region': region, 'disease': 'ALL'}
    ).sort('updated_at', -1).limit(7))
    
    risk_trend = [
        {'date': s.get('date', ''), 'risk_score': s.get('risk_score', 0)}
        for s in reversed(trend_stats)
    ]
    
    # Get alerts (recent notifications marked as risk)
    alerts = list(notifications.find(
        {'user_id': request.user.id, 'type': 'risk'}
    ).sort('created_at', -1).limit(5))
    
    # Default values if no data
    risk_score = latest_stat.get('risk_score', 50) if latest_stat else 50
    
    def get_risk_level(score):
        if score >= 76:
            return 'critical'
        elif score >= 51:
            return 'high'
        elif score >= 26:
            return 'medium'
        return 'low'
    
    return Response({
        'risk_score': risk_score,
        'risk_level': get_risk_level(risk_score),
        'rainfall': weather_data.get('rainfall', 0) if weather_data else 0,
        'humidity': weather_data.get('humidity', 0) if weather_data else 0,
        'water_ph': water_data.get('ph', 7.0) if water_data else 7.0,
        'water_tds': water_data.get('tds', 0) if water_data else 0,
        'trends': risk_trend,
        'alerts': [serialize_mongo_doc(a) for a in alerts],
        'region': region
    })
