"""
Seed script: populates the database with sample videos and testimonials.
Run with: python manage.py shell < seed_data.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()

from videos.models import Video, Tag
from testimonials.models import Testimonial

print("Clearing existing data...")
Video.objects.all().delete()
Tag.objects.all().delete()
Testimonial.objects.all().delete()

# ─── Tags ───────────────────────────────────────────────────────────────────
tags = {}
for name in ['4K', 'Color Grade', 'VFX', 'Slow Motion', 'Aerial', 'Documentary', 'Fashion', 'Sports', 'Wedding', 'Short Film']:
    tags[name] = Tag.objects.create(name=name)

# ─── Videos ─────────────────────────────────────────────────────────────────
print("Creating videos...")

videos_data = [
    {
        'title': 'Cinematic Showreel 2024',
        'description': 'A journey through the most breathtaking cinematography of 2024 — from aerial mountain vistas to intimate close-ups, showcasing the full range of cinematic storytelling.',
        'category': 'cinematic',
        'embed_url': 'https://www.youtube.com/embed/ysz5S6PUM-U',
        'thumbnail_url': 'https://img.youtube.com/vi/ysz5S6PUM-U/maxresdefault.jpg',
        'duration': '3:42',
        'featured': True,
        'order': 1,
        'client_name': 'Personal Project',
        'year': 2024,
        'tags_list': ['4K', 'Color Grade', 'Aerial'],
    },
    {
        'title': 'Nike — Just Do It Campaign',
        'description': 'High-octane commercial edit for Nike\'s global "Just Do It" campaign. Dynamic cuts, precise motion sync, and vibrant color grading designed to inspire.',
        'category': 'commercial',
        'embed_url': 'https://www.youtube.com/embed/WYP9AGtLvRg',
        'thumbnail_url': 'https://img.youtube.com/vi/WYP9AGtLvRg/maxresdefault.jpg',
        'duration': '1:00',
        'featured': True,
        'order': 2,
        'client_name': 'Nike Inc.',
        'year': 2024,
        'tags_list': ['Color Grade', 'Sports'],
    },
    {
        'title': 'Aurora — Official Music Video',
        'description': 'Ethereal music video for emerging artist Aurora. Dreamlike visuals, seamless transitions, and a moody color palette that transforms each frame into living art.',
        'category': 'music_video',
        'embed_url': 'https://www.youtube.com/embed/Zp9JoYJ5xHI',
        'thumbnail_url': 'https://img.youtube.com/vi/Zp9JoYJ5xHI/maxresdefault.jpg',
        'duration': '4:18',
        'featured': True,
        'order': 3,
        'client_name': 'Aurora Records',
        'year': 2024,
        'tags_list': ['Color Grade', 'VFX', 'Slow Motion'],
    },
    {
        'title': 'BMW M Series — Speed Redefined',
        'description': 'Automotive commercial capturing the raw power and elegance of the BMW M Series. Shot at 120fps with high-precision motion control rigs.',
        'category': 'commercial',
        'embed_url': 'https://www.youtube.com/embed/PewOSjGNFQA',
        'thumbnail_url': 'https://img.youtube.com/vi/PewOSjGNFQA/maxresdefault.jpg',
        'duration': '1:30',
        'featured': False,
        'order': 4,
        'client_name': 'BMW Group',
        'year': 2023,
        'tags_list': ['4K', 'Color Grade', 'Slow Motion'],
    },
    {
        'title': 'Lost in Patagonia — Travel Documentary',
        'description': 'A breathtaking journey through the untouched wilderness of Patagonia. Six weeks, 4,000 kilometers, and stories that transcend language.',
        'category': 'documentary',
        'embed_url': 'https://www.youtube.com/embed/jv-GVgNdWWs',
        'thumbnail_url': 'https://img.youtube.com/vi/jv-GVgNdWWs/maxresdefault.jpg',
        'duration': '12:44',
        'featured': True,
        'order': 5,
        'client_name': 'National Geographic',
        'year': 2023,
        'tags_list': ['4K', 'Aerial', 'Documentary'],
    },
    {
        'title': 'Valentina & Marco — Wedding Film',
        'description': 'An intimate cinematic wedding film capturing every emotion of Valentina and Marco\'s special day. From quiet morning preparations to midnight celebrations.',
        'category': 'cinematic',
        'embed_url': 'https://www.youtube.com/embed/O-zpOMYRi0w',
        'thumbnail_url': 'https://img.youtube.com/vi/O-zpOMYRi0w/maxresdefault.jpg',
        'duration': '6:20',
        'featured': False,
        'order': 6,
        'client_name': 'Private Client',
        'year': 2024,
        'tags_list': ['Color Grade', 'Wedding', 'Slow Motion'],
    },
    {
        'title': 'Zara — Summer Collection Reels',
        'description': 'A series of high-fashion social media reels for Zara\'s summer 2024 collection. Fast-paced, trend-setting edits optimized for maximum engagement.',
        'category': 'reels',
        'embed_url': 'https://www.youtube.com/embed/ZkOSg4C2p2o',
        'thumbnail_url': 'https://img.youtube.com/vi/ZkOSg4C2p2o/maxresdefault.jpg',
        'duration': '0:30',
        'featured': False,
        'order': 7,
        'client_name': 'Zara',
        'year': 2024,
        'tags_list': ['Fashion', 'Color Grade'],
    },
    {
        'title': 'TechCorp — Annual Summit Recap',
        'description': 'Corporate highlight reel for TechCorp\'s 2024 annual summit, featuring keynote addresses, product launches, and attendee experiences.',
        'category': 'corporate',
        'embed_url': 'https://www.youtube.com/embed/FTQbiNvZqaY',
        'thumbnail_url': 'https://img.youtube.com/vi/FTQbiNvZqaY/maxresdefault.jpg',
        'duration': '4:05',
        'featured': False,
        'order': 8,
        'client_name': 'TechCorp International',
        'year': 2024,
        'tags_list': ['4K', 'Documentary'],
    },
    {
        'title': 'Short Film: "The Last Frame"',
        'description': 'Award-winning short film exploring the relationship between memory and photography. Shot entirely in black and white with digital color toning.',
        'category': 'cinematic',
        'embed_url': 'https://www.youtube.com/embed/d1YBv2mV3ps',
        'thumbnail_url': 'https://img.youtube.com/vi/d1YBv2mV3ps/maxresdefault.jpg',
        'duration': '8:33',
        'featured': True,
        'order': 9,
        'client_name': 'Independent Film',
        'year': 2023,
        'tags_list': ['Color Grade', 'Short Film', 'VFX'],
    },
    {
        'title': 'Red Bull — Extreme Sports Reel',
        'description': 'Adrenaline-pumping extreme sports compilation for Red Bull. Base jumping, wingsuit flying, and big-wave surfing — all cut to a pulse-pounding soundtrack.',
        'category': 'reels',
        'embed_url': 'https://www.youtube.com/embed/K5E1Bt3YkNI',
        'thumbnail_url': 'https://img.youtube.com/vi/K5E1Bt3YkNI/maxresdefault.jpg',
        'duration': '2:15',
        'featured': False,
        'order': 10,
        'client_name': 'Red Bull Media House',
        'year': 2024,
        'tags_list': ['Sports', 'Slow Motion', '4K'],
    },
]

for vd in videos_data:
    tag_names = vd.pop('tags_list', [])
    video = Video.objects.create(**vd)
    for tn in tag_names:
        if tn in tags:
            video.tags.add(tags[tn])
    print(f"  Created: {video.title}")

# ─── Testimonials ────────────────────────────────────────────────────────────
print("Creating testimonials...")

testimonials_data = [
    {
        'client_name': 'Sarah Mitchell',
        'client_company': 'Nike Inc.',
        'client_role': 'Creative Director',
        'avatar_url': 'https://i.pravatar.cc/150?img=47',
        'rating': 5,
        'review_text': 'Absolutely blown away by the quality of work. The editing transformed our raw footage into a masterpiece that exceeded every expectation. The attention to detail in color grading and music sync is unparalleled. We\'ve already booked them for our next three campaigns.',
        'project_type': 'Commercial',
        'is_featured': True,
    },
    {
        'client_name': 'James Thornton',
        'client_company': 'Aurora Records',
        'client_role': 'A&R Manager',
        'avatar_url': 'https://i.pravatar.cc/150?img=12',
        'rating': 5,
        'review_text': 'Working with this editor was a game-changer for our artist. The music video they created has over 2 million views and counting. The creative vision, technical skill, and turnaround time are all world-class. Highly recommend to any label looking for premium content.',
        'project_type': 'Music Video',
        'is_featured': True,
    },
    {
        'client_name': 'Elena Vasquez',
        'client_company': 'BMW Group',
        'client_role': 'Head of Marketing',
        'avatar_url': 'https://i.pravatar.cc/150?img=31',
        'rating': 5,
        'review_text': 'The automotive commercial they delivered was simply stunning. Every frame was meticulously crafted to showcase our vehicles in the most compelling way. The slow-motion sequences and color work truly set the bar for automotive content.',
        'project_type': 'Commercial',
        'is_featured': True,
    },
    {
        'client_name': 'David Park',
        'client_company': 'TechCorp International',
        'client_role': 'VP of Communications',
        'avatar_url': 'https://i.pravatar.cc/150?img=58',
        'rating': 5,
        'review_text': 'Our annual summit recap video has been shared hundreds of times internally and with clients. The editing captured the energy of the event perfectly. Professional, efficient, and genuinely talented. Will definitely work together again.',
        'project_type': 'Corporate',
        'is_featured': False,
    },
    {
        'client_name': 'Valentina Rossi',
        'client_company': 'Private Client',
        'client_role': 'Bride',
        'avatar_url': 'https://i.pravatar.cc/150?img=25',
        'rating': 5,
        'review_text': 'Words cannot describe how emotional and beautiful our wedding film is. Every time we watch it, it feels like we\'re reliving that magical day. The way they captured our story, the small moments, the emotions — it\'s art. Forever grateful.',
        'project_type': 'Wedding Film',
        'is_featured': True,
    },
    {
        'client_name': 'Marcus Chen',
        'client_company': 'Zara',
        'client_role': 'Social Media Manager',
        'avatar_url': 'https://i.pravatar.cc/150?img=68',
        'rating': 4,
        'review_text': 'The fashion reels they produced for our summer campaign performed exceptionally well — our engagement rates tripled. They understand exactly what works on social media and can translate that into creative content that still feels premium.',
        'project_type': 'Social Media Reels',
        'is_featured': False,
    },
]

for td in testimonials_data:
    t = Testimonial.objects.create(**td)
    print(f"  Created: {t.client_name}")

print("\n[OK] Database seeded successfully!")
print(f"   Videos: {Video.objects.count()}")
print(f"   Tags: {Tag.objects.count()}")
print(f"   Testimonials: {Testimonial.objects.count()}")
