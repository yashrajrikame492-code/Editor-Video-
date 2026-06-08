import { useState, useEffect, useRef, useCallback } from 'react';
import { submitContact } from '../api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './ContactPage.css';

/* ── Constants ────────────────────────────────────────────────────────────── */
const INITIAL_FORM = {
  name: '', email: '', phone: '',
  project_type: '', budget_range: '', message: '',
};

const CONTACT_CARDS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email',
    value: 'yashrajrikame9876@gmail.com',
    href: 'mailto:yashrajrikame9876@gmail.com',
    accent: 'gold',
    tag: 'Preferred',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: 'Phone',
    value: '+91 7977831172',
    href: 'tel:+917977831172',
    accent: 'electric',
    tag: 'Direct',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Location',
    value: 'Mumbai, Maharashtra',
    href: null,
    accent: 'silver',
    tag: 'India',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: 'Response Time',
    value: 'Within 24 hours',
    href: null,
    accent: 'green',
    tag: 'Guaranteed',
  },
];

const TRUST_STATS = [
  { value: '120', suffix: '+', label: 'Projects Completed' },
  { value: '99',  suffix: '%', label: 'Client Satisfaction' },
  { value: '18',  suffix: '',  label: 'Awards Won' },
  { value: '5',   suffix: 'yrs', label: 'Experience' },
];

/* ── Animated counter ────────────────────────────────────────────────────── */
function TrustCounter({ value, suffix, label }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    const end = parseInt(value, 10);
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        let t0 = null;
        const dur = 1800;
        const step = (ts) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setN(Math.floor(ease * end));
          if (p < 1) requestAnimationFrame(step);
          else setN(end);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="ct-trust__stat">
      <span className="ct-trust__num">{n}{suffix}</span>
      <span className="ct-trust__stat-label">{label}</span>
    </div>
  );
}

