import { useState, useEffect, useRef, useCallback } from 'react';
import { getVideos, getCategories } from '../api';
import VideoCard from '../components/VideoCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './PortfolioPage.css';

const ALL_CAT = { value: 'all', label: 'All Work', count: 0 };

const CLIENT_LOGOS = [
  "NETFLIX", "RED BULL", "SPOTIFY", "NIKE", "UNIVERSAL",
  "SONY MUSIC", "SENNHEISER", "AUDI", "HBO", "APPLE TV+",
];

const STATS = [
  { value: '120', suffix: '+', label: 'Projects Delivered', icon: '◈' },
  { value: '18',  suffix: '',  label: 'Industry Awards',   icon: '◆' },
  { value: '50',  suffix: 'M+',label: 'Combined Views',    icon: '◉' },
  { value: '99',  suffix: '%', label: 'Client Retention',  icon: '◇' },
];

const TIMELINE_STEPS = [
  { num: '01', title: 'Discovery & Concept', body: 'Deep-dive creative briefs, mood boards, reference films, and narrative intent mapping.', icon: '✦' },
  { num: '02', title: 'Script & Storyboard',  body: 'Cinematic treatments, precise shot lists, animatics, and visual flow documentation.', icon: '◈' },
  { num: '03', title: 'Production',           body: 'ALEXA 35 / RED V-RAPTOR capture. Anamorphic primes. Precision art direction on set.', icon: '◉' },
  { num: '04', title: 'Color & Sound Design', body: 'DaVinci Resolve grade, Dolby Atmos mix, original score composition, SFX layering.', icon: '◆' },
  { num: '05', title: 'Delivery & Launch',    body: 'DCP theatrical master, ProRes archival, multi-platform campaign rollout & analytics.', icon: '◇' },
];

/* ── Animated number counter ──────────────────────────────────────────────── */
function Counter({ value, suffix = '', duration = 2000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    const end = parseInt(value, 10);
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true;
        let start = null;
        const step = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4); // easeOutQuart
          setDisplay(Math.floor(ease * end));
          if (p < 1) requestAnimationFrame(step);
          else setDisplay(end);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref} className="stat__num">{display}{suffix}</span>;
}

/* ── Floating particle canvas ─────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = [];
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -Math.random() * 0.22 - 0.06,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? '201,168,76' : '124,107,255',
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />;
}

/* ── Aurora / mesh background ─────────────────────────────────────────────── */
function AuroraBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    let raf;
    const tick = () => {
      t += 0.003;
      const x1 = 50 + 30 * Math.sin(t);
      const y1 = 30 + 20 * Math.cos(t * 0.7);
      const x2 = 70 + 25 * Math.cos(t * 1.2);
      const y2 = 60 + 25 * Math.sin(t * 0.9);
      el.style.background = `
        radial-gradient(ellipse 80% 60% at ${x1}% ${y1}%, rgba(201,168,76,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 70% 50% at ${x2}% ${y2}%, rgba(124,107,255,0.05) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 55%),
        #000000
      `;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={ref} className="aurora-bg" aria-hidden="true" />;
}

