from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoViewSet, TagViewSet

router = DefaultRouter()
router.register('videos', VideoViewSet, basename='video')
router.register('tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
    path('categories/', VideoViewSet.as_view({'get': 'categories'})),
]
