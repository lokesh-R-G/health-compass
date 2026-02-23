from django.urls import path
from . import views

urlpatterns = [
    path('profile', views.patient_profile, name='patient_profile'),
    path('history', views.patient_history, name='patient_history'),
    path('dashboard', views.patient_dashboard, name='patient_dashboard'),
]
