from rest_framework import serializers
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta
from django.utils import timezone
from accounts.models import User
from contacts.models import Contact
from opportunities.models import Opportunity
from tasks.models import Task
from analytics.models import CalendarEvent

class DashboardStatsSerializer(serializers.Serializer):
    # Current period (last 30 days)
    total_contacts = serializers.IntegerField()
    total_opportunities = serializers.IntegerField()
    total_value = serializers.FloatField()
    open_tasks = serializers.IntegerField()
    closed_won = serializers.IntegerField()
    closed_won_value = serializers.FloatField()
    avg_deal_size = serializers.FloatField()
    win_rate = serializers.FloatField()
    active_opportunities = serializers.IntegerField()
    
    # Previous period (days 31-60 ago) - for comparison
    previous_total_contacts = serializers.IntegerField()
    previous_total_opportunities = serializers.IntegerField()
    previous_total_value = serializers.FloatField()
    previous_closed_won = serializers.IntegerField()
    
    # All-time metrics
    all_time_contacts = serializers.IntegerField()
    all_time_opportunities = serializers.IntegerField()
    all_time_value = serializers.FloatField()
    all_time_closed_won_value = serializers.FloatField()
    all_time_avg_deal_size = serializers.FloatField()
    all_time_win_rate = serializers.FloatField()
    all_time_active_opportunities = serializers.IntegerField()
    all_time_open_tasks = serializers.IntegerField()

class PipelineStageSerializer(serializers.Serializer):
    stage = serializers.CharField()
    name = serializers.CharField()
    count = serializers.IntegerField()
    value = serializers.FloatField()
    percentage = serializers.FloatField()
    avg_probability = serializers.FloatField()

class ForecastSerializer(serializers.Serializer):
    total_pipeline = serializers.FloatField()
    weighted_forecast = serializers.FloatField()
    best_case = serializers.FloatField()
    worst_case = serializers.FloatField()
    monthly_forecast = serializers.DictField()

class TeamPerformanceSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    total_opportunities = serializers.IntegerField()
    total_value = serializers.FloatField()
    closed_won = serializers.IntegerField()
    closed_lost = serializers.IntegerField()
    win_rate = serializers.FloatField()
    avg_deal_size = serializers.FloatField()
    pipeline_value = serializers.FloatField()

class CalendarEventSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.company_name', read_only=True)
    opportunity_name = serializers.CharField(source='opportunity.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'start_time', 'end_time',
            'all_day', 'customer', 'opportunity', 'assigned_to', 'created_by',
            'status', 'reminder_minutes', 'customer_name', 'opportunity_name',
            'assigned_to_name', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that end_time is after start_time"""
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data

class ActivityTrendsSerializer(serializers.Serializer):
    period = serializers.CharField()
    contacts_created = serializers.IntegerField()
    opportunities_created = serializers.IntegerField()
    tasks_completed = serializers.IntegerField()
    deals_closed = serializers.IntegerField()
    revenue_generated = serializers.FloatField()

class SourceAnalysisSerializer(serializers.Serializer):
    source = serializers.CharField()
    contact_count = serializers.IntegerField()
    opportunity_count = serializers.IntegerField()
    win_rate = serializers.FloatField()
    total_value = serializers.FloatField()
    avg_deal_size = serializers.FloatField()

class TaskAnalyticsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    overdue_tasks = serializers.IntegerField()
    avg_completion_time_hours = serializers.FloatField()
    tasks_by_priority = serializers.DictField()
    tasks_by_type = serializers.DictField()

class RevenueTrendSerializer(serializers.Serializer):
    period = serializers.CharField()
    revenue = serializers.FloatField()
    target = serializers.FloatField()
    growth = serializers.FloatField()

class ConversionMetricsSerializer(serializers.Serializer):
    contact_to_opportunity_rate = serializers.FloatField()
    opportunity_to_win_rate = serializers.FloatField()
    overall_conversion_rate = serializers.FloatField()
    avg_sales_cycle_days = serializers.FloatField()
    stage_conversion_rates = serializers.DictField()

class ExecutiveSummarySerializer(serializers.Serializer):
    period = serializers.CharField()
    total_revenue = serializers.FloatField()
    revenue_growth = serializers.FloatField()
    new_customers = serializers.IntegerField()
    customer_growth = serializers.FloatField()
    active_opportunities = serializers.IntegerField()
    pipeline_value = serializers.FloatField()
    win_rate = serializers.FloatField()
    key_highlights = serializers.ListField()
    areas_for_improvement = serializers.ListField()