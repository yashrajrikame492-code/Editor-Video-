import { useEffect } from 'react';

/**
 * Wires an IntersectionObserver to a set of DOM elements.
 * Adds 'is-visible' class when element enters viewport.
 * @param {string} selector - CSS selector to target all reveal elements
 * @param {object} options - IntersectionObserver options
 */
export function useScrollReveal(selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale', options = {}) {
  useEffect(() => {
    const defaultOptions = {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after triggering for performance
          observer.unobserve(entry.target);
        }
      });
    }, defaultOptions);

    // Observe all matching elements
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
