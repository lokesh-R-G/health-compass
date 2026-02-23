from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from bson import ObjectId
from healthiq.mongodb import get_collection, Collections
from .serializers import DoctorSerializer, PendingRecordSerializer, ApproveRejectSerializer


def serialize_mongo_doc(doc):
    """Convert MongoDB document to serializable format."""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_doctors(request):
    """List all doctors with optional filters."""
    doctors = get_collection(Collections.DOCTORS)
    
    query = {}
    if request.GET.get('specialization'):
        query['specialization'] = request.GET.get('specialization')
    if request.GET.get('region'):
        query['region'] = request.GET.get('region')
    
    doctor_list = list(doctors.find(query))
    return Response([serialize_mongo_doc(d) for d in doctor_list])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_slots(request, doctor_id):
    """Get available slots for a doctor."""
    doctors = get_collection(Collections.DOCTORS)
    
    try:
        doctor = doctors.find_one({'_id': ObjectId(doctor_id)})
    except:
        doctor = doctors.find_one({'user_id': int(doctor_id)})
    
    if not doctor:
        return Response({'message': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(doctor.get('available_dates', []))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_records(request):
    """Get pending medical records for doctor approval."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    records = get_collection(Collections.MEDICAL_RECORDS)
    pending = list(records.find({'status': 'pending'}).sort('created_at', -1))
    
    return Response([serialize_mongo_doc(r) for r in pending])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_reject_record(request):
    """Approve or reject a medical record."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ApproveRejectSerializer(data=request.data)
    if serializer.is_valid():
        record_id = serializer.validated_data['record_id']
        action = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        
        records = get_collection(Collections.MEDICAL_RECORDS)
        notifications = get_collection(Collections.NOTIFICATIONS)
        
        try:
            record = records.find_one({'_id': ObjectId(record_id)})
        except:
            return Response({'message': 'Invalid record ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not record:
            return Response({'message': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = 'approved' if action == 'approve' else 'rejected'
        
        records.update_one(
            {'_id': ObjectId(record_id)},
            {
                '$set': {
                    'status': new_status,
                    'doctor_notes': notes,
                    'reviewed_by': request.user.id,
                    'reviewed_at': datetime.utcnow()
                }
            }
        )
        
        # Notify the patient
        notifications.insert_one({
            'user_id': record['patient_id'],
            'type': 'record',
            'title': f'Medical record {new_status}',
            'message': f'Your medical record for "{record["diagnosis"]}" has been {new_status} by a doctor.' + (f' Notes: {notes}' if notes else ''),
            'is_read': False,
            'created_at': datetime.utcnow(),
            'level': 'low' if new_status == 'approved' else 'medium'
        })
        
        updated_record = records.find_one({'_id': ObjectId(record_id)})
        return Response(serialize_mongo_doc(updated_record))
    
    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_history_for_doctor(request, patient_id):
    """Get patient history (read-only for doctors)."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    records = get_collection(Collections.MEDICAL_RECORDS)
    # Try to find by patient_id (could be string or int)
    try:
        patient_id_int = int(patient_id)
        query = {'patient_id': patient_id_int, 'status': 'approved'}
    except ValueError:
        query = {'patient_id': patient_id, 'status': 'approved'}
    
    patient_records = list(records.find(query).sort('created_at', -1))
    
    return Response([serialize_mongo_doc(r) for r in patient_records])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """Get appointments for the logged-in doctor."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    appointments = get_collection(Collections.APPOINTMENTS)
    apt_list = list(appointments.find({'doctor_id': request.user.id}).sort('appointment_date', -1))
    
    # Enrich with patient names
    patients = get_collection(Collections.PATIENTS)
    for apt in apt_list:
        patient = patients.find_one({'user_id': apt['patient_id']})
        apt['patient_name'] = patient.get('name', 'Unknown') if patient else 'Unknown'
    
    return Response([serialize_mongo_doc(a) for a in apt_list])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request):
    """Update appointment status (confirm/cancel)."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    appointment_id = request.data.get('appointment_id')
    new_status = request.data.get('status')
    
    if new_status not in ['confirmed', 'cancelled', 'completed']:
        return Response({'message': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    appointments = get_collection(Collections.APPOINTMENTS)
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    try:
        appointment = appointments.find_one({'_id': ObjectId(appointment_id)})
    except:
        return Response({'message': 'Invalid appointment ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not appointment:
        return Response({'message': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    appointments.update_one(
        {'_id': ObjectId(appointment_id)},
        {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
    )
    
    # Notify the patient
    notifications.insert_one({
        'user_id': appointment['patient_id'],
        'type': 'appointment',
        'title': f'Appointment {new_status}',
        'message': f'Your appointment on {appointment["appointment_date"]} has been {new_status}.',
        'is_read': False,
        'created_at': datetime.utcnow(),
        'level': 'low'
    })
    
    updated = appointments.find_one({'_id': ObjectId(appointment_id)})
    return Response(serialize_mongo_doc(updated))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_record(request, record_id):
    """Approve a medical record by ID."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    records = get_collection(Collections.MEDICAL_RECORDS)
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    try:
        record = records.find_one({'_id': ObjectId(record_id)})
    except:
        return Response({'message': 'Invalid record ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not record:
        return Response({'message': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
    
    records.update_one(
        {'_id': ObjectId(record_id)},
        {
            '$set': {
                'status': 'approved',
                'reviewed_by': request.user.id,
                'reviewed_at': datetime.utcnow()
            }
        }
    )
    
    # Notify the patient
    notifications.insert_one({
        'user_id': record['patient_id'],
        'type': 'record',
        'title': 'Medical record approved',
        'message': f'Your medical record for "{record["diagnosis"]}" has been approved by a doctor.',
        'is_read': False,
        'created_at': datetime.utcnow(),
        'severity': 'low'
    })
    
    updated_record = records.find_one({'_id': ObjectId(record_id)})
    return Response(serialize_mongo_doc(updated_record))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_record(request, record_id):
    """Reject a medical record by ID."""
    if request.user.role != 'doctor':
        return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    records = get_collection(Collections.MEDICAL_RECORDS)
    notifications = get_collection(Collections.NOTIFICATIONS)
    notes = request.data.get('notes', '')
    
    try:
        record = records.find_one({'_id': ObjectId(record_id)})
    except:
        return Response({'message': 'Invalid record ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not record:
        return Response({'message': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
    
    records.update_one(
        {'_id': ObjectId(record_id)},
        {
            '$set': {
                'status': 'rejected',
                'doctor_notes': notes,
                'reviewed_by': request.user.id,
                'reviewed_at': datetime.utcnow()
            }
        }
    )
    
    # Notify the patient
    notifications.insert_one({
        'user_id': record['patient_id'],
        'type': 'record',
        'title': 'Medical record rejected',
        'message': f'Your medical record for "{record["diagnosis"]}" has been rejected.' + (f' Notes: {notes}' if notes else ''),
        'is_read': False,
        'created_at': datetime.utcnow(),
        'severity': 'medium'
    })
    
    updated_record = records.find_one({'_id': ObjectId(record_id)})
    return Response(serialize_mongo_doc(updated_record))
