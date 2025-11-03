from rest_framework import serializers
from notifications.models import Notification, ActivityLog
from accounts.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read',
            'related_object_id', 'time_ago', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'


class ActivityLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    action_display = serializers.CharField(source='get_action_type_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_details', 'action_type', 'action_display',
            'content_type', 'content_type_display', 'object_id', 'details',
            'time_ago', 'created_at', 'ip_address'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'