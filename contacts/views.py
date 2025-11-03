from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from contacts.models import Contact, Tag
from contacts.serializers import ContactListSerializer, ContactDetailSerializer, TagSerializer
from notifications.models import ActivityLog

# Contact Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def contact_list(request):
    """List all contacts or create a new contact"""
    if request.method == 'GET':
        user = request.user
        queryset = Contact.objects.select_related('owner').prefetch_related('tags')
        
        if user.role != 'admin':
            queryset = queryset.filter(owner=user)
        
        # Filtering
        source = request.GET.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        # Search
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company_name__icontains=search) |
                Q(phone_number__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get('ordering', '-created_at')
        if ordering.lstrip('-') in ['created_at', 'first_name', 'last_name', 'company_name']:
            queryset = queryset.order_by(ordering)
        
        serializer = ContactListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # FIX: Pass the request context to the serializer so it can access the user
        serializer = ContactDetailSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            contact = serializer.save()
            ActivityLog.objects.create(
                user=request.user,
                action_type='create',
                content_type='contact',
                object_id=contact.id,
                details={
                    'contact_name': f"{contact.first_name} {contact.last_name}",
                    'email': contact.email
                }
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def contact_detail(request, pk):
    """Retrieve, update or delete a contact"""
    user = request.user
    queryset = Contact.objects.all()
    if user.role != 'admin':
        queryset = queryset.filter(owner=user)
    
    contact = get_object_or_404(queryset, pk=pk)
    
    if request.method == 'GET':
        serializer = ContactDetailSerializer(contact)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        # FIX: Pass context for updates as well
        serializer = ContactDetailSerializer(contact, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            updated_contact = serializer.save()
            ActivityLog.objects.create(
                user=request.user,
                action_type='update',
                content_type='contact',
                object_id=updated_contact.id,
                details={
                    'contact_name': f"{updated_contact.first_name} {updated_contact.last_name}",
                    'email': updated_contact.email
                }
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        ActivityLog.objects.create(
            user=request.user,
            action_type='delete',
            content_type='contact',
            object_id=contact.id,
            details={
                'contact_name': f"{contact.first_name} {contact.last_name}",
                'email': contact.email
            }
        )
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contact_stats(request):
    """Get contact statistics"""
    user = request.user
    base_filter = Q() if user.role == 'admin' else Q(owner=user)
    
    stats = Contact.objects.filter(base_filter).aggregate(
        total=Count('id'),
        by_source=Count('source'),
        with_company=Count('id', filter=Q(company_name__isnull=False) & ~Q(company_name=''))
    )
    
    source_stats = Contact.objects.filter(base_filter).values('source').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'total_contacts': stats['total'],
        'contacts_with_company': stats['with_company'],
        'source_breakdown': list(source_stats)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_last_contacted(request, pk):
    """Update last contacted timestamp"""
    user = request.user
    queryset = Contact.objects.all()
    if user.role != 'admin':
        queryset = queryset.filter(owner=user)
    
    contact = get_object_or_404(queryset, pk=pk)
    contact.update_last_contacted()
    return Response({'detail': 'Last contacted updated successfully.'})

# Tag Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tag_list(request):
    """List all tags or create a new tag"""
    if request.method == 'GET':
        tags = Tag.objects.annotate(contact_count=Count('contacts')).order_by('-contact_count', 'name')
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def tag_detail(request, pk):
    """Retrieve, update or delete a tag"""
    tag = get_object_or_404(Tag, pk=pk)
    
    if request.method == 'GET':
        serializer = TagSerializer(tag)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = TagSerializer(tag, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        tag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def popular_tags(request):
    """Get most popular tags"""
    popular_tags = Tag.objects.annotate(
        contact_count=Count('contacts')
    ).order_by('-contact_count')[:10]
    serializer = TagSerializer(popular_tags, many=True)
    return Response(serializer.data)