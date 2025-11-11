# calendar/models.py
from django.db import models
from django.contrib.auth import get_user_model
from contacts.models import Contact
from opportunities.models import Opportunity
import uuid

User = get_user_model()

class CalendarEvent(models.Model):
    EVENT_TYPES = [
        ('meeting', 'Meeting'),
        ('call', 'Phone Call'),
        ('deadline', 'Deadline'),
        ('task', 'Task'),
        ('reminder', 'Reminder'),
        ('other', 'Other')
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='meeting')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    
    # Relationships
    customer = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='calendar_events')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, null=True, blank=True, related_name='calendar_events')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_events')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    
    # Status & Reminders
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    reminder_sent = models.BooleanField(default=False)
    reminder_minutes = models.IntegerField(default=15)  # Minutes before event
    
    # Recurrence fields
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.CharField(max_length=255, blank=True)  # Store RRULE string
    recurrence_end = models.DateTimeField(null=True, blank=True)
    
    # Color coding
    color = models.CharField(max_length=7, default='#3788d8')  # Hex color
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'calendar_events'
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['assigned_to', 'start_time']),
            models.Index(fields=['start_time', 'end_time']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def duration(self):
        """Calculate event duration in minutes"""
        if self.all_day:
            return 24 * 60
        return (self.end_time - self.start_time).total_seconds() / 60

class EventReminder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(CalendarEvent, on_delete=models.CASCADE, related_name='reminders')
    reminder_time = models.DateTimeField()
    sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['reminder_time']