/* ── Cursor aurora (follows cursor with radial spotlight) ─────────────────── */
function CursorAurora() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cx = -200, cy = -200, tx = -200, ty = -200;
    let raf;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      cx = lerp(cx, tx, 0.06);
      cy = lerp(cy, ty, 0.06);
      el.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, []);
  return <div ref={ref} className="cursor-aurora" aria-hidden="true" />;
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function PortfolioPage() {
  const [videos,          setVideos]         = useState([]);
  const [categories,      setCategories]     = useState([ALL_CAT]);
  const [activeCategory,  setActiveCategory] = useState('all');
  const [loading,         setLoading]        = useState(true);
  const [timelinePct,     setTimelinePct]    = useState(0);
  const [heroParallax,    setHeroParallax]   = useState({ x: 0, y: 0 });

  const timelineRef = useRef(null);
  const heroRef     = useRef(null);

  useScrollReveal();

  /* data */
  useEffect(() => {
    getCategories().then(res => {
      const total = res.data.reduce((a, c) => a + c.count, 0);
      setCategories([{ value: 'all', label: 'All Work', count: total }, ...res.data]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = activeCategory !== 'all' ? { category: activeCategory } : {};
    getVideos(params)
      .then(res => setVideos(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  /* timeline scroll progress */
  useEffect(() => {
    const onScroll = () => {
      if (!timelineRef.current) return;
      const r = timelineRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.8 - r.top) / (r.height * 0.9)));
      setTimelinePct(p * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* hero mouse parallax */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 18;
      const y = ((e.clientY - top)  / height - 0.5) * 10;
      setHeroParallax({ x, y });
    };
    el.addEventListener('mousemove', onMove, { passive: true });
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  /* magnetic pill */
  const onPillMove  = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.4;
    const y = (e.clientY - r.top  - r.height / 2) * 0.4;
    e.currentTarget.style.transform = `translate(${x}px,${y}px)`;
  }, []);
  const onPillLeave = useCallback((e) => { e.currentTarget.style.transform = ''; }, []);

  return (
    <div className="pf-page page-enter">
      {/* Global aurora background */}
      <AuroraBackground />
      <CursorAurora />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="pf-hero">
        <ParticleCanvas />

        {/* Depth layers that move with cursor */}
        <div
          className="pf-hero__depth-1"
          style={{ transform: `translate(${heroParallax.x * 0.3}px, ${heroParallax.y * 0.3}px)` }}
          aria-hidden="true"
        />
        <div
          className="pf-hero__depth-2"
          style={{ transform: `translate(${heroParallax.x * 0.6}px, ${heroParallax.y * 0.6}px)` }}
          aria-hidden="true"
        />

        <div className="container pf-hero__inner">
          <p className="pf-eyebrow">
            <span className="pf-eyebrow__line" />
            Cinematic Work
            <span className="pf-eyebrow__dot" />
          </p>

          <h1 className="pf-hero__title">
            <span className="word-wrap"><span className="word" style={{ animationDelay: '0ms' }}>Visual</span></span>
            {' '}
            <span className="word-wrap"><span className="word pf-hero__title--gold" style={{ animationDelay: '120ms' }}>Stories</span></span>
            <br />
            <span className="word-wrap"><span className="word" style={{ animationDelay: '240ms' }}>That</span></span>
            {' '}
            <span className="word-wrap"><span className="word" style={{ animationDelay: '360ms' }}>Endure</span></span>
          </h1>

          <p className="pf-hero__sub reveal delay-3">
            A curated archive of award-winning cinematography spanning<br />
            global commercials, music videos, documentaries & brand films.
          </p>

          <div className="pf-hero__cta reveal delay-4">
            <a href="#portfolio-grid" className="btn-gold pf-cta-btn">
              <span>Explore the Work</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 14 0M13 6l6 6-6 6"/></svg>
            </a>
            <span className="pf-hero__scroll-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 4-4 4M8 12h7"/></svg>
              Scroll to discover
            </span>
          </div>
        </div>

        {/* Cinematic bottom edge fade */}
        <div className="pf-hero__fade" />
      </section>

      {/* ── BRAND MARQUEE ────────────────────────────────────────────────── */}
      <div className="pf-marquee-wrap reveal">
        <p className="pf-marquee-label">Trusted by visionary global brands</p>
        <div className="pf-marquee">
          {[0, 1].map(dup => (
            <ul key={dup} className="pf-marquee__track" aria-hidden={dup === 1}>
              {CLIENT_LOGOS.map((name, i) => (
                <li key={i} className="pf-marquee__item">
                  <span className="pf-marquee__dot">◆</span>
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="pf-stats reveal">
        <div className="container">
          <div className="pf-stats__grid">
            {STATS.map((s, i) => (
              <div key={i} className="pf-stat" style={{ '--i': i }}>
                <span className="pf-stat__icon">{s.icon}</span>
                <Counter value={s.value} suffix={s.suffix} />
                <p className="pf-stat__label">{s.label}</p>
                <div className="pf-stat__line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOM SECTION DIVIDER ───────────────────────────────────────── */}
      <div className="pf-divider" aria-hidden="true">
        <div className="pf-divider__line" />
        <div className="pf-divider__diamond">◆</div>
        <div className="pf-divider__line" />
      </div>

      {/* ── FILTERS + GRID ───────────────────────────────────────────────── */}
      <div className="pf-filters-bar" id="portfolio-grid">
        <div className="container">
          <div className="pf-filters">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`pf-pill${activeCategory === cat.value ? ' pf-pill--active' : ''}`}
                onClick={() => setActiveCategory(cat.value)}
                onMouseMove={onPillMove}
                onMouseLeave={onPillLeave}
              >
                {cat.label}
                <span className="pf-pill__count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="pf-grid-section">
        <div className="container">
          {loading ? (
            <div className="pf-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="pf-skeleton">
                  <div className="pf-skeleton__img shimmer" />
                  <div className="pf-skeleton__body">
                    <div className="pf-skeleton__line shimmer" style={{ width: '70%' }} />
                    <div className="pf-skeleton__line shimmer" style={{ width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="pf-empty reveal">
              <div className="pf-empty__icon">◇</div>
              <p>No projects found in this category.</p>
            </div>
          ) : (
            <>
              <div className="pf-grid">
                {videos.map((video, i) => (
                  <VideoCard key={video.id} video={video} delay={i * 55} />
                ))}
              </div>
              <p className="pf-count reveal">
                Showing <span className="gold-text">{videos.length}</span> cinematic projects
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── CUSTOM SECTION DIVIDER ───────────────────────────────────────── */}
      <div className="pf-divider" aria-hidden="true">
        <div className="pf-divider__line" />
        <div className="pf-divider__diamond">◈</div>
        <div className="pf-divider__line" />
      </div>

      {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
      <section ref={timelineRef} className="pf-timeline">
        <div className="container">
          <div className="pf-timeline__head reveal">
            <p className="pf-eyebrow" style={{ justifyContent: 'center' }}>
              <span className="pf-eyebrow__line" />
              Production Process
              <span className="pf-eyebrow__dot" />
            </p>
            <h2 className="pf-timeline__title">From Concept<br /><em>to Cinema</em></h2>
            <p className="pf-timeline__sub">
              Every frame is the result of obsessive craft, precision planning,<br />
              and a relentless pursuit of visual excellence.
            </p>
          </div>

          <div className="pf-timeline__track">
            {/* Scrolling progress spine */}
            <div className="pf-spine">
              <div className="pf-spine__bg" />
              <div className="pf-spine__fill" style={{ height: `${timelinePct}%` }} />
            </div>

            {TIMELINE_STEPS.map((step, i) => (
              <div key={i} className={`pf-tl-item ${i % 2 === 0 ? 'pf-tl-item--left' : 'pf-tl-item--right'} reveal`} style={{ '--delay': `${i * 80}ms` }}>
                <div className="pf-tl-node">
                  <span className="pf-tl-node__icon">{step.icon}</span>
                </div>
                <div className="pf-tl-card">
                  <span className="pf-tl-card__num">{step.num}</span>
                  <h3 className="pf-tl-card__title">{step.title}</h3>
                  <p className="pf-tl-card__body">{step.body}</p>
                  <div className="pf-tl-card__accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="pf-cta-section reveal">
        <div className="pf-cta-section__glow" aria-hidden="true" />
        <div className="container pf-cta-section__inner">
          <p className="pf-eyebrow" style={{ justifyContent: 'center' }}>
            <span className="pf-eyebrow__line" />Ready to Create<span className="pf-eyebrow__dot" />
          </p>
          <h2 className="pf-cta-section__title">Let's Build Something<br /><span className="gold-text">Legendary</span></h2>
          <a href="/contact" className="btn-gold pf-cta-btn">
            <span>Start a Project</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 14 0M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </section>
    </div>
  );
}
