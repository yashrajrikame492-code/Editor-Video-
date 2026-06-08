import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedVideos, getTestimonials } from '../api';
import VideoCard from '../components/VideoCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';
import './HomePage.css';

const BACKEND_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

/* ── Data ──────────────────────────────────────────────────────────────── */
/* ── Data ──────────────────────────────────────────────────────────────── */
const BENTO_SERVICES = [
  {
    id: 'youtube',
    type: 'hero',
    title: 'YouTube Video Editing',
    eyebrow: 'Core Service',
    desc: 'Engaging, narrative-driven editing built to optimize retention, click-through-rates, and channel growth.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-adjusting-sound-on-audio-mixer-41617-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop',
    metrics: '120M+ Views Generated',
    tag: 'Retention Engine',
    caseStudy: {
      title: 'YouTube Growth System',
      tagline: 'How we generated 120M+ views for creators',
      overview: 'Our editing methodology focuses on narrative pacing, aggressive hook optimization, and high-retention editing patterns that align with the YouTube recommendation algorithm.',
      kpis: [
        { label: 'Avg View Duration', val: '+45%' },
        { label: 'Click-Through Rate', val: '12.8%' },
        { label: 'Subscribers Gained', val: '2.4M+' }
      ],
      testimonial: {
        text: 'The editing structure completely transformed our channel. Our average watch time grew from 3 minutes to over 7 minutes in just two months.',
        author: 'Ali Abdaal',
        role: 'Creator & Educator'
      },
      beforeFilter: 'saturate(0.3) contrast(0.6) brightness(1.15)',
      afterFilter: 'contrast(1.15) saturate(1.2) sepia(0.08)',
      imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop'
    }
  },
  {
    id: 'commercial',
    type: 'hero',
    title: 'Commercial Ads',
    eyebrow: 'Production',
    desc: 'High-impact brand films and commercials designed to capture attention and drive product conversions.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-filmmaker-looking-through-camera-viewfinder-41804-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop',
    metrics: '500+ Videos Delivered',
    tag: 'Conversion Focus',
    caseStudy: {
      title: 'Cinematic Brand Campaigns',
      tagline: 'Premium advertisements that convert viewers into customers',
      overview: 'We craft cinematic brand films and TV advertisements that capture attention within the first 2 seconds, maintaining premium framing and elite sound design.',
      kpis: [
        { label: 'Ad Conversion Rate', val: '+240%' },
        { label: 'Delivered Masters', val: '500+' },
        { label: 'Client Satisfaction', val: '99.2%' }
      ],
      testimonial: {
        text: 'Their cinematic production values gave our brand campaign the premium editorial look we needed to stand out in the European market.',
        author: 'Sarah Jenkins',
        role: 'Director of Marketing, LVMH Group'
      },
      beforeFilter: 'saturate(0.2) contrast(0.5) brightness(1.2)',
      afterFilter: 'contrast(1.2) saturate(1.1) sepia(0.05)',
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop'
    }
  },
  {
    id: 'storytelling',
    type: 'hero',
    title: 'Brand Storytelling',
    eyebrow: 'Editorial',
    desc: 'Cinematic documentaries and authentic corporate narratives that build emotional brand connections.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cinematographer-operating-camera-on-set-41908-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    metrics: '98% Client Retention',
    tag: 'Documentary Grade',
    caseStudy: {
      title: 'Documentary & Brand Stories',
      tagline: 'Emotional connection through authentic cinema',
      overview: 'Documentary-style storytelling focusing on human emotion, pacing, and professional pacing to establish high authority brand presence.',
      kpis: [
        { label: 'Audience Engagement', val: '+180%' },
        { label: 'Client Retention', val: '98%' },
        { label: 'Award Nominations', val: '6' }
      ],
      testimonial: {
        text: 'A masterclass in narrative pacing. The documentary felt authentic, emotional, and resonated deeply with our foundation supporters.',
        author: 'Marcus Aurel',
        role: 'Founder, Aurel Foundation'
      },
      beforeFilter: 'saturate(0.3) contrast(0.7) brightness(1.1)',
      afterFilter: 'contrast(1.1) saturate(1.2) sepia(0.12)',
      imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop'
    }
  },
  {
    id: 'strategy',
    type: 'hero',
    title: 'Content Strategy',
    eyebrow: 'Consulting',
    desc: 'Audience scaling architectures designed to adapt editing hooks and localizations across international markets.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-typing-on-keyboard-in-dark-workspace-42004-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    metrics: '15+ Countries Served',
    tag: 'Global Reach',
    caseStudy: {
      title: 'Global Audience Expansion',
      tagline: 'Scaling media production across international markets',
      overview: 'A full-funnel content design framework designed to adapt editing hooks, graphics, and subtitles for global multi-channel delivery.',
      kpis: [
        { label: 'Countries Reached', val: '15+' },
        { label: 'View Growth', val: '+450M' },
        { label: 'ROI Multiplier', val: '4.8x' }
      ],
      testimonial: {
        text: 'Their localization strategy allowed us to launch Spanish and German channels effortlessly, doubling our brand footprint in 6 months.',
        author: 'David Dobrik',
        role: 'Global Media Director'
      },
      beforeFilter: 'saturate(0.4) contrast(0.8) brightness(1.1)',
      afterFilter: 'contrast(1.2) saturate(1.15) sepia(0.04)',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop'
    }
  }
];

