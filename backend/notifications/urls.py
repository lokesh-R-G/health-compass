from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notifications, name='get_notifications'),
    path('mark-read', views.mark_as_read, name='mark_read'),
    path('mark-all-read', views.mark_all_read, name='mark_all_read'),
    path('unread-count', views.unread_count, name='unread_count'),
]
