import React, { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════════ */
const rand  = (a, b) => Math.random() * (b - a) + a;
const randI = (a, b) => Math.floor(rand(a, b));

/* ═══════════════════════════════════════════════════════════════════════════════
   POOL INITIALIZERS  (called once per condition-change, never inside the loop)
═══════════════════════════════════════════════════════════════════════════════ */

/** Stars — for night-clear */
function makeStars(W, H) {
  const out = [];
  for (let i = 0; i < 200; i++) {
    out.push({ x: rand(0, W), y: rand(0, H * 0.82), r: rand(0.4, 2.4),
               phase: rand(0, Math.PI * 2), speed: rand(0.4, 1.8) });
  }
  return out;
}

/** Clouds — for cloudy and spring (reused) */
function makeClouds(count, W, H, yMin, yMax, wMin, wMax, speedScale) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x     : rand(0, W),
      y     : rand(H * yMin, H * yMax),
      w     : rand(wMin, wMax),
      h     : rand(40, 110),
      speed : rand(0.08, 0.28) * speedScale * (i % 2 === 0 ? 1 : 0.5),
      alpha : rand(0.5, 0.9),
      layer : i % 3,          // 0 = back, 2 = front
    });
  }
  return out;
}

/** ──────────────────────────────────────────────────────────
 *  RAIN — object pool:  { x, y, length, speed, opacity, lineW }
 *  'heavy' = thunderstorm variant
 * ────────────────────────────────────────────────────────── */
function makeRainDrops(W, H, heavy) {
  const count = heavy ? randI(300, 380) : randI(150, 230);
  const out   = [];
  for (let i = 0; i < count; i++) {
    const speed   = heavy ? rand(14, 28) : rand(8, 20);
    const opacity = 0.18 + (speed / (heavy ? 28 : 20)) * 0.55; // faster = brighter
    const lineW   = opacity > 0.55 ? 1.5 : 1;
    out.push({
      x: rand(0, W + H * 0.25),   // +offset so angled drops start off-screen
      y: rand(-H, H),
      length  : rand(12, 30) * (heavy ? 1.4 : 1),
      speed,
      opacity,
      lineW,
      splash  : null,   // { x, y, life } — single-frame splash record
    });
  }
  return out;
}

/** Lightning state (thunderstorm) */
function makeLightning() {
  return { flash: 0, flashAlpha: 0, timer: randI(90, 240) };
}

/** ──────────────────────────────────────────────────────────
 *  SNOW — object pool:  { x, y, radius, speed, drift, driftOffset }
 * ────────────────────────────────────────────────────────── */
function makeSnowFlakes(W, H) {
  const count = randI(80, 120);
  const out   = [];
  for (let i = 0; i < count; i++) {
    const r = rand(1, 4);
    out.push({
      x          : rand(0, W),
      y          : rand(-H, H),
      radius     : r,
      speed      : 0.5 + (r / 4) * 1.5,   // bigger = faster
      drift      : rand(0.4, 1.4),          // sway amplitude (px)
      driftOffset: rand(0, Math.PI * 2),
      opacity    : 0.45 + (r / 4) * 0.55,  // bigger = more opaque
    });
  }
  return out;
}

/** ──────────────────────────────────────────────────────────
 *  SPRING — petals / pollen:  { x, y, r, speed, drift, driftOffset, opacity, opacityDir }
 * ────────────────────────────────────────────────────────── */
function makeSpringPetals(W, H) {
  const out = [];
  for (let i = 0; i < 28; i++) {
    out.push({
      x          : rand(0, W),
      y          : rand(0, H),
      r          : rand(2.5, 6),
      speed      : rand(0.25, 0.75),        // upward drift speed
      drift      : rand(0.3, 1.1),
      driftOffset: rand(0, Math.PI * 2),
      opacity    : rand(0.3, 0.85),
      opacityDir : Math.random() > 0.5 ? 1 : -1,
    });
  }
  return out;
}

