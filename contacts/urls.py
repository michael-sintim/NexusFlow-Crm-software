from django.urls import path
from contacts.views import (
    contact_list, contact_detail, contact_stats, update_last_contacted,
    tag_list, tag_detail, popular_tags
)

urlpatterns = [
    # Contacts
    path('contacts/', contact_list, name='contact-list'),
    path('contacts/<uuid:pk>/', contact_detail, name='contact-detail'),
    path('contacts/stats/', contact_stats, name='contact-stats'),
    path('contacts/<uuid:pk>/update_last_contacted/', update_last_contacted, name='update-last-contacted'),
    
    # Tags
    path('tags/', tag_list, name='tag-list'),
    path('tags/<uuid:pk>/', tag_detail, name='tag-detail'),
    path('tags/popular/', popular_tags, name='popular-tags'),
]