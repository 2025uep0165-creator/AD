/* VFUHO — "The Build".
   A miniature brick villa that assembles itself, course by course, as you scroll.
   Pure three.js, no addons. Every element is a real construction stage:
   site → foundation → steel → columns → walls → floors → upper storey → roof → life. */

import * as THREE from 'three';

const BW = 1.00;   // brick length
const BH = 0.44;   // brick height
const BD = 0.52;   // brick depth
const G  = 0.05;   // mortar gap
const CH = BH + G; // course height

const STAGES = 9;            // must match CHAPTERS in site.js
const BAND   = 1 / STAGES;

const clamp  = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp   = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const backOut = t => { const c = 1.35; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

/* ---------- palette ---------- */
const BRICKS = ['#b4552f', '#c2643b', '#a94d2c', '#ce7148', '#9e4527', '#bb5c34'];
const CONCRETE = ['#8a827a', '#7c746c', '#938a81'];
const pick = a => a[(Math.random() * a.length) | 0];
const tint = hex => new THREE.Color(hex).offsetHSL(0, (Math.random() - .5) * .05, (Math.random() - .5) * .07);

export function createScene(canvas, opts = {}) {
  const lowPower = opts.lowPower === true;

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(0x1a130e, 120, 280);

  const FRAME = lowPower ? 1.34 : 1;                       // pull back on small screens
  const camera = new THREE.PerspectiveCamera(lowPower ? 46 : 38, 1, 0.5, 400);

  /* ---------- light ---------- */
  const hemi = new THREE.HemisphereLight(0xaac6e0, 0x5a3f2c, 1.05);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffd6a0, 2.9);
  sun.position.set(34, 46, 24);
  if (!lowPower) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 140;
    const s = 34;
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s });
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
  }
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x7fa8e8, 0.50);
  rim.position.set(-30, 18, -26);
  scene.add(rim);

  // key keyFill that follows the camera — keeps the visible façade lit
  const keyFill = new THREE.DirectionalLight(0xffc78a, 1.15);
  scene.add(keyFill);

  // interior glow, lit in the final chapter
  const hearth = new THREE.PointLight(0xffb366, 0, 26, 2);
  hearth.position.set(0, 4, 0);
  scene.add(hearth);

  /* ---------- ground ---------- */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(150, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 0.96, metalness: 0 })
  );
  ground.position.y = -0.52;
  ground.receiveShadow = !lowPower;
  scene.add(ground);

  /* ---------- the build ---------- */
  const boxes = [], rods = [], panes = [];
  compose({ boxes, rods, panes });

  const boxIM  = instanced(new THREE.BoxGeometry(1, 1, 1), boxes.length,
                   new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.03 }), true);
  const rodIM  = instanced(new THREE.CylinderGeometry(0.075, 0.075, 1, 7), rods.length,
                   new THREE.MeshStandardMaterial({ color: 0x585c63, roughness: 0.32, metalness: 0.92 }), false);
  const paneIM = instanced(new THREE.BoxGeometry(1, 1, 1), panes.length,
                   new THREE.MeshPhysicalMaterial({
                     color: 0x9fd0e8, roughness: 0.08, metalness: 0, transmission: 0.55,
                     transparent: true, opacity: 0.55, thickness: 0.4, side: THREE.DoubleSide
                   }), false);

  [boxIM, rodIM, paneIM].forEach(m => m && scene.add(m));
  boxes.forEach((b, i) => boxIM.setColorAt(i, b.color));
  if (boxIM.instanceColor) boxIM.instanceColor.needsUpdate = true;

  /* ---------- water ---------- */
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(9.2, 6.2).rotateX(-Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x2b7f9e, roughness: 0.06, metalness: 0.15, transparent: true,
      opacity: 0.0, transmission: 0.4, thickness: 1
    })
  );
  water.position.set(15.4, 0.92, 3.4);
  scene.add(water);

  /* ---------- dust ---------- */
  const dust = makeDust(lowPower ? 220 : 620);
  scene.add(dust);

  /* ---------- camera rig ---------- */
  const drag = { x: 0, y: 0, vx: 0, vy: 0, active: false, lx: 0, ly: 0, moved: false };
  const target = new THREE.Vector3();
  let progress = 0, shown = 0, clock = 0;

  function onDown(e) {
    drag.active = true; drag.moved = false;
    drag.lx = (e.touches ? e.touches[0].clientX : e.clientX);
    drag.ly = (e.touches ? e.touches[0].clientY : e.clientY);
  }
  function onMove(e) {
    if (!drag.active) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dx = x - drag.lx, dy = y - drag.ly;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    drag.vx += dx * 0.0045;
    drag.vy -= dy * 0.055;
    drag.lx = x; drag.ly = y;
    if (e.touches && drag.moved) e.preventDefault();
  }
  function onUp() { drag.active = false; }

  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: true });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);

  /* ---------- per-frame ---------- */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(),
        e3 = new THREE.Euler(), v3 = new THREE.Vector3(), sc = new THREE.Vector3();

  function place(im, list, p, i) {
    const it = list[i];
    const t = clamp((p - it.t0) / it.dur);
    if (t <= 0) { m4.makeScale(0, 0, 0); im.setMatrixAt(i, m4); return; }
    const a = t >= 1 ? 1 : backOut(t);
    const f = 1 - a;
    v3.set(
      it.pos[0] + it.jit[0] * f,
      it.pos[1] + (10 + it.jit[1]) * f * f,
      it.pos[2] + it.jit[2] * f
    );
    e3.set(it.rot[0] + it.spin[0] * f, it.rot[1] + it.spin[1] * f, it.rot[2] + it.spin[2] * f);
    q.setFromEuler(e3);
    const g = t >= 1 ? 1 : 0.4 + 0.6 * a;
    sc.set(it.size[0] * g, it.size[1] * g, it.size[2] * g);
    m4.compose(v3, q, sc);
    im.setMatrixAt(i, m4);
  }

  function render(dt) {
    clock += dt;

    // eased approach to the target progress — keeps scrubbing silky
    shown += (progress - shown) * Math.min(1, dt * 7);
    const p = shown;

    for (let i = 0; i < boxes.length; i++) place(boxIM, boxes, p, i);
    boxIM.instanceMatrix.needsUpdate = true;
    if (rods.length)  { for (let i = 0; i < rods.length; i++)  place(rodIM, rods, p, i);  rodIM.instanceMatrix.needsUpdate = true; }
    if (panes.length) { for (let i = 0; i < panes.length; i++) place(paneIM, panes, p, i); paneIM.instanceMatrix.needsUpdate = true; }

    // water fills during the final chapter
    const fill = clamp((p - BAND * 8.15) / (BAND * 0.7));
    water.material.opacity = fill * 0.88;
    water.position.y = lerp(0.6, 1.25, fill);

    // lights on
    hearth.intensity = clamp((p - BAND * 8.4) / (BAND * 0.6)) * 34;

    // camera
    drag.x += drag.vx; drag.vx *= 0.90;
    drag.y = clamp(drag.y + drag.vy, -5, 20); drag.vy *= 0.90;

    const k = smooth(p);
    const orbit = -0.55 + p * Math.PI * 1.25 + clock * 0.028 + drag.x;
    const radius = lerp(54, 41, k) * FRAME;
    const height = lerp(6.5, 25, k) * (lowPower ? 1.18 : 1) + drag.y + Math.sin(clock * 0.22) * 0.7;
    camera.position.set(Math.sin(orbit) * radius, height, Math.cos(orbit) * radius);
    target.set(0, lerp(2.2, 7.4, k), 0);
    camera.lookAt(target);
    keyFill.position.copy(camera.position).multiplyScalar(0.7).setY(camera.position.y * 0.55 + 14);

    dust.rotation.y = clock * 0.012;
    dust.material.opacity = 0.18 + 0.12 * Math.sin(clock * 0.4);

    renderer.render(scene, camera);
  }

  function resize(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  return {
    render, resize,
    setProgress(v) { progress = clamp(v); },
    jump(v) { progress = shown = clamp(v); },
    get stage() { return Math.min(STAGES - 1, Math.floor(shown / BAND)); },
    dispose() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
    }
  };

  /* ================= helpers ================= */

  function instanced(geo, count, mat, coloured) {
    if (!count) return null;
    const im = new THREE.InstancedMesh(geo, mat, count);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.castShadow = !lowPower;
    im.receiveShadow = !lowPower;
    im.frustumCulled = false;
    if (coloured) im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    return im;
  }
}

