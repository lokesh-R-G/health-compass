from rest_framework import serializers


class NotificationSerializer(serializers.Serializer):
    """Serializer for notifications."""
    id = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    type = serializers.ChoiceField(choices=['risk', 'appointment', 'record', 'info'])
    title = serializers.CharField()
    message = serializers.CharField()
    is_read = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)
    level = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'critical'],
        required=False
    )
