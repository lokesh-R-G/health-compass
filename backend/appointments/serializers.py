from rest_framework import serializers


class AppointmentSerializer(serializers.Serializer):
    """Serializer for appointments."""
    id = serializers.CharField(read_only=True)
    patient_id = serializers.IntegerField(read_only=True)
    patient_name = serializers.CharField(read_only=True)
    doctor_id = serializers.IntegerField()
    doctor_name = serializers.CharField(read_only=True)
    appointment_date = serializers.CharField()
    appointment_time = serializers.CharField(required=False)
    status = serializers.ChoiceField(
        choices=['pending', 'confirmed', 'cancelled', 'completed'],
        default='pending',
        read_only=True
    )
    created_at = serializers.DateTimeField(read_only=True)


class BookAppointmentSerializer(serializers.Serializer):
    """Serializer for booking appointments."""
    doctor_id = serializers.IntegerField()
    appointment_date = serializers.CharField()
    appointment_time = serializers.CharField(required=False, default='10:00 AM')
    reason = serializers.CharField(required=False, default='')
