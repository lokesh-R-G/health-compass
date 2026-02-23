from rest_framework import serializers


class RegionRiskSerializer(serializers.Serializer):
    """Serializer for regional risk data."""
    region = serializers.CharField()
    risk_score = serializers.IntegerField()
    risk_level = serializers.CharField()
    total_cases = serializers.IntegerField()
    growth_rate = serializers.FloatField()
    is_anomaly = serializers.BooleanField()


class RiskTrendSerializer(serializers.Serializer):
    """Serializer for risk trend data."""
    date = serializers.CharField()
    score = serializers.IntegerField()
    cases = serializers.IntegerField(required=False)


class DiseaseDistributionSerializer(serializers.Serializer):
    """Serializer for disease distribution."""
    disease = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()


class EnvironmentalDataSerializer(serializers.Serializer):
    """Serializer for environmental data."""
    region = serializers.CharField()
    rainfall = serializers.FloatField()
    humidity = serializers.FloatField()
    temperature = serializers.FloatField()
    ph = serializers.FloatField()
    tds = serializers.FloatField()
    air_quality = serializers.CharField()


class AdminDashboardSerializer(serializers.Serializer):
    """Serializer for admin dashboard data."""
    total_patients = serializers.IntegerField()
    cases_today = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    avg_risk_score = serializers.IntegerField()
    cases_trend = RiskTrendSerializer(many=True)
    disease_distribution = DiseaseDistributionSerializer(many=True)
    region_risks = RegionRiskSerializer(many=True)
    water_quality = serializers.ListField()
    weather_data = serializers.DictField()
