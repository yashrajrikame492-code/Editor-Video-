from rest_framework import serializers
from .models import Video, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class VideoListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'category', 'category_display',
            'embed_url', 'video_file', 'thumbnail_url', 'thumbnail_file', 'duration',
            'tags', 'featured', 'views_count', 'client_name', 'year', 'order',
        ]


class VideoDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Video
        fields = '__all__'
