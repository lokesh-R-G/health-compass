"""
URL configuration for HealthIQ project.
Regional Health Intelligence & Emergency Medical System
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({'status': 'ok', 'message': 'HealthIQ API is running'})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root - welcome page."""
    return Response({
        'name': 'HealthIQ API',
        'version': '1.0.0',
        'description': 'Regional Health Intelligence & Emergency Medical System',
        'status': 'running',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth/',
            'patient': '/api/patient/',
            'doctor': '/api/doctor/',
            'appointments': '/api/appointment/',
            'analytics': '/api/analytics/',
            'notifications': '/api/notifications/',
        },
        'frontend': 'http://localhost:8081'
    })


# Import views directly for specific endpoints
from patients.views import add_medical_record
from analytics.views import admin_risk_overview

urlpatterns = [
    # Root
    path('', api_root, name='api_root'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('api/health', health_check, name='health_check'),
    
    # Authentication
    path('api/auth/', include('accounts.urls')),
    
    # Patient endpoints
    path('api/patient/', include('patients.urls')),
    path('api/medical-record', add_medical_record, name='add_medical_record'),
    
    # Doctor endpoints
    path('api/doctor/', include('doctors.urls')),
    path('api/doctors', include('doctors.urls')),
    
    # Appointment endpoints
    path('api/appointment/', include('appointments.urls')),
    
    # Analytics endpoints
    path('api/region/', include('analytics.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/admin/risk-overview', admin_risk_overview, name='admin_risk_overview'),
    
    # Notification endpoints
    path('api/notifications/', include('notifications.urls')),
    path('api/notifications', include('notifications.urls')),
]
