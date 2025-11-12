from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.EventListCreate.as_view(), name='event-list'),
    path('events/<int:pk>/', views.EventDetail.as_view(), name='event-detail'),
    path('events/upcoming/', views.UpcomingEvents.as_view(), name='upcoming-events'),
    path('events/today/', views.TodayEvents.as_view(), name='today-events'),
    # Add reminder endpoints if needed
    path('reminders/', views.EventReminderListCreate.as_view(), name='reminder-list'),
    path('reminders/<int:pk>/', views.EventReminderDetail.as_view(), name='reminder-detail'),
]