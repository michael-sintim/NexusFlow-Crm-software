from django.urls import path
from tasks.views import (
    task_list, task_detail, my_tasks, overdue_tasks,
    complete_task, start_task, dashboard_stats
)

urlpatterns = [
    path('tasks/', task_list, name='task-list'),
    path('tasks/<uuid:pk>/', task_detail, name='task-detail'),
    path('tasks/my_tasks/', my_tasks, name='my-tasks'),
    path('tasks/overdue/', overdue_tasks, name='overdue-tasks'),
    path('tasks/<uuid:pk>/complete/', complete_task, name='complete-task'),
    path('tasks/<uuid:pk>/start/', start_task, name='start-task'),
    path('tasks/dashboard_stats/', dashboard_stats, name='dashboard-stats'),
]