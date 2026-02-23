from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from bson import ObjectId
from healthiq.mongodb import get_collection, Collections


def serialize_mongo_doc(doc):
    """Convert MongoDB document to serializable format."""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    # Convert datetime to string
    if 'created_at' in doc and isinstance(doc['created_at'], datetime):
        doc['time'] = doc['created_at'].strftime('%Y-%m-%d %H:%M')
    return doc


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get notifications for the current user."""
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    user_notifications = list(
        notifications.find({'user_id': request.user.id})
        .sort('created_at', -1)
        .limit(50)
    )
    
    return Response([serialize_mongo_doc(n) for n in user_notifications])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request):
    """Mark a notification as read."""
    notification_id = request.data.get('notification_id')
    
    if not notification_id:
        return Response({'message': 'notification_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    try:
        result = notifications.update_one(
            {'_id': ObjectId(notification_id), 'user_id': request.user.id},
            {'$set': {'is_read': True}}
        )
    except:
        return Response({'message': 'Invalid notification ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if result.modified_count == 0:
        return Response({'message': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    notification = notifications.find_one({'_id': ObjectId(notification_id)})
    return Response(serialize_mongo_doc(notification))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read."""
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    result = notifications.update_many(
        {'user_id': request.user.id, 'is_read': False},
        {'$set': {'is_read': True}}
    )
    
    return Response({'message': f'Marked {result.modified_count} notifications as read'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Get count of unread notifications."""
    notifications = get_collection(Collections.NOTIFICATIONS)
    
    count = notifications.count_documents({
        'user_id': request.user.id,
        'is_read': False
    })
    
    return Response({'count': count})