/** Spring cloud pool (lighter, softer than storm clouds) */
function makeSpringClouds(W, H) {
  return makeClouds(8, W, H, 0.04, 0.42, 140, 320, 0.6);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SHARED CLOUD DRAW  (used by both cloudy & spring scenes)
═══════════════════════════════════════════════════════════════════════════════ */
function drawCloudShape(ctx, x, y, w, h, alpha, tint = '#eef2f7') {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = tint;
  const r     = h / 2;
  const steps = Math.max(3, Math.ceil(w / (r * 1.1)));
  for (let i = 0; i < steps; i++) {
    const t  = i / Math.max(1, steps - 1);
    const bx = x + t * w;
    const bump = Math.sin(t * Math.PI) * h * 0.32;
    ctx.beginPath();
    ctx.arc(bx, y - bump, r * (0.65 + 0.38 * Math.sin(t * Math.PI)), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE DRAW FUNCTIONS   (signature: drawXxx(ctx, W, H, frame, particles))
═══════════════════════════════════════════════════════════════════════════════ */

/* ── Sunny day ──────────────────────────────────────────────────────────────── */
function drawSunnyDay(ctx, W, H, frame) {
  const t = frame * 0.016;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,    '#4aade8');
  sky.addColorStop(0.45, '#fde68a');
  sky.addColorStop(1,    '#fb923c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const cx = W * 0.74, cy = H * 0.2;
  const pulse = Math.sin(t * 1.5) * 6;
  const R = 58 + pulse;

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 3.4);
  glow.addColorStop(0, 'rgba(255,215,50,0.5)');
  glow.addColorStop(1, 'rgba(255,180,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, R * 3.4, 0, Math.PI * 2); ctx.fill();

  // Core
  ctx.fillStyle = '#ffe066';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  // Rays
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.004);
  const RC = 12;
  for (let i = 0; i < RC; i++) {
    const angle = (i / RC) * Math.PI * 2;
    const len   = R * 1.5 + Math.sin(t * 2 + i) * 10;
    ctx.strokeStyle = `rgba(255,230,80,${(0.4 + 0.22 * Math.sin(t + i)).toFixed(2)})`;
    ctx.lineWidth   = 2.5 + Math.sin(t * 1.5 + i) * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (R + 6), Math.sin(angle) * (R + 6));
    ctx.lineTo(Math.cos(angle) * len,     Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();
}

/* ── Night clear ────────────────────────────────────────────────────────────── */
function drawNightClear(ctx, W, H, frame, stars) {
  const t = frame * 0.016;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,    '#07072a');
  sky.addColorStop(0.55, '#171760');
  sky.addColorStop(1,    '#2d1b69');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const a = 0.32 + 0.68 * Math.abs(Math.sin(t * s.speed + s.phase));
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }

  const mx = W * 0.76, my = H * 0.19;
  const mg = ctx.createRadialGradient(mx, my, 22, mx, my, 95);
  mg.addColorStop(0, 'rgba(190,215,255,0.28)');
  mg.addColorStop(1, 'rgba(80,130,200,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 95, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#d8e8ff';
  ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#171760';
  ctx.beginPath(); ctx.arc(mx + 18, my - 10, 34, 0, Math.PI * 2); ctx.fill();
}

/* ── Cloudy ─────────────────────────────────────────────────────────────────── */
function drawCloudy(ctx, W, H, frame, clouds) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#687f8e'); sky.addColorStop(1, '#b8ccd4');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i];
    c.x += c.speed;
    if (c.x > W + c.w) c.x = -c.w;
    if (c.x < -c.w)    c.x =  W + c.w;
    drawCloudShape(ctx, c.x - c.w / 2, c.y, c.w, c.h, c.alpha);
  }
}

/* ── RAIN  ───────────────────────────────────────────────────────────────────
   Uses object pool, diagonal angle ~12°, splash effect on reset.
   drawRain(ctx, W, H, frame, drops, lightning, heavy)
─────────────────────────────────────────────────────────────────────────────── */
const RAIN_ANGLE_TAN = Math.tan((12 * Math.PI) / 180); // ~0.213

function drawRain(ctx, W, H, frame, drops, lightning, heavy) {
  /* ── Background ── */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, heavy ? '#101020' : '#1e3040');
  sky.addColorStop(1, heavy ? '#0e1624' : '#2e5070');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  /* ── Drops ── */
  ctx.save();
  ctx.lineCap = 'round';

  for (let i = 0; i < drops.length; i++) {
    const d  = drops[i];
    const dx = d.speed * RAIN_ANGLE_TAN;

    d.y += d.speed;
    d.x += dx;

    /* splash: render one frame, then clear */
    if (d.splash) {
      const sp = d.splash;
      sp.life -= 1;
      if (sp.life > 0) {
        for (let j = 0; j < sp.rings.length; j++) {
          const ring = sp.rings[j];
          ctx.globalAlpha = (sp.life / 3) * 0.55;
          ctx.strokeStyle = 'rgba(160,210,245,0.9)';
          ctx.lineWidth   = 0.8;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, ring.r * (1 + (3 - sp.life) * 0.4), 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        d.splash = null;
      }
    }

    /* reset when out of bounds */
    if (d.y > H || d.x > W + 40) {
      /* create splash at last position before reset */
      if (d.y > H) {
        d.splash = {
          x: d.x, y: H - 2, life: 3,
          rings: [{ r: rand(2, 4) }, { r: rand(5, 8) }],
        };
      }
      d.y = rand(-60, -5);
      d.x = rand(-40, W + 40);
    }

    /* draw drop */
    ctx.globalAlpha = d.opacity;
    ctx.strokeStyle = heavy ? 'rgba(180,220,255,0.9)' : 'rgba(160,210,245,0.85)';
    ctx.lineWidth   = d.lineW;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + dx * (d.length / d.speed), d.y + d.length);
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha = 1;

  /* ── Lightning (thunderstorm) ── */
  if (heavy && lightning) {
    lightning.timer -= 1;
    if (lightning.timer <= 0) {
      // ~10% chance per check → on average flash every 1-4 s at 60fps
      if (Math.random() < 0.1) {
        lightning.flashAlpha = rand(0.28, 0.55);
        lightning.flash      = randI(6, 10);          // frames to stay lit
      }
      lightning.timer = randI(80, 200);
    }
    if (lightning.flash > 0) {
      const lx = rand(W * 0.2, W * 0.8);
      const lg = ctx.createRadialGradient(lx, 0, 10, lx, H * 0.3, W * 0.8);
      lg.addColorStop(0, `rgba(255,255,230,${lightning.flashAlpha.toFixed(2)})`);
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
      lightning.flash      -= 1;
      lightning.flashAlpha *= 0.82;
    }
  }
}

/* ── SNOW  ───────────────────────────────────────────────────────────────────
   Sine-wave horizontal drift, parallax depth, ground strip.
   drawSnow(ctx, W, H, frame, flakes)
─────────────────────────────────────────────────────────────────────────────── */
function drawSnow(ctx, W, H, frame, flakes) {
  /* ── Background ── */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#7a9ab0'); sky.addColorStop(1, '#c8e0ec');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  /* ── Flakes ── */
  for (let i = 0; i < flakes.length; i++) {
    const f = flakes[i];

    /* sine-wave drift: x += sin(frame*0.01 + driftOffset) * drift */
    f.x += Math.sin(frame * 0.01 + f.driftOffset) * f.drift;
    f.y += f.speed;

    if (f.y > H + 10) {
      f.y = -10;
      f.x = rand(0, W);
    }
    if (f.x >  W + 10) f.x = -10;
    if (f.x < -10)     f.x =  W + 10;

    ctx.globalAlpha = f.opacity;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* ── Ground accumulation strip ── */
  const groundH = Math.min(H * 0.06, 38);
  const ground  = ctx.createLinearGradient(0, H - groundH, 0, H);
  ground.addColorStop(0, 'rgba(255,255,255,0)');
  ground.addColorStop(1, 'rgba(240,248,255,0.55)');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H - groundH, W, groundH);
}

/* ── SPRING  ─────────────────────────────────────────────────────────────────
   Warm sky, slow fluffy clouds, floating petals/pollen, gentle sun.
   drawSpring(ctx, W, H, frame, springClouds, petals)
─────────────────────────────────────────────────────────────────────────────── */
function drawSpring(ctx, W, H, frame, springClouds, petals) {
  const t = frame * 0.016;

  /* ── Warm pale sky ── */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,    '#b8daf5');
  sky.addColorStop(0.55, '#fef3c7');
  sky.addColorStop(1,    '#fde68a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  /* ── Gentle sun (top-right corner, softer than sunny-day) ── */
  const sx = W * 0.78, sy = H * 0.14;
  const sp = Math.sin(frame * 0.005);           // slow pulse
  const SR = 42 + sp * 4;

  const sg = ctx.createRadialGradient(sx, sy, SR * 0.3, sx, sy, SR * 3.5);
  sg.addColorStop(0, `rgba(255,220,120,${(0.38 + sp * 0.06).toFixed(2)})`);
  sg.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(sx, sy, SR * 3.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ffe98a';
  ctx.beginPath(); ctx.arc(sx, sy, SR, 0, Math.PI * 2); ctx.fill();

  /* Soft short rays */
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(frame * 0.002);
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const rLen  = SR * 1.35 + Math.sin(frame * 0.008 + i) * 6;
    ctx.strokeStyle = `rgba(255,230,100,${(0.28 + 0.12 * Math.sin(t + i)).toFixed(2)})`;
    ctx.lineWidth   = 1.8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (SR + 4), Math.sin(angle) * (SR + 4));
    ctx.lineTo(Math.cos(angle) * rLen,     Math.sin(angle) * rLen);
    ctx.stroke();
  }
  ctx.restore();

  /* ── Drifting clouds ── */
  for (let i = 0; i < springClouds.length; i++) {
    const c = springClouds[i];
    c.x += c.speed;
    if (c.x > W + c.w) c.x = -c.w;
    drawCloudShape(ctx, c.x - c.w / 2, c.y, c.w, c.h, c.alpha, '#f0f8ff');
  }

  /* ── Floating petals / pollen ── */
  for (let i = 0; i < petals.length; i++) {
    const p = petals[i];

    p.y -= p.speed;                                           // drift upward
    p.x += Math.sin(frame * 0.012 + p.driftOffset) * p.drift;

    /* opacity pulse: fade in and out */
    p.opacity += p.opacityDir * 0.004;
    if (p.opacity > 0.92) { p.opacity = 0.92; p.opacityDir = -1; }
    if (p.opacity < 0.15) { p.opacity = 0.15; p.opacityDir =  1; }

    if (p.y < -12) {
      p.y  = H + 12;
      p.x  = rand(0, W);
    }
    if (p.x >  W + 12) p.x = -12;
    if (p.x < -12)     p.x =  W + 12;

    /* petal: soft ellipse rotated gently */
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(frame * 0.008 + p.driftOffset) * 0.6);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,192,203,0.9)'    // pink
                  : i % 3 === 1 ? 'rgba(255,228,225,0.85)'   // rose white
                  :               'rgba(255,240,200,0.8)';    // pale yellow pollen
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

