from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Video, Tag
from .serializers import VideoListSerializer, VideoDetailSerializer, TagSerializer


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Video.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VideoDetailSerializer
        return VideoListSerializer

    def get_queryset(self):
        queryset = Video.objects.all()
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        if category:
            queryset = queryset.filter(category=category)
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(featured=True)
        return queryset

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """Increment view count for a video."""
        video = self.get_object()
        video.views_count += 1
        video.save(update_fields=['views_count'])
        return Response({'views_count': video.views_count})

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Return featured videos."""
        qs = Video.objects.filter(featured=True)
        serializer = VideoListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Return list of all categories with counts."""
        from django.db.models import Count
        cats = (
            Video.objects
            .values('category')
            .annotate(count=Count('id'))
            .order_by('category')
        )
        # Add display names
        display_map = dict(Video.CATEGORY_CHOICES)
        data = [
            {
                'value': c['category'],
                'label': display_map.get(c['category'], c['category']),
                'count': c['count'],
            }
            for c in cats
        ]
        return Response(data)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
