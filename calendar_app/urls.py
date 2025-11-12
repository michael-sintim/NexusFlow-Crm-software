from django.urls import path
from . import views

urlpatterns = [
    # Primary endpoints
    path('events/', views.EventListCreate.as_view(), name='event-list'),
    path('events/<uuid:pk>/', views.EventDetail.as_view(), name='event-detail'),
    path('events/upcoming/', views.UpcomingEvents.as_view(), name='upcoming-events'),
    path('events/today/', views.TodayEvents.as_view(), name='today-events'),
    
    # Calendar-specific endpoints (for frontend compatibility)
    path('calendar/events/', views.EventListCreate.as_view(), name='calendar-event-list'),
    path('calendar/events/<uuid:pk>/', views.EventDetail.as_view(), name='calendar-event-detail'),
    path('calendar/events/upcoming/', views.UpcomingEvents.as_view(), name='calendar-upcoming-events'),
    path('calendar/events/today/', views.TodayEvents.as_view(), name='calendar-today-events'),
    
    # Reminder endpoints
    path('reminders/', views.EventReminderListCreate.as_view(), name='reminder-list'),
    path('reminders/<uuid:pk>/', views.EventReminderDetail.as_view(), name='reminder-detail'),
]