/* ── Haze / Mist ────────────────────────────────────────────────────────────── */
function drawHaze(ctx, W, H, frame) {
  const t = frame * 0.016;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,   '#c2b298');
  sky.addColorStop(0.5, '#d4c4a5');
  sky.addColorStop(1,   '#e8d8c4');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 6; i++) {
    const y     = H * (0.1 + i * 0.15);
    const shift = Math.sin(t * 0.12 + i * 0.8) * 60;
    const a     = 0.11 + 0.06 * Math.sin(t * 0.18 + i);
    const g     = ctx.createLinearGradient(shift, y, W + shift, y + 70);
    g.addColorStop(0,   'rgba(228,218,200,0)');
    g.addColorStop(0.5, `rgba(235,225,210,${a.toFixed(2)})`);
    g.addColorStop(1,   'rgba(228,218,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, 80);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */

export default function WeatherCanvas({ condition = 'clear', isDay = true }) {
  /* ── Canvas refs (two canvases for crossfade) ── */
  const canvasARef = useRef(null);   // "current" scene
  const canvasBRef = useRef(null);   // "outgoing" scene snapshot

  /* ── Particle pools — keyed by scene, never re-allocated in the loop ── */
  const poolRef = useRef(null);

  /* ── Crossfade state ── */
  const fadeRef = useRef({
    active       : false,
    progress     : 1,    // 0 → 1  (1 = fully showing canvas A)
    snapshotTaken: false,
  });

  /* ── Track previous condition to trigger crossfade ── */
  const prevCondRef = useRef({ condition, isDay });

  /* ── Condition read by the rAF loop each frame (avoids stale closure) ── */
  const condRef = useRef({ condition, isDay });
  condRef.current = { condition, isDay };

  /* ── Trigger crossfade when condition/isDay changes ── */
  useEffect(() => {
    const prev = prevCondRef.current;
    if (prev.condition === condition && prev.isDay === isDay) return;

    const canvasA = canvasARef.current;
    const canvasB = canvasBRef.current;
    if (!canvasA || !canvasB) return;

    /* Snapshot current frame into canvas B */
    const ctxB = canvasB.getContext('2d');
    canvasB.width  = canvasA.width;
    canvasB.height = canvasA.height;
    ctxB.drawImage(canvasA, 0, 0);

    /* Show canvas B (old) on top, then fade it out */
    canvasB.style.opacity = '1';
    canvasB.style.display = 'block';

    fadeRef.current = { active: true, progress: 0, snapshotTaken: true };
    prevCondRef.current = { condition, isDay };
  }, [condition, isDay]);

  /* ── Re-init particle pools when condition/isDay changes ── */
  useEffect(() => {
    const canvasA = canvasARef.current;
    if (!canvasA) return;
    const W = canvasA.width  || window.innerWidth;
    const H = canvasA.height || window.innerHeight;

    poolRef.current = {
      stars      : makeStars(W, H),
      clouds     : makeClouds(12, W, H, 0.05, 0.55, 120, 340, 1),
      rainDrops  : makeRainDrops(W, H, false),
      stormDrops : makeRainDrops(W, H, true),
      lightning  : makeLightning(),
      snowFlakes : makeSnowFlakes(W, H),
      springClouds: makeSpringClouds(W, H),
      petals     : makeSpringPetals(W, H),
    };
  }, [condition, isDay]);

  /* ── Main animation loop — runs once on mount ── */
  useEffect(() => {
    const canvasA = canvasARef.current;
    const canvasB = canvasBRef.current;
    if (!canvasA || !canvasB) return;

    const ctxA = canvasA.getContext('2d');
    let W = 0, H = 0;

    function resize() {
      W = canvasA.width  = canvasB.width  = window.innerWidth;
      H = canvasA.height = canvasB.height = window.innerHeight;

      /* Re-init all pools on resize so positions make sense */
      poolRef.current = {
        stars       : makeStars(W, H),
        clouds      : makeClouds(12, W, H, 0.05, 0.55, 120, 340, 1),
        rainDrops   : makeRainDrops(W, H, false),
        stormDrops  : makeRainDrops(W, H, true),
        lightning   : makeLightning(),
        snowFlakes  : makeSnowFlakes(W, H),
        springClouds: makeSpringClouds(W, H),
        petals      : makeSpringPetals(W, H),
      };
    }

    resize();
    window.addEventListener('resize', resize);

    let frame  = 0;
    let rafId  = null;
    const FADE_SPEED = 0.025;  // ~1s at 60fps  (1/40 frames)

    function loop() {
      frame++;
      const { condition: cond, isDay: day } = condRef.current;
      const pool = poolRef.current;
      if (!pool) { rafId = requestAnimationFrame(loop); return; }

      ctxA.clearRect(0, 0, W, H);

      /* ── Dispatch to the right draw function ── */
      if (cond === 'clear' && day) {
        drawSunnyDay(ctxA, W, H, frame);
      } else if (cond === 'clear' && !day) {
        drawNightClear(ctxA, W, H, frame, pool.stars);
      } else if (cond === 'clouds') {
        drawCloudy(ctxA, W, H, frame, pool.clouds);
      } else if (cond === 'rain') {
        drawRain(ctxA, W, H, frame, pool.rainDrops, null, false);
      } else if (cond === 'thunderstorm') {
        drawRain(ctxA, W, H, frame, pool.stormDrops, pool.lightning, true);
      } else if (cond === 'snow') {
        drawSnow(ctxA, W, H, frame, pool.snowFlakes);
      } else if (cond === 'haze') {
        drawHaze(ctxA, W, H, frame);
      } else {
        /* 'spring' or any unrecognized → spring scene */
        drawSpring(ctxA, W, H, frame, pool.springClouds, pool.petals);
      }

      /* ── Crossfade: tick canvas B opacity down ── */
      const fade = fadeRef.current;
      if (fade.active) {
        fade.progress = Math.min(1, fade.progress + FADE_SPEED);
        const bOpacity = 1 - fade.progress;
        canvasB.style.opacity = bOpacity.toFixed(3);
        if (fade.progress >= 1) {
          fade.active          = false;
          canvasB.style.opacity = '0';
          canvasB.style.display = 'none';
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []); // deliberately runs once; condition is read via condRef each frame

  const canvasStyle = {
    position: 'fixed',
    inset   : 0,
    width   : '100%',
    height  : '100%',
    display : 'block',
  };

  return (
    <>
      {/* Canvas A: current (live) scene */}
      <canvas
        ref={canvasARef}
        style={{ ...canvasStyle, zIndex: 0 }}
      />
      {/* Canvas B: outgoing scene snapshot, fades out on top */}
      <canvas
        ref={canvasBRef}
        style={{ ...canvasStyle, zIndex: 1, opacity: 0, display: 'none',
                 transition: 'none',   /* JS controls opacity directly */ }}
      />
    </>
  );
}
