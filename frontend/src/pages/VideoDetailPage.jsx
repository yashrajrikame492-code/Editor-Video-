import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVideo, incrementView, getVideos } from '../api';
import VideoCard from '../components/VideoCard';
import { getEmbedUrl, getThumbnailUrl } from '../utils/video';
import './VideoDetailPage.css';

function StarRating({ rating }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star${i < rating ? '' : ' empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function VideoDetailPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getVideo(id).then(res => {
      setVideo(res.data);
      incrementView(id).catch(() => {});
      // Fetch related videos by same category
      return getVideos({ category: res.data.category });
    }).then(res => {
      const data = res.data.results || res.data;
      setRelated(data.filter(v => v.id !== Number(id)).slice(0, 3));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loading-wrap" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="detail-error container">
        <h2>Video not found</h2>
        <Link to="/portfolio" className="btn-outline">← Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <div className="detail-page page-enter">
      {/* Video Player */}
      <div className="detail-player-section">
        <div className="detail-player-wrap">
          {video.video_file ? (
            <video
              src={video.video_file}
              controls
              playsInline
              className="detail-player"
              poster={getThumbnailUrl(video)}
            />
          ) : (
            <iframe
              src={`${getEmbedUrl(video.embed_url)}?rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="detail-player"
            />
          )}
        </div>
      </div>

      <div className="container detail-body">
        <div className="detail-main">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/portfolio">Portfolio</Link>
            <span>›</span>
            <span>{video.category_display || video.category}</span>
          </div>

          {/* Title & meta */}
          <h1 className="detail-title">{video.title}</h1>

          <div className="detail-meta-row">
            <span className="detail-category pill active">{video.category_display}</span>
            {video.year && <span className="detail-year">{video.year}</span>}
            {video.duration && (
              <span className="detail-duration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {video.duration}
              </span>
            )}
            <span className="detail-views">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {video.views_count?.toLocaleString()} views
            </span>
          </div>

          {video.description && (
            <div className="detail-description">
              <div className="gold-divider" />
              <p>{video.description}</p>
            </div>
          )}

          {/* Tags */}
          {video.tags?.length > 0 && (
            <div className="detail-tags">
              {video.tags.map(tag => (
                <span key={tag.id} className="detail-tag">#{tag.name}</span>
              ))}
            </div>
          )}

          {/* Client info */}
          {video.client_name && (
            <div className="detail-client glass-card">
              <div className="detail-client__label">Client</div>
              <div className="detail-client__name">{video.client_name}</div>
            </div>
          )}

          {/* Back + Hire CTA */}
          <div className="detail-actions">
            <Link to="/portfolio" className="btn-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span>Back to Portfolio</span>
            </Link>
            <Link to="/contact" className="btn-gold">
              <span>Hire Me For A Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Related Videos */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="container">
            <p className="section-eyebrow">More Like This</p>
            <h2 className="section-title">Related Projects</h2>
            <div className="gold-divider" style={{ marginBottom: '40px' }} />
            <div className="related-grid">
              {related.map((v, i) => (
                <VideoCard key={v.id} video={v} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
