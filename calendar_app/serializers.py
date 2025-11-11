# calendar/serializers.py
from rest_framework import serializers
from .models import CalendarEvent, EventReminder
from contacts.serializers import ContactSerializer
from opportunities.serializers import OpportunitySerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']

class CalendarEventSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    customer_details = ContactSerializer(source='customer', read_only=True)
    opportunity_details = OpportunitySerializer(source='opportunity', read_only=True)
    duration = serializers.ReadOnlyField()
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'start_time', 'end_time',
            'all_day', 'customer', 'customer_details', 'opportunity', 'opportunity_details',
            'assigned_to', 'assigned_to_details', 'created_by', 'created_by_details',
            'status', 'reminder_minutes', 'is_recurring', 'recurrence_rule',
            'recurrence_end', 'color', 'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class EventReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventReminder
        fields = '__all__'