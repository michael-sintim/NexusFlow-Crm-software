from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from notifications.models import Notification, ActivityLog
from notifications.serializers import NotificationSerializer, ActivityLogSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        notification = serializer.save()
        # If marking as read, don't create activity log to avoid spam
        if 'is_read' in serializer.validated_data and serializer.validated_data['is_read']:
            return
        # For other updates, log them
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='update',
            content_type='notification',
            object_id=notification.id,
            details={
                'notification_title': notification.title,
                'is_read': notification.is_read
            }
        )
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': f'{updated} notifications marked as read'})
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (last 10)"""
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['action_type', 'content_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ActivityLog.objects.select_related('user').all()
        return ActivityLog.objects.filter(user=user).select_related('user')
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Get recent activity for dashboard"""
        user = self.request.user
        base_filter = Q() if user.role == 'admin' else Q(user=user)
        
        recent_activity = ActivityLog.objects.filter(base_filter).select_related('user').order_by('-created_at')[:20]
        serializer = self.get_serializer(recent_activity, many=True)
        return Response(serializer.data)