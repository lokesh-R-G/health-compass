from rest_framework import serializers
from datetime import datetime


class PatientProfileSerializer(serializers.Serializer):
    """Serializer for patient profile."""
    id = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    email = serializers.EmailField(read_only=True)
    phone = serializers.CharField(required=False)
    dob = serializers.CharField(required=False)
    gender = serializers.CharField(required=False)
    blood_group = serializers.CharField(required=False)
    region = serializers.CharField(required=False)


class MedicalRecordSerializer(serializers.Serializer):
    """Serializer for medical records."""
    id = serializers.CharField(read_only=True)
    patient_id = serializers.IntegerField(read_only=True)
    patient_name = serializers.CharField(read_only=True)
    diagnosis = serializers.CharField()
    medication = serializers.CharField()
    hospital = serializers.CharField()
    date = serializers.CharField()
    status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected'],
        default='pending',
        read_only=True
    )
    created_at = serializers.DateTimeField(read_only=True)
    doctor_notes = serializers.CharField(required=False, allow_blank=True)


class CreateMedicalRecordSerializer(serializers.Serializer):
    """Serializer for creating medical records."""
    diagnosis = serializers.CharField()
    medication = serializers.CharField()
    hospital = serializers.CharField()
    date = serializers.CharField()


class PatientDashboardSerializer(serializers.Serializer):
    """Serializer for patient dashboard data."""
    risk_score = serializers.IntegerField()
    risk_level = serializers.CharField()
    rainfall = serializers.FloatField()
    humidity = serializers.FloatField()
    water_ph = serializers.FloatField()
    water_tds = serializers.FloatField()
    risk_trend = serializers.ListField()
    alerts = serializers.ListField()
    region = serializers.CharField()
