# calendar_app/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import CalendarEvent, EventReminder
from .serializers import CalendarEventSerializer, EventReminderSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

@method_decorator(never_cache, name='dispatch')
class EventListCreate(generics.ListCreateAPIView):
    serializer_class = CalendarEventSerializer
    
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Add no-cache headers
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response

    def get_queryset(self):
        queryset = CalendarEvent.objects.all()
        
        # Filter by assigned user
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(assigned_to=user)
        
        # Date range filtering
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date)
                end = datetime.fromisoformat(end_date)
                queryset = queryset.filter(
                    Q(start_time__range=(start, end)) |
                    Q(end_time__range=(start, end)) |
                    Q(start_time__lte=start, end_time__gte=end)
                )
            except ValueError:
                pass
        
        # Event type filtering
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        return queryset.select_related(
            'assigned_to', 'created_by', 'customer', 'opportunity'
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        queryset = CalendarEvent.objects.all()
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(assigned_to=user)
        return queryset.select_related(
            'assigned_to', 'created_by', 'customer', 'opportunity'
        )
    
    def patch(self, request, *args, **kwargs):
        """Handle status changes and partial updates"""
        event = self.get_object()
        
        # Check if this is a status change request
        new_status = request.data.get('status')
        if new_status and new_status in dict(CalendarEvent.STATUS_CHOICES):
            event.status = new_status
            event.save()
            return Response({'status': 'Status updated'})
        
        # Otherwise, perform normal update
        return self.partial_update(request, *args, **kwargs)

class UpcomingEvents(generics.ListAPIView):
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        user = self.request.user
        now = timezone.now()
        week_later = now + timedelta(days=7)
        
        queryset = CalendarEvent.objects.filter(
            start_time__range=(now, week_later),
            status__in=['scheduled', 'in_progress']
        )
        
        if not user.is_staff:
            queryset = queryset.filter(assigned_to=user)
            
        return queryset.order_by('start_time')[:10]

class TodayEvents(generics.ListAPIView):
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        user = self.request.user
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        queryset = CalendarEvent.objects.filter(
            start_time__date=today
        )
        
        if not user.is_staff:
            queryset = queryset.filter(assigned_to=user)
            
        return queryset.order_by('start_time')

# Keep your existing EventReminder views if needed
class EventReminderListCreate(generics.ListCreateAPIView):
    serializer_class = EventReminderSerializer
    queryset = EventReminder.objects.all()

class EventReminderDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventReminderSerializer
    queryset = EventReminder.objects.all()