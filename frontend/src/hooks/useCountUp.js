import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter that counts from 0 to `target` when element enters viewport.
 * @param {number} target - The final number to count to
 * @param {number} duration - Animation duration in ms (default 2000)
 * @param {string} suffix - Optional suffix e.g. '+', 'M+'
 * @returns {{ ref, display }} - ref to attach to element, display is the current value string
 */
export function useCountUp(target, duration = 2000, suffix = '') {
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const isFloat = target % 1 !== 0;

          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = eased * target;

            setDisplay(
              isFloat
                ? value.toFixed(1) + suffix
                : Math.floor(value) + suffix
            );

            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, suffix]);

  return { ref, display };
}
