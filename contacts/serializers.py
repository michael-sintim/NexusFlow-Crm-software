from rest_framework import serializers
from contacts.models import Contact, Tag
from accounts.serializers import UserSerializer
import re


class TagSerializer(serializers.ModelSerializer):
    contact_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'contact_count']
        read_only_fields = ['id']
    
    def get_contact_count(self, obj):
        return obj.contacts.count()


class ContactListSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    contacted = serializers.SerializerMethodField()  # ADD THIS FIELD
    
    class Meta:
        model = Contact
        fields = [
            'id', 'first_name', 'last_name', 'email', 'company_name',
            'phone_number', 'title', 'source', 'owner_name', 'tags',
            'last_contacted', 'contacted', 'created_at'  # ADD contacted HERE
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_contacted(self, obj):
        # Returns True if last_contacted is not None
        return obj.last_contacted is not None


class ContactDetailSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        write_only=True,
        many=True,
        required=False,
        source='tags'
    )
    opportunity_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    contacted = serializers.SerializerMethodField()  # ADD THIS FIELD
    
    class Meta:
        model = Contact
        fields = [
            'id', 'owner', 'company_name', 'first_name', 'last_name',
            'email', 'phone_number', 'title', 'source', 'notes',
            'tags', 'tag_ids', 'last_contacted', 'contacted', 'opportunity_count',  # ADD contacted HERE
            'task_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_contacted(self, obj):
        # Returns True if last_contacted is not None
        return obj.last_contacted is not None
    
    def get_opportunity_count(self, obj):
        return obj.opportunities.count()
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def validate_email(self, value):
        """Ensure email is unique (excluding current instance during updates)"""
        if not value:  # Allow empty emails if field is not required
            return value
            
        queryset = Contact.objects.filter(email=value)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
        if queryset.exists():
            raise serializers.ValidationError("A contact with this email already exists.")
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value:
            # Allow: digits, spaces, hyphens, plus, parentheses, commas, periods, x (for extension)
            if not re.match(r'^[0-9\s\-\+\(\)\.,x]*$', value, re.IGNORECASE):
                raise serializers.ValidationError("Phone number contains invalid characters.")
            # Ensure at least some digits are present
            if not re.search(r'\d', value):
                raise serializers.ValidationError("Phone number must contain at least one digit.")
        return value
    
    def validate(self, data):
        """Validate related fields and data consistency"""
        # Ensure at least first_name or last_name is provided
        first_name = data.get('first_name', self.instance.first_name if self.instance else None)
        last_name = data.get('last_name', self.instance.last_name if self.instance else None)
        
        if not first_name and not last_name:
            raise serializers.ValidationError(
                "At least one of 'first_name' or 'last_name' must be provided."
            )
        
        return data
    
    def create(self, validated_data):
        """Create contact with owner from request context"""
        # Extract tags if present
        tags = validated_data.pop('tags', [])
        
        # Set owner from request context
        validated_data['owner'] = self.context['request'].user
        
        # Create the contact
        contact = super().create(validated_data)
        
        # Add tags if provided
        if tags:
            contact.tags.set(tags)
        
        return contact
    
    def update(self, instance, validated_data):
        """Update contact and handle tags separately"""
        # Extract tags if present
        tags = validated_data.pop('tags', None)
        
        # Update the contact instance
        instance = super().update(instance, validated_data)
        
        # Update tags if provided
        if tags is not None:
            instance.tags.set(tags)
        
        return instance