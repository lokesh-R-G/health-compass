from rest_framework import serializers


class DoctorSerializer(serializers.Serializer):
    """Serializer for doctor profiles."""
    id = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    email = serializers.EmailField(read_only=True)
    specialization = serializers.CharField()
    region = serializers.CharField()
    available_dates = serializers.ListField(child=serializers.CharField())


class PendingRecordSerializer(serializers.Serializer):
    """Serializer for pending medical records."""
    id = serializers.CharField(read_only=True)
    patient_id = serializers.IntegerField(read_only=True)
    patient_name = serializers.CharField()
    patient_region = serializers.CharField()
    diagnosis = serializers.CharField()
    medication = serializers.CharField()
    hospital = serializers.CharField()
    date = serializers.CharField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()


class ApproveRejectSerializer(serializers.Serializer):
    """Serializer for approve/reject action."""
    record_id = serializers.CharField()
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    notes = serializers.CharField(required=False, allow_blank=True)
