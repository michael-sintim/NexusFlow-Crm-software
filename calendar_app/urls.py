# calendar/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalendarEventViewSet, EventReminderViewSet

router = DefaultRouter()
router.register(r'events', CalendarEventViewSet, basename='events')
router.register(r'reminders', EventReminderViewSet, basename='reminders')

urlpatterns = [
    path('calendar/', include(router.urls)),
]