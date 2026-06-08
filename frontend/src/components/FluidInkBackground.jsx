import { useEffect, useRef } from 'react';

export default function FluidInkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Mouse targets
    const mouse = { x: width / 2, y: height / 2 };
    const prevMouse = { x: mouse.x, y: mouse.y };

    // Lerped positions (heavy lag & echoes)
    const blob = { x: mouse.x, y: mouse.y };
    let prevBlobX = mouse.x;
    let prevBlobY = mouse.y;

    const echo1 = { x: mouse.x, y: mouse.y };
    let prevEcho1X = mouse.x;
    let prevEcho1Y = mouse.y;

    const echo2 = { x: mouse.x, y: mouse.y };
    let prevEcho2X = mouse.x;
    let prevEcho2Y = mouse.y;

    let hasMoved = false;
    let hueOffset = 0;
    let time = 0;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Fill background on resize with premium black color (#000000)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!hasMoved) {
        // Snap instantly to cursor to prevent slide-in line from center
        blob.x = prevBlobX = prevMouse.x = mouse.x;
        blob.y = prevBlobY = prevMouse.y = mouse.y;

        echo1.x = prevEcho1X = mouse.x;
        echo1.y = prevEcho1Y = mouse.y;

        echo2.x = prevEcho2X = mouse.x;
        echo2.y = prevEcho2Y = mouse.y;

        hasMoved = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const drawBlob = (x, y, prevX, prevY, sizeScale, opacityScale) => {
      const dx = x - prevX;
      const dy = y - prevY;
      const speed = Math.hypot(dx, dy);

      ctx.save();
      ctx.translate(x, y);

      // Rotate drawing matrix to point in direction of travel
      const angle = Math.atan2(dy, dx);
      ctx.rotate(angle);

      // Stretches in direction of movement and squashes laterally (clamped for visual stability)
      const scaleX = Math.min(1 + speed * 0.025, 2.2);
      const scaleY = Math.max(1 - speed * 0.008, 0.6);
      ctx.scale(scaleX * sizeScale, scaleY * sizeScale);

      // Smaller pulsating/breathing radius (40px - 70px target, base 55px)
      const radius = 55 + Math.sin(time * 2.1) * 3;

      // Multi-color radial gradient cycling vivid spectrum colors
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      
      // Dynamic golden-yellow hue (drifts softly between 38 and 53 degrees)
      const baseHue = 38 + (hueOffset % 15);

      // Increased opacity by 25 percent (raising base stop opacity from 0.30 to 0.55)
      const baseOpacity = 0.55 * opacityScale;

      // Multi-layered golden-yellow color stops
      // Stop 0: Soft Champagne equivalent (#FFE999)
      grad.addColorStop(0, `hsla(${baseHue + 8}, 100%, 80%, ${baseOpacity})`);
      // Stop 0.35: Warm Honey equivalent (#FFD966)
      grad.addColorStop(0.35, `hsla(${baseHue + 4}, 100%, 70%, ${baseOpacity * 0.73})`);
      // Stop 0.7: Amber equivalent (#FFC840)
      grad.addColorStop(0.7, `hsla(${baseHue}, 100%, 63%, ${baseOpacity * 0.4})`);
      // Stop 1.0: Fades out into background (#000000)
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const tick = () => {
      time += 0.016; // Approx time step matching 60fps

      // Slowly rotate/drift golden-yellow hue over time (~0.3 degrees per frame)
      hueOffset = (hueOffset + 0.3) % 360;

      // Apply heavy lerp inertia for the main blob (lerp factor: 0.05)
      blob.x += (mouse.x - blob.x) * 0.05;
      blob.y += (mouse.y - blob.y) * 0.05;

      // Apply lerp lag for the trailing echoes (echo1 follows blob at 0.03, echo2 follows echo1 at 0.015)
      echo1.x += (blob.x - echo1.x) * 0.03;
      echo1.y += (blob.y - echo1.y) * 0.03;

      echo2.x += (echo1.x - echo2.x) * 0.015;
      echo2.y += (echo1.y - echo2.y) * 0.015;

      // Fill canvas with semi-transparent black for a clean, fast trail fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      ctx.fillRect(0, 0, width, height);

      if (hasMoved) {
        // Draw trailing elements in back-to-front order (echo2 -> echo1 -> main blob)
        // echo2: 0.50 scale, 0.30 opacity
        drawBlob(echo2.x, echo2.y, prevEcho2X, prevEcho2Y, 0.50, 0.30);
        // echo1: 0.75 scale, 0.60 opacity
        drawBlob(echo1.x, echo1.y, prevEcho1X, prevEcho1Y, 0.75, 0.60);
        // main blob: 1.00 scale, 1.00 opacity
        drawBlob(blob.x, blob.y, prevBlobX, prevBlobY, 1.00, 1.00);

        // Save previous positions for the next frame's speed calculations
        prevBlobX = blob.x;
        prevBlobY = blob.y;

        prevEcho1X = echo1.x;
        prevEcho1Y = echo1.y;

        prevEcho2X = echo2.x;
        prevEcho2Y = echo2.y;
      }

      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        display: 'block',
        background: '#000000',
        filter: 'blur(36px)',
        WebkitFilter: 'blur(36px)',
      }}
    />
  );
}
