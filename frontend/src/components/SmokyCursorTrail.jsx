import { useEffect, useRef } from 'react';

/**
 * SmokyCursorTrail
 *
 * Renders a canvas-based, GPU-smooth smoky particle trail on mouse movement.
 * - Warm gold palette: #FFD700, #FFC300, #E8A000, amber/ochre accents
 * - Particles: 6-14px blurred circles with opacity easing and scale growth
 * - Drift: randomized upward + outward velocity simulating real smoke
 * - Lifetime: 800ms–1800ms with eased cubic falloff
 * - Only emits during mouse movement (idle = no particles)
 * - pointer-events: none, position: fixed, high z-index
 * - No dependencies, no custom cursor image
 */
export default function SmokyCursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Resize handler ────────────────────────────────────────────────────
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Colour palette ────────────────────────────────────────────────────
    const COLORS = [
      'rgba(255, 215,   0,',  // #FFD700 — pure gold
      'rgba(255, 195,   0,',  // #FFC300 — bright amber-gold
      'rgba(232, 160,   0,',  // #E8A000 — rich amber
      'rgba(255, 180,  50,',  // warm honey
      'rgba(200, 130,  20,',  // deep ochre
      'rgba(255, 240, 100,',  // pale champagne
    ];

    // ── Particle pool ─────────────────────────────────────────────────────
    const particles = [];
    let nextId = 0;

    // ── Mouse state ───────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0, moving: false };
    let moveTimer = null;
    let raf = null;

    // ── Emit particles ─────────────────────────────────────────────────────
    const emit = (x, y) => {
      // Emit 2–4 particles per move event for density without overload
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle     = Math.random() * Math.PI * 2;
        const speed     = 0.3 + Math.random() * 0.8;      // px/ms
        const lifetime  = 800 + Math.random() * 1000;     // 800–1800ms
        const startSize = 6  + Math.random() * 8;         // 6–14px radius
        const color     = COLORS[Math.floor(Math.random() * COLORS.length)];

        // Slight upward bias + randomized outward scatter
        const vx = Math.cos(angle) * speed * 0.7;
        const vy = Math.sin(angle) * speed * 0.5 - 0.35; // negative = up in canvas coords

        particles.push({
          id:       ++nextId,
          x:        x + (Math.random() - 0.5) * 12,  // tiny spawn jitter
          y:        y + (Math.random() - 0.5) * 12,
          vx,
          vy,
          startSize,
          color,
          born:     performance.now(),
          lifetime,
          blur:     3 + Math.random() * 4,            // per-particle blur (3–7px)
        });
      }
    };

    // ── Cubic easing (ease-out-cubic) ──────────────────────────────────────
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // ── Render loop ────────────────────────────────────────────────────────
    const render = (now) => {
      // Full clear every frame — canvas is purely overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w   = canvas.width  / dpr;
      const h   = canvas.height / dpr;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p   = particles[i];
        const age = now - p.born;
        const t   = Math.min(age / p.lifetime, 1);

        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Age-based position (velocity in px/ms)
        const x = p.x + p.vx * age;
        const y = p.y + p.vy * age;

        // Opacity: full at 0, eased fade-out starting at 30% life
        const fadeT   = Math.max(0, (t - 0.0) / 1.0); // 0→1 over full life
        const opacity = (1 - easeOutCubic(fadeT)) * 0.72; // max 72% opacity

        // Size grows slightly as smoke dissipates (scale up 40%)
        const radius = p.startSize * (1 + t * 0.45);

        // Blur also grows slightly with age
        const blurPx = p.blur * (1 + t * 0.6);

        ctx.save();
        ctx.filter    = `blur(${blurPx.toFixed(1)}px)`;
        ctx.globalAlpha = opacity;

        // Radial gradient for soft, feathered smoke puff
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0,    `${p.color}${opacity.toFixed(3)})`);
        grad.addColorStop(0.45, `${p.color}${(opacity * 0.6).toFixed(3)})`);
        grad.addColorStop(1,    `${p.color}0)`);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    // ── Mouse listeners ────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Mark as moving
      if (!mouse.moving) {
        mouse.moving = true;
      }

      emit(mouse.x, mouse.y);

      // Stop emitting 80ms after last movement
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        mouse.moving = false;
      }, 80);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(moveTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        999994,   // just below FluidCursor (999995) — layered effect
      }}
    />
  );
}
