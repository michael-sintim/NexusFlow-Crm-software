from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from datetime import datetime
from tasks.models import Task
from tasks.serializers import TaskListSerializer, TaskDetailSerializer
from notifications.models import ActivityLog, Notification

# Task Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list(request):
    """List all tasks or create a new task"""
    if request.method == 'GET':
        user = request.user
        queryset = Task.objects.select_related(
            'assigned_to', 'related_contact', 'related_opportunity'
        )
        
        if user.role != 'admin':
            queryset = queryset.filter(assigned_to=user)
        
        # Filtering
        status_filter = request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        priority_filter = request.GET.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        task_type_filter = request.GET.get('task_type')
        if task_type_filter:
            queryset = queryset.filter(task_type=task_type_filter)
        
        assigned_to_filter = request.GET.get('assigned_to')
        if assigned_to_filter:
            queryset = queryset.filter(assigned_to=assigned_to_filter)
        
        # Search
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get('ordering', 'due_date')
        if ordering.lstrip('-') in ['due_date', 'priority', 'created_at', 'status']:
            queryset = queryset.order_by(ordering)
        
        serializer = TaskListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print("🔧 Task creation request received")
        print(f"🔧 Request user: {request.user} (ID: {request.user.id})")
        print(f"🔧 Request data: {request.data}")
        
        serializer = TaskDetailSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            print("✅ Serializer is valid, creating task...")
            task = serializer.save()
            print(f"✅ Task created successfully: {task.title} (ID: {task.id})")
            print(f"✅ Task assigned to: {task.assigned_to}")
            print(f"✅ Task due date: {task.due_date}")
            
            # Create notification for assigned user
            if task.assigned_to != request.user:
                Notification.objects.create(
                    user=task.assigned_to,
                    notification_type='task_assigned',
                    title='New Task Assigned',
                    message=f'You have been assigned a new task: {task.title}',
                    related_object_id=task.id
                )
                print(f"📧 Notification created for {task.assigned_to}")
            
            ActivityLog.objects.create(
                user=request.user,
                action_type='create',
                content_type='task',
                object_id=task.id,
                details={
                    'task_title': task.title,
                    'assigned_to': task.assigned_to.get_full_name(),
                    'due_date': task.due_date.isoformat() if task.due_date else None
                }
            )
            print("📝 Activity log created")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Serializer validation failed:")
            print(f"❌ Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    """Retrieve, update or delete a task"""
    user = request.user
    queryset = Task.objects.select_related(
        'assigned_to', 'related_contact', 'related_opportunity'
    )
    
    if user.role != 'admin':
        queryset = queryset.filter(assigned_to=user)
    
    task = get_object_or_404(queryset, pk=pk)
    
    if request.method == 'GET':
        serializer = TaskDetailSerializer(task)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = TaskDetailSerializer(
            task, 
            data=request.data, 
            partial=partial, 
            context={'request': request}
        )
        if serializer.is_valid():
            updated_task = serializer.save()
            ActivityLog.objects.create(
                user=request.user,
                action_type='update',
                content_type='task',
                object_id=updated_task.id,
                details={
                    'task_title': updated_task.title,
                    'status': updated_task.status
                }
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        ActivityLog.objects.create(
            user=request.user,
            action_type='delete',
            content_type='task',
            object_id=task.id,
            details={
                'task_title': task.title
            }
        )
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    """Get current user's tasks"""
    queryset = Task.objects.select_related(
        'assigned_to', 'related_contact', 'related_opportunity'
    ).filter(assigned_to=request.user)
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    # Filter overdue tasks
    overdue = request.GET.get('overdue')
    if overdue == 'true':
        queryset = queryset.filter(due_date__lt=datetime.now())
    
    serializer = TaskListSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_tasks(request):
    """Get overdue tasks"""
    queryset = Task.objects.select_related(
        'assigned_to', 'related_contact', 'related_opportunity'
    ).filter(
        assigned_to=request.user,
        due_date__lt=datetime.now(),
        status__in=['open', 'in_progress']
    )
    serializer = TaskListSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def complete_task(request, pk):
    """Mark task as completed"""
    user = request.user
    queryset = Task.objects.all()
    if user.role != 'admin':
        queryset = queryset.filter(assigned_to=user)
    
    task = get_object_or_404(queryset, pk=pk)
    task.status = 'completed'
    task.save()
    
    ActivityLog.objects.create(
        user=request.user,
        action_type='update',
        content_type='task',
        object_id=task.id,
        details={
            'task_title': task.title,
            'status': 'completed'
        }
    )
    
    return Response(TaskDetailSerializer(task).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def start_task(request, pk):
    """Mark task as in progress"""
    user = request.user
    queryset = Task.objects.all()
    if user.role != 'admin':
        queryset = queryset.filter(assigned_to=user)
    
    task = get_object_or_404(queryset, pk=pk)
    task.status = 'in_progress'
    task.save()
    
    ActivityLog.objects.create(
        user=request.user,
        action_type='update',
        content_type='task',
        object_id=task.id,
        details={
            'task_title': task.title,
            'status': 'in_progress'
        }
    )
    
    return Response(TaskDetailSerializer(task).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get task statistics for dashboard"""
    user = request.user
    base_filter = Q(assigned_to=user)
    
    if user.role == 'admin':
        base_filter = Q()
    
    stats = Task.objects.filter(base_filter).aggregate(
        total=Count('id'),
        open=Count('id', filter=Q(status='open')),
        in_progress=Count('id', filter=Q(status='in_progress')),
        completed=Count('id', filter=Q(status='completed')),
        overdue=Count('id', filter=Q(due_date__lt=datetime.now()) & Q(status__in=['open', 'in_progress']))
    )
    
    return Response(stats)