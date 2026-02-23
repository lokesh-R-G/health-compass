from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_doctors, name='list_doctors'),
    path('<str:doctor_id>/slots', views.doctor_slots, name='doctor_slots'),
    path('pending', views.pending_records, name='pending_records'),
    path('approve', views.approve_reject_record, name='approve_reject'),
    path('approve/<str:record_id>', views.approve_record, name='approve_record'),
    path('reject/<str:record_id>', views.reject_record, name='reject_record'),
    path('patient/<str:patient_id>/history', views.patient_history_for_doctor, name='patient_history_doctor'),
    path('appointments', views.doctor_appointments, name='doctor_appointments'),
    path('appointment/update', views.update_appointment_status, name='update_appointment'),
]
