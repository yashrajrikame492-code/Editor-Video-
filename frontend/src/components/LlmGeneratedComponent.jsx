import { useEffect, useRef, useState } from 'react';

export default function LlmGeneratedComponent() {
  const canvasRef = useRef(null);
  
  // Slider states
  const [size, setSize] = useState(35);
  const [opacity, setOpacity] = useState(0.55);
  const [blur, setBlur] = useState(28);
  const [fadeSpeed, setFadeSpeed] = useState(0.45);
  const [lerpInertia, setLerpInertia] = useState(0.05);
  const [copied, setCopied] = useState(false);

  // Sync states to refs for loop consumption (prevents loop restarts)
  const sizeRef = useRef(size);
  const opacityRef = useRef(opacity);
  const fadeSpeedRef = useRef(fadeSpeed);
  const lerpInertiaRef = useRef(lerpInertia);

  useEffect(() => {
    sizeRef.current = size;
    opacityRef.current = opacity;
    fadeSpeedRef.current = fadeSpeed;
    lerpInertiaRef.current = lerpInertia;
  }, [size, opacity, fadeSpeed, lerpInertia]);

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const mouse = { x: width / 2, y: height / 2 };
    const prevMouse = { x: mouse.x, y: mouse.y };

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
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse within the sandbox container
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      if (!hasMoved) {
        blob.x = prevBlobX = prevMouse.x = mouse.x;
        blob.y = prevBlobY = prevMouse.y = mouse.y;

        echo1.x = prevEcho1X = mouse.x;
        echo1.y = prevEcho1Y = mouse.y;

        echo2.x = prevEcho2X = mouse.x;
        echo2.y = prevEcho2Y = mouse.y;

        hasMoved = true;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });

    const drawBlob = (x, y, prevX, prevY, sizeScale, opacityScale) => {
      const dx = x - prevX;
      const dy = y - prevY;
      const speed = Math.hypot(dx, dy);

      ctx.save();
      ctx.translate(x, y);

      const angle = Math.atan2(dy, dx);
      ctx.rotate(angle);

      const scaleX = Math.min(1 + speed * 0.03, 2.5);
      const scaleY = Math.max(1 - speed * 0.01, 0.5);
      ctx.scale(scaleX * sizeScale, scaleY * sizeScale);

      const currentBaseSize = sizeRef.current;
      const radius = (currentBaseSize + Math.sin(time * 2.1) * 5) * sizeScale;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      const alpha = opacityRef.current * opacityScale;

      grad.addColorStop(0, `rgba(255, 195, 0, ${alpha})`);
      grad.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.5})`);
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const tick = () => {
      time += 0.016;

      const lerp = lerpInertiaRef.current;
      blob.x += (mouse.x - blob.x) * lerp;
      blob.y += (mouse.y - blob.y) * lerp;

      echo1.x += (blob.x - echo1.x) * lerp * 0.6;
      echo1.y += (blob.y - echo1.y) * lerp * 0.6;

      echo2.x += (echo1.x - echo2.x) * lerp * 0.3;
      echo2.y += (echo1.y - echo2.y) * lerp * 0.3;

      // Fill canvas with semi-transparent white (decay trail)
      const fade = fadeSpeedRef.current;
      ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
      ctx.fillRect(0, 0, width, height);

      if (hasMoved) {
        // Draw trailing elements back-to-front
        drawBlob(echo2.x, echo2.y, prevEcho2X, prevEcho2Y, 0.50, 0.30);
        drawBlob(echo1.x, echo1.y, prevEcho1X, prevEcho1Y, 0.75, 0.60);
        drawBlob(blob.x, blob.y, prevBlobX, prevBlobY, 1.00, 1.00);

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
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // Generate dynamic prompt text
  const generatedPrompt = `Build a premium fluid ink cursor effect using HTML5 Canvas and vanilla JavaScript. The native cursor remains visible and unchanged. Behind it, render a multi-layered trailing echo effect (primary blob of ${size}px, plus two trailing echo blobs lagging behind at scaled distances/opacities) that follows the cursor with heavy lerp inertia (primary factor ${lerpInertia.toFixed(3)}) — creating an organic liquid distortion trail that lags, stretches, and morphs directionally based on velocity.

