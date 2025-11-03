from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model
from contacts.models import Contact
import uuid

User = get_user_model()

class Opportunity(models.Model):
    STAGE_CHOICES = (
        ('prospect', 'Prospect'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='opportunities')
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='opportunities')
    title = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='prospect')
    probability = models.IntegerField(default=0, help_text="0-100%")
    expected_close_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stage']),
            models.Index(fields=['owner']),
            models.Index(fields=['contact']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_stage_display()}"

