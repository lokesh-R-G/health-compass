from pymongo import MongoClient
from django.conf import settings

_client = None
_db = None


def get_db():
    """Get MongoDB database connection."""
    global _client, _db
    
    if _db is None:
        _client = MongoClient(settings.MONGODB_URI)
        _db = _client[settings.MONGODB_NAME]
    
    return _db


def get_collection(collection_name: str):
    """Get a MongoDB collection."""
    return get_db()[collection_name]


def close_connection():
    """Close MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None


# Collection names constants
class Collections:
    PATIENTS = 'patients'
    MEDICAL_RECORDS = 'medical_records'
    DOCTORS = 'doctors'
    APPOINTMENTS = 'appointments'
    REGIONAL_STATS = 'regional_stats'
    WEATHER_DATA = 'weather_data'
    WATER_QUALITY = 'water_quality'
    NOTIFICATIONS = 'notifications'
