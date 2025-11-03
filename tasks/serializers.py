from rest_framework import serializers
from tasks.models import Task
from contacts.serializers import ContactListSerializer
from opportunities.serializers import OpportunityListSerializer
from accounts.serializers import UserSerializer
from datetime import datetime


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'assigned_to', 'assigned_to_details', 'title', 
            'task_type', 'due_date', 'priority', 'status', 
            'is_overdue', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_overdue(self, obj):
        if obj.due_date:
            return obj.due_date < datetime.now(obj.due_date.tzinfo)
        return False


class TaskDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views"""
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    contact_details = ContactListSerializer(source='related_contact', read_only=True)
    opportunity_details = OpportunityListSerializer(source='related_opportunity', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'assigned_to', 'assigned_to_details', 'related_contact', 
            'contact_details', 'related_opportunity', 'opportunity_details',
            'title', 'description', 'task_type', 'due_date', 'priority', 
            'status', 'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'assigned_to_details', 'contact_details', 'opportunity_details']
        extra_kwargs = {
            'assigned_to': {'required': False, 'allow_null': True},
            'due_date': {'required': False, 'allow_null': True}
        }
    
    def get_is_overdue(self, obj):
        if obj.due_date:
            return obj.due_date < datetime.now(obj.due_date.tzinfo)
        return False
    
    def validate_assigned_to(self, value):
        """Validate assigned_to"""
        print(f"🔧 Validating assigned_to: {value}")
        # If not provided during update, it will be set in create() method
        if value is None:
            return value
        return value
    
    def validate_due_date(self, value):
        """Validate due date is not in the past"""
        print(f"🔧 Validating due_date: {value}")
        if value and value < datetime.now(value.tzinfo):
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value
    
    def create(self, validated_data):
        """Set default assigned_to to current user if not provided"""
        request = self.context.get('request')
        print(f"🔧 Create method - Request user: {request.user if request else 'No request'}")
        print(f"🔧 Create method - Validated data keys: {list(validated_data.keys())}")
        print(f"🔧 Create method - Has assigned_to: {'assigned_to' in validated_data}")
        
        # Check if assigned_to is in the data
        if 'assigned_to' not in validated_data:
            print("🔧 assigned_to not provided in data")
            if request:
                validated_data['assigned_to'] = request.user
                print(f"🔧 Auto-assigned to request user: {request.user}")
            else:
                print("❌ No request context available!")
        
        # Set default status if not provided
        if 'status' not in validated_data:
            validated_data['status'] = 'open'
            print("🔧 Set default status: open")
        
        # Set default priority if not provided
        if 'priority' not in validated_data:
            validated_data['priority'] = 'medium'
            print("🔧 Set default priority: medium")
        
        # Debug the final data
        print(f"🔧 Final validated data - assigned_to: {validated_data.get('assigned_to')}")
        print(f"🔧 Final validated data - due_date: {validated_data.get('due_date')}")
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Handle update with proper validation"""
        request = self.context.get('request')
        if request and 'assigned_to' not in validated_data:
            validated_data['assigned_to'] = request.user
        return super().update(instance, validated_data)