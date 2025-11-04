# opportunities/urls.py
from django.urls import path
from opportunities.views import OpportunityViewSet

urlpatterns = [
    path('opportunities/', OpportunityViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('opportunities/<uuid:pk>/', OpportunityViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})),
    path('opportunities/pipeline/', OpportunityViewSet.as_view({'get': 'pipeline'})),
    path('opportunities/upcoming_closes/', OpportunityViewSet.as_view({'get': 'upcoming_closes'})),
    path('opportunities/<uuid:pk>/update_stage/', OpportunityViewSet.as_view({'post': 'update_stage'})),
]

