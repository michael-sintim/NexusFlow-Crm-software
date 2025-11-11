from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from django.utils import timezone
from datetime import timedelta, datetime
from analytics.serializers import (
    DashboardStatsSerializer, PipelineStageSerializer, ForecastSerializer,
    TeamPerformanceSerializer, ActivityTrendsSerializer, SourceAnalysisSerializer,
    TaskAnalyticsSerializer, RevenueTrendSerializer, ConversionMetricsSerializer
)
from opportunities.models import Opportunity
from contacts.models import Contact
from tasks.models import Task
from accounts.models import User


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def _get_base_filter(self):
        user = self.request.user
        if user.role == 'admin':
            return Q()
        return Q(owner=user)
    
    def _get_task_filter(self):
        user = self.request.user
        if user.role == 'admin':
            return Q()
        return Q(assigned_to=user)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get comprehensive dashboard metrics with 30-day comparison"""
        user = request.user
        base_filter = self._get_base_filter()
        task_filter = self._get_task_filter()
        
        # Define time periods
        now = timezone.now()
        current_period_start = now - timedelta(days=30)
        previous_period_start = now - timedelta(days=60)
        previous_period_end = current_period_start
        
        # CURRENT PERIOD (last 30 days)
        # Opportunities analytics
        opps = Opportunity.objects.filter(base_filter)
        current_opps = opps.filter(created_at__gte=current_period_start)
        current_total_opps = current_opps.count()
        
        current_closed_won_opps = opps.filter(
            stage='closed_won',
            closed_date__gte=current_period_start
        )
        current_closed_won_count = current_closed_won_opps.count()
        
        active_opps = opps.exclude(stage__in=['closed_won', 'closed_lost']).count()
        
        # Contacts analytics - current period
        current_contacts = Contact.objects.filter(
            base_filter,
            created_at__gte=current_period_start
        ).count()
        
        # Tasks analytics - current period
        current_tasks_completed = Task.objects.filter(
            task_filter,
            status='completed',
            updated_at__gte=current_period_start
        ).count()
        
        # Current period values
        current_total_value = float(current_opps.aggregate(Sum('value'))['value__sum'] or 0)
        current_closed_won_value = float(current_closed_won_opps.aggregate(Sum('value'))['value__sum'] or 0)
        
        # PREVIOUS PERIOD (days 31-60 ago)
        previous_opps = opps.filter(
            created_at__gte=previous_period_start,
            created_at__lt=previous_period_end
        )
        previous_total_opps = previous_opps.count()
        
        previous_closed_won_opps = opps.filter(
            stage='closed_won',
            closed_date__gte=previous_period_start,
            closed_date__lt=previous_period_end
        )
        previous_closed_won_count = previous_closed_won_opps.count()
        
        previous_contacts = Contact.objects.filter(
            base_filter,
            created_at__gte=previous_period_start,
            created_at__lt=previous_period_end
        ).count()
        
        previous_tasks_completed = Task.objects.filter(
            task_filter,
            status='completed',
            updated_at__gte=previous_period_start,
            updated_at__lt=previous_period_end
        ).count()
        
        previous_total_value = float(previous_opps.aggregate(Sum('value'))['value__sum'] or 0)
        previous_closed_won_value = float(previous_closed_won_opps.aggregate(Sum('value'))['value__sum'] or 0)
        
        # ALL-TIME METRICS (for other displays)
        total_contacts = Contact.objects.filter(base_filter).count()
        total_opps = opps.count()
        total_value = float(opps.aggregate(Sum('value'))['value__sum'] or 0)
        closed_won_value = float(opps.filter(stage='closed_won').aggregate(Sum('value'))['value__sum'] or 0)
        avg_deal_size = float(opps.aggregate(Avg('value'))['value__avg'] or 0)
        
        closed_won_count = opps.filter(stage='closed_won').count()
        win_rate = (closed_won_count / total_opps * 100) if total_opps > 0 else 0
        
        open_tasks = Task.objects.filter(task_filter, status__in=['open', 'in_progress']).count()
        
        stats = {
            # Current period stats (for percentage calculations)
            'total_contacts': current_contacts,
            'total_opportunities': current_total_opps,
            'total_value': current_total_value,
            'closed_won': current_closed_won_count,
            
            # Previous period stats (for comparison)
            'previous_total_contacts': previous_contacts,
            'previous_total_opportunities': previous_total_opps,
            'previous_total_value': previous_total_value,
            'previous_closed_won': previous_tasks_completed,  # Using tasks completed as "Tasks Completed" metric
            
            # All-time metrics (if you need them elsewhere)
            'all_time_contacts': total_contacts,
            'all_time_opportunities': total_opps,
            'all_time_value': total_value,
            'closed_won_value': closed_won_value,
            'avg_deal_size': avg_deal_size,
            'win_rate': round(win_rate, 2),
            'active_opportunities': active_opps,
            'open_tasks': open_tasks,
        }
        
        serializer = DashboardStatsSerializer(stats)

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        """Get detailed pipeline analysis"""
        user = request.user
        base_filter = self._get_base_filter()
        
        pipeline_data = []
        total_value = float(Opportunity.objects.filter(base_filter).aggregate(Sum('value'))['value__sum'] or 0)
        
        for stage_value, stage_name in Opportunity.STAGE_CHOICES:
            stage_opps = Opportunity.objects.filter(base_filter, stage=stage_value)
            stage_count = stage_opps.count()
            stage_value_sum = float(stage_opps.aggregate(Sum('value'))['value__sum'] or 0)
            stage_avg_probability = float(stage_opps.aggregate(Avg('probability'))['probability__avg'] or 0)
            
            percentage = (stage_value_sum / total_value * 100) if total_value > 0 else 0
            
            pipeline_data.append({
                'stage': stage_value,
                'name': stage_name,
                'count': stage_count,
                'value': stage_value_sum,
                'percentage': round(percentage, 2),
                'avg_probability': round(stage_avg_probability, 2),
            })
        
        serializer = PipelineStageSerializer(pipeline_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def forecast(self, request):
        """Get revenue forecast with multiple scenarios"""
        user = request.user
        base_filter = self._get_base_filter()
        
        # Get active opportunities (not closed)
        active_opps = Opportunity.objects.filter(
            base_filter
        ).exclude(stage__in=['closed_won', 'closed_lost'])
        
        total_pipeline = float(active_opps.aggregate(Sum('value'))['value__sum'] or 0)
        
        # Calculate weighted forecast
        weighted_forecast = 0
        best_case = 0
        worst_case = 0
        
        for opp in active_opps:
            weighted_value = opp.value * (opp.probability / 100)
            weighted_forecast += weighted_value
            
            # Best case: 25% higher than probability
            best_case += opp.value * (min(100, opp.probability + 25) / 100)
            # Worst case: 25% lower than probability
            worst_case += opp.value * (max(0, opp.probability - 25) / 100)
        
        # Monthly forecast breakdown
        monthly_forecast = {}
        current_month = timezone.now().replace(day=1)
        
        for i in range(6):  # Next 6 months
            month_key = current_month.strftime('%Y-%m')
            month_opps = active_opps.filter(expected_close_date__month=current_month.month,
                                          expected_close_date__year=current_month.year)
            month_forecast = sum([opp.value * (opp.probability / 100) for opp in month_opps])
            monthly_forecast[month_key] = round(float(month_forecast), 2)
            current_month = current_month + timedelta(days=32)
            current_month = current_month.replace(day=1)
        
        forecast_data = {
            'total_pipeline': round(total_pipeline, 2),
            'weighted_forecast': round(weighted_forecast, 2),
            'best_case': round(best_case, 2),
            'worst_case': round(worst_case, 2),
            'monthly_forecast': monthly_forecast,
        }
        
        serializer = ForecastSerializer(forecast_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def team_performance(self, request):
        """Get team performance metrics"""
        if request.user.role != 'admin':
            return Response({'detail': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.filter(role='sales', is_active=True)
        performance_data = []
        
        for user in users:
            user_opps = Opportunity.objects.filter(owner=user)
            total_opps = user_opps.count()
            closed_won = user_opps.filter(stage='closed_won').count()
            closed_lost = user_opps.filter(stage='closed_lost').count()
            total_value = float(user_opps.aggregate(Sum('value'))['value__sum'] or 0)
            pipeline_value = float(user_opps.exclude(stage__in=['closed_won', 'closed_lost']).aggregate(Sum('value'))['value__sum'] or 0)
            avg_deal_size = float(user_opps.aggregate(Avg('value'))['value__avg'] or 0)
            
            win_rate = (closed_won / total_opps * 100) if total_opps > 0 else 0
            
            performance_data.append({
                'user_id': user.id,
                'username': user.get_full_name() or user.username,
                'total_opportunities': total_opps,
                'total_value': round(total_value, 2),
                'closed_won': closed_won,
                'closed_lost': closed_lost,
                'win_rate': round(win_rate, 2),
                'avg_deal_size': round(avg_deal_size, 2),
                'pipeline_value': round(pipeline_value, 2),
            })
        
        serializer = TeamPerformanceSerializer(performance_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def activity_trends(self, request):
        """Get activity trends over time"""
        user = request.user
        base_filter = self._get_base_filter()
        task_filter = self._get_task_filter()
        
        # Last 30 days of activity
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Weekly trends
        trends_data = []
        current_date = thirty_days_ago
        
        while current_date <= timezone.now():
            week_start = current_date
            week_end = current_date + timedelta(days=6)
            week_key = week_start.strftime('%Y-%m-%d')
            
            week_contacts = Contact.objects.filter(
                base_filter,
                created_at__date__range=[week_start, week_end]
            ).count()
            
            week_opps = Opportunity.objects.filter(
                base_filter,
                created_at__date__range=[week_start, week_end]
            ).count()
            
            week_tasks = Task.objects.filter(
                task_filter,
                status='completed',
                updated_at__date__range=[week_start, week_end]
            ).count()
            
            week_deals = Opportunity.objects.filter(
                base_filter,
                stage='closed_won',
                closed_date__date__range=[week_start, week_end]
            )
            
            week_deals_count = week_deals.count()
            week_revenue = float(week_deals.aggregate(Sum('value'))['value__sum'] or 0)
            
            trends_data.append({
                'period': week_key,
                'contacts_created': week_contacts,
                'opportunities_created': week_opps,
                'tasks_completed': week_tasks,
                'deals_closed': week_deals_count,
                'revenue_generated': week_revenue,
            })
            
            current_date += timedelta(days=7)
        
        serializer = ActivityTrendsSerializer(trends_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def source_analysis(self, request):
        """Analyze performance by contact source"""
        user = request.user
        base_filter = self._get_base_filter()
        
        sources = Contact.SOURCE_CHOICES
        source_data = []
        
        for source_value, source_name in sources:
            source_contacts = Contact.objects.filter(base_filter, source=source_value)
            contact_count = source_contacts.count()
            
            # Get opportunities from these contacts
            source_opps = Opportunity.objects.filter(
                base_filter,
                contact__source=source_value
            )
            opp_count = source_opps.count()
            won_opps = source_opps.filter(stage='closed_won')
            win_rate = (won_opps.count() / opp_count * 100) if opp_count > 0 else 0
            total_value = float(source_opps.aggregate(Sum('value'))['value__sum'] or 0)
            avg_deal_size = float(won_opps.aggregate(Avg('value'))['value__avg'] or 0) if won_opps.exists() else 0
            
            source_data.append({
                'source': source_name,
                'contact_count': contact_count,
                'opportunity_count': opp_count,
                'win_rate': round(win_rate, 2),
                'total_value': round(total_value, 2),
                'avg_deal_size': round(avg_deal_size, 2),
            })
        
        serializer = SourceAnalysisSerializer(source_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def task_analytics(self, request):
        """Get task performance analytics"""
        user = request.user
        task_filter = self._get_task_filter()
        
        tasks = Task.objects.filter(task_filter)
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='completed').count()
        overdue_tasks = tasks.filter(
            due_date__lt=timezone.now(),
            status__in=['open', 'in_progress']
        ).count()
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Calculate average completion time
        completed_tasks_with_dates = tasks.filter(
            status='completed',
            created_at__isnull=False,
            updated_at__isnull=False
        )
        
        avg_completion_time = completed_tasks_with_dates.annotate(
            completion_time=ExpressionWrapper(
                F('updated_at') - F('created_at'),
                output_field=FloatField()
            )
        ).aggregate(avg_time=Avg('completion_time'))
        
        avg_completion_hours = 0
        if avg_completion_time['avg_time']:
            avg_completion_hours = avg_completion_time['avg_time'].total_seconds() / 3600
        
        # Tasks by priority
        tasks_by_priority = tasks.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        
        priority_dict = {}
        for item in tasks_by_priority:
            priority_dict[item['priority']] = item['count']
        
        # Tasks by type
        tasks_by_type = tasks.values('task_type').annotate(
            count=Count('id')
        ).order_by('task_type')
        
        type_dict = {}
        for item in tasks_by_type:
            type_dict[item['task_type']] = item['count']
        
        analytics_data = {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'completion_rate': round(completion_rate, 2),
            'overdue_tasks': overdue_tasks,
            'avg_completion_time_hours': round(avg_completion_hours, 2),
            'tasks_by_priority': priority_dict,
            'tasks_by_type': type_dict,
        }
        
        serializer = TaskAnalyticsSerializer(analytics_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def revenue_trends(self, request):
        """Get revenue trends and targets for the last 12 months - OPTIMIZED"""
        user = request.user
        base_filter = self._get_base_filter()
        
        # Calculate date range for last 12 complete months
        end_date = timezone.now().replace(day=1)  # First day of current month
        start_date = (end_date - timedelta(days=365)).replace(day=1)  # Approximately 12 months ago
        
        # Get all won opportunities in the date range
        won_opps = Opportunity.objects.filter(
            base_filter,
            stage='closed_won',
            closed_date__gte=start_date,
            closed_date__lt=end_date
        )
        
        # Aggregate by month using Django's TruncMonth
        monthly_revenue = won_opps.annotate(
            month=TruncMonth('closed_date')
        ).values('month').annotate(
            revenue=Sum('value')
        ).order_by('month')
        
        # Create a dictionary for easy lookup
        revenue_by_month = {
            data['month'].strftime('%Y-%m'): float(data['revenue'] or 0)
            for data in monthly_revenue
        }
        
        # Build the complete 12-month dataset
        revenue_data = []
        current = start_date
        
        while current < end_date:
            month_key = current.strftime('%Y-%m')
            revenue = revenue_by_month.get(month_key, 0)
            target = revenue * 1.1  # 10% growth target
            
            revenue_data.append({
                'period': month_key,
                'revenue': round(revenue, 2),
                'target': round(target, 2),
                'growth': 0,  # Will calculate below
            })
            
            # Move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
        
        # Calculate growth percentages
        for i in range(1, len(revenue_data)):
            current_rev = revenue_data[i]['revenue']
            previous_rev = revenue_data[i-1]['revenue']
            
            if previous_rev > 0:
                growth = ((current_rev - previous_rev) / previous_rev) * 100
                revenue_data[i]['growth'] = round(growth, 2)
        
        # Ensure we only return last 12 months
        revenue_data = revenue_data[-12:]
        
        serializer = RevenueTrendSerializer(revenue_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def conversion_metrics(self, request):
        """Get sales conversion metrics"""
        user = request.user
        base_filter = self._get_base_filter()
        
        # Overall conversion rates
        total_contacts = Contact.objects.filter(base_filter).count()
        total_opportunities = Opportunity.objects.filter(base_filter).count()
        won_opportunities = Opportunity.objects.filter(base_filter, stage='closed_won').count()
        
        contact_to_opp_rate = (total_opportunities / total_contacts * 100) if total_contacts > 0 else 0
        opp_to_win_rate = (won_opportunities / total_opportunities * 100) if total_opportunities > 0 else 0
        overall_conversion_rate = (won_opportunities / total_contacts * 100) if total_contacts > 0 else 0
        
        # Stage conversion rates
        stage_conversion = {}
        stages = list(Opportunity.STAGE_CHOICES)
        
        for i in range(len(stages) - 1):
            current_stage = stages[i][0]
            next_stage = stages[i + 1][0]
            
            current_count = Opportunity.objects.filter(base_filter, stage=current_stage).count()
            moved_count = Opportunity.objects.filter(
                base_filter,
                stage=next_stage
            ).count()
            
            conversion_rate = (moved_count / current_count * 100) if current_count > 0 else 0
            stage_conversion[f"{current_stage}_to_{next_stage}"] = round(conversion_rate, 2)
        
        # Average sales cycle
        won_opps_with_dates = Opportunity.objects.filter(
            base_filter,
            stage='closed_won',
            created_at__isnull=False,
            closed_date__isnull=False
        )
        
        avg_sales_cycle = won_opps_with_dates.annotate(
            cycle_time=ExpressionWrapper(
                F('closed_date') - F('created_at'),
                output_field=FloatField()
            )
        ).aggregate(avg_cycle=Avg('cycle_time'))
        
        avg_cycle_days = 0
        if avg_sales_cycle['avg_cycle']:
            avg_cycle_days = avg_sales_cycle['avg_cycle'].total_seconds() / 86400
        
        conversion_data = {
            'contact_to_opportunity_rate': round(contact_to_opp_rate, 2),
            'opportunity_to_win_rate': round(opp_to_win_rate, 2),
            'overall_conversion_rate': round(overall_conversion_rate, 2),
            'avg_sales_cycle_days': round(avg_cycle_days, 2),
            'stage_conversion_rates': stage_conversion,
        }
        
        serializer = ConversionMetricsSerializer(conversion_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def executive_summary(self, request):
        """Get comprehensive executive summary"""
        # Note: This approach creates new request objects which might not be ideal
        # In production, you might want to refactor to call the methods directly
        
        dashboard_response = self.dashboard(request)
        pipeline_response = self.pipeline(request) 
        forecast_response = self.forecast(request)
        conversion_response = self.conversion_metrics(request)
        revenue_response = self.revenue_trends(request)
        
        summary = {
            'performance_overview': dashboard_response.data,
            'pipeline_analysis': pipeline_response.data,
            'revenue_forecast': forecast_response.data,
            'conversion_metrics': conversion_response.data,
            'revenue_trends': revenue_response.data,
        }
        
        return Response(summary)
    
# calendar/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from calendar_app.models import CalendarEvent
from calendar_app.serializers import CalendarEventSerializer

class CalendarEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset - users see their own events + events they're assigned to
        queryset = CalendarEvent.objects.filter(
            Q(created_by=user) | Q(assigned_to=user)
        ).select_related('customer', 'opportunity', 'assigned_to', 'created_by')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date and end_date:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            queryset = queryset.filter(
                Q(start_time__range=[start, end]) |
                Q(end_time__range=[start, end]) |
                Q(start_time__lte=start, end_time__gte=end)
            )
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
            
        # Filter by customer
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
            
        return queryset.order_by('start_time')
    
    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):
        """Get upcoming events for the next 7 days"""
        today = timezone.now()
        next_week = today + timedelta(days=7)
        
        events = self.get_queryset().filter(
            start_time__range=[today, next_week],
            status__in=['scheduled', 'in_progress']
        )
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today_events(self, request):
        """Get today's events"""
        today = timezone.now().date()
        
        events = self.get_queryset().filter(
            start_time__date=today,
            status__in=['scheduled', 'in_progress']
        )
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark an event as completed"""
        event = self.get_object()
        event.status = 'completed'
        event.save()
        
        serializer = self.get_serializer(event)
        return Response(serializer.data)