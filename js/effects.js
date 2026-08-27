/* ==========================================================================
   effects.js — canvas particle systems.
   Embers, snow, and one atmospheric field per iconic moment (blood, fire,
   wildfire, ice, poison, dust). All driven from the single rAF loop in
   main.js so nothing runs while it is off screen.
   ========================================================================== */

function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.floor(w * dpr) || cv.height !== Math.floor(h * dpr)) {
    cv.width = Math.max(1, Math.floor(w * dpr));
    cv.height = Math.max(1, Math.floor(h * dpr));
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ embers */

function EmberField(cv, opts) {
  opts = opts || {};
  const g = cv.getContext('2d');
  const count = opts.count || 90;
  let W = 0, H = 0, parts = [];

  function spawn(p, seed) {
    p.x = Math.random() * W;
    p.y = seed ? Math.random() * H : H + 12;
    p.r = 0.6 + Math.random() * 1.9;
    p.vy = -(6 + Math.random() * 26);
    p.vx = (Math.random() - 0.5) * 10;
    p.life = 0;
    p.max = 4 + Math.random() * 7;
    p.hue = 18 + Math.random() * 26;
    p.flick = Math.random() * Math.PI * 2;
  }

  function resize() {
    fitCanvas(cv);
    W = cv.clientWidth; H = cv.clientHeight;
    if (parts.length !== count) {
      parts = new Array(count).fill(0).map(() => ({}));
      parts.forEach(p => spawn(p, true));
    }
  }

  function step(dt, intensity) {
    if (!W) resize();
    g.clearRect(0, 0, W, H);
    const k = intensity === undefined ? 1 : intensity;
    if (k <= 0.01) return;
    g.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      p.life += dt;
      p.flick += dt * 6;
      p.x += (p.vx + Math.sin(p.life * 1.4 + p.flick) * 9) * dt;
      p.y += p.vy * dt;
      if (p.life > p.max || p.y < -20) spawn(p, false);
      const fade = Math.sin(Math.min(p.life / p.max, 1) * Math.PI);
      const a = fade * (0.5 + Math.sin(p.flick) * 0.28) * k;
      if (a <= 0) continue;
      const r = p.r * (1 + Math.sin(p.flick) * 0.16);
      const grad = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 72%, ${a})`);
      grad.addColorStop(0.35, `hsla(${p.hue - 6}, 100%, 52%, ${a * 0.5})`);
      grad.addColorStop(1, 'hsla(20, 100%, 40%, 0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(p.x, p.y, r * 5, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  return { step, resize };
}

/* -------------------------------------------------------------------- snow */

function SnowField(cv, opts) {
  opts = opts || {};
  const g = cv.getContext('2d');
  const count = opts.count || 220;
  let W = 0, H = 0, parts = [], wind = 0, t = 0;

  function spawn(p, seed) {
    p.x = Math.random() * (W + 200) - 100;
    p.y = seed ? Math.random() * H : -10;
    p.z = 0.25 + Math.random() * 1.0;          /* depth → size and speed */
    p.r = p.z * 1.7;
    p.vy = 14 + p.z * 42;
    p.sway = Math.random() * Math.PI * 2;
    p.swayR = 8 + Math.random() * 22;
  }

  function resize() {
    fitCanvas(cv);
    W = cv.clientWidth; H = cv.clientHeight;
    if (parts.length !== count) {
      parts = new Array(count).fill(0).map(() => ({}));
      parts.forEach(p => spawn(p, true));
    }
  }

  function step(dt, intensity) {
    if (!W) resize();
    t += dt;
    wind = Math.sin(t * 0.21) * 26 + Math.sin(t * 0.07) * 18;
    g.clearRect(0, 0, W, H);
    const k = intensity === undefined ? 1 : intensity;
    if (k <= 0.01) return;
    for (const p of parts) {
      p.sway += dt * 1.6;
      p.x += (wind * p.z + Math.cos(p.sway) * p.swayR) * dt;
      p.y += p.vy * dt;
      if (p.y > H + 12) spawn(p, false);
      if (p.x < -110) p.x = W + 100; else if (p.x > W + 110) p.x = -100;
      g.globalAlpha = (0.16 + p.z * 0.55) * k;
      g.fillStyle = '#e8f4ff';
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }

  return { step, resize };
}

/* --------------------------------------------------- per-moment atmospheres */

const FX_STYLE = {
  blood:    { hue: 356, sat: 82, light: 34, rise: false, glow: 0.5,  speed: 22, size: 3.4, count: 70 },
  fire:     { hue: 24,  sat: 100, light: 55, rise: true,  glow: 1.0,  speed: 70, size: 3.0, count: 110 },
  wildfire: { hue: 132, sat: 100, light: 52, rise: true,  glow: 1.0,  speed: 62, size: 3.6, count: 110 },
  ice:      { hue: 196, sat: 78, light: 74, rise: false, glow: 0.65, speed: 26, size: 2.2, count: 120 },
  poison:   { hue: 285, sat: 70, light: 55, rise: true,  glow: 0.8,  speed: 30, size: 3.2, count: 80 },
  dust:     { hue: 34,  sat: 18, light: 46, rise: false, glow: 0.2,  speed: 34, size: 5.5, count: 80 }
};

/* Colour grades. Each is a multiply tint plus an additive bloom, so the
   backdrop below reads as the same shot the particles belong to. */
const FX_GRADE = {
  blood:    { tint: 'rgba(255,116,104,1)', tintA: 0.50, bloom: 'rgba(150,10,14,1)',   bloomA: 0.16 },
  fire:     { tint: 'rgba(255,172,110,1)', tintA: 0.36, bloom: 'rgba(255,110,30,1)',  bloomA: 0.14 },
  wildfire: { tint: 'rgba(140,255,190,1)', tintA: 0.44, bloom: 'rgba(20,220,130,1)',  bloomA: 0.15 },
  ice:      { tint: 'rgba(146,198,255,1)', tintA: 0.46, bloom: 'rgba(60,150,210,1)',  bloomA: 0.13 },
  poison:   { tint: 'rgba(206,152,255,1)', tintA: 0.42, bloom: 'rgba(130,60,200,1)',  bloomA: 0.14 },
  dust:     { tint: 'rgba(226,210,182,1)', tintA: 0.34, bloom: 'rgba(150,120,80,1)',  bloomA: 0.10 }
};

/* `spec` is the moment: { fx, scene, sceneSeed, sceneOpts }. The painted
   backdrop can be swapped for a real photograph at any time via setImage(). */
function MomentFX(cv, spec) {
  const type = typeof spec === 'string' ? spec : spec.fx;
  const s = FX_STYLE[type] || FX_STYLE.dust;
  const grade = FX_GRADE[type] || FX_GRADE.dust;
  const g = cv.getContext('2d');
  let W = 0, H = 0, parts = [], t = 0;

  /* Sections that already run their own particle system (snow, dragons) ask
     for the backdrop alone, so the two don't stack up. */
  const quiet = typeof spec === 'object' && spec.noParticles;

  /* The backdrop is painted the first time this section is actually near the
     viewport, not at load: painting all sixteen up front costs ~50MB of
     canvas and a visible stall before the first frame. A photo, if one is
     supplied, replaces it. */
  let backdrop = null, photo = null, painted = false;
  const wantsScene = typeof spec === 'object' && spec.scene && typeof Scenery !== 'undefined';

  function ensurePainted() {
    if (painted || !wantsScene) return;
    painted = true;
    backdrop = Scenery.paint(spec.scene, spec.sceneSeed, spec.sceneOpts, 1200, 675);
  }

  function setImage(url) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { photo = im; };
    im.src = url;
  }

  /* cover-fit the backdrop, with a slow push-in so the frame is never static */
  function drawBackdrop(k) {
    ensurePainted();
    const src = photo || backdrop;
    if (!src) return;
    const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
    const zoom = 1.06 + (1 - k) * 0.10 + Math.sin(t * 0.06) * 0.012;
    const scale = Math.max(W / sw, H / sh) * zoom;
    const dw = sw * scale, dh = sh * scale;
    const dx = (W - dw) / 2 + Math.sin(t * 0.05) * W * 0.012;
    const dy = (H - dh) / 2 + (1 - k) * H * 0.045 + Math.cos(t * 0.04) * H * 0.010;
    g.globalAlpha = Math.min(1, k * 1.25);
    g.drawImage(src, dx, dy, dw, dh);
    g.globalAlpha = 1;

    /* grade it into the moment's palette */
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = grade.tintA * k;
    g.fillStyle = grade.tint; g.fillRect(0, 0, W, H);

    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = grade.bloomA * k;
    g.fillStyle = grade.bloom; g.fillRect(0, 0, W, H);

    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  }

  function spawn(p, seed) {
    p.x = Math.random() * W;
    if (s.rise)      p.y = seed ? Math.random() * H : H + 10;
    else if (type === 'blood') p.y = seed ? Math.random() * H : -10;
    else             p.y = Math.random() * H;
    p.r = s.size * (0.35 + Math.random());
    p.vy = (s.rise ? -1 : 1) * s.speed * (0.4 + Math.random());
    p.vx = (Math.random() - 0.5) * s.speed * 0.5;
    p.life = 0;
    p.max = 3 + Math.random() * 5;
    p.ph = Math.random() * 7;
  }

  function resize() {
    fitCanvas(cv);
    W = cv.clientWidth; H = cv.clientHeight;
    if (parts.length !== s.count) {
      parts = new Array(s.count).fill(0).map(() => ({}));
      parts.forEach(p => spawn(p, true));
    }
  }

  function step(dt, intensity) {
    if (!W) resize();
    const k = Math.max(0, Math.min(1, intensity === undefined ? 1 : intensity));
    g.clearRect(0, 0, W, H);
    if (k <= 0.01) return;
    t += dt;

    drawBackdrop(k);
    if (quiet) return;

    if (s.glow > 0.4) g.globalCompositeOperation = 'lighter';

    for (const p of parts) {
      p.life += dt;
      p.ph += dt * 3;
      p.x += (p.vx + Math.sin(p.life * 1.1 + p.ph) * s.speed * 0.35) * dt;
      p.y += p.vy * dt;
      if (p.life > p.max || p.y < -30 || p.y > H + 30) spawn(p, false);

      const fade = Math.sin(Math.min(p.life / p.max, 1) * Math.PI);
      const a = fade * k * (0.35 + s.glow * 0.5);
      if (a <= 0.002) continue;

      const rad = p.r * (type === 'dust' ? 6 : 4.5);
      const grad = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      grad.addColorStop(0, `hsla(${s.hue}, ${s.sat}%, ${s.light + 18}%, ${a})`);
      grad.addColorStop(0.4, `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${a * 0.45})`);
      grad.addColorStop(1, `hsla(${s.hue}, ${s.sat}%, ${s.light - 20}%, 0)`);
      g.fillStyle = grad;
      g.beginPath(); g.arc(p.x, p.y, rad, 0, 7); g.fill();

      /* ice grows little crystal spurs instead of soft blobs */
      if (type === 'ice' && p.r > s.size * 0.9) {
        g.strokeStyle = `hsla(196, 90%, 88%, ${a * 0.7})`;
        g.lineWidth = 0.8;
        g.beginPath();
        for (let i = 0; i < 3; i++) {
          const ang = p.ph + i * 2.094;
          g.moveTo(p.x, p.y);
          g.lineTo(p.x + Math.cos(ang) * p.r * 3, p.y + Math.sin(ang) * p.r * 3);
        }
        g.stroke();
      }
    }
    g.globalCompositeOperation = 'source-over';

    /* blood also runs down the panel in slow rivulets */
    if (type === 'blood') {
      g.globalAlpha = k * 0.5;
      for (let i = 0; i < 7; i++) {
        const x = ((i * 137.5) % 100) / 100 * W;
        const len = (Math.sin(t * 0.22 + i) * 0.5 + 0.5) * H * 0.85;
        const grad = g.createLinearGradient(x, 0, x, len);
        grad.addColorStop(0, 'rgba(120,10,14,0.55)');
        grad.addColorStop(1, 'rgba(70,4,8,0)');
        g.fillStyle = grad;
        g.fillRect(x - 1.2, 0, 2.4, len);
      }
      g.globalAlpha = 1;
    }
  }

  return { step, resize, setImage };
}

/* ------------------------------------------------------------ dragon flight */
/* A silhouetted dragon crossing the panel, with a breath of fire on hover.   */

function DragonScene(cv) {
  const g = cv.getContext('2d');
  let W = 0, H = 0, t = 0;
  const flames = [];
  const pointer = { x: -999, y: -999, active: false };

  function resize() { fitCanvas(cv); W = cv.clientWidth; H = cv.clientHeight; }

  function wing(cx, cy, sc, flap, dir) {
    /* membrane between four fingers, folding on the flap phase */
    const spread = 0.55 + Math.sin(flap) * 0.42;
    g.beginPath();
    g.moveTo(cx, cy);
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a = (-0.35 - i * 0.42) * spread - 0.15;
      const len = sc * (2.5 - i * 0.32);
      pts.push([cx + Math.cos(a) * len * dir, cy + Math.sin(a) * len]);
    }
    g.moveTo(cx, cy);
    pts.forEach((p, i) => {
      const prev = i ? pts[i - 1] : [cx, cy];
      g.quadraticCurveTo((prev[0] + p[0]) / 2 + dir * sc * 0.2,
                         (prev[1] + p[1]) / 2 + sc * 0.55, p[0], p[1]);
    });
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      g.lineTo(cx + (p[0] - cx) * 0.28, cy + (p[1] - cy) * 0.28);
    }
    g.closePath();
    g.fill();
    /* finger bones */
    g.strokeStyle = 'rgba(255,150,60,0.28)';
    g.lineWidth = 1.1;
    pts.forEach(p => { g.beginPath(); g.moveTo(cx, cy); g.lineTo(p[0], p[1]); g.stroke(); });
  }

  function dragon(x, y, sc, flap, dir) {
    g.save();
    g.translate(x, y);
    g.scale(dir, 1);
    g.fillStyle = '#0b0709';

    /* tail */
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(-sc * 3.4, sc * (0.5 + Math.sin(flap * 0.8) * 0.6), -sc * 5.6,
                        sc * (1.2 + Math.sin(flap * 0.8) * 0.9));
    g.lineTo(-sc * 5.2, sc * (1.5 + Math.sin(flap * 0.8) * 0.9));
    g.quadraticCurveTo(-sc * 3.2, sc * (0.95 + Math.sin(flap * 0.8) * 0.6), 0, sc * 0.42);
    g.closePath(); g.fill();

    /* body */
    g.beginPath();
    g.ellipse(0, sc * 0.2, sc * 1.5, sc * 0.52, 0.06, 0, 7);
    g.fill();

    /* neck + head */
    g.beginPath();
    g.moveTo(sc * 1.1, sc * 0.05);
    g.quadraticCurveTo(sc * 2.5, -sc * 0.75, sc * 3.5, -sc * 0.55);
    g.lineTo(sc * 4.3, -sc * 0.34);
    g.lineTo(sc * 3.45, -sc * 0.1);
    g.quadraticCurveTo(sc * 2.5, -sc * 0.2, sc * 1.15, sc * 0.5);
    g.closePath(); g.fill();

    /* horns */
    g.beginPath();
    g.moveTo(sc * 3.4, -sc * 0.55);
    g.lineTo(sc * 3.0, -sc * 1.25);
    g.lineTo(sc * 3.5, -sc * 0.62);
    g.closePath(); g.fill();

    /* eye */
    g.fillStyle = 'rgba(255,140,40,0.95)';
    g.beginPath(); g.arc(sc * 3.55, -sc * 0.42, sc * 0.07, 0, 7); g.fill();

    /* wings */
    g.fillStyle = 'rgba(12,8,10,0.94)';
    wing(sc * 0.2, -sc * 0.15, sc, flap, 1);
    g.fillStyle = 'rgba(20,13,16,0.8)';
    wing(sc * 0.1, sc * 0.05, sc * 0.82, flap + 0.4, -1);

    g.restore();
    return { mx: x + dir * sc * 4.3, my: y - sc * 0.34 };
  }

  function breathe(mx, my, tx, ty, power) {
    const ang = Math.atan2(ty - my, tx - mx);
    for (let i = 0; i < power; i++) {
      flames.push({
        x: mx, y: my,
        vx: Math.cos(ang) * (180 + Math.random() * 260) + (Math.random() - 0.5) * 60,
        vy: Math.sin(ang) * (180 + Math.random() * 260) + (Math.random() - 0.5) * 60,
        life: 0, max: 0.5 + Math.random() * 0.7,
        r: 3 + Math.random() * 7
      });
    }
  }

  function step(dt, intensity) {
    if (!W) resize();
    const k = intensity === undefined ? 1 : intensity;
    g.clearRect(0, 0, W, H);
    if (k <= 0.01) return;
    t += dt;

    /* three dragons on different loops and depths */
    const specs = [
      { sc: H * 0.055, per: 26, yA: 0.30, yB: 0.05, flap: 2.1, dir: 1, lead: true },
      { sc: H * 0.034, per: 34, yA: 0.55, yB: 0.07, flap: 2.6, dir: 1, off: 0.42 },
      { sc: H * 0.026, per: 42, yA: 0.20, yB: 0.05, flap: 3.0, dir: -1, off: 0.75 }
    ];

    let lead = null;
    specs.forEach(sp => {
      const u = ((t / sp.per) + (sp.off || 0)) % 1;
      const x = sp.dir > 0 ? -W * 0.25 + u * W * 1.5 : W * 1.25 - u * W * 1.5;
      const y = H * sp.yA + Math.sin(t * 0.5 + (sp.off || 0) * 9) * H * sp.yB;
      const m = dragon(x, y, sp.sc, t * sp.flap, sp.dir);
      if (sp.lead) lead = m;
    });

    if (pointer.active && lead && Math.random() < 0.55) {
      breathe(lead.mx, lead.my, pointer.x, pointer.y, 3);
    }

    g.globalCompositeOperation = 'lighter';
    for (let i = flames.length - 1; i >= 0; i--) {
      const f = flames[i];
      f.life += dt;
      if (f.life > f.max) { flames.splice(i, 1); continue; }
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vx *= 0.96; f.vy = f.vy * 0.96 - 40 * dt;
      const p = f.life / f.max;
      const a = (1 - p) * 0.75;
      const rad = f.r * (1 + p * 4.5);
      const hue = 44 - p * 34;
      const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
      grad.addColorStop(0, `hsla(${hue + 14}, 100%, ${78 - p * 26}%, ${a})`);
      grad.addColorStop(0.4, `hsla(${hue}, 100%, 52%, ${a * 0.5})`);
      grad.addColorStop(1, 'hsla(14, 100%, 40%, 0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(f.x, f.y, rad, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.active = true;
  });
  cv.addEventListener('pointerleave', () => { pointer.active = false; });

  return { step, resize, pointer };
}

/* ---------------------------------------------------- global ember cursor  */

function CursorTrail(cv) {
  const g = cv.getContext('2d');
  let W = 0, H = 0;
  const sparks = [];
  let last = { x: 0, y: 0 }, has = false;

  function resize() { fitCanvas(cv); W = cv.clientWidth; H = cv.clientHeight; }

  window.addEventListener('pointermove', e => {
    if (!has) { last.x = e.clientX; last.y = e.clientY; has = true; return; }
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) return;
    const n = Math.min(3, Math.floor(d / 14) + 1);
    for (let i = 0; i < n; i++) {
      sparks.push({
        x: e.clientX + (Math.random() - 0.5) * 8,
        y: e.clientY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 26 - dx * 0.6,
        vy: (Math.random() - 0.5) * 26 - dy * 0.6 - 18,
        life: 0, max: 0.5 + Math.random() * 0.8, r: 0.7 + Math.random() * 1.5
      });
    }
    if (sparks.length > 220) sparks.splice(0, sparks.length - 220);
    last.x = e.clientX; last.y = e.clientY;
  }, { passive: true });

  function step(dt) {
    if (!W) resize();
    g.clearRect(0, 0, W, H);
    if (!sparks.length) return;
    g.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;
      if (s.life > s.max) { sparks.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt;
      s.vy -= 26 * dt; s.vx *= 0.97;
      const p = s.life / s.max, a = (1 - p) * 0.85;
      const rad = s.r * 5;
      const grad = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad);
      grad.addColorStop(0, `hsla(38, 100%, 76%, ${a})`);
      grad.addColorStop(0.4, `hsla(24, 100%, 54%, ${a * 0.45})`);
      grad.addColorStop(1, 'hsla(18, 100%, 40%, 0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(s.x, s.y, rad, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  return { step, resize };
}
