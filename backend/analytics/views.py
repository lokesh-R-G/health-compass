from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta
from healthiq.mongodb import get_collection, Collections
from accounts.models import User


def serialize_mongo_doc(doc):
    """Convert MongoDB document to serializable format."""
    if doc is None:
        return None
    if '_id' in doc:
        doc['id'] = str(doc.pop('_id'))
    return doc


def get_risk_level(score):
    """Convert risk score to risk level."""
    if score >= 76:
        return 'critical'
    elif score >= 51:
        return 'high'
    elif score >= 26:
        return 'medium'
    return 'low'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def region_risk(request):
    """Get risk data for all regions."""
    regional_stats = get_collection(Collections.REGIONAL_STATS)
    
    # Get latest stats for each region (new region names)
    regions = ['Chennai_South', 'Chennai_Central', 'Coimbatore']
    result = []
    
    for region in regions:
        stat = regional_stats.find_one({'region': region, 'disease': 'ALL'}, sort=[('updated_at', -1)])
        if stat:
            result.append({
                'region_id': region,
                'region': region.replace('_', ' '),
                'risk_score': stat.get('risk_score', 50),
                'risk_level': get_risk_level(stat.get('risk_score', 50)),
                'total_cases': stat.get('total_cases', 0),
                'growth_rate': stat.get('growth_rate', 0),
                'is_anomaly': stat.get('is_anomaly', False)
            })
        else:
            # Default data if no stats exist
            result.append({
                'region_id': region,
                'region': region.replace('_', ' '),
                'risk_score': 50,
                'risk_level': 'medium',
                'total_cases': 0,
                'growth_rate': 0,
                'is_anomaly': False
            })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def region_trend(request):
    """Get risk trend data."""
    regional_stats = get_collection(Collections.REGIONAL_STATS)
    
    region = request.GET.get('region')
    days = int(request.GET.get('days', 7))
    
    query = {'disease': 'ALL'}
    if region:
        # Handle both underscore and space formats
        query['region'] = region.replace(' ', '_') if ' ' in region else region
    
    # Get stats for the last N days
    date_limit = (datetime.utcnow() - timedelta(days=days)).strftime('%Y-%m-%d')
    # For now, get all available stats since data is seeded with fixed dates
    
    stats = list(regional_stats.find(query).sort('updated_at', -1).limit(7))
    
    # Aggregate by date
    trend_map = {}
    for stat in stats:
        date = stat.get('date', '')
        if date not in trend_map:
            trend_map[date] = {'date': date, 'score': 0, 'cases': 0, 'count': 0}
        trend_map[date]['score'] += stat.get('risk_score', 0)
        trend_map[date]['cases'] += stat.get('total_cases', 0)
        trend_map[date]['count'] += 1
    
    # Calculate averages
    result = []
    for date, data in sorted(trend_map.items()):
        result.append({
            'date': date,
            'score': int(data['score'] / data['count']) if data['count'] > 0 else 0,
            'cases': data['cases']
        })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_risk_overview(request):
    """Get admin dashboard data."""
    if request.user.role != 'admin':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    patients = get_collection(Collections.PATIENTS)
    medical_records = get_collection(Collections.MEDICAL_RECORDS)
    regional_stats = get_collection(Collections.REGIONAL_STATS)
    notifications = get_collection(Collections.NOTIFICATIONS)
    weather = get_collection(Collections.WEATHER_DATA)
    water = get_collection(Collections.WATER_QUALITY)
    
    # Total patients
    total_patients = patients.count_documents({})
    
    # Cases today (approved records from today)
    today = datetime.utcnow().strftime('%Y-%m-%d')
    cases_today = medical_records.count_documents({
        'status': 'approved',
        'date': today
    })
    
    # Active alerts (unread risk notifications)
    active_alerts = notifications.count_documents({
        'type': 'risk',
        'is_read': False
    })
    
    # Average risk score (new region names)
    regions = ['Chennai_South', 'Chennai_Central', 'Coimbatore']
    total_risk = 0
    region_risks = []
    
    for region in regions:
        stat = regional_stats.find_one({'region': region, 'disease': 'ALL'}, sort=[('updated_at', -1)])
        risk_score = stat.get('risk_score', 50) if stat else 50
        total_risk += risk_score
        region_risks.append({
            'region': region.replace('_', ' '),
            'score': risk_score,
            'level': get_risk_level(risk_score),
            'cases': stat.get('total_cases', 0) if stat else 0
        })
    
    avg_risk_score = int(total_risk / len(regions)) if regions else 0
    
    # Cases trend (last 7 days)
    cases_trend = []
    for i in range(6, -1, -1):
        date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
        date_display = (datetime.utcnow() - timedelta(days=i)).strftime('%b %d')
        cases = medical_records.count_documents({'status': 'approved', 'date': date})
        cases_trend.append({'date': date_display, 'cases': cases})
    
    # Disease distribution
    pipeline = [
        {'$match': {'status': 'approved'}},
        {'$group': {'_id': '$diagnosis', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 5}
    ]
    disease_counts = list(medical_records.aggregate(pipeline))
    total_diseases = sum(d['count'] for d in disease_counts)
    disease_distribution = [
        {
            'name': d['_id'],
            'value': int((d['count'] / total_diseases) * 100) if total_diseases > 0 else 0
        }
        for d in disease_counts
    ]
    
    # Water quality
    water_quality = []
    for region in regions:
        data = water.find_one({'region': region}, sort=[('date', -1)])
        water_quality.append({
            'region': region.replace('_', ' '),
            'ph': data.get('ph', 7.0) if data else 7.0,
            'tds': data.get('tds', 300) if data else 300
        })
    
    # Weather data (average or latest)
    weather_data_result = {}
    latest_weather = weather.find_one({}, sort=[('date', -1)])
    if latest_weather:
        weather_data_result = {
            'rainfall': latest_weather.get('rainfall', 0),
            'humidity': latest_weather.get('humidity', 0),
            'temperature': latest_weather.get('temperature', 0),
            'air_quality': latest_weather.get('air_quality', 'Good')
        }
    else:
        weather_data_result = {
            'rainfall': 45,
            'humidity': 78,
            'temperature': 32,
            'air_quality': 'Good'
        }
    
    return Response({
        'total_patients': total_patients,
        'cases_today': cases_today,
        'active_alerts': active_alerts,
        'avg_risk_score': avg_risk_score,
        'cases_trend': cases_trend,
        'disease_distribution': disease_distribution,
        'region_risks': region_risks,
        'water_quality': water_quality,
        'weather_data': weather_data_result
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def disease_distribution(request):
    """Get disease distribution data."""
    medical_records = get_collection(Collections.MEDICAL_RECORDS)
    
    pipeline = [
        {'$match': {'status': 'approved'}},
        {'$group': {'_id': '$diagnosis', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 10}
    ]
    
    disease_counts = list(medical_records.aggregate(pipeline))
    total = sum(d['count'] for d in disease_counts)
    
    result = [
        {
            'disease': d['_id'],
            'count': d['count'],
            'percentage': round((d['count'] / total) * 100, 1) if total > 0 else 0
        }
        for d in disease_counts
    ]
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def environmental_data(request):
    """Get environmental data."""
    weather = get_collection(Collections.WEATHER_DATA)
    water = get_collection(Collections.WATER_QUALITY)
    
    region = request.GET.get('region')
    
    if region:
        region_key = region.replace(' ', '_') if ' ' in region else region
        weather_data = weather.find_one({'region': region_key}, sort=[('date', -1)])
        water_data = water.find_one({'region': region_key}, sort=[('date', -1)])
        
        result = [{
            'region_id': region_key,
            'region': region_key.replace('_', ' '),
            'rainfall': weather_data.get('rainfall', 0) if weather_data else 0,
            'humidity': weather_data.get('humidity', 0) if weather_data else 0,
            'temperature': weather_data.get('temperature', 0) if weather_data else 0,
            'water_ph': water_data.get('ph', 7.0) if water_data else 7.0,
            'tds': water_data.get('tds', 0) if water_data else 0,
            'air_quality': weather_data.get('air_quality', 'Good') if weather_data else 'Good'
        }]
    else:
        regions = ['Chennai_South', 'Chennai_Central', 'Coimbatore']
        result = []
        
        for r in regions:
            weather_data = weather.find_one({'region': r}, sort=[('date', -1)])
            water_data = water.find_one({'region': r}, sort=[('date', -1)])
            
            result.append({
                'region_id': r,
                'region': r.replace('_', ' '),
                'rainfall': weather_data.get('rainfall', 0) if weather_data else 0,
                'humidity': weather_data.get('humidity', 0) if weather_data else 0,
                'temperature': weather_data.get('temperature', 0) if weather_data else 0,
                'water_ph': water_data.get('ph', 7.0) if water_data else 7.0,
                'tds': water_data.get('tds', 0) if water_data else 0,
                'air_quality': weather_data.get('air_quality', 'Good') if weather_data else 'Good'
            })
    
    return Response(result)
