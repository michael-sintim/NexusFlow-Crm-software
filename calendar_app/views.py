# calendar/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import CalendarEvent, EventReminder
from .serializers import CalendarEventSerializer, EventReminderSerializer

class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventSerializer
    
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
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events for the current user"""
        now = timezone.now()
        week_later = now + timedelta(days=7)
        
        events = self.get_queryset().filter(
            start_time__range=(now, week_later),
            status__in=['scheduled', 'in_progress']
        ).order_by('start_time')[:10]
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's events"""
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        events = self.get_queryset().filter(
            start_time__date=today
        ).order_by('start_time')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change event status"""
        event = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(CalendarEvent.STATUS_CHOICES):
            event.status = new_status
            event.save()
            return Response({'status': 'Status updated'})
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class EventReminderViewSet(viewsets.ModelViewSet):
    serializer_class = EventReminderSerializer
    queryset = EventReminder.objects.all()