/* =====================================================================
   COMPOSITION — where the house is actually designed.
   ===================================================================== */
function compose(out) {
  const seq = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };

  const add = (bucket, kind, pos, size, color, rot = [0, 0, 0]) =>
    seq[bucket].push({ kind, pos, size, color, rot });

  /* ---- geometry of the house ---- */
  const W = 20, D = 13;                 // ground storey footprint
  const GY = 0.92;                      // top of ground slab
  const GC = 12;                        // ground-storey courses
  const FY = GY + GC * CH;              // top of ground storey / floor-2 level
  const UC = 10;                        // upper-storey courses
  const RY = FY + 0.55 + UC * CH;       // roof level

  /* 0 — THE SITE: pad, setting-out pegs, string lines */
  add(0, 'box', [0, -0.30, 0], [30, 0.55, 21], new THREE.Color('#41382f'));
  // setting-out pegs on the building line
  for (let i = 0; i < 7; i++) {
    const x = -13.2 + i * 4.4;
    add(0, 'box', [x, 0.42, -9.2], [0.13, 1.45, 0.13], new THREE.Color('#7a6552'));
    add(0, 'box', [x, 0.42,  9.2], [0.13, 1.45, 0.13], new THREE.Color('#7a6552'));
  }
  for (let i = 0; i < 4; i++) {
    const z = -6.3 + i * 4.2;
    add(0, 'box', [-13.6, 0.42, z], [0.13, 1.45, 0.13], new THREE.Color('#7a6552'));
    add(0, 'box', [ 13.6, 0.42, z], [0.13, 1.45, 0.13], new THREE.Color('#7a6552'));
  }
  // pallets of bricks stacked ready on site
  [[-12.6, -8.2], [-12.6, -2.0], [-11.4, 5.8]].forEach(([px, pz]) => {
    for (let c = 0; c < 7; c++)
      for (let r = 0; r < 3; r++)
        for (let k = 0; k < 2; k++)
          add(0, 'box',
            [px + (c % 2 ? 0.05 : 0) + k * (BW + .06), 0.12 + c * (BH + .02) + BH / 2, pz + r * (BD + .06)],
            [BW, BH, BD], tint(pick(BRICKS)), [0, (c % 2) * 0.03, 0]);
  });

  /* 1 — THE FOUNDATION: footings then the slab */
  const cols = [[-8.4, -5.0], [8.4, -5.0], [-8.4, 5.0], [8.4, 5.0], [0, -5.0], [0, 5.0]];
  cols.forEach(([x, z]) => add(1, 'box', [x, 0.22, z], [3.0, 0.9, 3.0], tint(pick(CONCRETE))));
  add(1, 'box', [0, GY - 0.26, 0], [W + 1.4, 0.55, D + 1.4], new THREE.Color('#9b9288'));

  /* 2 — THE STEEL: rebar cages standing in the footings */
  cols.forEach(([x, z]) => {
    const H = 6.4;
    [[-.45, -.45], [.45, -.45], [-.45, .45], [.45, .45]].forEach(([ox, oz]) =>
      seq[2].push({ kind: 'rod', pos: [x + ox, GY + H / 2 - 0.3, z + oz], size: [1, H, 1], rot: [0, 0, 0] }));
    for (let t = 0; t < 7; t++) {                      // stirrups
      const y = GY + 0.4 + t * 0.85;
      seq[2].push({ kind: 'rod', pos: [x, y, z - 0.45], size: [1, 1.0, 1], rot: [0, 0, Math.PI / 2] });
      seq[2].push({ kind: 'rod', pos: [x, y, z + 0.45], size: [1, 1.0, 1], rot: [0, 0, Math.PI / 2] });
      seq[2].push({ kind: 'rod', pos: [x - 0.45, y, z], size: [1, 1.0, 1], rot: [Math.PI / 2, 0, 0] });
      seq[2].push({ kind: 'rod', pos: [x + 0.45, y, z], size: [1, 1.0, 1], rot: [Math.PI / 2, 0, 0] });
    }
  });

  /* 3 — THE COLUMNS: brick piers cast around the steel */
  cols.forEach(([x, z]) => {
    for (let c = 0; c < GC; c++) {
      const y = GY + c * CH + BH / 2;
      const r = (c % 2) ? 0 : Math.PI / 2;             // alternating header/stretcher
      add(3, 'box', [x - 0.52, y, z - 0.28], [BW, BH, BD], tint(pick(BRICKS)), [0, r, 0]);
      add(3, 'box', [x + 0.52, y, z + 0.28], [BW, BH, BD], tint(pick(BRICKS)), [0, r, 0]);
      add(3, 'box', [x - 0.28, y, z + 0.52], [BD, BH, BW], tint(pick(BRICKS)), [0, r, 0]);
      add(3, 'box', [x + 0.28, y, z - 0.52], [BD, BH, BW], tint(pick(BRICKS)), [0, r, 0]);
    }
  });

  /* 4 — THE WALLS: ground storey, laid in running bond with real openings */
  const gOpen = {
    front: [[-2.0, 2.0, 0, 9], [5.0, 8.4, 4, 9]],       // door + window
    back:  [[-7.6, -4.0, 4, 9], [3.2, 6.8, 4, 9]],
    left:  [[-2.6, 2.6, 3, 9]],
    right: [[-3.4, 3.4, 3, 10]]                          // wide glazed opening
  };
  wallRing(seq[4], W, D, GY, GC, gOpen, cols);

  /* 5 — THE FLOORS: deck over the ground storey + a cast stair */
  add(5, 'box', [0, FY + 0.21, 0], [W + 0.6, 0.42, D + 0.6], new THREE.Color('#a39a8f'));
  for (let s = 0; s < 11; s++) {                         // staircase
    const y = GY + 0.3 + s * (FY - GY - 0.3) / 11;
    add(5, 'box', [-6.2 + s * 0.02, y, 7.2 + s * 0.62], [4.2, 0.30, 0.62], tint(pick(CONCRETE)));
  }
  add(5, 'box', [-4.0, FY + 0.9, 8.1], [0.22, 1.2, 7.4], new THREE.Color('#6d6660'));

  /* 6 — THE UPPER STOREY: offset volume, cantilevered over the entrance */
  const UW = 17, UD = 11.5, UX = 2.2, UZ = -0.4;
  const uOpen = {
    front: [[-5.4, -1.4, 2, 8], [1.6, 5.6, 2, 8]],
    back:  [[-4.4, -0.4, 2, 8], [2.4, 6.0, 2, 8]],
    left:  [[-3.0, 3.0, 2, 8]],
    right: [[-3.6, 3.6, 2, 9]]
  };
  wallRing(seq[6], UW, UD, FY + 0.55, UC, uOpen, [], UX, UZ);

  /* 7 — THE ROOF: deck, parapet, balcony and its railing */
  add(7, 'box', [UX, RY + 0.24, UZ], [UW + 0.8, 0.46, UD + 0.8], new THREE.Color('#a39a8f'));
  for (let i = 0; i < 4; i++) {                          // parapet
    const [ax, len, at, isX] = [
      [UX, UW + 0.8, UZ - UD / 2 - 0.36, true],
      [UX, UW + 0.8, UZ + UD / 2 + 0.36, true],
      [UZ, UD + 0.8, UX - UW / 2 - 0.36, false],
      [UZ, UD + 0.8, UX + UW / 2 + 0.36, false]
    ][i];
    const n = Math.round(len / (BW + G));
    for (let j = 0; j < n; j++) {
      const u = ax - len / 2 + (j + 0.5) * (len / n);
      const p = isX ? [u, RY + 0.84, at] : [at, RY + 0.84, u];
      add(7, 'box', p, isX ? [BW, BH * 1.7, BD] : [BD, BH * 1.7, BW], tint(pick(BRICKS)));
    }
  }
  // balcony slab where the upper storey steps back
  add(7, 'box', [-7.3, FY + 0.56, 2.0], [5.6, 0.32, 8.0], new THREE.Color('#9b9288'));
  for (let j = 0; j < 14; j++)                           // balustrade
    add(7, 'box', [-10.0, FY + 1.25, -1.7 + j * 0.58], [0.16, 1.05, 0.16], new THREE.Color('#5d5852'));
  add(7, 'box', [-10.0, FY + 1.85, 2.0], [0.30, 0.16, 8.0], new THREE.Color('#6d6660'));

  /* 8 — THE LIFE: pool, terrace, planting, lamps */
  add(8, 'box', [15.4, 0.35, 3.4], [10.6, 1.3, 7.6], new THREE.Color('#5d5750'));   // pool shell
  add(8, 'box', [15.4, 0.55, 3.4], [9.2, 1.1, 6.2], new THREE.Color('#1f6a86'));    // pool lining
  for (let i = 0; i < 40; i++) {                                                     // terrace paving
    const gx = i % 8, gz = (i / 8) | 0;
    add(8, 'box', [8.6 + gx * 1.72, 0.98, -6.6 + gz * 1.72], [1.6, 0.16, 1.6], tint(pick(CONCRETE)));
  }
  const trees = [[-17.5, -9.5], [-19, 2.5], [-16, 11], [-3, 13.5], [9, 13], [21, 10.5], [23, 1], [20.5, -9], [8, -12.5], [-6, -12]];
  trees.forEach(([x, z]) => {
    const h = 2.2 + Math.random() * 1.8;
    add(8, 'box', [x, 0.6 + h / 2, z], [0.46, h, 0.46], new THREE.Color('#6b4e30'));
    for (let b = 0; b < 3; b++) {
      const r = 2.5 - b * 0.62;
      add(8, 'box', [x, 0.6 + h + b * 0.66, z], [r, 1.25, r],
        new THREE.Color(b % 2 ? '#4f8449' : '#3f7040'), [0, Math.random() * 0.8, 0]);
    }
  });
  [[-11.5, -8.5], [11.5, -8.5], [0, 10.5]].forEach(([x, z]) => {                     // lamps
    add(8, 'box', [x, 1.9, z], [0.2, 2.6, 0.2], new THREE.Color('#4a453f'));
    add(8, 'box', [x, 3.35, z], [0.7, 0.32, 0.7], new THREE.Color('#ffd9a0'));
  });

  /* ---- glazing rides along with the walls it sits in ---- */
  glaze(seq[4], gOpen, W, D, GY, 0, 0);
  glaze(seq[6], uOpen, UW, UD, FY + 0.55, UX, UZ);

  /* ---- schedule everything onto the 0→1 timeline ---- */
  let idx = 0;
  for (let s = 0; s < STAGES; s++) {
    const list = seq[s];
    const start = s * BAND;
    const span = BAND * 0.88;
    // lay from the bottom up, so walls rise rather than flicker into place
    list.sort((a, b) => a.pos[1] - b.pos[1]);
    list.forEach((it, i) => {
      const f = list.length > 1 ? i / (list.length - 1) : 0;
      const item = {
        pos: it.pos, size: it.size, rot: it.rot, color: it.color,
        t0: start + f * span,
        dur: Math.max(BAND * 0.16, span * 0.26),
        jit: [(Math.random() - .5) * 7, Math.random() * 5, (Math.random() - .5) * 7],
        spin: [(Math.random() - .5) * 2.4, (Math.random() - .5) * 3.4, (Math.random() - .5) * 2.4]
      };
      if (it.kind === 'rod') out.rods.push(item);
      else if (it.kind === 'pane') out.panes.push(item);
      else out.boxes.push(item);
      idx++;
    });
  }

  /* ---- wall builder ---- */
  function wallRing(bucket, w, d, y0, courses, openings, skip = [], ox = 0, oz = 0) {
    const sides = [
      { key: 'front', axis: 'x', at: oz + d / 2, from: ox - w / 2, to: ox + w / 2 },
      { key: 'back',  axis: 'x', at: oz - d / 2, from: ox - w / 2, to: ox + w / 2 },
      { key: 'left',  axis: 'z', at: ox - w / 2, from: oz - d / 2 + BW, to: oz + d / 2 - BW },
      { key: 'right', axis: 'z', at: ox + w / 2, from: oz - d / 2 + BW, to: oz + d / 2 - BW }
    ];
    sides.forEach(side => {
      const len = side.to - side.from;
      const n = Math.max(1, Math.round(len / (BW + G)));
      const step = len / n;
      const holes = openings[side.key] || [];
      for (let c = 0; c < courses; c++) {
        const y = y0 + c * CH + BH / 2;
        const shift = (c % 2) ? step * 0.5 : 0;
        for (let i = 0; i < n; i++) {
          const u = side.from + shift + (i + 0.5) * step;
          if (u - step / 2 < side.from - 0.02 || u + step / 2 > side.to + 0.02) continue;
          const local = u - (side.axis === 'x' ? ox : oz);
          if (holes.some(h => c >= h[2] && c < h[3] && local > h[0] && local < h[1])) continue;
          const pos = side.axis === 'x' ? [u, y, side.at] : [side.at, y, u];
          // don't re-lay bricks where a column already stands
          if (skip.some(([cx, cz]) => Math.abs(pos[0] - cx) < 1.3 && Math.abs(pos[2] - cz) < 1.3)) continue;
          const size = side.axis === 'x' ? [step - G, BH, BD] : [BD, BH, step - G];
          bucket.push({ kind: 'box', pos, size, color: tint(pick(BRICKS)), rot: [0, 0, 0] });
        }
      }
    });
  }

  /* ---- fill every opening with glass ---- */
  function glaze(bucket, openings, w, d, y0, ox, oz) {
    const map = {
      front: { axis: 'x', at: oz + d / 2 },
      back:  { axis: 'x', at: oz - d / 2 },
      left:  { axis: 'z', at: ox - w / 2 },
      right: { axis: 'z', at: ox + w / 2 }
    };
    Object.entries(openings).forEach(([key, holes]) => {
      const m = map[key];
      holes.forEach(([a, b, c0, c1]) => {
        if (key === 'front' && a < 2.1 && a > -2.1 && c0 === 0) return;  // the doorway stays open
        const cu = (a + b) / 2 + (m.axis === 'x' ? ox : oz);
        const wlen = b - a;
        const y = y0 + ((c0 + c1) / 2) * CH;
        const hgt = (c1 - c0) * CH;
        const pos = m.axis === 'x' ? [cu, y, m.at] : [m.at, y, cu];
        const size = m.axis === 'x' ? [wlen - 0.3, hgt - 0.2, 0.12] : [0.12, hgt - 0.2, wlen - 0.3];
        bucket.push({ kind: 'pane', pos, size, color: null, rot: [0, 0, 0] });
      });
    });
  }
}

