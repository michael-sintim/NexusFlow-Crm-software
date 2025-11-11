from rest_framework import serializers
from opportunities.models import Opportunity
from contacts.serializers import ContactListSerializer
from accounts.serializers import UserSerializer

class OpportunityListSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.get_full_name', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    days_to_close = serializers.SerializerMethodField()
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'value', 'stage', 'probability', 
            'contact_name', 'owner_name', 'expected_close_date',
            'days_to_close', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_days_to_close(self, obj):
        if obj.expected_close_date:
            from datetime import date
            delta = obj.expected_close_date - date.today()
            return delta.days
        return None


class OpportunityDetailSerializer(serializers.ModelSerializer):
    contact_details = ContactListSerializer(source='contact', read_only=True)
    owner_details = UserSerializer(source='owner', read_only=True)
    task_count = serializers.SerializerMethodField()
    age_days = serializers.SerializerMethodField()
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'contact', 'contact_details', 'owner', 'owner_details',
            'title', 'value', 'stage', 'probability', 'expected_close_date',
            'description', 'task_count', 'age_days', 'created_at', 
            'updated_at', 'closed_date'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'closed_date']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_age_days(self, obj):
        return obj.age_days  # Now uses the model property
    
    def validate_probability(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Probability must be between 0 and 100.")
        return value
    
    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Value cannot be negative.")
        return value
    
    def validate_expected_close_date(self, value):
        from datetime import date
        if value and value < date.today():
            raise serializers.ValidationError("Expected close date cannot be in the past.")
        return value
    
    def update(self, instance, validated_data):
        # Handle any special update logic here
        return super().update(instance, validated_data)