/* ==========================================================================
   scenery.js — procedural matte paintings.

   Each moment gets an actual *place* behind it rather than an abstract
   particle field: a burning skyline, the Wall, a godswood, a hall of
   columns. Painted once into an offscreen canvas at load, then composited
   each frame with a slow drift and a colour grade, so the cost per frame is
   one drawImage plus two fills.

   If a real photograph is supplied for a moment (see assets/img/), it
   replaces the painting and gets the identical grade and drift treatment.
   ========================================================================== */

/* deterministic RNG so a given scene always paints the same way */
function seeded(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* midpoint-displacement ridge, returns n heights in 0..1 */
function ridge(rnd, n, rough) {
  let pts = [rnd(), rnd()];
  let r = rough;
  while (pts.length < n) {
    const next = [];
    for (let i = 0; i < pts.length - 1; i++) {
      next.push(pts[i], (pts[i] + pts[i + 1]) / 2 + (rnd() - 0.5) * r);
    }
    next.push(pts[pts.length - 1]);
    pts = next; r *= 0.55;
  }
  return pts.map(v => Math.max(0, Math.min(1, v)));
}

const Scenery = (() => {

  function sky(g, W, H, stops) {
    const grad = g.createLinearGradient(0, 0, 0, H);
    stops.forEach(([o, c]) => grad.addColorStop(o, c));
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
  }

  function glow(g, x, y, r, inner, outer, alpha) {
    g.save();
    g.globalAlpha = alpha === undefined ? 1 : alpha;
    g.globalCompositeOperation = 'lighter';
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.45, outer);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.restore();
  }

  /* a filled silhouette from a normalised height array */
  function ridgeFill(g, pts, W, H, topY, amp, fill) {
    g.beginPath();
    g.moveTo(0, H);
    for (let i = 0; i < pts.length; i++) {
      g.lineTo(i / (pts.length - 1) * W, topY + (1 - pts[i]) * amp);
    }
    g.lineTo(W, H); g.closePath();
    g.fillStyle = fill; g.fill();
  }

  function stars(g, W, H, rnd, n, maxY) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * (maxY || H * 0.6);
      const a = rnd() * 0.7 + 0.1;
      g.fillStyle = `rgba(210,228,255,${a})`;
      g.fillRect(x, y, rnd() > 0.9 ? 2 : 1, rnd() > 0.9 ? 2 : 1);
    }
  }

  function smoke(g, x, baseY, w, h, rnd, tint) {
    g.save();
    g.globalAlpha = 0.30;
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const cx = x + (rnd() - 0.5) * w * 1.4 * t;
      const cy = baseY - t * h;
      const r = w * (0.35 + t * 1.5);
      const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, tint || 'rgba(50,44,40,0.75)');
      grad.addColorStop(1, 'rgba(20,18,18,0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    }
    g.restore();
  }

  /* ------------------------------------------------------- the paintings -- */

  /* Night, a great fire, a crowd around it. Dragon birth, the loot train. */
  function pyre(g, W, H, rnd) {
    sky(g, W, H, [[0, '#08060a'], [0.45, '#1a0c07'], [0.78, '#4a1a06'], [1, '#120705']]);
    stars(g, W, H, rnd, 90, H * 0.42);

    const hy = H * 0.72;
    const far = ridge(rnd, 129, 0.35);
    ridgeFill(g, far, W, H, hy - H * 0.09, H * 0.10, '#150e0c');
    const near = ridge(rnd, 129, 0.5);
    ridgeFill(g, near, W, H, hy, H * 0.07, '#0c0808');

    /* the fire itself */
    const fx = W * 0.5, fy = H * 0.80;
    glow(g, fx, fy, W * 0.42, 'rgba(255,190,90,0.55)', 'rgba(220,90,20,0.22)', 1);

    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      const t = rnd();
      const w = W * (0.11 - t * 0.085) * (0.5 + rnd());
      const hgt = H * (0.10 + t * 0.30) * (0.55 + rnd() * 0.7);
      const x = fx + (rnd() - 0.5) * W * 0.20 * (1 - t * 0.5);
      const hue = 18 + rnd() * 30 + t * 14;
      const a = 0.16 + rnd() * 0.28;
      g.fillStyle = `hsla(${hue},100%,${48 + t * 26}%,${a})`;
      g.beginPath();
      g.moveTo(x - w, fy);
      g.quadraticCurveTo(x - w * 0.5, fy - hgt * 0.6, x + (rnd() - 0.5) * w, fy - hgt);
      g.quadraticCurveTo(x + w * 0.6, fy - hgt * 0.55, x + w, fy);
      g.closePath(); g.fill();
    }
    g.restore();

    /* pyre logs */
    g.fillStyle = '#0a0605';
    for (let i = 0; i < 14; i++) {
      const a = (rnd() - 0.5) * 0.8;
      g.save();
      g.translate(fx + (rnd() - 0.5) * W * 0.16, fy + rnd() * H * 0.03);
      g.rotate(a);
      g.fillRect(-W * 0.06, -4, W * 0.12, 9);
      g.restore();
    }

    smoke(g, fx, fy - H * 0.28, W * 0.09, H * 0.55, rnd, 'rgba(60,40,30,0.6)');

    /* onlookers */
    g.fillStyle = '#050405';
    for (let i = 0; i < 26; i++) {
      const x = rnd() * W;
      const d = 0.5 + rnd() * 0.5;
      const bh = H * 0.13 * d;
      const y = H * (0.90 + rnd() * 0.08);
      g.beginPath();
      g.ellipse(x, y - bh, bh * 0.17, bh * 0.17, 0, 0, 7);
      g.fill();
      g.fillRect(x - bh * 0.16, y - bh * 0.84, bh * 0.32, bh * 0.84);
    }
  }

  /* A city on fire. `hue` swings it from ember orange to wildfire green. */
  function skyline(g, W, H, rnd, opts) {
    opts = opts || {};
    const green = opts.green;
    const top = green ? '#02100a' : '#0a0507';
    const mid = green ? '#062418' : '#2a0d06';
    const low = green ? '#0d5c34' : '#7d2807';
    sky(g, W, H, [[0, top], [0.42, mid], [0.80, low], [1, green ? '#04160d' : '#180804']]);

    const hy = H * 0.66;
    glow(g, W * 0.5, hy + H * 0.08, W * 0.62,
      green ? 'rgba(90,255,170,0.40)' : 'rgba(255,150,60,0.42)',
      green ? 'rgba(20,180,110,0.16)' : 'rgba(200,70,20,0.18)', 1);

    /* far hills */
    ridgeFill(g, ridge(rnd, 129, 0.3), W, H, hy - H * 0.05, H * 0.07,
      green ? '#04180f' : '#1c0d08');

    /* the city — a band of blocks with towers, a keep, and a domed sept */
    function city(baseY, scale, fill, count) {
      g.fillStyle = fill;
      let x = -W * 0.05;
      while (x < W * 1.05) {
        const w = W * (0.018 + rnd() * 0.045) * scale;
        const h = H * (0.05 + Math.pow(rnd(), 1.7) * 0.20) * scale;
        g.fillRect(x, baseY - h, w, h + H);
        /* the odd spire */
        if (rnd() > 0.82) {
          const sw = w * 0.32;
          g.beginPath();
          g.moveTo(x + w / 2 - sw, baseY - h);
          g.lineTo(x + w / 2, baseY - h - H * 0.09 * scale);
          g.lineTo(x + w / 2 + sw, baseY - h);
          g.closePath(); g.fill();
        }
        x += w + W * 0.004 * scale;
      }
      void count;
    }
    city(hy + H * 0.06, 0.85, green ? '#062315' : '#1f0f09');
    city(hy + H * 0.15, 1.15, green ? '#031a0f' : '#140905');

    /* the Red Keep: a mass of round towers on the right */
    const kx = W * 0.78, ky = hy + H * 0.10;
    g.fillStyle = green ? '#021409' : '#0f0704';
    g.fillRect(kx - W * 0.11, ky - H * 0.20, W * 0.22, H * 0.40);
    [-0.09, -0.03, 0.03, 0.09].forEach((o, i) => {
      const tw = W * 0.032, th = H * (0.26 + (i % 2) * 0.09);
      g.fillRect(kx + W * o - tw / 2, ky - th, tw, th + H * 0.2);
      g.beginPath();
      g.moveTo(kx + W * o - tw * 0.62, ky - th);
      g.lineTo(kx + W * o, ky - th - H * 0.055);
      g.lineTo(kx + W * o + tw * 0.62, ky - th);
      g.closePath(); g.fill();
    });

    /* the Great Sept: a dome on a hill, left of centre */
    const sx = W * 0.26, sy = hy + H * 0.04;
    g.fillStyle = green ? '#04200f' : '#160b06';
    g.beginPath(); g.arc(sx, sy - H * 0.14, W * 0.055, Math.PI, 0); g.fill();
    g.fillRect(sx - W * 0.055, sy - H * 0.14, W * 0.11, H * 0.30);
    for (let i = -2; i <= 2; i++) {
      g.fillRect(sx + i * W * 0.028 - W * 0.006, sy - H * 0.22, W * 0.012, H * 0.09);
    }

    /* fires burning through the streets */
    for (let i = 0; i < 16; i++) {
      const x = rnd() * W, y = hy + H * (0.05 + rnd() * 0.22);
      glow(g, x, y, W * (0.03 + rnd() * 0.06),
        green ? 'rgba(120,255,180,0.5)' : 'rgba(255,170,70,0.5)',
        green ? 'rgba(30,200,120,0.2)' : 'rgba(200,80,20,0.2)', 0.8);
    }
    for (let i = 0; i < 6; i++) {
      smoke(g, rnd() * W, hy, W * 0.05, H * 0.62, rnd,
        green ? 'rgba(30,70,50,0.5)' : 'rgba(60,44,36,0.55)');
    }

    /* near rooftops */
    g.fillStyle = '#050404';
    let x = -W * 0.02;
    while (x < W * 1.02) {
      const w = W * (0.05 + rnd() * 0.08);
      const h = H * (0.06 + rnd() * 0.10);
      g.fillRect(x, H - h, w, h);
      x += w + W * 0.006;
    }
  }

  /* A hall of columns and window light. Feasts, trials, the throne room. */
  function hall(g, W, H, rnd, opts) {
    opts = opts || {};
    sky(g, W, H, [[0, '#07070a'], [0.5, '#0d0c10'], [1, '#050506']]);

    const warm = opts.warm !== false;
    const lightCol = warm ? 'rgba(255,190,110,' : 'rgba(150,200,255,';

    /* tall lancet windows on the back wall — narrow, so they read as stone
       pierced by light rather than as a lit backdrop */
    const n = 5;
    for (let i = 0; i < n; i++) {
      const cx = W * (0.5 + (i - (n - 1) / 2) * 0.085);
      const w = W * 0.022, top = H * 0.10, bot = H * 0.60;
      const wg = g.createLinearGradient(cx, top, cx, bot);
      wg.addColorStop(0, lightCol + '0.34)');
      wg.addColorStop(1, lightCol + '0.10)');
      g.fillStyle = wg;
      g.beginPath();
      g.moveTo(cx - w, bot); g.lineTo(cx - w, top + w * 1.6);
      g.quadraticCurveTo(cx, top - w * 0.8, cx + w, top + w * 1.6);
      g.lineTo(cx + w, bot); g.closePath(); g.fill();
      /* the shaft it throws across the floor */
      g.save();
      g.globalCompositeOperation = 'lighter';
      const grad = g.createLinearGradient(cx, top, cx, H);
      grad.addColorStop(0, lightCol + '0.09)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(cx - w, top); g.lineTo(cx + w, top);
      g.lineTo(cx + w * 2.6, H); g.lineTo(cx - w * 2.6, H);
      g.closePath(); g.fill();
      g.restore();
    }

    /* a raised dais at the far end */
    g.fillStyle = '#0a0a0d';
    for (let i = 0; i < 3; i++) {
      g.fillRect(W * (0.30 - i * 0.04), H * (0.60 + i * 0.032),
                 W * (0.40 + i * 0.08), H * 0.034);
    }

    /* columns receding on both sides, each with a base and a capital */
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const x = W * 0.5 + side * W * (0.17 + t * 0.35);
        const w = W * (0.030 + t * 0.048);
        const top = H * (0.09 - t * 0.085);
        const v = 20 + t * 14;
        g.fillStyle = `rgb(${v},${v},${v + 3})`;
        g.fillRect(x - w / 2, top, w, H);
        g.fillStyle = `rgb(${v + 8},${v + 8},${v + 11})`;
        g.fillRect(x - w * 0.80, top, w * 1.60, H * 0.032);          /* capital */
        g.fillRect(x - w * 0.72, top + H * 0.032, w * 1.44, H * 0.014);
        g.fillRect(x - w * 0.86, H * (0.88 - t * 0.11), w * 1.72, H * 0.028); /* base */
        /* fluting */
        g.fillStyle = 'rgba(0,0,0,0.35)';
        for (let f = -1; f <= 1; f++) g.fillRect(x + f * w * 0.26, top + H * 0.05, w * 0.06, H);
      }
    }

    /* banners between the columns */
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 3; i++) {
        const x = W * 0.5 + side * W * (0.24 + i * 0.14);
        const w = W * 0.05, top = H * 0.10, len = H * 0.44;
        g.fillStyle = opts.banner || 'rgba(60,12,14,0.55)';
        g.beginPath();
        g.moveTo(x - w, top); g.lineTo(x + w, top);
        g.lineTo(x + w, top + len); g.lineTo(x, top + len + H * 0.05);
        g.lineTo(x - w, top + len); g.closePath(); g.fill();
      }
    }

    /* braziers: an iron bowl on a stand with fire sitting in it */
    [0.20, 0.80].forEach(p => {
      const x = W * p, y = H * 0.76;
      glow(g, x, y - H * 0.02, W * 0.15, 'rgba(255,175,80,0.55)', 'rgba(190,70,20,0.18)', 1);
      g.fillStyle = '#0a0908';
      g.fillRect(x - W * 0.006, y, W * 0.012, H * 0.20);              /* stem  */
      g.fillRect(x - W * 0.026, y + H * 0.195, W * 0.052, H * 0.012); /* foot  */
      g.beginPath();                                                   /* bowl  */
      g.moveTo(x - W * 0.030, y - H * 0.012);
      g.lineTo(x + W * 0.030, y - H * 0.012);
      g.lineTo(x + W * 0.018, y + H * 0.020);
      g.lineTo(x - W * 0.018, y + H * 0.020);
      g.closePath(); g.fill();
      g.save();
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const fw = W * 0.008 * (0.6 + rnd());
        const fh = H * (0.03 + rnd() * 0.055);
        const fx = x + (rnd() - 0.5) * W * 0.036;
        g.fillStyle = `hsla(${26 + rnd() * 24},100%,${56 + rnd() * 20}%,0.42)`;
        g.beginPath();
        g.moveTo(fx - fw, y - H * 0.010);
        g.quadraticCurveTo(fx, y - H * 0.010 - fh * 0.7, fx, y - H * 0.010 - fh);
        g.quadraticCurveTo(fx, y - H * 0.010 - fh * 0.7, fx + fw, y - H * 0.010);
        g.closePath(); g.fill();
      }
      g.restore();
    });

    /* floor with a faint wet reflection */
    const fg = g.createLinearGradient(0, H * 0.72, 0, H);
    fg.addColorStop(0, 'rgba(255,255,255,0.045)');
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fg; g.fillRect(0, H * 0.72, W, H * 0.28);
    void rnd;
  }

  /* A crowd below a great stone facade. Executions, trials, the pit. */
  function crowd(g, W, H, rnd) {
    sky(g, W, H, [[0, '#0b0c10'], [0.55, '#171519'], [1, '#0a0809']]);

    /* the building */
    const by = H * 0.60;
    g.fillStyle = '#131217';
    g.fillRect(W * 0.10, H * 0.04, W * 0.80, by);
    g.fillStyle = '#0e0d11';
    for (let i = 0; i < 7; i++) {
      const x = W * (0.16 + i * 0.115);
      g.fillRect(x, H * 0.10, W * 0.038, by - H * 0.06);
    }
    /* pediment */
    g.fillStyle = '#16151a';
    g.beginPath();
    g.moveTo(W * 0.08, H * 0.10); g.lineTo(W * 0.5, H * -0.04);
    g.lineTo(W * 0.92, H * 0.10); g.closePath(); g.fill();

    /* steps */
    g.fillStyle = '#0c0b0e';
    for (let i = 0; i < 6; i++) {
      g.fillRect(W * (0.06 - i * 0.012), by + i * H * 0.028,
                 W * (0.88 + i * 0.024), H * 0.030);
    }

    glow(g, W * 0.5, by - H * 0.06, W * 0.3, 'rgba(255,200,140,0.14)', 'rgba(120,80,40,0.05)', 1);

    /* the crowd — four ranks, nearer ones bigger and darker */
    for (let rank = 0; rank < 4; rank++) {
      const d = 0.42 + rank * 0.24;
      const y = H * (0.78 + rank * 0.075);
      const shade = 12 - rank * 3;
      g.fillStyle = `rgb(${shade},${shade},${shade + 2})`;
      const step = W * (0.030 - rank * 0.003);
      for (let x = -step; x < W + step; x += step * (0.7 + rnd() * 0.6)) {
        const hh = H * 0.055 * d;
        g.beginPath(); g.arc(x, y, hh * 0.42, 0, 7); g.fill();
        g.beginPath();
        g.moveTo(x - hh * 0.72, y + hh * 2.4);
        g.quadraticCurveTo(x - hh * 0.70, y + hh * 0.34, x, y + hh * 0.34);
        g.quadraticCurveTo(x + hh * 0.70, y + hh * 0.34, x + hh * 0.72, y + hh * 2.4);
        g.closePath(); g.fill();
        /* the odd spear */
        if (rnd() > 0.88) {
          g.fillRect(x + hh * 0.5, y - H * 0.16, 2.5, H * 0.20);
        }
      }
    }
  }

  /* The Wall: seven hundred feet of ice, and the dark in front of it. */
  function wall(g, W, H, rnd) {
    sky(g, W, H, [[0, '#03060c'], [0.42, '#071320'], [0.75, '#0b2333'], [1, '#050d14']]);
    stars(g, W, H, rnd, 130, H * 0.5);

    /* aurora */
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const y = H * (0.10 + i * 0.055);
      const grad = g.createLinearGradient(0, y - H * 0.09, 0, y + H * 0.09);
      grad.addColorStop(0, 'rgba(60,200,190,0)');
      grad.addColorStop(0.5, `rgba(80,220,200,${0.05 + rnd() * 0.05})`);
      grad.addColorStop(1, 'rgba(60,200,190,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= W; x += W / 16) {
        g.lineTo(x, y + Math.sin(x / W * 7 + i) * H * 0.035);
      }
      g.lineTo(W, y + H * 0.10); g.lineTo(0, y + H * 0.10);
      g.closePath(); g.fill();
    }
    g.restore();

    /* distant peaks */
    ridgeFill(g, ridge(rnd, 129, 0.6), W, H, H * 0.40, H * 0.22, '#0a1622');

    /* the Wall — a cliff of ice. Its lip sits low enough to leave sky above,
       and it is night, so the ice stays dark except where the moon catches it. */
    const wallTopPts = ridge(rnd, 65, 0.10);
    const topY = H * 0.30, amp = H * 0.06;
    const grad = g.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, '#7ea8c0');
    grad.addColorStop(0.08, '#4f7d97');
    grad.addColorStop(0.40, '#254c62');
    grad.addColorStop(0.75, '#12303f');
    grad.addColorStop(1, '#08171f');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, H);
    for (let i = 0; i < wallTopPts.length; i++) {
      g.lineTo(i / (wallTopPts.length - 1) * W, topY + (1 - wallTopPts[i]) * amp);
    }
    g.lineTo(W, H); g.closePath(); g.fill();

    /* vertical striations, hewn block seams, and fracture lines */
    g.save();
    g.globalAlpha = 0.26;
    for (let i = 0; i < 110; i++) {
      const x = rnd() * W;
      const w = 1 + rnd() * 9;
      const lg = g.createLinearGradient(x, topY, x, H);
      lg.addColorStop(0, rnd() > 0.5 ? 'rgba(200,232,246,0.55)' : 'rgba(6,20,30,0.6)');
      lg.addColorStop(1, 'rgba(6,18,26,0)');
      g.fillStyle = lg;
      g.fillRect(x, topY, w, H);
    }
    /* courses of cut ice, fainter as they recede down into shadow */
    g.globalAlpha = 1;
    for (let row = 0; row < 9; row++) {
      const y = topY + H * 0.055 + row * H * 0.075;
      const a = 0.16 * (1 - row / 11);
      g.strokeStyle = `rgba(190,224,240,${a})`;
      g.lineWidth = 1.4;
      g.beginPath();
      for (let x = 0; x <= W; x += W / 24) g.lineTo(x, y + Math.sin(x / W * 9 + row) * 3);
      g.stroke();
      /* staggered vertical joints */
      g.strokeStyle = `rgba(8,22,32,${a * 1.4})`;
      for (let j = 0; j < 13; j++) {
        const x = ((j + (row % 2) * 0.5) / 13) * W;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + H * 0.075); g.stroke();
      }
    }
    /* a few long cracks */
    g.strokeStyle = 'rgba(210,236,250,0.10)';
    g.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) {
      let x = rnd() * W, y = topY + rnd() * H * 0.1;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 9; k++) {
        x += (rnd() - 0.5) * W * 0.05; y += H * 0.07;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.restore();

    /* the lip catches the moon */
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(220,245,255,0.55)';
    g.lineWidth = 3;
    g.beginPath();
    for (let i = 0; i < wallTopPts.length; i++) {
      const x = i / (wallTopPts.length - 1) * W;
      const y = topY + (1 - wallTopPts[i]) * amp;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    g.restore();

    /* the gate, and torches along the base */
    g.fillStyle = 'rgba(4,10,14,0.9)';
    g.beginPath();
    g.moveTo(W * 0.44, H); g.lineTo(W * 0.44, H * 0.86);
    g.quadraticCurveTo(W * 0.50, H * 0.79, W * 0.56, H * 0.86);
    g.lineTo(W * 0.56, H); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) {
      const x = W * (0.06 + i * 0.11);
      glow(g, x, H * 0.93, W * 0.035, 'rgba(255,180,90,0.55)', 'rgba(200,90,20,0.15)', 0.9);
    }

    /* snow drifts, and a line of riders at the base — the Wall means nothing
       without something human-sized in front of it */
    ridgeFill(g, ridge(rnd, 65, 0.4), W, H, H * 0.945, H * 0.035, 'rgba(190,220,238,0.13)');
    g.fillStyle = '#04090d';
    for (let i = 0; i < 22; i++) {
      const x = rnd() * W;
      const s = H * 0.020 * (0.75 + rnd() * 0.5);
      const y = H * (0.965 + rnd() * 0.02);
      g.beginPath(); g.arc(x, y - s * 2.5, s * 0.42, 0, 7); g.fill();
      g.beginPath();
      g.moveTo(x - s * 0.5, y); g.lineTo(x - s * 0.42, y - s * 2.2);
      g.lineTo(x + s * 0.42, y - s * 2.2); g.lineTo(x + s * 0.5, y);
      g.closePath(); g.fill();
      if (rnd() > 0.6) g.fillRect(x + s * 0.5, y - s * 4.2, 1.8, s * 4.2);
    }
  }

  /* The godswood: a weirwood, red leaves, snow, and a face in the trunk. */
  function godswood(g, W, H, rnd) {
    sky(g, W, H, [[0, '#0a0f14'], [0.45, '#141a20'], [1, '#0c1116']]);

    /* the tree line behind — trunks that taper and fork, not sticks */
    g.lineCap = 'round';
    for (let i = 0; i < 34; i++) {
      const x = rnd() * W, h = H * (0.26 + rnd() * 0.34);
      const shade = 10 + Math.floor(rnd() * 8);
      g.strokeStyle = `rgb(${shade},${shade + 3},${shade + 6})`;
      for (let seg = 0; seg < 5; seg++) {
        const t0 = seg / 5, t1 = (seg + 1) / 5;
        g.lineWidth = (3 + rnd() * 8) * (1 - t0 * 0.8);
        g.beginPath();
        g.moveTo(x + (rnd() - 0.5) * 14 * t0, H * 0.82 - h * t0);
        g.lineTo(x + (rnd() - 0.5) * 14 * t1, H * 0.82 - h * t1);
        g.stroke();
      }
    }
    g.fillStyle = 'rgba(8,12,16,0.85)';
    g.fillRect(0, H * 0.80, W, H * 0.20);

    /* the weirwood: a heavy pale trunk that tapers, then recursive branching */
    const bx = W * 0.5, by = H * 0.88;
    const trunkTop = H * 0.60, trunkW = W * 0.042;
    g.fillStyle = '#e9e4da';
    g.beginPath();
    g.moveTo(bx - trunkW * 1.35, by);
    g.quadraticCurveTo(bx - trunkW * 0.92, by - (by - trunkTop) * 0.55,
                       bx - trunkW * 0.52, trunkTop);
    g.lineTo(bx + trunkW * 0.52, trunkTop);
    g.quadraticCurveTo(bx + trunkW * 0.92, by - (by - trunkTop) * 0.55,
                       bx + trunkW * 1.35, by);
    g.closePath(); g.fill();
    /* bark grain */
    g.strokeStyle = 'rgba(150,142,130,0.35)';
    g.lineWidth = 1.2;
    for (let i = 0; i < 14; i++) {
      const o = (rnd() - 0.5) * trunkW * 2;
      g.beginPath();
      g.moveTo(bx + o * 1.25, by);
      g.quadraticCurveTo(bx + o, (by + trunkTop) / 2, bx + o * 0.5, trunkTop);
      g.stroke();
    }

    g.strokeStyle = '#e7e2d8';
    (function branch(x, y, ang, len, w, d) {
      if (d > 6 || len < 5) return;
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      g.lineWidth = w;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      const n = d < 2 ? 2 : (rnd() > 0.35 ? 2 : 3);
      for (let i = 0; i < n; i++) {
        branch(x2, y2, ang + (i - (n - 1) / 2) * (0.44 + rnd() * 0.34) + (rnd() - 0.5) * 0.2,
               len * (0.66 + rnd() * 0.16), w * 0.64, d + 1);
      }
    })(bx, trunkTop + H * 0.01, -Math.PI / 2, H * 0.115, trunkW * 0.95, 0);

    /* the canopy of red leaves */
    g.save();
    for (let i = 0; i < 340; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.pow(rnd(), 0.55) * W * 0.20;
      const x = bx + Math.cos(a) * r * 1.25;
      const y = H * 0.34 + Math.sin(a) * r * 0.72;
      g.globalAlpha = 0.20 + rnd() * 0.5;
      g.fillStyle = `hsl(${348 + rnd() * 14}, ${58 + rnd() * 30}%, ${20 + rnd() * 24}%)`;
      g.beginPath(); g.ellipse(x, y, 5 + rnd() * 13, 3 + rnd() * 8, a, 0, 7); g.fill();
    }
    g.restore();

    /* the carved face, set low on the trunk where it is actually cut */
    const fy = H * 0.715;
    g.fillStyle = 'rgba(78,8,10,0.9)';
    /* grieving, downturned eyes */
    [-1, 1].forEach(sd => {
      g.beginPath();
      g.moveTo(bx + sd * W * 0.010, fy - H * 0.012);
      g.quadraticCurveTo(bx + sd * W * 0.030, fy - H * 0.022,
                         bx + sd * W * 0.040, fy + H * 0.004);
      g.quadraticCurveTo(bx + sd * W * 0.030, fy + H * 0.014,
                         bx + sd * W * 0.010, fy + H * 0.004);
      g.closePath(); g.fill();
    });
    /* a long open mouth */
    g.beginPath();
    g.moveTo(bx - W * 0.030, fy + H * 0.055);
    g.quadraticCurveTo(bx, fy + H * 0.125, bx + W * 0.030, fy + H * 0.055);
    g.quadraticCurveTo(bx, fy + H * 0.082, bx - W * 0.030, fy + H * 0.055);
    g.fill();
    /* sap running from the eyes and the mouth */
    g.fillStyle = 'rgba(122,12,14,0.5)';
    g.fillRect(bx - W * 0.026, fy + H * 0.004, 3.5, H * 0.115);
    g.fillRect(bx + W * 0.023, fy + H * 0.004, 3.5, H * 0.088);
    g.fillRect(bx - W * 0.003, fy + H * 0.100, 3, H * 0.062);

    /* snow on the ground */
    ridgeFill(g, ridge(rnd, 65, 0.35), W, H, H * 0.88, H * 0.05, 'rgba(226,240,250,0.16)');
  }

  /* Open ground, ranked spears, banners, mud and haze. */
  function battlefield(g, W, H, rnd, opts) {
    opts = opts || {};
    const fiery = opts.fire;
    sky(g, W, H, fiery
      ? [[0, '#0d0605'], [0.5, '#2c0f06'], [0.85, '#94360a'], [1, '#2a0f06']]
      : [[0, '#0e1013'], [0.5, '#1b1e22'], [0.85, '#2b2c2c'], [1, '#141414']]);

    const hy = H * 0.62;
    if (fiery) glow(g, W * 0.5, hy + H * 0.10, W * 0.7,
      'rgba(255,150,50,0.42)', 'rgba(180,60,15,0.16)', 1);

    ridgeFill(g, ridge(rnd, 129, 0.4), W, H, hy - H * 0.06, H * 0.10,
      fiery ? '#20100a' : '#191c20');
    ridgeFill(g, ridge(rnd, 129, 0.5), W, H, hy + H * 0.02, H * 0.07,
      fiery ? '#150a06' : '#111316');

    /* ranks of spears */
    for (let rank = 0; rank < 3; rank++) {
      const d = 0.45 + rank * 0.28;
      const y = hy + H * (0.06 + rank * 0.09);
      g.strokeStyle = `rgba(${8 + rank * 3},${8 + rank * 3},${9 + rank * 3},1)`;
      g.lineWidth = 1.2 + rank * 1.1;
      const step = W * (0.011 + rank * 0.004);
      for (let x = 0; x < W; x += step) {
        const h = H * (0.10 + rnd() * 0.05) * d;
        const lean = (rnd() - 0.5) * 12 * d;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + lean, y - h); g.stroke();
      }
      /* heads below the spears */
      g.fillStyle = `rgb(${6 + rank * 3},${6 + rank * 3},${7 + rank * 3})`;
      for (let x = 0; x < W; x += step * 1.6) {
        g.beginPath(); g.arc(x, y + H * 0.012 * d, H * 0.010 * d, 0, 7); g.fill();
      }
    }

    /* banners */
    for (let i = 0; i < 7; i++) {
      const x = W * (0.06 + rnd() * 0.88);
      const y = hy + H * 0.04, len = H * 0.16;
      g.strokeStyle = '#0a0a0b'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - len * 1.5); g.stroke();
      g.fillStyle = opts.banner || (fiery ? 'rgba(120,30,10,0.55)' : 'rgba(40,44,50,0.65)');
      g.beginPath();
      g.moveTo(x, y - len * 1.5); g.lineTo(x + W * 0.035, y - len * 1.42);
      g.lineTo(x + W * 0.035, y - len * 0.72); g.lineTo(x, y - len * 0.62);
      g.closePath(); g.fill();
    }

    /* haze bands for depth */
    for (let i = 0; i < 3; i++) {
      const y = hy + H * (0.02 + i * 0.07);
      const grad = g.createLinearGradient(0, y - H * 0.05, 0, y + H * 0.05);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, fiery ? 'rgba(120,60,30,0.18)' : 'rgba(120,124,130,0.13)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad; g.fillRect(0, y - H * 0.05, W, H * 0.10);
    }

    /* churned foreground */
    g.fillStyle = fiery ? '#100805' : '#0b0c0d';
    ridgeFill(g, ridge(rnd, 65, 0.5), W, H, H * 0.86, H * 0.08,
      fiery ? '#100805' : '#0b0c0d');
  }

  const PAINTERS = { pyre, skyline, hall, crowd, wall, godswood, battlefield };

  /* Paint `type` into a fresh offscreen canvas and hand it back. */
  function paint(type, seed, opts, w, h) {
    const W = w || 1600, H = h || 900;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const fn = PAINTERS[type] || PAINTERS.hall;
    fn(g, W, H, seeded(seed || 1), opts || {});
    return cv;
  }

  return { paint, types: Object.keys(PAINTERS) };
})();