/* ── Floating particle canvas ─────────────────────────────────────────────── */
function ContactParticles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const pts = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 55; i++) {
      pts.push({
        x: Math.random() * 1400,
        y: Math.random() * 800,
        r: Math.random() * 1.4 + 0.2,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.2 - 0.04,
        a: Math.random() * 0.35 + 0.08,
        c: Math.random() > 0.55 ? '201,168,76' : '124,107,255',
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="ct-particles" aria-hidden="true" />;
}

/* ── Living aurora background ─────────────────────────────────────────────── */
function ContactAurora() {
  const ref = useRef(null);
  useEffect(() => {
    let t = 0, raf;
    const tick = () => {
      t += 0.0025;
      if (ref.current) {
        const x1 = 40 + 25 * Math.sin(t);
        const y1 = 25 + 18 * Math.cos(t * 0.8);
        const x2 = 65 + 20 * Math.cos(t * 1.1);
        const y2 = 65 + 20 * Math.sin(t * 0.9);
        ref.current.style.background = `
          radial-gradient(ellipse 70% 50% at ${x1}% ${y1}%,rgba(201,168,76,0.09) 0%,transparent 60%),
          radial-gradient(ellipse 60% 45% at ${x2}% ${y2}%,rgba(124,107,255,0.07) 0%,transparent 60%),
          radial-gradient(ellipse 50% 35% at 15% 75%,rgba(201,168,76,0.05) 0%,transparent 55%),
          #000000`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={ref} className="ct-aurora" aria-hidden="true" />;
}

/* ── Cursor-following spotlight ───────────────────────────────────────────── */
function CursorSpotlight() {
  const ref = useRef(null);
  useEffect(() => {
    let cx = -400, cy = -400, tx = -400, ty = -400, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('mousemove', move, { passive: true });
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      cx = lerp(cx, tx, 0.07);
      cy = lerp(cy, ty, 0.07);
      if (ref.current) ref.current.style.transform = `translate(${cx}px,${cy}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', move); };
  }, []);
  return <div ref={ref} className="ct-spotlight" aria-hidden="true" />;
}

/* ── Premium floating label input ─────────────────────────────────────────── */
function FloatField({ id, label, required, children, hasValue }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || hasValue;

  return (
    <div className={`ff-group ${focused ? 'ff-group--focused' : ''} ${lifted ? 'ff-group--lifted' : ''}`}>
      <label htmlFor={id} className="ff-label">
        {label}{required && <span className="ff-req">*</span>}
      </label>
      <div
        className="ff-field"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
        <div className="ff-underline">
          <div className="ff-underline__fill" />
        </div>
        <div className="ff-glow" />
      </div>
    </div>
  );
}

/* ── Info card with 3D tilt ───────────────────────────────────────────────── */
function InfoCard({ card, delay }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    el.style.setProperty('--mx', `${(e.clientX - r.left)}px`);
    el.style.setProperty('--my', `${(e.clientY - r.top)}px`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <div
      ref={ref}
      className={`ct-icard ct-icard--${card.accent} reveal`}
      style={{ '--delay': `${delay}ms`, transitionDelay: `${delay}ms` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="ct-icard__spotlight" />
      <div className="ct-icard__icon-wrap">
        {card.icon}
      </div>
      <div className="ct-icard__body">
        <div className="ct-icard__meta">
          <span className="ct-icard__label">{card.label}</span>
          <span className="ct-icard__tag">{card.tag}</span>
        </div>
        {card.href
          ? <a href={card.href} className="ct-icard__value">{card.value}</a>
          : <p className="ct-icard__value">{card.value}</p>
        }
      </div>
      <div className="ct-icard__arrow">
        {card.href && (
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form,     setForm]     = useState(INITIAL_FORM);
  const [status,   setStatus]   = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef(null);

  useScrollReveal();

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitContact(form);
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus('error');
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorData = err.response.data;
        if (errorData.message) {
          setErrorMsg(errorData.message);
        } else {
          const errors = Object.entries(errorData)
            .map(([field, msgs]) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
              const fieldError = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
              return `${fieldName}: ${fieldError}`;
            })
            .join(' | ');
          setErrorMsg(errors || 'Something went wrong. Please try again.');
        }
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    }
  };

  /* magnetic submit btn */
  const onBtnMove = useCallback((e) => {
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.45;
    const y = (e.clientY - r.top  - r.height / 2) * 0.45;
    btn.style.transform = `translate(${x}px,${y}px)`;
  }, []);
  const onBtnLeave = useCallback((e) => {
    e.currentTarget.style.transform = '';
  }, []);

  return (
    <div className="ct-page page-enter">
      {/* Background systems */}
      <ContactAurora />
      <CursorSpotlight />

      {/* Noise texture */}
      <div className="ct-noise" aria-hidden="true" />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="ct-hero">
        <ContactParticles />

        {/* Decorative corner frame lines */}
        <div className="ct-corner ct-corner--tl" aria-hidden="true" />
        <div className="ct-corner ct-corner--tr" aria-hidden="true" />

        <div className="container ct-hero__inner">
          {/* Eyebrow */}
          <div className="ct-eyebrow">
            <span className="ct-eyebrow__line" />
            <span>Let's Talk</span>
            <span className="ct-eyebrow__dot" />
          </div>

          {/* Staggered headline */}
          <h1 className="ct-hero__title">
            <span className="word-wrap">
              <span className="word" style={{ animationDelay: '0ms' }}>Let's&nbsp;</span>
            </span>
            <span className="word-wrap">
              <span className="word" style={{ animationDelay: '100ms' }}>Create&nbsp;</span>
            </span>
            <br />
            <span className="word-wrap">
              <span className="word ct-hero__title--accent" style={{ animationDelay: '220ms' }}>Something</span>
            </span>
            <br />
            <span className="word-wrap">
              <span className="word ct-hero__title--gold" style={{ animationDelay: '340ms' }}>Extraordinary.</span>
            </span>
          </h1>

          <p className="ct-hero__sub reveal delay-3">
            Ready to bring your vision to life? Share your project details
            and let's craft something unforgettable, together.
          </p>

          {/* Scroll cue */}
          <div className="ct-scroll-cue reveal delay-4" aria-hidden="true">
            <div className="ct-scroll-cue__track">
              <div className="ct-scroll-cue__thumb" />
            </div>
            <span>Scroll to connect</span>
          </div>
        </div>

        <div className="ct-hero__fade" />
      </section>

      {/* ── MAIN CONTACT SECTION ──────────────────────────────────────────── */}
      <section className="ct-main">
        <div className="container">
          <div className="ct-layout">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="ct-left">

              {/* Info cards */}
              <div className="ct-cards-label reveal">
                <span className="ct-eyebrow">
                  <span className="ct-eyebrow__line" />Contact Details<span className="ct-eyebrow__dot" />
                </span>
              </div>

              <div className="ct-info-grid">
                {CONTACT_CARD_DATA.map((card, i) => (
                  <InfoCard key={card.label} card={card} delay={i * 90} />
                ))}
              </div>

              {/* Availability pill */}
              <div className="ct-avail reveal delay-5">
                <span className="ct-avail__dot" />
                <span className="ct-avail__text">Available for new projects</span>
                <span className="ct-avail__badge">Open</span>
              </div>

              {/* Trust stats */}
              <div className="ct-trust reveal delay-6">
                <p className="ct-trust__label">By the numbers</p>
                <div className="ct-trust__grid">
                  {TRUST_STATS.map(s => (
                    <TrustCounter key={s.label} {...s} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN — FORM ──────────────────────────────────────── */}
            <div className="ct-right reveal delay-2">

              {status === 'success' ? (
                /* ── Success state ──────────────────────────────────────── */
                <div className="ct-success">
                  <div className="ct-success__ring">
                    <div className="ct-success__check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="ct-success__title">Message Received!</h3>
                  <p className="ct-success__body">
                    Thank you for reaching out. I'll review your project details
                    and be in touch within 24 hours to begin our conversation.
                  </p>
                  <button
                    className="ct-btn-ghost"
                    onClick={() => setStatus('idle')}
                  >
                    Send Another Inquiry
                  </button>
                </div>

              ) : (
                /* ── Form ──────────────────────────────────────────────── */
                <form
                  ref={formRef}
                  className="ct-form"
                  onSubmit={handleSubmit}
                  id="contact-form"
                  noValidate
                >
                  {/* Animated gradient border */}
                  <div className="ct-form__border-anim" aria-hidden="true" />

                  <div className="ct-form__header">
                    <h2 className="ct-form__title">Project Inquiry</h2>
                    <p className="ct-form__subtitle">Fields marked * are required</p>
                  </div>

                  <div className="ct-form__divider" />

                  {/* Row 1 */}
                  <div className="ct-form__row">
                    <FloatField id="ct-name" label="Full Name" required hasValue={!!form.name}>
                      <input
                        id="ct-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="ff-input"
                        placeholder="John Smith"
                        autoComplete="name"
                      />
                    </FloatField>
                    <FloatField id="ct-email" label="Email Address" required hasValue={!!form.email}>
                      <input
                        id="ct-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="ff-input"
                        placeholder="john@company.com"
                        autoComplete="email"
                      />
                    </FloatField>
                  </div>

                  {/* Row 2 */}
                  <div className="ct-form__row">
                    <FloatField id="ct-phone" label="Phone Number" hasValue={!!form.phone}>
                      <input
                        id="ct-phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="ff-input"
                        placeholder="+91 99999 99999"
                        autoComplete="tel"
                      />
                    </FloatField>
                    <FloatField id="ct-type" label="Project Type" hasValue={!!form.project_type}>
                      <select
                        id="ct-type"
                        name="project_type"
                        value={form.project_type}
                        onChange={handleChange}
                        className="ff-input ff-select"
                      >
                        <option value="">Select type…</option>
                        <option value="commercial">Commercial</option>
                        <option value="music_video">Music Video</option>
                        <option value="corporate">Corporate</option>
                        <option value="documentary">Documentary</option>
                        <option value="reels">Social Media Reels</option>
                        <option value="wedding">Wedding Film</option>
                        <option value="other">Other</option>
                      </select>
                    </FloatField>
                  </div>

                  {/* Budget */}
                  <FloatField id="ct-budget" label="Budget Range" hasValue={!!form.budget_range}>
                    <select
                      id="ct-budget"
                      name="budget_range"
                      value={form.budget_range}
                      onChange={handleChange}
                      className="ff-input ff-select"
                    >
                      <option value="">Select budget…</option>
                      <option value="under_5k">Under ₹5,000</option>
                      <option value="5k_15k">₹5,000 – ₹15,000</option>
                      <option value="15k_50k">₹15,000 – ₹50,000</option>
                      <option value="50k_plus">₹50,000+</option>
                      <option value="discuss">Let's Discuss</option>
                    </select>
                  </FloatField>

                  {/* Message */}
                  <FloatField id="ct-message" label="Project Details" required hasValue={!!form.message}>
                    <textarea
                      id="ct-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="ff-input ff-textarea"
                      placeholder="Tell me about your project — the vision, timeline, and any specific requirements…"
                    />
                  </FloatField>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="ct-form__error" role="alert">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`ct-submit${status === 'submitting' ? ' ct-submit--loading' : ''}`}
                    disabled={status === 'submitting'}
                    id="contact-submit"
                    onMouseMove={onBtnMove}
                    onMouseLeave={onBtnLeave}
                  >
                    <span className="ct-submit__content">
                      {status === 'submitting' ? (
                        <>
                          <span className="ct-submit__spinner" />
                          <span>Sending Inquiry…</span>
                        </>
                      ) : (
                        <>
                          <span>Send Inquiry</span>
                          <svg viewBox="0 0 18 18" fill="none" width="16" height="16">
                            <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      )}
                    </span>
                    <div className="ct-submit__sweep" aria-hidden="true" />
                    <div className="ct-submit__glow" aria-hidden="true" />
                  </button>

                  <p className="ct-form__note">
                    🔒 Your information is private and never shared.
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

/* alias to avoid reference error — reuse the same CONTACT_CARDS data */
const CONTACT_CARD_DATA = CONTACT_CARDS;