Core visual behavior:
The blobs deform elliptically in the direction of travel. At high velocity, they stretch into teardrop shapes. At rest, they contract back into soft rounded shapes.
Use a rich premium yellow gradient fill (blend of golden yellows) with ${(opacity * 100).toFixed(0)}% alpha (opacity) of rgba(255, 195, 0, ${opacity.toFixed(2)}) for the primary blob, with echoes rendered at 75% size/60% opacity and 50% size/30% opacity respectively. Applied on a light-themed background (e.g., #F4F4F6 or #FFFFFF) with a strong filter: blur(${blur}px) on the canvas layer so the trail has perfectly smooth, soft, and glowing volumetric edges without any harsh lines.
The canvas must be position: fixed, z-index: 0, pointer-events: none, full viewport.

Trail & dissipation:
Each frame, clear the canvas with a semi-transparent decay layer (e.g., rgba(255, 255, 255, ${fadeSpeed.toFixed(2)})) to produce an organic fluid trail that fades quickly and cleanly along the cursor's path.

Fluid morphing & echoes:
Track velocity of each layer independently. Scale and rotate the drawing matrix of each blob to point along its direction of travel using Math.atan2. Apply a sine wave breathing oscillator (radius + Math.sin(time * 2.1) * 5) for organic pulsation.

Performance: requestAnimationFrame at 60fps. No libraries. Pure canvas 2D API. Production-grade, clean code.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="sandbox-wrapper">
      <style>{`
        .sandbox-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 800px;
          padding: 40px 20px;
          background: #F4F4F6;
          color: #0f172a;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .sandbox-canvas-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          height: 480px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }

        .sandbox-canvas {
          width: 100%;
          height: 100%;
          display: block;
          /* Blur filter dynamically set */
        }

        .sandbox-dashboard {
          width: 100%;
          max-width: 1000px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
          z-index: 10;
        }

        .sandbox-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .sandbox-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .sandbox-desc {
          font-size: 0.95rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: rgba(0, 0, 0, 0.02);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.02);
        }

        .control-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
        }

        .control-value {
          color: #c29900;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .control-slider {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          accent-color: #e2b007;
          cursor: pointer;
        }

        .prompt-container {
          background: #0f172a;
          border-radius: 14px;
          padding: 24px;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .prompt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .prompt-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
        }

        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #e2b007;
          color: #0f172a;
          border: none;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(226, 176, 7, 0.2);
        }

        .copy-btn:hover {
          background: #f1bd08;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(226, 176, 7, 0.3);
        }

        .copy-btn:active {
          transform: translateY(0);
        }

        .prompt-textarea {
          width: 100%;
          height: 180px;
          background: transparent;
          border: none;
          color: #f1f5f9;
          font-family: monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          resize: none;
          outline: none;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>

      <div className="sandbox-header">
        <h1 className="sandbox-title">Fluid Ink Cursor Simulator</h1>
        <p className="sandbox-desc">
          Drag your cursor across the white panel below to interact with the fluid blob trail. 
          Use the sliders to adjust parameters and generate the updated code prompt in real-time.
        </p>
      </div>

      <div className="sandbox-canvas-container">
        <canvas
          ref={canvasRef}
          className="sandbox-canvas"
          style={{
            filter: `blur(${blur}px)`,
            WebkitFilter: `blur(${blur}px)`,
          }}
        />
      </div>

      <div className="sandbox-dashboard">
        <div className="controls-grid">
          {/* Blob Size Slider */}
          <div className="control-group">
            <div className="control-header">
              <span>Blob Size</span>
              <span className="control-value">{size}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="control-slider"
            />
          </div>

          {/* Opacity Slider */}
          <div className="control-group">
            <div className="control-header">
              <span>Blob Opacity</span>
              <span className="control-value">{(opacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.00"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="control-slider"
            />
          </div>

          {/* Blur Intensity Slider */}
          <div className="control-group">
            <div className="control-header">
              <span>Blur Radius</span>
              <span className="control-value">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="control-slider"
            />
          </div>

          {/* Fade Speed Slider */}
          <div className="control-group">
            <div className="control-header">
              <span>Fade Speed</span>
              <span className="control-value">{(1 - fadeSpeed).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={fadeSpeed}
              onChange={(e) => setFadeSpeed(Number(e.target.value))}
              className="control-slider"
            />
          </div>

          {/* Lerp Inertia Slider */}
          <div className="control-group">
            <div className="control-header">
              <span>Lerp Inertia</span>
              <span className="control-value">{lerpInertia.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.010"
              max="0.300"
              step="0.005"
              value={lerpInertia}
              onChange={(e) => setLerpInertia(Number(e.target.value))}
              className="control-slider"
            />
          </div>
        </div>

        <div className="prompt-container">
          <div className="prompt-header">
            <span className="prompt-label">Dynamically Generated Prompt</span>
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          </div>
          <textarea
            readOnly
            value={generatedPrompt}
            className="prompt-textarea"
          />
        </div>
      </div>
    </div>
  );
}
