from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Video(models.Model):
    CATEGORY_CHOICES = [
        ('commercial', 'Commercial'),
        ('music_video', 'Music Video'),
        ('cinematic', 'Cinematic'),
        ('reels', 'Reels'),
        ('corporate', 'Corporate'),
        ('documentary', 'Documentary'),
        ('instagram_reel', 'Instagram Reel'),
        ('youtube_short', 'YouTube Short'),
        ('tutorial', 'Tutorial'),
        ('educational', 'Educational'),
        ('explainer', 'Explainer Video'),
        ('course_content', 'Course Content'),
        ('podcast', 'Podcast'),
        ('real_estate', 'Real Estate'),
        ('ai_videos', 'AI Videos'),
        ('informational','Informational'),
        ('youtube_growth','Youtube Growth'),
        ('business','Business'),
        
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='cinematic')
    embed_url = models.URLField(
        blank=True,
        help_text='YouTube or Vimeo embed URL (alternative to uploading a video file)'
    )
    video_file = models.FileField(
        upload_to='videos/',
        blank=True,
        null=True,
        help_text='Upload a local video file (.mp4, .webm, etc.)'
    )
    thumbnail_url = models.URLField(
        blank=True,
        help_text='Thumbnail image URL (alternative to uploading a thumbnail file)'
    )
    thumbnail_file = models.ImageField(
        upload_to='thumbnails/',
        blank=True,
        null=True,
        help_text='Upload a local thumbnail image'
    )
    duration = models.CharField(max_length=10, blank=True, help_text='e.g. 2:34')
    tags = models.ManyToManyField(Tag, blank=True, related_name='videos')
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text='Display order (lower = first)')
    views_count = models.PositiveIntegerField(default=0)
    client_name = models.CharField(max_length=100, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
