from django.urls import path
from accounts.views import (
    # Auth views
    register, login, refresh_token, me, 
    update_profile, change_password,
    # User management views
    user_list, user_create, user_detail, 
    user_update, user_delete, user_deactivate, user_activate
)

urlpatterns = [
    # Authentication endpoints
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('refresh_token/', refresh_token, name='refresh_token'),
    path('me/', me, name='me'),
    path('update_profile/', update_profile, name='update_profile'),
    path('change_password/', change_password, name='change_password'),
    
    # User management endpoints (admin)
    path('users/', user_list, name='user_list'),
    path('users/create/', user_create, name='user_create'),
    path('users/<int:pk>/', user_detail, name='user_detail'),
    path('users/<int:pk>/update/', user_update, name='user_update'),
    path('users/<int:pk>/delete/', user_delete, name='user_delete'),
    path('users/<int:pk>/deactivate/', user_deactivate, name='user_deactivate'),
    path('users/<int:pk>/activate/', user_activate, name='user_activate'),
]