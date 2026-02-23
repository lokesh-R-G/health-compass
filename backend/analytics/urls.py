from django.urls import path
from . import views

urlpatterns = [
    path('risk', views.region_risk, name='region_risk'),
    path('trend', views.region_trend, name='region_trend'),
    path('diseases', views.disease_distribution, name='disease_distribution'),
    path('environmental', views.environmental_data, name='environmental_data'),
]
