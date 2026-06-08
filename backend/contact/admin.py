from django.contrib import admin
from .models import ContactInquiry


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'project_type', 'budget_range', 'is_read', 'submitted_at']
    list_filter = ['project_type', 'is_read']
    list_editable = ['is_read']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['submitted_at']
