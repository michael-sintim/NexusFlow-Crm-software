from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class Contact(models.Model):
    SOURCE_CHOICES = (
        ('referral', 'Referral'),
        ('cold_call', 'Cold Call'),
        ('website', 'Website'),
        ('email', 'Email'),
        ('social_media', 'Social Media'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,  # Changed from SET_NULL
        related_name='contacts',
        null=False  # Must have an owner
    )
    company_name = models.CharField(max_length=255, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    title = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='other')
    notes = models.TextField(blank=True)
    last_contacted = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['owner']),
            models.Index(fields=['created_at']),
        ]
        unique_together = [['owner', 'email']]  # Optional: allow same email for different owners
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def update_last_contacted(self):
        """Update the last_contacted timestamp to now"""
        self.last_contacted = timezone.now()
        self.save(update_fields=['last_contacted', 'updated_at'])


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    contacts = models.ManyToManyField(Contact, related_name='tags', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name