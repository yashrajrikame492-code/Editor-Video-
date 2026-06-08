import { useState, useEffect } from 'react';
import { getTestimonials } from '../api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './TestimonialsPage.css';

function StarRating({ rating = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star${i < rating ? '' : ' empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useScrollReveal();

  useEffect(() => {
    getTestimonials()
      .then(res => setTestimonials(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="testi-page page-enter">
      {/* Header */}
      <div className="page-header">
        <div className="page-header__bg" />
        <div className="page-header__noise" />
        <div className="container page-header__content">
          <p className="section-eyebrow" style={{ justifyContent: 'center' }}>Social Proof</p>
          <h1 className="page-title display-title">Client Reviews</h1>
          <div className="gold-divider center" />
          <p className="page-subtitle">
            Real words from real clients. Hear what industry leaders and
            creative visionaries say about the collaboration.
          </p>
        </div>
      </div>

      {/* Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-wrap"><div className="loading-spinner" /></div>
          ) : (
            <div className="testi-masonry">
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className={`testi-full-card glass-card reveal delay-${Math.min((i % 4) + 1, 8)}`}
                >
                  <div className="testi-full-top">
                    <div className="testi-big-quote">"</div>
                    <StarRating rating={t.rating} />
                  </div>
                  <p className="testi-full-text">{t.review_text}</p>
                  <div className="testi-full-footer">
                    <img
                      src={t.avatar_url || `https://i.pravatar.cc/60?u=person${t.id}`}
                      alt={t.client_name}
                      className="testi-avatar"
                    />
                    <div>
                      <p className="testi-name">{t.client_name}</p>
                      <p className="testi-company">
                        {t.client_role && <span>{t.client_role}</span>}
                        {t.client_company && <span className="gold-text"> @ {t.client_company}</span>}
                      </p>
                      {t.project_type && (
                        <span className="testi-project-type">{t.project_type}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
