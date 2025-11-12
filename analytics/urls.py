from django.urls import path
from analytics.views import AnalyticsViewSet, CalendarEventViewSet

calendar_list = CalendarEventViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

calendar_detail = CalendarEventViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

# FIXED: Use the correct method names from your viewset
calendar_today = CalendarEventViewSet.as_view({
    'get': 'today_events',  # Changed from 'today' to 'today_events'
})

calendar_upcoming = CalendarEventViewSet.as_view({
    'get': 'upcoming_events',  # Changed from 'upcoming' to 'upcoming_events'
})

urlpatterns = [
    # === ANALYTICS ROUTES ===
    path('dashboard/', AnalyticsViewSet.as_view({'get': 'dashboard'}), name='analytics-dashboard'),
    path('pipeline/', AnalyticsViewSet.as_view({'get': 'pipeline'}), name='analytics-pipeline'),
    path('forecast/', AnalyticsViewSet.as_view({'get': 'forecast'}), name='analytics-forecast'),
    path('team_performance/', AnalyticsViewSet.as_view({'get': 'team_performance'}), name='analytics-team-performance'),
    path('activity_trends/', AnalyticsViewSet.as_view({'get': 'activity_trends'}), name='analytics-activity-trends'),
    path('source_analysis/', AnalyticsViewSet.as_view({'get': 'source_analysis'}), name='analytics-source-analysis'),
    path('task_analytics/', AnalyticsViewSet.as_view({'get': 'task_analytics'}), name='analytics-task-analytics'),
    path('revenue_trends/', AnalyticsViewSet.as_view({'get': 'revenue_trends'}), name='analytics-revenue-trends'),
    path('conversion_metrics/', AnalyticsViewSet.as_view({'get': 'conversion_metrics'}), name='analytics-conversion-metrics'),
    path('executive_summary/', AnalyticsViewSet.as_view({'get': 'executive_summary'}), name='analytics-executive-summary'),

    # === CALENDAR ROUTES ===
    path('calendar/', calendar_list, name='calendar-list'),
    path('calendar/<int:pk>/', calendar_detail, name='calendar-detail'),
    path('calendar/today/', calendar_today, name='calendar-today'),
    path('calendar/upcoming/', calendar_upcoming, name='calendar-upcoming'),
    

]