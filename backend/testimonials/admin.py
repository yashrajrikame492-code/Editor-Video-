from django.contrib import admin
from .models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'client_company', 'rating', 'is_featured', 'created_at']
    list_filter = ['rating', 'is_featured']
    list_editable = ['is_featured']
    search_fields = ['client_name', 'review_text']
