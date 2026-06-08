import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { incrementView } from '../api';
import { getThumbnailUrl } from '../utils/video';
import './VideoCard.css';

export default function VideoCard({ video, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const cardRef  = useRef(null);
  const rippleRef = useRef(null);

  /* ── Track mouse for spotlight + 3D tilt + parallax ─────────────────── */
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;

    /* spotlight CSS vars */
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    /* 3D tilt */
    const tiltX = -((y - cy) / cy) * 7;
    const tiltY =  ((x - cx) / cx) * 7;
    card.style.transform =
      `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.03)`;

    /* inner image parallax */
    const img = card.querySelector('.vcard__img');
    if (img) {
      const mx = ((x - cx) / cx) * -10;
      const my = ((y - cy) / cy) * -10;
      img.style.transform = `scale(1.14) translate(${mx}px,${my}px)`;
    }
  }, []);

  /* ── Reset on leave ──────────────────────────────────────────────────── */
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
    const img = card.querySelector('.vcard__img');
    if (img) img.style.transform = '';
  }, []);

  /* ── Click ripple effect ─────────────────────────────────────────────── */
  const handleClick = useCallback((e) => {
    incrementView(video.id).catch(() => {});

    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'vcard__ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;
    card.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, [video.id]);

  return (
    <Link
      ref={cardRef}
      to={`/portfolio/${video.id}`}
      className={[
        'vcard',
        hovered            ? 'vcard--hovered'  : '',
        video.featured     ? 'vcard--featured' : '',
      ].filter(Boolean).join(' ')}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-label={`View ${video.title}`}
    >
      {/* ── Thumbnail ──────────────────────────────────────────────────── */}
      <div className="vcard__media">
        <img
          src={getThumbnailUrl(video)}
          alt={video.title}
          loading="lazy"
          className="vcard__img"
        />

        {/* Cinematic overlay */}
        <div className="vcard__overlay">
          {/* Play button */}
          <div className="vcard__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M8 5.5v13l10-6.5L8 5.5Z" />
            </svg>
          </div>

          {/* Duration chip */}
          {video.duration && (
            <span className="vcard__duration">{video.duration}</span>
          )}
        </div>

        {/* Badges row */}
        <div className="vcard__badges">
          <span className="vcard__category">
            {video.category_display || video.category}
          </span>
          {video.featured && <span className="vcard__star">★</span>}
        </div>

        {/* Cursor-following gradient glow */}
        <div className="vcard__glow" aria-hidden="true" />

        {/* Animated gradient border accent (visible on hover) */}
        <div className="vcard__border-anim" aria-hidden="true" />
      </div>

      {/* ── Info panel ─────────────────────────────────────────────────── */}
      <div className="vcard__info">
        <h3 className="vcard__title">{video.title}</h3>
        <div className="vcard__meta">
          {video.client_name && (
            <span className="vcard__client">{video.client_name}</span>
          )}
          {video.year && (
            <span className="vcard__year">{video.year}</span>
          )}
        </div>
        {video.views_count > 0 && (
          <span className="vcard__views">
            {video.views_count.toLocaleString()} views
          </span>
        )}

        {/* Animated bottom line */}
        <div className="vcard__bottom-line" aria-hidden="true" />
      </div>
    </Link>
  );
}
