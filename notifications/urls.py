# notifications/urls.py
from django.urls import path
from notifications.views import NotificationViewSet, ActivityLogViewSet

urlpatterns = [
    # Notifications
    path('notifications/', NotificationViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('notifications/<uuid:pk>/', NotificationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})),
    path('notifications/unread_count/', NotificationViewSet.as_view({'get': 'unread_count'})),
    path('notifications/mark_all_read/', NotificationViewSet.as_view({'post': 'mark_all_read'})),
    path('notifications/<uuid:pk>/mark_read/', NotificationViewSet.as_view({'patch': 'mark_read'})),
    path('notifications/recent/', NotificationViewSet.as_view({'get': 'recent'})),
    
    # Activity Logs
    path('activity-logs/', ActivityLogViewSet.as_view({'get': 'list'})),
    path('activity-logs/<uuid:pk>/', ActivityLogViewSet.as_view({'get': 'retrieve'})),
    path('activity-logs/recent_activity/', ActivityLogViewSet.as_view({'get': 'recent_activity'})),
]