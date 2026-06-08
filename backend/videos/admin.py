from django.contrib import admin
from .models import Video, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'featured', 'views_count', 'year', 'order', 'created_at']
    list_filter = ['category', 'featured', 'year']
    search_fields = ['title', 'description', 'client_name']
    list_editable = ['featured', 'order']
    filter_horizontal = ['tags']
    ordering = ['order', '-created_at']
