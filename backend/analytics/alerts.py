"""
Alert System - Create and manage health alerts.
"""

from datetime import datetime
from healthiq.mongodb import get_collection, Collections


def create_risk_alert(region: str, risk_score: int, risk_level: str, is_anomaly: bool):
    """
    Create risk alerts for users in a region.
    
    Args:
        region: The affected region
        risk_score: The calculated risk score
        risk_level: The risk level (low/medium/high/critical)
        is_anomaly: Whether an anomaly was detected
    """
    notifications = get_collection(Collections.NOTIFICATIONS)
    patients = get_collection(Collections.PATIENTS)
    
    # Get all patients in the region
    region_patients = list(patients.find({'region': region}))
    
    # Create alert message
    if is_anomaly:
        title = f'Disease outbreak alert in {region}'
        message = f'An unusual increase in disease cases has been detected in your region. Risk score: {risk_score}. Please take precautions.'
    else:
        title = f'High health risk alert for {region}'
        message = f'The health risk level in your region is {risk_level}. Risk score: {risk_score}. Stay informed and take necessary precautions.'
    
    # Create notification for each patient
    for patient in region_patients:
        notifications.insert_one({
            'user_id': patient['user_id'],
            'type': 'risk',
            'title': title,
            'message': message,
            'is_read': False,
            'created_at': datetime.utcnow(),
            'level': risk_level
        })


def create_system_alert(title: str, message: str, level: str = 'medium'):
    """Create a system-wide alert for admins."""
    notifications = get_collection(Collections.NOTIFICATIONS)
    from accounts.models import User
    
    admins = User.objects.filter(role='admin')
    
    for admin in admins:
        notifications.insert_one({
            'user_id': admin.id,
            'type': 'info',
            'title': title,
            'message': message,
            'is_read': False,
            'created_at': datetime.utcnow(),
            'level': level
        })
