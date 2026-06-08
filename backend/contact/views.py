from rest_framework import generics, status
from rest_framework.response import Response
from .models import ContactInquiry
from .serializers import ContactInquirySerializer


class ContactInquiryCreateView(generics.CreateAPIView):
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Thank you! Your inquiry has been received. We\'ll be in touch soon.'},
            status=status.HTTP_201_CREATED,
        )
