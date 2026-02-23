from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from bson import ObjectId
from healthiq.mongodb import get_collection, Collections
from .serializers import AppointmentSerializer, BookAppointmentSerializer


def serialize_mongo_doc(doc):
    """Convert MongoDB document to serializable format."""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    """Book an appointment with a doctor."""
    if request.user.role != 'patient':
        return Response({'message': 'Only patients can book appointments'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = BookAppointmentSerializer(data=request.data)
    if serializer.is_valid():
        appointments = get_collection(Collections.APPOINTMENTS)
        doctors = get_collection(Collections.DOCTORS)
        patients = get_collection(Collections.PATIENTS)
        notifications = get_collection(Collections.NOTIFICATIONS)
        
        doctor_id = serializer.validated_data['doctor_id']
        appointment_date = serializer.validated_data['appointment_date']
        appointment_time = serializer.validated_data.get('appointment_time', '10:00 AM')
        
        # Get doctor info
        doctor = doctors.find_one({'user_id': doctor_id})
        if not doctor:
            return Response({'message': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get patient info
        patient = patients.find_one({'user_id': request.user.id})
        patient_name = patient.get('name', '') if patient else ''
        
        # Check if appointment slot is available
        existing = appointments.find_one({
            'doctor_id': doctor_id,
            'appointment_date': appointment_date,
            'appointment_time': appointment_time,
            'status': {'$nin': ['cancelled']}
        })
        
        if existing:
            return Response({'message': 'This slot is already booked'}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment = {
            'patient_id': request.user.id,
            'patient_name': patient_name,
            'doctor_id': doctor_id,
            'doctor_name': doctor.get('name', ''),
            'appointment_date': appointment_date,
            'appointment_time': appointment_time,
            'reason': serializer.validated_data.get('reason', ''),
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
        
        result = appointments.insert_one(appointment)
        appointment['_id'] = result.inserted_id
        
        # Notify the doctor
        notifications.insert_one({
            'user_id': doctor_id,
            'type': 'appointment',
            'title': 'New appointment request',
            'message': f'{patient_name} has requested an appointment on {appointment_date} at {appointment_time}.',
            'is_read': False,
            'created_at': datetime.utcnow(),
            'level': 'low'
        })
        
        return Response(serialize_mongo_doc(appointment), status=status.HTTP_201_CREATED)
    
    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_appointments(request):
    """List appointments for the current user."""
    appointments = get_collection(Collections.APPOINTMENTS)
    
    if request.user.role == 'patient':
        apt_list = list(appointments.find({'patient_id': request.user.id}).sort('appointment_date', -1))
    elif request.user.role == 'doctor':
        apt_list = list(appointments.find({'doctor_id': request.user.id}).sort('appointment_date', -1))
    else:
        apt_list = list(appointments.find().sort('appointment_date', -1))
    
    return Response([serialize_mongo_doc(a) for a in apt_list])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    """Cancel an appointment."""
    appointments = get_collection(Collections.APPOINTMENTS)
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    try:
        appointment = appointments.find_one({'_id': ObjectId(appointment_id)})
    except:
        return Response({'message': 'Invalid appointment ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not appointment:
        return Response({'message': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user owns this appointment
    if request.user.role == 'patient' and appointment['patient_id'] != request.user.id:
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    appointments.update_one(
        {'_id': ObjectId(appointment_id)},
        {'$set': {'status': 'cancelled', 'updated_at': datetime.utcnow()}}
    )
    
    # Notify the other party
    notify_user_id = appointment['doctor_id'] if request.user.role == 'patient' else appointment['patient_id']
    notifications.insert_one({
        'user_id': notify_user_id,
        'type': 'appointment',
        'title': 'Appointment cancelled',
        'message': f'The appointment on {appointment["appointment_date"]} has been cancelled.',
        'is_read': False,
        'created_at': datetime.utcnow(),
        'level': 'medium'
    })
    
    updated = appointments.find_one({'_id': ObjectId(appointment_id)})
    return Response(serialize_mongo_doc(updated))