const MARQUEE_ITEMS = [
  'YouTube', 'Commercials', 'Documentaries', 'Reels', 'Color Grading',
  'Motion Graphics', 'Wedding Films', 'Corporate Videos', 'Branded Content', 'VFX',
];

/* ── Stat Counter Card ─────────────────────────────────────────────────── */
function StatCard({ value, suffix, label, delay }) {
  const { ref, display } = useCountUp(value, 2200, suffix);
  return (
    <div className="stat-card reveal" style={{ transitionDelay: `${delay}ms` }}>
      <div className="stat-card__number gold-text" ref={ref}>{display}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

/* ── Star Rating ────────────────────────────────────────────────────────── */
function StarRating({ rating = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star${i < rating ? '' : ' empty'}`}>★</span>
      ))}
    </div>
  );
}

/* ── HomePage ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTesti, setActiveTesti] = useState(0);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [hoveredCard, setHoveredCard] = useState(null);

  useScrollReveal();

  useEffect(() => {
    Promise.all([
      getFeaturedVideos(),
      getTestimonials({ featured: true }),
    ]).then(([vRes, tRes]) => {
      setFeaturedVideos(vRes.data.results || vRes.data);
      setTestimonials(tRes.data.results || tRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const timer = setInterval(() => {
      setActiveTesti(p => (p + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [testimonials]);

  useEffect(() => {
    if (showreelOpen || activeCaseStudy) {
      document.body.classList.add('showreel-modal-active');
    } else {
      document.body.classList.remove('showreel-modal-active');
    }
    return () => {
      document.body.classList.remove('showreel-modal-active');
    };
  }, [showreelOpen, activeCaseStudy]);

  useEffect(() => {
    let player;
    let timer;

    const initPlayer = () => {
      const el = document.getElementById('hero-yt-player');
      if (!el) return;

      player = new window.YT.Player('hero-yt-player', {
        videoId: 'T6dCntaqHZ0',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          start: 45,
          end: 180,
          loop: 0
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            const endedCode = window.YT?.PlayerState?.ENDED ?? 0;
            const pausedCode = window.YT?.PlayerState?.PAUSED ?? 2;
            if (event.data === endedCode) {
              event.target.seekTo(45);
              event.target.playVideo();
            } else if (event.data === pausedCode) {
              const currentTime = event.target.getCurrentTime();
              if (currentTime >= 178 || currentTime < 44) {
                event.target.seekTo(45);
                event.target.playVideo();
              }
            }
          }
        }
      });
    };

    const checkAPI = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        timer = setTimeout(checkAPI, 100);
      }
    };

    if (!window.YT_API_LOADED) {
      window.YT_API_LOADED = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    checkAPI();

    return () => {
      clearTimeout(timer);
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, []);

  return (
    <div className="home-page">

      {/* ═══════════════ HERO ═══════════════════════════════════════════ */}
      <section className="hero" aria-label="Hero section">
        {/* Background Video */}
        <div className="hero__bg">
          <div className="hero__video-wrap">
            <div id="hero-yt-player" className="hero__iframe" />
          </div>
          {/* Composite layers */}
          <div className="hero__overlay" />
          <div className="hero__vignette" />
          <div className="hero__noise" />
          <div className="hero__gradient-bottom" />
        </div>

        {/* Hero Content */}
        <div className="hero__content container">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" />
            <span>Award-Winning Cinematics</span>
            <span className="hero__eyebrow-line" />
          </div>

          <h1 className="hero__headline display-title">
            <span className="hero__headline-line hero__hl-1">Turning Raw</span>
            <span className="hero__headline-line hero__hl-2">
              Footage Into
            </span>
            <span className="hero__headline-line hero__hl-3 gold-text">
              Cinematic
            </span>
            <span className="hero__headline-line hero__hl-4 gold-text">
              Experiences.
            </span>
          </h1>

          <p className="hero__sub">
            Video editor & colorist crafting immersive narratives for
            global brands, independent artists, and visionary directors.
          </p>

          <div className="hero__actions">
            <button 
              onClick={() => setShowreelOpen(true)} 
              className="btn-gold hero__btn-primary"
              data-cursor="magnetic"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Play Showreel</span>
            </button>
            <Link to="/portfolio" className="btn-outline" data-cursor="magnetic">
              <span>Explore Work</span>
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Floating stat chips */}
          <div className="hero__chips">
            <div className="hero__chip delay-1">
              <span className="hero__chip-val">120+</span>
              <span className="hero__chip-lbl">Projects</span>
            </div>
            <div className="hero__chip delay-2">
              <span className="hero__chip-val">8</span>
              <span className="hero__chip-lbl">Years</span>
            </div>
            <div className="hero__chip delay-3">
              <span className="hero__chip-val">50+</span>
              <span className="hero__chip-lbl">Clients</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hero__scroll">
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ═══════════════ MARQUEE STRIP ══════════════════════════════════ */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
              <span className="marquee-dot">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════ FEATURED WORK ══════════════════════════════════ */}
      <section className="section featured-section" aria-label="Featured work">
        <div className="container">
          <div className="featured-header">
            <div className="featured-header__left">
              <p className="section-eyebrow reveal">Selected Work</p>
              <h2 className="section-title reveal delay-1">Featured Projects</h2>
              <div className="gold-divider reveal delay-2" />
            </div>
            <Link to="/portfolio" className="btn-outline reveal reveal-right">
              <span>View All Work</span>
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="loading-spinner" /></div>
          ) : (
            <div className="featured-grid">
              {featuredVideos.slice(0, 6).map((video, i) => (
                <VideoCard key={video.id} video={video} delay={i * 90} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ STATS ══════════════════════════════════════════ */}
      <section className="stats-section" aria-label="Statistics">
        <div className="stats-section__bg" />
        <div className="container">
          <div className="stats-grid">
            <StatCard value={120}  suffix="+"  label="Projects Edited"    delay={0}   />
            <StatCard value={100}  suffix="M+" label="Views Generated"    delay={100} />
            <StatCard value={50}   suffix="+"  label="Happy Clients"      delay={200} />
            <StatCard value={8}    suffix="+"  label="Years Experience"   delay={300} />
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES & BENTO GRID ═══════════════════════════ */}
      <section className="section services-section" aria-label="Services">
        <div className="container">
          <div className="services-header">
            <p className="section-eyebrow reveal">What I Do</p>
            <h2 className="section-title reveal delay-1">Services & Capabilities</h2>
            <div className="gold-divider reveal delay-2" />
            <p className="services-sub reveal delay-3">
              An asymmetric bento layout demonstrating post-production craftsmanship. Hover hero cards for video previews, click to expand case studies.
            </p>
          </div>

          <div className="bento-grid">
            {/* 1. YouTube Video Editing (Hero, span 8, row span 2) */}
            <div 
              className="bento-card bento-card--hero bento-card--youtube"
              onMouseEnter={() => setHoveredCard('youtube')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => { setActiveCaseStudy(BENTO_SERVICES[0]); setSliderPos(50); }}
              data-cursor="play"
            >
              <div className="bento-card__media">
                {hoveredCard === 'youtube' ? (
                  <video src={BENTO_SERVICES[0].videoUrl} muted loop autoPlay playsInline className="bento-card__video" />
                ) : (
                  <img src={BENTO_SERVICES[0].thumbnail} alt={BENTO_SERVICES[0].title} className="bento-card__img" />
                )}
                <div className="bento-card__overlay" />
              </div>
              <div className="bento-card__content">
                <span className="bento-card__eyebrow">{BENTO_SERVICES[0].eyebrow}</span>
                <h3 className="bento-card__title">{BENTO_SERVICES[0].title}</h3>
                <p className="bento-card__desc">{BENTO_SERVICES[0].desc}</p>
                <div className="bento-card__footer">
                  <span className="bento-card__metric">{BENTO_SERVICES[0].metrics}</span>
                  <span className="bento-card__badge">{BENTO_SERVICES[0].tag}</span>
                </div>
              </div>
            </div>

            {/* 2. Motion Graphics (Medium, span 4, tilt) */}
            <div className="bento-card bento-card--medium bento-card--motion" data-cursor="hover">
              <div className="bento-card__glow" />
              <div className="bento-card__content">
                <div className="bento-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="bento-card__title">Motion Graphics</h3>
                <p className="bento-card__desc">Dynamic titles, lower-thirds, kinetic typography, and animated accents that elevate production value.</p>
                <span className="bento-card__badge" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Tilt Dynamic</span>
              </div>
            </div>

            {/* 3. Sound Design (Small, span 4) */}
            <div className="bento-card bento-card--small bento-card--sound">
              <div className="bento-card__content">
                <div className="bento-card__icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </div>
                <div className="bento-card__small-body">
                  <span className="bento-card__small-num">Spatial Audio</span>
                  <h4 className="bento-card__small-title">Sound Design & Mix</h4>
                  <p className="bento-card__small-desc">Immersive cinema foley, soundscapes, and clear vocal levels.</p>
                </div>
              </div>
            </div>

            {/* 4. Commercial Ads (Hero, span 12, row span 2) */}
            <div 
              className="bento-card bento-card--hero bento-card--commercial"
              onMouseEnter={() => setHoveredCard('commercial')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => { setActiveCaseStudy(BENTO_SERVICES[1]); setSliderPos(50); }}
              data-cursor="play"
            >
              <div className="bento-card__media">
                {hoveredCard === 'commercial' ? (
                  <video src={BENTO_SERVICES[1].videoUrl} muted loop autoPlay playsInline className="bento-card__video" />
                ) : (
                  <img src={BENTO_SERVICES[1].thumbnail} alt={BENTO_SERVICES[1].title} className="bento-card__img" />
                )}
                <div className="bento-card__overlay" />
              </div>
              <div className="bento-card__content">
                <span className="bento-card__eyebrow">{BENTO_SERVICES[1].eyebrow}</span>
                <h3 className="bento-card__title">{BENTO_SERVICES[1].title}</h3>
                <p className="bento-card__desc">{BENTO_SERVICES[1].desc}</p>
                <div className="bento-card__footer">
                  <span className="bento-card__metric">{BENTO_SERVICES[1].metrics}</span>
                  <span className="bento-card__badge">{BENTO_SERVICES[1].tag}</span>
                </div>
              </div>
            </div>

            {/* 5. Brand Storytelling (Hero, span 8, row span 2) */}
            <div 
              className="bento-card bento-card--hero bento-card--storytelling"
              onMouseEnter={() => setHoveredCard('storytelling')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => { setActiveCaseStudy(BENTO_SERVICES[2]); setSliderPos(50); }}
              data-cursor="play"
            >
              <div className="bento-card__media">
                {hoveredCard === 'storytelling' ? (
                  <video src={BENTO_SERVICES[2].videoUrl} muted loop autoPlay playsInline className="bento-card__video" />
                ) : (
                  <img src={BENTO_SERVICES[2].thumbnail} alt={BENTO_SERVICES[2].title} className="bento-card__img" />
                )}
                <div className="bento-card__overlay" />
              </div>
              <div className="bento-card__content">
                <span className="bento-card__eyebrow">{BENTO_SERVICES[2].eyebrow}</span>
                <h3 className="bento-card__title">{BENTO_SERVICES[2].title}</h3>
                <p className="bento-card__desc">{BENTO_SERVICES[2].desc}</p>
                <div className="bento-card__footer">
                  <span className="bento-card__metric">{BENTO_SERVICES[2].metrics}</span>
                  <span className="bento-card__badge">{BENTO_SERVICES[2].tag}</span>
                </div>
              </div>
            </div>

            {/* 6. Color Grading (Medium, span 4, tilt) */}
            <div className="bento-card bento-card--medium bento-card--color" data-cursor="hover">
              <div className="bento-card__glow" />
              <div className="bento-card__content">
                <div className="bento-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                    <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <h3 className="bento-card__title">Color Grading</h3>
                <p className="bento-card__desc">Hollywood-grade LUT development, HDR color science matching, contrast adjustments, and look design.</p>
                <span className="bento-card__badge" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Tilt Dynamic</span>
              </div>
            </div>

            {/* 7. Thumbnail Design (Small, span 4) */}
            <div className="bento-card bento-card--small bento-card--thumbnail">
              <div className="bento-card__content">
                <div className="bento-card__icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className="bento-card__small-body">
                  <span className="bento-card__small-num">+18% CTR Growth</span>
                  <h4 className="bento-card__small-title">Thumbnail Design</h4>
                  <p className="bento-card__small-desc">Psychology-based design for high click hooks.</p>
                </div>
              </div>
            </div>

            {/* 8. VFX Integration (Medium, span 4, tilt) */}
            <div className="bento-card bento-card--medium bento-card--vfx" data-cursor="hover">
              <div className="bento-card__glow" />
              <div className="bento-card__content">
                <div className="bento-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M21 12H3" />
                  </svg>
                </div>
                <h3 className="bento-card__title">VFX Integration</h3>
                <p className="bento-card__desc">Seamless sky replacements, motion tracking, wire removals, chroma key green-screen, and digital cleanups.</p>
                <span className="bento-card__badge" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Tilt Dynamic</span>
              </div>
            </div>

            {/* 9. Captions & Subtitles (Small, span 4) */}
            <div className="bento-card bento-card--small bento-card--captions">
              <div className="bento-card__content">
                <div className="bento-card__icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M7 15h4M13 15h4M7 9h10" />
                  </svg>
                </div>
                <div className="bento-card__small-body">
                  <span className="bento-card__small-num">99% Legibility</span>
                  <h4 className="bento-card__small-title">Captions & Subtitles</h4>
                  <p className="bento-card__small-desc">Pop typography, emoji cues, and translations.</p>
                </div>
              </div>
            </div>

            {/* 10. Social Media Cuts (Small, span 4) */}
            <div className="bento-card bento-card--small bento-card--social">
              <div className="bento-card__content">
                <div className="bento-card__icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <div className="bento-card__small-body">
                  <span className="bento-card__small-num">Viral Shorts</span>
                  <h4 className="bento-card__small-title">Social Media Cuts</h4>
                  <p className="bento-card__small-desc">Fast hooks for TikTok, Reels, and YT Shorts.</p>
                </div>
              </div>
            </div>

            {/* 11. Podcast Editing (Medium, span 4, tilt) */}
            <div className="bento-card bento-card--medium bento-card--podcast" data-cursor="hover">
              <div className="bento-card__glow" />
              <div className="bento-card__content">
                <div className="bento-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                    <path d="M12 1v11M12 18v5M19 12a7 7 0 0 1-14 0" />
                  </svg>
                </div>
                <h3 className="bento-card__title">Podcast Editing</h3>
                <p className="bento-card__desc">Clean dialogue mixes, multi-cam switches, vocal pop compression, and background level adjustments.</p>
                <span className="bento-card__badge" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Tilt Dynamic</span>
              </div>
            </div>

            {/* 12. Video SEO Optimization (Small, span 4) */}
            <div className="bento-card bento-card--small bento-card--seo">
              <div className="bento-card__content">
                <div className="bento-card__icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="bento-card__small-body">
                  <span className="bento-card__small-num">Algorithmic</span>
                  <h4 className="bento-card__small-title">Video SEO Strategy</h4>
                  <p className="bento-card__small-desc">Metadata structures, keyword mapping, tag optimization.</p>
                </div>
              </div>
            </div>

            {/* 13. Content Strategy (Hero, span 8, row span 2) */}
            <div 
              className="bento-card bento-card--hero bento-card--strategy"
              onMouseEnter={() => setHoveredCard('strategy')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => { setActiveCaseStudy(BENTO_SERVICES[3]); setSliderPos(50); }}
              data-cursor="play"
            >
              <div className="bento-card__media">
                {hoveredCard === 'strategy' ? (
                  <video src={BENTO_SERVICES[3].videoUrl} muted loop autoPlay playsInline className="bento-card__video" />
                ) : (
                  <img src={BENTO_SERVICES[3].thumbnail} alt={BENTO_SERVICES[3].title} className="bento-card__img" />
                )}
                <div className="bento-card__overlay" />
              </div>
              <div className="bento-card__content">
                <span className="bento-card__eyebrow">{BENTO_SERVICES[3].eyebrow}</span>
                <h3 className="bento-card__title">{BENTO_SERVICES[3].title}</h3>
                <p className="bento-card__desc">{BENTO_SERVICES[3].desc}</p>
                <div className="bento-card__footer">
                  <span className="bento-card__metric">{BENTO_SERVICES[3].metrics}</span>
                  <span className="bento-card__badge">{BENTO_SERVICES[3].tag}</span>
                </div>
              </div>
            </div>

            {/* 14. Client Success Dashboard (Medium/Large, span 6, row span 2) */}
            <div className="bento-card bento-card--dashboard">
              <div className="bento-card__content">
                <span className="bento-card__eyebrow">Client Impact</span>
                <h3 className="bento-card__title">Performance Metrics</h3>
                
                <div className="dashboard-grid">
                  <div className="dash-widget">
                    <span className="dash-widget__label">Avg Watch Time</span>
                    <div className="dash-widget__value-row">
                      <span className="dash-widget__value">+48%</span>
                      <span className="dash-widget__trend">↑</span>
                    </div>
                    <svg viewBox="0 0 100 30" width="100%" height="24" className="sparkline">
                      <path d="M 0 25 Q 20 5 40 20 T 80 5 T 100 2" fill="none" stroke="#22c55e" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="dash-widget">
                    <span className="dash-widget__label">CTR Growth</span>
                    <div className="dash-widget__value-row">
                      <span className="dash-widget__value">12.4%</span>
                      <span className="dash-widget__trend">↑</span>
                    </div>
                    <svg viewBox="0 0 100 30" width="100%" height="24" className="sparkline">
                      <path d="M 0 20 Q 25 25 50 15 T 75 10 T 100 5" fill="none" stroke="#22c55e" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="dash-widget">
                    <span className="dash-widget__label">Subscribers Gained</span>
                    <div className="dash-widget__value-row">
                      <span className="dash-widget__value">1.2M+</span>
                      <span className="dash-widget__trend">↑</span>
                    </div>
                    <div className="dash-widget__bar-grid">
                      <div className="dash-widget__bar" style={{ height: '30%' }} />
                      <div className="dash-widget__bar" style={{ height: '50%' }} />
                      <div className="dash-widget__bar" style={{ height: '40%' }} />
                      <div className="dash-widget__bar" style={{ height: '80%' }} />
                    </div>
                  </div>
                  <div className="dash-widget">
                    <span className="dash-widget__label">Revenue Impact</span>
                    <div className="dash-widget__value-row">
                      <span className="dash-widget__value gold-text">$8.5M+</span>
                    </div>
                    <span className="dash-widget__sub">Attributed ROI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 15. Trusted By Achievements (Medium/Large, span 6, row span 2) */}
            <div className="bento-card bento-card--trusted">
              <div className="bento-card__content">
                <span className="bento-card__eyebrow">Enterprise Credentials</span>
                <h3 className="bento-card__title">Trusted By Leading Brands</h3>
                <p className="bento-card__desc">Delivering high-caliber post-production and strategy for global corporations and educators.</p>
                
                <div className="trusted-logos">
                  <div className="trusted-logo" data-cursor="hover">Google</div>
                  <div className="trusted-logo" data-cursor="hover">Adobe</div>
                  <div className="trusted-logo" data-cursor="hover">Shopify</div>
                  <div className="trusted-logo" data-cursor="hover">Notion</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Case Study Fullscreen Expansion Modal Overlay */}
      {activeCaseStudy && (
        <div className="case-study-modal">
          <div className="case-study-modal__backdrop" onClick={() => setActiveCaseStudy(null)} />
          <div className="case-study-modal__content">
            {/* Close Button */}
            <button 
              className="case-study-modal__close"
              onClick={() => setActiveCaseStudy(null)}
              aria-label="Close Case Study"
              data-cursor="magnetic"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="case-study-modal__scrollable">
              <span className="case-study-modal__eyebrow">Case Study Case Analysis</span>
              <h2 className="case-study-modal__title">{activeCaseStudy.caseStudy.title}</h2>
              <p className="case-study-modal__tagline">{activeCaseStudy.caseStudy.tagline}</p>
              
              <div className="case-study-modal__grid">
                {/* Before/After Split Screen Slider */}
                <div className="case-study-modal__slider-column">
                  <span className="slider-title-tag">Before / After Color Grade (Drag Center Bar)</span>
                  <div className="grading-slider">
                    <div className="grading-slider__image-container">
                      {/* After (Graded) */}
                      <img 
                        src={activeCaseStudy.caseStudy.imageUrl} 
                        alt="Graded Footage" 
                        className="grading-slider__img" 
                        style={{ filter: activeCaseStudy.caseStudy.afterFilter }}
                      />
                      {/* Before (LOG, cropped dynamically using clip-path) */}
                      <div 
                        className="grading-slider__before-overlay"
                        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                      >
                        <img 
                          src={activeCaseStudy.caseStudy.imageUrl} 
                          alt="Raw LOG Footage" 
                          className="grading-slider__img"
                          style={{ filter: activeCaseStudy.caseStudy.beforeFilter }}
                        />
                      </div>
                    </div>
                    {/* Slider divider line and drag badge */}
                    <div className="grading-slider__handle" style={{ left: `${sliderPos}%` }}>
                      <div className="grading-slider__handle-line" />
                      <div className="grading-slider__handle-button">
                        ⟷
                      </div>
                    </div>
                    {/* Invisible high-performance Input Range over entire container */}
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderPos} 
                      onChange={(e) => setSliderPos(Number(e.target.value))} 
                      className="grading-slider__range"
                      data-cursor="scrub"
                    />
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="case-study-modal__info-column">
                  <div className="case-study-modal__block">
                    <h4 className="case-study-modal__section-heading">Overview</h4>
                    <p className="case-study-modal__text">{activeCaseStudy.caseStudy.overview}</p>
                  </div>

                  <div className="case-study-modal__block">
                    <h4 className="case-study-modal__section-heading">Key KPIs</h4>
                    <div className="case-study-modal__kpis">
                      {activeCaseStudy.caseStudy.kpis.map((kpi, idx) => (
                        <div key={idx} className="case-study-modal__kpi-card">
                          <span className="kpi-val">{kpi.val}</span>
                          <span className="kpi-lbl">{kpi.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="case-study-modal__block">
                    <h4 className="case-study-modal__section-heading">Client Testimonial</h4>
                    <blockquote className="case-study-modal__quote">
                      "{activeCaseStudy.caseStudy.testimonial.text}"
                      <cite className="case-study-modal__quote-cite">
                        <strong>{activeCaseStudy.caseStudy.testimonial.author}</strong>
                        <span>{activeCaseStudy.caseStudy.testimonial.role}</span>
                      </cite>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ PROCESS ════════════════════════════════════════ */}
      <section className="section process-section" aria-label="Creative process">
        <div className="process-section__bg" />
        <div className="container">
          <div className="process-header">
            <p className="section-eyebrow reveal">How I Work</p>
            <h2 className="section-title reveal delay-1">The Process</h2>
            <div className="gold-divider reveal delay-2" />
          </div>

          <div className="process-steps">
            {[
              {
                num: '01',
                title: 'Pre-Production',
                desc: 'We align on vision, story structure, reference reels, and the emotional arc of your project before a single cut is made.',
              },
              {
                num: '02',
                title: 'Edit & Grade',
                desc: 'Frame-perfect editing, precision color science, and immersive sound design transform raw footage into a cinematic experience.',
              },
              {
                num: '03',
                title: 'Delivery',
                desc: 'Multiple format exports, revision rounds, and master files delivered clean to every platform you need.',
              },
            ].map((step, i) => (
              <div key={step.num} className={`process-step reveal delay-${i + 1}`}>
                <div className="process-step__num gold-text">{step.num}</div>
                <div className="process-step__connector" />
                <h3 className="process-step__title">{step.title}</h3>
                <p className="process-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="section testi-section" aria-label="Testimonials">
          <div className="container">
            <div className="testi-header">
              <p className="section-eyebrow reveal">Client Love</p>
              <h2 className="section-title reveal delay-1">What Clients Say</h2>
              <div className="gold-divider center reveal delay-2" />
            </div>

            <div className="testi-carousel reveal delay-3">
              <div className="testi-card glass-card">
                <div className="testi-quote-mark">"</div>
                <p className="testi-text">{testimonials[activeTesti]?.review_text}</p>
                <StarRating rating={testimonials[activeTesti]?.rating || 5} />
                <div className="testi-author">
                  <img
                    src={testimonials[activeTesti]?.avatar_url || `https://i.pravatar.cc/60?u=${activeTesti}`}
                    alt={testimonials[activeTesti]?.client_name}
                    className="testi-avatar"
                  />
                  <div>
                    <p className="testi-name">{testimonials[activeTesti]?.client_name}</p>
                    <p className="testi-role">
                      {testimonials[activeTesti]?.client_role}
                      {testimonials[activeTesti]?.client_company && ` @ ${testimonials[activeTesti].client_company}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="testi-dots">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`testi-dot${i === activeTesti ? ' active' : ''}`}
                    onClick={() => setActiveTesti(i)}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="testi-cta reveal delay-4">
              <Link to="/testimonials" className="btn-outline">
                <span>Read All Reviews</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ CTA BANNER ═════════════════════════════════════ */}
      <section className="cta-banner" aria-label="Call to action">
        <div className="cta-banner__bg" />
        <div className="cta-banner__glow" />
        <div className="container">
          <div className="cta-banner__inner">
            <p className="section-eyebrow reveal" style={{ justifyContent: 'center' }}>Ready?</p>
            <h2 className="cta-banner__title display-title reveal delay-1">
              Let's Create Something<br />
              <span className="gold-text">Extraordinary.</span>
            </h2>
            <p className="cta-banner__sub reveal delay-2">
              From concept to delivery — let's collaborate and bring your vision to life.
            </p>
            <div className="cta-banner__actions reveal delay-3">
              <Link to="/contact" className="btn-gold cta-banner__btn">
                <span>Book A Consultation</span>
              </Link>
              <Link to="/portfolio" className="btn-outline">
                <span>View My Work</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Cinematic Showreel Modal */}
      {showreelOpen && (
        <div className="showreel-modal">
          <div className="showreel-modal__backdrop" onClick={() => setShowreelOpen(false)} />
          <div className="showreel-modal__content">
            <button 
              className="showreel-modal__close" 
              onClick={() => setShowreelOpen(false)} 
              aria-label="Close Showreel"
              data-cursor="magnetic"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="showreel-modal__video-wrap">
              <video
                src={`${BACKEND_URL}/media/showreel.mp4`}
                controls
                autoPlay
                playsInline
                className="showreel-modal__iframe"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