/* =====================================================================
   texture + particle helpers
   ===================================================================== */
function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const g = c.getContext('2d').createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.00, '#1d2c40');
  g.addColorStop(0.34, '#3b4152');
  g.addColorStop(0.52, '#6d5137');
  g.addColorStop(0.62, '#8a5a34');
  g.addColorStop(0.74, '#3a271b');
  g.addColorStop(1.00, '#150f0b');
  const ctx = c.getContext('2d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

function groundTexture() {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = '#231b15'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 26000; i++) {                       // grit
    x.fillStyle = `rgba(${120 + Math.random() * 70 | 0},${95 + Math.random() * 55 | 0},${75 + Math.random() * 45 | 0},${Math.random() * 0.22})`;
    x.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  x.strokeStyle = 'rgba(226,180,130,0.20)'; x.lineWidth = 1;   // survey grid
  for (let i = 0; i <= 32; i++) {
    const p = (i / 32) * S;
    x.beginPath(); x.moveTo(p, 0); x.lineTo(p, S); x.stroke();
    x.beginPath(); x.moveTo(0, p); x.lineTo(S, p); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(7, 7);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function makeDust(n) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 12 + Math.random() * 46, a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 34;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xffcf9a, size: 0.17, transparent: true, opacity: 0.25,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
}
