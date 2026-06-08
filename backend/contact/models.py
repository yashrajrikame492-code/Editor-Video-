from django.db import models


class ContactInquiry(models.Model):
    BUDGET_CHOICES = [
        ('under_5k', 'Under ₹5,000'),
        ('5k_15k', '₹5,000 – ₹15,000'),
        ('15k_50k', '₹15,000 – ₹50,000'),
        ('50k_plus', '₹50,000+'),
        ('discuss', 'Let\'s Discuss'),
    ]

    PROJECT_TYPE_CHOICES = [
        ('commercial', 'Commercial'),
        ('music_video', 'Music Video'),
        ('corporate', 'Corporate'),
        ('documentary', 'Documentary'),
        ('reels', 'Social Media Reels'),
        ('wedding', 'Wedding Film'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    project_type = models.CharField(max_length=30, choices=PROJECT_TYPE_CHOICES, blank=True)
    budget_range = models.CharField(max_length=20, choices=BUDGET_CHOICES, blank=True)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name_plural = 'Contact Inquiries'

    def __str__(self):
        return f'{self.name} <{self.email}> — {self.submitted_at.date()}'
