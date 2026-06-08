import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',             label: 'Home' },
  { to: '/portfolio',    label: 'Work' },
  { to: '/about',        label: 'About' },
  { to: '/testimonials', label: 'Reviews' },
  { to: '/contact',      label: 'Contact' },
  { to: '/simulation',   label: 'Simulator' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--open' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 10.5L22 16L13 21.5V10.5Z" fill="currentColor" />
            </svg>
          </div>
          <div className="navbar__logo-text">
            <span className="logo-primary">YASH</span>
            <span className="logo-dot">.</span>
            <span className="logo-secondary">EDITS</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label }, i) => (
            <Link
              key={to}
              to={to}
              className={`navbar__link${location.pathname === to ? ' navbar__link--active' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {label}
              <span className="navbar__link-underline" />
            </Link>
          ))}
        </nav>

        {/* CTA + Hamburger */}
        <div className="navbar__actions">
          <Link to="/contact" className="navbar__cta btn-gold" aria-label="Hire Me">
            <span>Hire Me</span>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <button
            className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className="hamburger__line" />
            <span className="hamburger__line" />
            <span className="hamburger__line" />
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Menu */}
      <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu__bg" />
        <nav className="mobile-menu__nav">
          {NAV_LINKS.map(({ to, label }, i) => (
            <Link
              key={to}
              to={to}
              className={`mobile-menu__link${location.pathname === to ? ' active' : ''}`}
              style={{ transitionDelay: menuOpen ? `${i * 70 + 100}ms` : '0ms' }}
            >
              <span className="mobile-link-num">0{i + 1}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <Link to="/contact" className="btn-gold" style={{ transitionDelay: menuOpen ? '450ms' : '0ms' }}>
            <span>Start A Project</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
