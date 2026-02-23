"""
Risk Engine - Calculate regional health risk scores and detect anomalies.

This module provides functions for:
1. Calculating disease growth rates
2. Detecting anomalies using statistical methods
3. Computing overall risk scores
4. Updating regional statistics
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import statistics
from healthiq.mongodb import get_collection, Collections


def get_risk_level(score: int) -> str:
    """Convert risk score to risk level."""
    if score >= 76:
        return 'critical'
    elif score >= 51:
        return 'high'
    elif score >= 26:
        return 'medium'
    return 'low'


def calculate_growth_rate(today_cases: int, yesterday_cases: int) -> float:
    """Calculate disease growth rate."""
    if yesterday_cases == 0:
        return 0.0 if today_cases == 0 else 100.0
    return ((today_cases - yesterday_cases) / yesterday_cases) * 100


def detect_anomaly(current_value: float, historical_values: List[float], std_multiplier: float = 2.0) -> bool:
    """
    Detect if current value is an anomaly using statistical method.
    
    Args:
        current_value: The current value to check
        historical_values: List of historical values
        std_multiplier: Number of standard deviations for threshold
    
    Returns:
        True if anomaly detected, False otherwise
    """
    if len(historical_values) < 2:
        return False
    
    try:
        mean = statistics.mean(historical_values)
        std = statistics.stdev(historical_values)
        threshold = mean + (std_multiplier * std)
        return current_value > threshold
    except statistics.StatisticsError:
        return False


def normalize_value(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0-100 scale."""
    if max_val == min_val:
        return 50.0
    normalized = ((value - min_val) / (max_val - min_val)) * 100
    return max(0, min(100, normalized))


def calculate_risk_score(
    growth_rate: float,
    rainfall: float,
    humidity: float,
    water_quality_anomaly: bool,
    is_disease_anomaly: bool
) -> int:
    """
    Calculate regional health risk score.
    
    Formula:
    RiskScore = 0.5 × DiseaseGrowthRate + 0.2 × RainfallIndex + 0.2 × HumidityIndex + 0.1 × WaterQualityAnomaly
    
    Args:
        growth_rate: Disease growth rate percentage
        rainfall: Rainfall in mm (0-200 range expected)
        humidity: Humidity percentage (0-100)
        water_quality_anomaly: True if water quality is abnormal
        is_disease_anomaly: True if disease outbreak detected
    
    Returns:
        Risk score from 0-100
    """
    # Normalize growth rate (assume -50% to +100% range)
    normalized_growth = normalize_value(growth_rate, -50, 100)
    
    # Normalize rainfall (higher rainfall = higher risk for waterborne diseases)
    normalized_rainfall = normalize_value(rainfall, 0, 200)
    
    # Humidity is already normalized (0-100)
    normalized_humidity = humidity
    
    # Water quality anomaly adds to risk
    water_quality_factor = 100 if water_quality_anomaly else 0
    
    # Calculate weighted score
    score = (
        0.5 * normalized_growth +
        0.2 * normalized_rainfall +
        0.2 * normalized_humidity +
        0.1 * water_quality_factor
    )
    
    # Add bonus for disease anomaly
    if is_disease_anomaly:
        score = min(100, score + 20)
    
    return int(max(0, min(100, score)))


def update_regional_risk(region: str) -> Dict:
    """
    Update risk score for a specific region.
    
    Args:
        region: The region name
    
    Returns:
        Updated regional statistics
    """
    regional_stats = get_collection(Collections.REGIONAL_STATS)
    weather = get_collection(Collections.WEATHER_DATA)
    water = get_collection(Collections.WATER_QUALITY)
    
    today = datetime.utcnow().strftime('%Y-%m-%d')
    
    # Get today's stats
    today_stat = regional_stats.find_one({'region': region, 'date': today})
    if not today_stat:
        return None
    
    today_cases = today_stat.get('total_cases', 0)
    
    # Get yesterday's cases
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    yesterday_stat = regional_stats.find_one({'region': region, 'date': yesterday})
    yesterday_cases = yesterday_stat.get('total_cases', 0) if yesterday_stat else 0
    
    # Get last 7 days for anomaly detection
    last_7_days = [(datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, 8)]
    historical_cases = []
    for date in last_7_days:
        stat = regional_stats.find_one({'region': region, 'date': date})
        if stat:
            historical_cases.append(stat.get('total_cases', 0))
    
    # Calculate growth rate
    growth_rate = calculate_growth_rate(today_cases, yesterday_cases)
    
    # Detect disease anomaly
    is_anomaly = detect_anomaly(today_cases, historical_cases)
    
    # Get environmental data
    weather_data = weather.find_one({'region': region}, sort=[('date', -1)])
    water_data = water.find_one({'region': region}, sort=[('date', -1)])
    
    rainfall = weather_data.get('rainfall', 0) if weather_data else 0
    humidity = weather_data.get('humidity', 50) if weather_data else 50
    
    # Check water quality anomaly (pH outside 6.5-8.5 or TDS > 500)
    water_quality_anomaly = False
    if water_data:
        ph = water_data.get('ph', 7.0)
        tds = water_data.get('tds', 0)
        water_quality_anomaly = ph < 6.5 or ph > 8.5 or tds > 500
    
    # Calculate risk score
    risk_score = calculate_risk_score(growth_rate, rainfall, humidity, water_quality_anomaly, is_anomaly)
    risk_level = get_risk_level(risk_score)
    
    # Update regional stat
    regional_stats.update_one(
        {'region': region, 'date': today},
        {
            '$set': {
                'risk_score': risk_score,
                'risk_level': risk_level,
                'growth_rate': growth_rate,
                'is_anomaly': is_anomaly,
                'rainfall': rainfall,
                'humidity': humidity,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    # Trigger alerts if risk is high
    if risk_score >= 75 or is_anomaly:
        from analytics.alerts import create_risk_alert
        create_risk_alert(region, risk_score, risk_level, is_anomaly)
    
    return {
        'region': region,
        'risk_score': risk_score,
        'risk_level': risk_level,
        'total_cases': today_cases,
        'growth_rate': growth_rate,
        'is_anomaly': is_anomaly
    }


def run_risk_engine():
    """Run risk engine for all regions."""
    regions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region']
    results = []
    
    for region in regions:
        result = update_regional_risk(region)
        if result:
            results.append(result)
    
    return results
