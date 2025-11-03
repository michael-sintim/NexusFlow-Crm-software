from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})  # Changed from confirm_password to password2
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email',  # Reordered to match frontend priority
            'password', 'password2',  # Using password2 instead of confirm_password
            'username', 'role', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},  # Make first_name required
            'last_name': {'required': True},   # Make last_name required
            'username': {'required': False}    # Make username optional - we'll generate it
        }
    
    def validate(self, attrs):
        # Check password confirmation during creation
        if self.instance is None and 'password' in attrs:
            if 'password2' not in attrs:  # Changed from confirm_password to password2
                raise serializers.ValidationError({"password2": "This field is required when setting password."})
            if attrs['password'] != attrs['password2']:  # Changed from confirm_password to password2
                raise serializers.ValidationError({"password2": "Passwords do not match."})
        
        # Validate password strength
        if 'password' in attrs:
            try:
                validate_password(attrs['password'])
            except DjangoValidationError as e:
                raise serializers.ValidationError({'password': list(e.messages)})
        
        # Ensure email is unique
        email = attrs.get('email')
        if email and User.objects.filter(email=email).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
        
        return attrs
    
    def create(self, validated_data):
        # Remove password2 before creating user
        validated_data.pop('password2', None)
        password = validated_data.pop('password', None)
        
        # Generate username from email if not provided
        if 'username' not in validated_data or not validated_data['username']:
            # Create username from email (e.g., "john@example.com" -> "john")
            base_username = validated_data['email'].split('@')[0]
            username = base_username
            counter = 1
            
            # Ensure username is unique
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            validated_data['username'] = username
        
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        validated_data.pop('password2', None)  # Remove password2
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']