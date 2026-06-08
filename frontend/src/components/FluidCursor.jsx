import { useEffect, useRef } from 'react';

/**
 * Ultra-Luxury WebGL 2 "Smokey Fluid Dynamics" Cursor Trail
 * 
 * Simulates 2D Navier-Stokes equations on a low-res grid,
 * upscaling with linear filtering to render a photorealistic golden smoke/silk trail.
 * 
 * Features:
 * - WebGL 2 GPU-accelerated fluid solver (Advection, Jacobi projection, Vorticity, Buoyancy)
 * - Velocity scaling (silken threads when fast, blooming clouds when slow)
 * - Click shockwave (radial velocity injection propagating physically)
 * - Hover state micro-turbulence (increased curl and vortex injections)
 * - Dynamic color mapping (Champagne Gold -> Amber -> Warm Honey -> Charcoal -> Trans)
 * - Procedural FBM noise overlay for realistic organic smoke texture
 * - Wind and idle breathing drift
 * - Robust texture fallback (Half Float -> Float -> Byte)
 */
export default function FluidCursor() {
  const canvasRef = useRef(null);

  // Simulation parameters (Fine-tuned for a premium smooth liquid light trail)
  const SIM_HEIGHT = 128; // Grid height
  const VELOCITY_DISSIPATION = 6.0; // Custom velocity decay rate
  const DENSITY_DISSIPATION = 6.0; // Custom density dissipation rate
  const PRESSURE_ITERATIONS = 20; // Premium pressure convergence
  const CURL = 5.0; // Custom vorticity/curl turbulence
  const SPLAT_RADIUS = 0.12; // Input splat radius (equivalent to 0.0012 in simulation)
  const SPLAT_FORCE = 1800.0; // Mouse speed force multiplier
  const BUOYANCY = 0.00; // No buoyancy — light stays exactly on cursor path

  // State refs
  const mouse = useRef({ x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, moved: false });
  const lerpedMouse = useRef({ x: 0, y: 0, px: 0, py: 0 }); // Smooth interpolation tracker
  const isHovered = useRef(false);
  const hoverTarget = useRef(null);
  const clickQueued = useRef(false);
  const clickPoint = useRef({ x: 0, y: 0 });

  // WebGL 2 Context & Resources Refs
  const glRef = useRef(null);
  const programsRef = useRef({});
  const fbosRef = useRef({});
  const quadVaoRef = useRef(null);
  const quadVboRef = useRef(null);
  const timeRef = useRef(0);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Initialize WebGL 2
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.warn("WebGL 2 not supported. Luxury smoke cursor disabled.");
      return;
    }
    glRef.current = gl;

    // 2. Query Texture and Framebuffer Support
    // We try HALF_FLOAT first (standard, fast), then FLOAT, then UNSIGNED_BYTE as a foolproof fallback.
    const extHalfFloatLinear = gl.getExtension('OES_texture_half_float_linear');
    const extFloatLinear = gl.getExtension('OES_texture_float_linear');

    const testSupport = (internalFormat, format, type) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(tex);
      return status === gl.FRAMEBUFFER_COMPLETE;
    };

    let texType = gl.HALF_FLOAT;
    let texInternalFormat = gl.RGBA16F;
    let texFormat = gl.RGBA;

    if (extHalfFloatLinear && testSupport(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT)) {
      texType = gl.HALF_FLOAT;
      texInternalFormat = gl.RGBA16F;
    } else if (extFloatLinear && testSupport(gl.RGBA32F, gl.RGBA, gl.FLOAT)) {
      texType = gl.FLOAT;
      texInternalFormat = gl.RGBA32F;
    } else {
      texType = gl.UNSIGNED_BYTE;
      texInternalFormat = gl.RGBA;
    }

    // 3. Compile Shaders & Create Programs
    const createShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source.trim());
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const createProgram = (vsSource, fsSource) => {
      const vs = createShader(vsSource, gl.VERTEX_SHADER);
      const fs = createShader(fsSource, gl.FRAGMENT_SHADER);
      if (!vs || !fs) return null;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program Link Error:", gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    };

    // Shared pass-through vertex shader
    const baseVertexShader = `#version 300 es
      in vec2 aPosition;
      out vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Shaders declarations
    const shaders = {
      clear: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uTarget;
        uniform float uValue;
        void main() {
          fragColor = uValue * texture(uTarget, vUv);
        }
      `,
      splat: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uTarget;
        uniform vec2 uPoint;
        uniform vec3 uColor;
        uniform float uRadius;
        uniform float uAspect;
        void main() {
          vec2 delta = vUv - uPoint;
          delta.x *= uAspect;
          float distSq = dot(delta, delta);
          float factor = exp(-distSq / uRadius);
          vec3 base = texture(uTarget, vUv).xyz;
          fragColor = vec4(base + uColor * factor, 1.0);
        }
      `,
      shockwave: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uVelocity;
        uniform vec2 uPoint;
        uniform float uRadius;
        uniform float uForce;
        uniform float uAspect;
        void main() {
          vec2 delta = vUv - uPoint;
          delta.x *= uAspect;
          float distSq = dot(delta, delta);
          float factor = exp(-distSq / uRadius);
          vec2 vel = texture(uVelocity, vUv).xy;
          if (distSq > 0.0001) {
            vec2 dir = normalize(delta);
            vel += dir * uForce * factor;
          }
          fragColor = vec4(vel, 0.0, 1.0);
        }
      `,
      advect: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uVelocity;
        uniform sampler2D uQuantity;
        uniform vec2 uTexelSize;
        uniform float uDt;
        uniform float uDissipation;
        void main() {
          vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
          fragColor = uDissipation * texture(uQuantity, coord);
        }
      `,
      divergence: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uVelocity;
        uniform vec2 uTexelSize;
        void main() {
          float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
          float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
          float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
          float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
          float div = 0.5 * ((R - L) + (T - B));
          fragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `,
      jacobi: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        uniform vec2 uTexelSize;
        void main() {
          float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
          float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
          float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
          float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
          float div = texture(uDivergence, vUv).x;
          float p = 0.25 * (L + R + B + T - div);
          fragColor = vec4(p, 0.0, 0.0, 1.0);
        }
      `,
      gradientSubtract: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        uniform vec2 uTexelSize;
        void main() {
          float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
          float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
          float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
          float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
          vec2 vel = texture(uVelocity, vUv).xy;
          vel -= 0.5 * vec2(R - L, T - B);
          fragColor = vec4(vel, 0.0, 1.0);
        }
      `,
      vorticity: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uVelocity;
        uniform vec2 uTexelSize;
        void main() {
          float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
          float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
          float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
          float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
          float vorticity = 0.5 * ((R - L) - (T - B));
          fragColor = vec4(vorticity, 0.0, 0.0, 1.0);
        }
      `,
      vorticityForce: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uVelocity;
        uniform sampler2D uVorticity;
        uniform vec2 uTexelSize;
        uniform float uCurl;
        uniform float uDt;
        void main() {
          float L = texture(uVorticity, vUv - vec2(uTexelSize.x, 0.0)).x;
          float R = texture(uVorticity, vUv + vec2(uTexelSize.x, 0.0)).x;
          float B = texture(uVorticity, vUv - vec2(0.0, uTexelSize.y)).x;
          float T = texture(uVorticity, vUv + vec2(0.0, uTexelSize.y)).x;
          float C = texture(uVorticity, vUv).x;
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          float len = length(force);
          if (len > 0.0001) {
            force = (force / len) * uCurl * C;
          } else {
            force = vec2(0.0);
          }
          vec2 vel = texture(uVelocity, vUv).xy;
          fragColor = vec4(vel + force * uDt, 0.0, 1.0);
        }
      `,
      buoyancy: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uVelocity;
        uniform sampler2D uDensity;
        uniform float uBuoyancy;
        uniform float uDt;
        void main() {
          vec2 vel = texture(uVelocity, vUv).xy;
          float dens = texture(uDensity, vUv).x;
          vel.y += uBuoyancy * dens * uDt;
          fragColor = vec4(vel, 0.0, 1.0);
        }
      `,
      display: `#version 300 es
        precision highp float;
        in vec2 vUv;
        out vec4 fragColor;
        uniform sampler2D uDensity;
        uniform vec2 uTexelSize;
        uniform bool uShading;

        void main() {
          float density = texture(uDensity, vUv).x;

          // Smooth feathered edge threshold — no hard discard cutoff
          // smoothstep creates a silky, gaussian-like soft edge (no harsh borders)
          float edge = smoothstep(0.0, 0.35, density);

          if (edge <= 0.004) discard;

          // Premium liquid light color palette
          // Core: warm champagne gold — Outer aura: soft violet-gold
          vec3 goldCore   = vec3(0.98, 0.88, 0.48); // warm champagne gold (#FBE07A)
          vec3 auraOuter  = vec3(0.78, 0.62, 0.96); // soft violet-lavender aura

          // Radial color blend: golden hot core fading to violet aura at edges
          float colorT = smoothstep(0.0, 1.0, min(density * 2.2, 1.0));
          vec3 color = mix(auraOuter, goldCore, colorT);

          if (uShading) {
            float L = texture(uDensity, vUv - vec2(uTexelSize.x, 0.0)).x;
            float R = texture(uDensity, vUv + vec2(uTexelSize.x, 0.0)).x;
            float T = texture(uDensity, vUv + vec2(0.0, uTexelSize.y)).x;
            float B = texture(uDensity, vUv - vec2(0.0, uTexelSize.y)).x;

            vec3 normal = normalize(vec3(R - L, T - B, 1.0));
            float diffuse = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
            color *= (0.6 + 0.4 * diffuse);
          }

          // Ultra-smooth feathered alpha — smoothstep falloff, hard cap at 50%
          // pow(edge, 1.4) makes the attenuation curve extremely gradual (no sharp rim)
          float alpha = min(pow(edge, 1.4) * 0.58, 0.50);

          fragColor = vec4(color, alpha);
        }
      `
    };

    // Compile programs
    const programs = {};
    for (const name in shaders) {
      const prog = createProgram(baseVertexShader, shaders[name]);
      if (!prog) {
        console.error(`Failed to compile WebGL program: ${name}`);
        return;
      }
      programs[name] = prog;
    }
    programsRef.current = programs;

    // 4. Create Quad VAO/VBO for rendering full-screen textures
    const quadVertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const quadVao = gl.createVertexArray();
    const quadVbo = gl.createBuffer();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    // Get input position location
    const positionLoc = 0; // standard layout location or query
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    quadVaoRef.current = quadVao;
    quadVboRef.current = quadVbo;

    // 5. Framebuffer management helpers
    const createFBO = (w, h) => {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, texInternalFormat, w, h, 0, texFormat, texType, null);

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        }
      };
    };

    const createDoubleFBO = (w, h) => {
      let fbo1 = createFBO(w, h);
      let fbo2 = createFBO(w, h);
      return {
        get read() { return fbo1; },
        get write() { return fbo2; },
        swap() {
          const tmp = fbo1;
          fbo1 = fbo2;
          fbo2 = tmp;
        }
      };
    };

    // 6. Init Framebuffers with correct sizes
    let simWidth = 0;
    let simHeight = SIM_HEIGHT;

    const initFramebuffers = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      
      simWidth = Math.round(simHeight * aspect);

      // Clean up existing FBOs if any
      const keys = Object.keys(fbosRef.current);
      keys.forEach(k => {
        const item = fbosRef.current[k];
        if (item.swap) {
          gl.deleteTexture(item.read.texture);
          gl.deleteFramebuffer(item.read.fbo);
          gl.deleteTexture(item.write.texture);
          gl.deleteFramebuffer(item.write.fbo);
        } else {
          gl.deleteTexture(item.texture);
          gl.deleteFramebuffer(item.fbo);
        }
      });

      // Allocate new FBOs
      fbosRef.current = {
        density: createDoubleFBO(simWidth, simHeight),
        velocity: createDoubleFBO(simWidth, simHeight),
        pressure: createDoubleFBO(simWidth, simHeight),
        divergence: createFBO(simWidth, simHeight),
        vorticity: createFBO(simWidth, simHeight)
      };
    };

    // Initial resize setup
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x DPR for WebGL performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initFramebuffers();
    };
    
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // 7. Event listeners inside the canvas layout
    const onMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight; // invert y for WebGL texture coordinates
      
      if (!mouse.current.moved) {
        mouse.current.px = x;
        mouse.current.py = y;
        lerpedMouse.current.x = x;
        lerpedMouse.current.y = y;
        lerpedMouse.current.px = x;
        lerpedMouse.current.py = y;
        mouse.current.moved = true;
      }
      mouse.current.x = x;
      mouse.current.y = y;
    };

    const onMouseDown = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight;
      clickPoint.current = { x, y };
      clickQueued.current = true;
    };

    // Event Delegation: Mouse Over to detect interactive targets (swirling bursts)
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const interactiveEl = target.closest('a, button, [role="button"], .btn-gold, .btn-outline, .pill, .vcard');
      if (interactiveEl) {
        isHovered.current = true;
        hoverTarget.current = interactiveEl;
      } else {
        isHovered.current = false;
        hoverTarget.current = null;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    // 8. Fluid simulation drawing functions
    const blit = (destinationFBO) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, destinationFBO ? destinationFBO.fbo : null);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Main solver variables
    let lastTime = performance.now();

    const update = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033); // Cap dt to prevent numerical explosions
      lastTime = now;
      timeRef.current += dt;

      const gl = glRef.current;
      const programs = programsRef.current;
      const fbos = fbosRef.current;
      const quadVao = quadVaoRef.current;

      if (!gl || !fbos.density) {
        animationFrameId.current = requestAnimationFrame(update);
        return;
      }

      gl.bindVertexArray(quadVao);
      gl.viewport(0, 0, simWidth, simHeight);

      // Interpolate mouse coordinates smoothly for buttery cursor movement
      const lerpFactor = 0.22; // lower = smoother delay, higher = snappier
      lerpedMouse.current.px = lerpedMouse.current.x;
      lerpedMouse.current.py = lerpedMouse.current.y;
      lerpedMouse.current.x += (mouse.current.x - lerpedMouse.current.x) * lerpFactor;
      lerpedMouse.current.y += (mouse.current.y - lerpedMouse.current.y) * lerpFactor;

      // Compute velocity delta from lerped positions
      mouse.current.dx = lerpedMouse.current.x - lerpedMouse.current.px;
      mouse.current.dy = lerpedMouse.current.y - lerpedMouse.current.py;
      mouse.current.px = lerpedMouse.current.x;
      mouse.current.py = lerpedMouse.current.y;

      const speed = Math.hypot(mouse.current.dx, mouse.current.dy);

      // A. Advection (Velocity field advects itself)
      const velDissipation = 1.0 / (1.0 + VELOCITY_DISSIPATION * dt);
      gl.useProgram(programs.advect);
      gl.uniform1i(gl.getUniformLocation(programs.advect, "uVelocity"), fbos.velocity.read.attach(0));
      gl.uniform1i(gl.getUniformLocation(programs.advect, "uQuantity"), fbos.velocity.read.attach(0));
      gl.uniform2f(gl.getUniformLocation(programs.advect, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      gl.uniform1f(gl.getUniformLocation(programs.advect, "uDt"), dt);
      gl.uniform1f(gl.getUniformLocation(programs.advect, "uDissipation"), velDissipation);
      blit(fbos.velocity.write);
      fbos.velocity.swap();

      // B. Buoyancy force (disabled for clean ribbon flow)
      gl.useProgram(programs.buoyancy);
      gl.uniform1i(gl.getUniformLocation(programs.buoyancy, "uVelocity"), fbos.velocity.read.attach(0));
      gl.uniform1i(gl.getUniformLocation(programs.buoyancy, "uDensity"), fbos.density.read.attach(1));
      gl.uniform1f(gl.getUniformLocation(programs.buoyancy, "uBuoyancy"), BUOYANCY);
      gl.uniform1f(gl.getUniformLocation(programs.buoyancy, "uDt"), dt);
      blit(fbos.velocity.write);
      fbos.velocity.swap();

      // C. Vorticity Confinement (disabled curl keeps liquid light trail straight and smooth)
      gl.useProgram(programs.vorticity);
      gl.uniform1i(gl.getUniformLocation(programs.vorticity, "uVelocity"), fbos.velocity.read.attach(0));
      gl.uniform2f(gl.getUniformLocation(programs.vorticity, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      blit(fbos.vorticity);

      gl.useProgram(programs.vorticityForce);
      gl.uniform1i(gl.getUniformLocation(programs.vorticityForce, "uVelocity"), fbos.velocity.read.attach(0));
      gl.uniform1i(gl.getUniformLocation(programs.vorticityForce, "uVorticity"), fbos.vorticity.attach(1));
      gl.uniform2f(gl.getUniformLocation(programs.vorticityForce, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      gl.uniform1f(gl.getUniformLocation(programs.vorticityForce, "uCurl"), CURL);
      gl.uniform1f(gl.getUniformLocation(programs.vorticityForce, "uDt"), dt);
      blit(fbos.velocity.write);
      fbos.velocity.swap();

      // D. Splats (Inject density and velocity)
      // 1. Mouse movements
      if (mouse.current.moved && speed > 0.0001) {
        // Density Splat - constant size for uniform luxurious aura width
        const splatRadius = SPLAT_RADIUS / 100.0; 

        gl.useProgram(programs.splat);
        gl.uniform1i(gl.getUniformLocation(programs.splat, "uTarget"), fbos.density.read.attach(0));
        gl.uniform2f(gl.getUniformLocation(programs.splat, "uPoint"), lerpedMouse.current.x, lerpedMouse.current.y);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uRadius"), splatRadius);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uAspect"), simWidth / simHeight);
        
        // High-end dual color blend density injection (creates golden core)
        gl.uniform3f(gl.getUniformLocation(programs.splat, "uColor"), 0.65, 0.52, 0.25);
        blit(fbos.density.write);
        fbos.density.swap();

        // Velocity Splat
        gl.useProgram(programs.splat);
        gl.uniform1i(gl.getUniformLocation(programs.splat, "uTarget"), fbos.velocity.read.attach(0));
        gl.uniform2f(gl.getUniformLocation(programs.splat, "uPoint"), lerpedMouse.current.x, lerpedMouse.current.y);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uRadius"), splatRadius * 1.5);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uAspect"), simWidth / simHeight);
        
        // Inject velocity vector
        gl.uniform3f(
          gl.getUniformLocation(programs.splat, "uColor"), 
          mouse.current.dx * SPLAT_FORCE, 
          mouse.current.dy * SPLAT_FORCE, 
          0.0
        );
        blit(fbos.velocity.write);
        fbos.velocity.swap();
      }

      // 2. Soft continuous seepage (only active when mouse moves to prevent blobs)
      if (mouse.current.moved && speed > 0.0001) {
        gl.useProgram(programs.splat);
        gl.uniform1i(gl.getUniformLocation(programs.splat, "uTarget"), fbos.density.read.attach(0));
        gl.uniform2f(gl.getUniformLocation(programs.splat, "uPoint"), lerpedMouse.current.x, lerpedMouse.current.y);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uRadius"), (SPLAT_RADIUS / 100.0) * 0.75);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uAspect"), simWidth / simHeight);
        gl.uniform3f(gl.getUniformLocation(programs.splat, "uColor"), 0.06, 0.04, 0.02);
        blit(fbos.density.write);
        fbos.density.swap();
      }

      // 3. Hover elements (no micro-turbulence swirl, keep it a perfectly clean light ribbon)

      // 4. Click shockwave (radial velocity ring solver)
      if (clickQueued.current) {
        clickQueued.current = false;
        
        // Inject instant high-density burst at click point (soft color aura)
        gl.useProgram(programs.splat);
        gl.uniform1i(gl.getUniformLocation(programs.splat, "uTarget"), fbos.density.read.attach(0));
        gl.uniform2f(gl.getUniformLocation(programs.splat, "uPoint"), clickPoint.current.x, clickPoint.current.y);
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uRadius"), (SPLAT_RADIUS / 100.0) * 2.0); // elegant small burst
        gl.uniform1f(gl.getUniformLocation(programs.splat, "uAspect"), simWidth / simHeight);
        gl.uniform3f(gl.getUniformLocation(programs.splat, "uColor"), 0.65, 0.40, 0.60); // soft rose/gold puff
        blit(fbos.density.write);
        fbos.density.swap();

        // Trigger radial shockwave in velocity grid
        gl.useProgram(programs.shockwave);
        gl.uniform1i(gl.getUniformLocation(programs.shockwave, "uVelocity"), fbos.velocity.read.attach(0));
        gl.uniform2f(gl.getUniformLocation(programs.shockwave, "uPoint"), clickPoint.current.x, clickPoint.current.y);
        gl.uniform1f(gl.getUniformLocation(programs.shockwave, "uRadius"), (SPLAT_RADIUS / 100.0) * 1.25);
        gl.uniform1f(gl.getUniformLocation(programs.shockwave, "uForce"), SPLAT_FORCE * 0.0012); // scaled push
        gl.uniform1f(gl.getUniformLocation(programs.shockwave, "uAspect"), simWidth / simHeight);
        blit(fbos.velocity.write);
        fbos.velocity.swap();
      }

      // E. Pressure Solve (Jacobi iterations to enforce incompressibility)
      // 1. Compute velocity divergence field
      gl.useProgram(programs.divergence);
      gl.uniform1i(gl.getUniformLocation(programs.divergence, "uVelocity"), fbos.velocity.read.attach(0));
      gl.uniform2f(gl.getUniformLocation(programs.divergence, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      blit(fbos.divergence);

      // 2. Clear pressure read FBO
      gl.useProgram(programs.clear);
      gl.uniform1i(gl.getUniformLocation(programs.clear, "uTarget"), fbos.pressure.read.attach(0));
      gl.uniform1f(gl.getUniformLocation(programs.clear, "uValue"), 0.0);
      blit(fbos.pressure.write);
      fbos.pressure.swap();

      // 3. Jacobi iterations
      gl.useProgram(programs.jacobi);
      gl.uniform1i(gl.getUniformLocation(programs.jacobi, "uDivergence"), fbos.divergence.attach(1));
      gl.uniform2f(gl.getUniformLocation(programs.jacobi, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      const uPressureLoc = gl.getUniformLocation(programs.jacobi, "uPressure");
      
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(uPressureLoc, fbos.pressure.read.attach(0));
        blit(fbos.pressure.write);
        fbos.pressure.swap();
      }

      // 4. Subtract pressure gradient from velocity
      gl.useProgram(programs.gradientSubtract);
      gl.uniform1i(gl.getUniformLocation(programs.gradientSubtract, "uPressure"), fbos.pressure.read.attach(0));
      gl.uniform1i(gl.getUniformLocation(programs.gradientSubtract, "uVelocity"), fbos.velocity.read.attach(1));
      gl.uniform2f(gl.getUniformLocation(programs.gradientSubtract, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      blit(fbos.velocity.write);
      fbos.velocity.swap();

      // F. Density Advection (moves smoke color along velocity field)
      const densityDissipation = 1.0 / (1.0 + DENSITY_DISSIPATION * dt);
      gl.useProgram(programs.advect);
      gl.uniform1i(gl.getUniformLocation(programs.advect, "uVelocity"), fbos.velocity.read.attach(0));
      gl.uniform1i(gl.getUniformLocation(programs.advect, "uQuantity"), fbos.density.read.attach(0));
      gl.uniform2f(gl.getUniformLocation(programs.advect, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      gl.uniform1f(gl.getUniformLocation(programs.advect, "uDt"), dt);
      gl.uniform1f(gl.getUniformLocation(programs.advect, "uDissipation"), densityDissipation);
      blit(fbos.density.write);
      fbos.density.swap();

      // G. Render final density buffer to screen viewport
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programs.display);
      gl.uniform1i(gl.getUniformLocation(programs.display, "uDensity"), fbos.density.read.attach(0));
      gl.uniform2f(gl.getUniformLocation(programs.display, "uTexelSize"), 1.0 / simWidth, 1.0 / simHeight);
      gl.uniform1i(gl.getUniformLocation(programs.display, "uShading"), SHADING ? 1 : 0);
      blit(null);

      gl.bindVertexArray(null);
      animationFrameId.current = requestAnimationFrame(update);
    };

    animationFrameId.current = requestAnimationFrame(update);

    // 9. Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseover', onMouseOver);

      const gl = glRef.current;
      if (!gl) return;

      // Delete VAO/VBO
      if (quadVaoRef.current) gl.deleteVertexArray(quadVaoRef.current);
      if (quadVboRef.current) gl.deleteBuffer(quadVboRef.current);

      // Delete shader programs
      const programs = programsRef.current;
      for (const name in programs) {
        gl.deleteProgram(programs[name]);
      }

      // Delete FBO textures and framebuffers
      const fbos = fbosRef.current;
      for (const k in fbos) {
        const item = fbos[k];
        if (item.swap) {
          gl.deleteTexture(item.read.texture);
          gl.deleteFramebuffer(item.read.fbo);
          gl.deleteTexture(item.write.texture);
          gl.deleteFramebuffer(item.write.fbo);
        } else {
          gl.deleteTexture(item.texture);
          gl.deleteFramebuffer(item.fbo);
        }
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999995, // below CustomCursor HTML dot/halo (999997) but above all page contents
        mixBlendMode: 'screen', // luxury bloom screen blending
      }}
    />
  );
}
