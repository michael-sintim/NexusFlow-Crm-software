from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model
from contacts.models import Contact
from opportunities.models import Opportunity
from tasks.models import Task
import uuid

User = get_user_model()


class AnalyticsSnapshot(models.Model):
    """
    Stores periodic system-wide statistics for dashboard analytics.
    Snapshots are typically generated daily or weekly by a scheduled task (e.g., Celery beat).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True)
    total_users = models.PositiveIntegerField(default=0)
    total_contacts = models.PositiveIntegerField(default=0)
    total_opportunities = models.PositiveIntegerField(default=0)
    total_tasks = models.PositiveIntegerField(default=0)
    deals_won = models.PositiveIntegerField(default=0)
    deals_lost = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]
        verbose_name = "Analytics Snapshot"
        verbose_name_plural = "Analytics Snapshots"

    def __str__(self):
        return f"Snapshot {self.date}"


class UserPerformance(models.Model):
    """
    Tracks individual user performance metrics — useful for leaderboards or reports.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_metrics')
    period_start = models.DateField()
    period_end = models.DateField()
    contacts_created = models.PositiveIntegerField(default=0)
    opportunities_created = models.PositiveIntegerField(default=0)
    tasks_completed = models.PositiveIntegerField(default=0)
    deals_closed = models.PositiveIntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-period_start']
        unique_together = ('user', 'period_start', 'period_end')
        indexes = [
            models.Index(fields=['user', 'period_start', 'period_end']),
        ]
        verbose_name = "User Performance"
        verbose_name_plural = "User Performance Reports"

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.period_start} → {self.period_end})"


class KPI(models.Model):
    """
    Defines configurable Key Performance Indicators for flexible analytics dashboards.
    These can be updated without modifying code.
    """
    METRIC_TYPE_CHOICES = (
        ('count', 'Count'),
        ('percentage', 'Percentage'),
        ('currency', 'Currency'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPE_CHOICES, default='count')
    value = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Key Performance Indicator"
        verbose_name_plural = "Key Performance Indicators"

    def __str__(self):
        return f"{self.name}: {self.value}"
    
