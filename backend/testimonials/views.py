from rest_framework import viewsets
from .models import Testimonial
from .serializers import TestimonialSerializer


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

    def get_queryset(self):
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            return Testimonial.objects.filter(is_featured=True)
        return Testimonial.objects.all()
