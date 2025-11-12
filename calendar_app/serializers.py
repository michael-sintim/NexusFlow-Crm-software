# calendar/serializers.py
from rest_framework import serializers
from .models import CalendarEvent, EventReminder
from contacts.serializers import ContactListSerializer
from opportunities.serializers import OpportunityListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']

class CalendarEventSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    customer_details = ContactListSerializer(source='customer', read_only=True)
    opportunity_details = OpportunityListSerializer(source='opportunity', read_only=True)
    duration = serializers.ReadOnlyField()
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'start_time', 'end_time',
            'all_day', 'customer', 'customer_details', 'opportunity', 'opportunity_details',
            'created_by', 'created_by_details', 'status', 'reminder_minutes', 
            'is_recurring', 'recurrence_rule', 'recurrence_end', 'color',  'location',
            'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Get the request user and set both assigned_to and created_by
        request = self.context.get('request')
        user = request.user if request and hasattr(request, 'user') else None
        
        if user:
            validated_data['assigned_to'] = user
            validated_data['created_by'] = user
        else:
            # Fallback: get the first active user
            first_user = User.objects.filter(is_active=True).first()
            if first_user:
                validated_data['assigned_to'] = first_user
                validated_data['created_by'] = first_user
            else:
                raise serializers.ValidationError("No user available to assign the event to")
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent assigned_to from being changed via API since it's auto-assigned
        if 'assigned_to' in validated_data:
            del validated_data['assigned_to']
        return super().update(instance, validated_data)

class EventReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventReminder
        fields = '__all__'