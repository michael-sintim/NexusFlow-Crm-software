from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Avg, Q
from datetime import date
from opportunities.models import Opportunity
from opportunities.serializers import OpportunityListSerializer, OpportunityDetailSerializer
from notifications.models import ActivityLog

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['stage', 'owner', 'contact']
    search_fields = ['title', 'description', 'contact__first_name', 'contact__last_name']
    ordering_fields = ['created_at', 'value', 'probability', 'expected_close_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OpportunityListSerializer
        return OpportunityDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Opportunity.objects.select_related('contact', 'owner')
        
        if user.role == 'admin':
            return queryset
        return queryset.filter(owner=user)
    
    def perform_create(self, serializer):
        opportunity = serializer.save(owner=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='create',
            content_type='opportunity',
            object_id=opportunity.id,
            details={
                'opportunity_title': opportunity.title,
                'value': float(opportunity.value),
                'stage': opportunity.stage
            }
        )
    
    def perform_update(self, serializer):
        old_stage = self.get_object().stage
        opportunity = serializer.save()
        
        # Log stage changes specifically
        if old_stage != opportunity.stage:
            ActivityLog.objects.create(
                user=self.request.user,
                action_type='update',
                content_type='opportunity',
                object_id=opportunity.id,
                details={
                    'opportunity_title': opportunity.title,
                    'stage_changed': True,
                    'old_stage': old_stage,
                    'new_stage': opportunity.stage
                }
            )
        else:
            ActivityLog.objects.create(
                user=self.request.user,
                action_type='update',
                content_type='opportunity',
                object_id=opportunity.id,
                details={
                    'opportunity_title': opportunity.title,
                    'stage_changed': False
                }
            )
    
    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='delete',
            content_type='opportunity',
            object_id=instance.id,
            details={
                'opportunity_title': instance.title,
                'stage': instance.stage,
                'value': float(instance.value)
            }
        )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        """Get pipeline grouped by stage"""
        user = self.request.user
        base_filter = Q() if user.role == 'admin' else Q(owner=user)
        
        pipeline_data = []
        for stage_value, stage_name in Opportunity.STAGE_CHOICES:
            queryset = Opportunity.objects.filter(base_filter, stage=stage_value)
            
            stats = queryset.aggregate(
                count=Count('id'),
                total_value=Sum('value'),
                avg_probability=Avg('probability'),
                avg_days_open=Avg('age_days')
            )
            
            pipeline_data.append({
                'stage': stage_value,
                'stage_name': stage_name,
                'count': stats['count'] or 0,
                'total_value': float(stats['total_value'] or 0),
                'avg_probability': float(stats['avg_probability'] or 0),
                'avg_days_open': float(stats['avg_days_open'] or 0) if stats['avg_days_open'] else 0,
                'opportunities': OpportunityListSerializer(queryset, many=True).data
            })
        
        return Response(pipeline_data)
    
    @action(detail=False, methods=['get'])
    def upcoming_closes(self, request):
        """Get opportunities with upcoming close dates"""
        user = self.request.user
        base_filter = Q() if user.role == 'admin' else Q(owner=user)
        
        upcoming_opps = Opportunity.objects.filter(
            base_filter,
            expected_close_date__gte=date.today(),
            stage__in=['qualified', 'proposal', 'negotiation']
        ).order_by('expected_close_date')[:10]
        
        serializer = OpportunityListSerializer(upcoming_opps, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_stage(self, request, pk=None):
        """Update opportunity stage"""
        opportunity = self.get_object()
        new_stage = request.data.get('stage')
        
        if new_stage not in dict(Opportunity.STAGE_CHOICES):
            return Response({'detail': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_stage = opportunity.stage
        opportunity.stage = new_stage
        
        # Set closed date if moving to closed stages
        if new_stage in ['closed_won', 'closed_lost'] and not opportunity.closed_date:
            from django.utils import timezone
            opportunity.closed_date = timezone.now()
        
        opportunity.save()
        
        ActivityLog.objects.create(
            user=request.user,
            action_type='update',
            content_type='opportunity',
            object_id=opportunity.id,
            details={
                'opportunity_title': opportunity.title,
                'stage_changed': True,
                'old_stage': old_stage,
                'new_stage': new_stage
            }
        )
        
        return Response(OpportunityDetailSerializer(opportunity).data)