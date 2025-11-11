# calendar_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.EventListCreate.as_view(), name='event-list'),
    path('events/<int:pk>/', views.EventDetail.as_view(), name='event-detail'),
    path('events/upcoming/', views.UpcomingEvents.as_view(), name='upcoming-events'),
    path('events/today/', views.TodayEvents.as_view(), name='today-events'),
]