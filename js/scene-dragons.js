/* ==========================================================================
   scene-dragons.js — Drogon, Rhaegal and Viserion as geometry.

   Built to the show's own model sheets: 16m long with a 23m span for Drogon,
   15m/22m for the other two — a span about 1.45x the body, which is most of
   what makes a dragon read as a dragon rather than a lizard with flaps.

   The body is one continuous surface. A spline runs nose to tail tip carrying
   a radius and a spike height at every station; an ellipse is swept along it,
   squashed narrow through the neck and broad through the ribcage. Nothing is
   a chain of separate blobs, so there are no seams in the silhouette.

   The wing is a bat's: humerus, forearm, five fingers, and membrane panels
   whose trailing edges sag between the tips. The scale texture is procedural
   and lives in the fragment shader, keyed off surface coordinates carried
   through from the sweep.

   Nothing animates on the CPU. Every vertex carries

       aRig = (part, t, side, _)

         part  0 body · 1 wing · 2 tail · 3 neck · 4 jaw
         t     0..1 along that part, from its root
         side  -1 / +1, which wing

   and the vertex shader flaps, sways and banks from that: one draw call per
   dragon, no skinning matrices.
   ========================================================================== */

function DragonGL(canvas) {
  const gl = makeGL(canvas);
  if (!gl) return null;

  /* ---------------------------------------------------------------- mesh -- */

  const M = { pos: [], nrm: [], uv: [], rig: [], idx: [] };

  const push = (p, n, uv, rig) => {
    M.pos.push(p[0], p[1], p[2]);
    M.nrm.push(n[0], n[1], n[2]);
    M.uv.push(uv[0], uv[1]);
    M.rig.push(rig[0], rig[1], rig[2], rig[3] || 0);
    return M.pos.length / 3 - 1;
  };

  /* Bring a Geo primitive in, transformed, tagging every vertex it adds. */
  function solid(src, mat, rig, uv) {
    const base = M.pos.length / 3;
    const tmp = Geo.merge(Geo.empty(), src, mat || M4.ident());
    for (let i = 0; i < tmp.pos.length; i += 3) {
      M.pos.push(tmp.pos[i], tmp.pos[i + 1], tmp.pos[i + 2]);
      M.nrm.push(tmp.nrm[i], tmp.nrm[i + 1], tmp.nrm[i + 2]);
      M.uv.push(uv ? uv[0] : 0.5, uv ? uv[1] : 0.5);
      M.rig.push(rig[0], rig[1], rig[2], 0);
    }
    for (let i = 0; i < tmp.idx.length; i++) M.idx.push(tmp.idx[i] + base);
  }

  /* ---- the spine ---------------------------------------------------------
     [x, y, ry, rz, spike] — ry/rz are the vertical and lateral radii, so the
     neck can be narrow and deep while the ribcage is broad. */
  const SPINE = [
    [ 8.30, 1.62, 0.10, 0.10, 0.00],
    [ 7.95, 1.64, 0.26, 0.22, 0.00],
    [ 7.45, 1.70, 0.40, 0.32, 0.04],
    [ 6.90, 1.79, 0.52, 0.44, 0.10],
    [ 6.35, 1.86, 0.61, 0.55, 0.20],
    [ 5.80, 1.84, 0.58, 0.52, 0.30],
    [ 5.20, 1.78, 0.47, 0.41, 0.34],
    [ 4.50, 1.50, 0.47, 0.40, 0.37],
    [ 3.75, 1.16, 0.52, 0.44, 0.40],
    [ 3.00, 0.82, 0.58, 0.49, 0.43],
    [ 2.25, 0.52, 0.66, 0.57, 0.45],
    [ 1.50, 0.36, 0.80, 0.72, 0.47],
    [ 0.75, 0.28, 1.00, 0.94, 0.45],
    [ 0.00, 0.16, 1.16, 1.10, 0.40],
    [-0.85, 0.08, 1.13, 1.05, 0.35],
    [-1.75, 0.01, 0.93, 0.85, 0.31],
    [-2.65,-0.07, 0.87, 0.79, 0.28],
    [-3.55,-0.20, 0.71, 0.65, 0.25],
    [-4.55,-0.36, 0.55, 0.51, 0.22],
    [-5.65,-0.54, 0.41, 0.38, 0.18],
    [-6.75,-0.72, 0.29, 0.27, 0.14],
    [-7.85,-0.90, 0.19, 0.18, 0.10],
    [-8.85,-1.06, 0.10, 0.09, 0.05],
    [-9.70,-1.18, 0.03, 0.03, 0.01]
  ];

  const HIP = -2.65, SHOULDER = 1.50, HEAD_X = 6.35;

  /* which part of the rig a station belongs to, and how far along it is */
  function rigAt(x) {
    if (x >= SHOULDER) {
      return [3, Math.min(1, (x - SHOULDER) / (HEAD_X - SHOULDER)), 0];
    }
    if (x <= HIP) {
      return [2, Math.min(1, (HIP - x) / (HIP - (-9.70))), 0];
    }
    return [0, 0, 0];
  }

  const catmull = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t +
                  (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                  (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };

  /* Resample the control points into a smooth run of stations. */
  function spline(ctrl, per) {
    const out = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const a = ctrl[Math.max(0, i - 1)], b = ctrl[i],
            c = ctrl[i + 1], d = ctrl[Math.min(ctrl.length - 1, i + 2)];
      const steps = i === ctrl.length - 2 ? per : per - 1;
      for (let s = 0; s <= steps; s++) {
        const t = s / per;
        out.push([0, 1, 2, 3, 4].map(k => catmull(a[k], b[k], c[k], d[k], t)));
      }
    }
    return out;
  }

  const RING = 20;

  /* Sweep the cross-section along the spine into one continuous hull. */
  function sweepBody() {
    const st = spline(SPINE, 4);
    const rows = [];
    let run = 0;

    for (let i = 0; i < st.length; i++) {
      const [x, y, ry, rz] = st[i];
      const prev = st[Math.max(0, i - 1)], next = st[Math.min(st.length - 1, i + 1)];
      let tx = next[0] - prev[0], ty = next[1] - prev[1];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      /* the section's own up vector, perpendicular to the spine in the XY plane */
      const ux = -ty, uy = tx;
      if (i) run += Math.hypot(x - prev[0], y - prev[1]);

      const rig = rigAt(x);
      const row = [];
      for (let k = 0; k <= RING; k++) {
        const a = k / RING * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const p = [x + ux * ry * ca, y + uy * ry * ca, rz * sa];
        /* normal of an ellipse sweep: scale the direction by the inverse radii */
        let nx = ux * ca / ry, ny = uy * ca / ry, nz = sa / rz;
        const nl = Math.hypot(nx, ny, nz) || 1;
        row.push(push(p, [nx / nl, ny / nl, nz / nl], [k / RING, run * 0.55], rig));
      }
      rows.push(row);
    }

    for (let i = 0; i < rows.length - 1; i++) {
      for (let k = 0; k < RING; k++) {
        const a = rows[i][k], b = rows[i][k + 1], c = rows[i + 1][k], d = rows[i + 1][k + 1];
        M.idx.push(a, c, b, b, c, d);
      }
    }
    return st;
  }

  /* The spike row down the back — a plate at each station, standing on the
     spine's own up vector so it follows the neck's arc and the tail's droop. */
  function crest(st) {
    for (let i = 2; i < st.length - 2; i += 2) {
      const [x, y, ry, , h0] = st[i];
      /* no crest over the skull, and an uneven run of heights, so the row
         reads as bone rather than a saw blade */
      if (x > 5.4 || h0 < 0.05) continue;
      const vary = [1.0, 0.66, 0.88, 0.54][(i >> 1) % 4];
      const h = h0 * 1.5 * vary;
      const nx = st[i + 1], pv = st[i - 1];
      let tx = nx[0] - pv[0], ty = nx[1] - pv[1];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      /* the spine runs nose to tail, so "up" is (ty, -tx), not (-ty, tx) */
      const ux = ty, uy = -tx;
      const bx = x + ux * ry * 0.92, by = y + uy * ry * 0.92;
      /* raked back along the spine, the way a fin lies */
      const tipX = bx + ux * h * 1.20 + tx * h * 0.85;
      const tipY = by + uy * h * 1.20 + ty * h * 0.85;
      const w = Math.max(0.035, h * 0.16);
      const rig = rigAt(x);
      const back = [bx - tx * h * 0.5, by - ty * h * 0.5];
      const fwd  = [bx + tx * h * 0.42, by + ty * h * 0.42];
      const n = [ux, uy, 0];
      const a = push([fwd[0], fwd[1], 0], n, [0.5, 0], rig);
      const b = push([back[0], back[1], 0], n, [0.5, 0], rig);
      const c = push([tipX, tipY, w], n, [0.5, 1], rig);
      const d = push([tipX, tipY, -w], n, [0.5, 1], rig);
      M.idx.push(a, b, c, a, d, b, a, c, d, b, d, c);
    }
  }

  /* ---- the head ---------------------------------------------------------- */

  function head() {
    const rigH = [3, 1, 0];

    /* lower jaw, hinged so it can drop on the breath */
    const JAW = [
      [ 5.60, 1.52, 0.30, 0.30],
      [ 6.20, 1.42, 0.34, 0.36],
      [ 6.90, 1.36, 0.28, 0.30],
      [ 7.55, 1.36, 0.19, 0.20],
      [ 8.10, 1.40, 0.07, 0.07]
    ];
    const rows = [];
    for (const [x, y, ry, rz] of JAW) {
      const row = [];
      for (let k = 0; k <= 10; k++) {
        const a = k / 10 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        row.push(push([x, y + ry * ca, rz * sa], [0, ca, sa], [k / 10, x], [4, 1, 0]));
      }
      rows.push(row);
    }
    for (let i = 0; i < rows.length - 1; i++)
      for (let k = 0; k < 10; k++)
        M.idx.push(rows[i][k], rows[i + 1][k], rows[i][k + 1],
                   rows[i][k + 1], rows[i + 1][k], rows[i + 1][k + 1]);

    /* brow ridges, and the crown of horns sweeping back off the skull */
    [1, -1].forEach(s => {
      solid(Geo.box(0.62, 0.10, 0.16),
        M4.mul(M4.translate(6.55, 2.10, 0.34 * s), M4.rotZ(0.10)), rigH);

      const horns = [
        [6.15, 2.22, 0.30, 1.35, 0.95, -0.30],
        [5.85, 2.16, 0.46, 1.05, 1.15, -0.48],
        [5.55, 2.02, 0.58, 0.80, 1.35, -0.62],
        [6.45, 1.92, 0.52, 0.62, 1.75, -0.30]
      ];
      horns.forEach(([x, y, z, len, pitch, yaw], i) => {
        const mat = M4.mul(M4.mul(M4.mul(
          M4.translate(x, y, z * s),
          M4.rotY(yaw * s)), M4.rotZ(pitch)), M4.rotZ(0));
        solid(Geo.cyl(0.012, 0.075 - i * 0.008, len, 7),
          M4.mul(mat, M4.translate(0, len / 2, 0)), rigH);
      });

      /* cheek and jawline spikes */
      for (let i = 0; i < 4; i++) {
        const x = 5.7 + i * 0.42;
        solid(Geo.cyl(0.008, 0.038, 0.28, 6),
          M4.mul(M4.mul(M4.translate(x, 1.66, (0.30 - i * 0.03) * s),
            M4.rotZ(-0.5)), M4.rotX(-1.1 * s)), rigH);
      }

      /* the eye, set under the brow */
      solid(Geo.sphere(0.115, 12), M4.translate(6.30, 1.97, 0.40 * s), [5, 1, s]);
    });

    /* teeth — the upper row hangs down, the lower stands up */
    [1, -1].forEach(s => {
      for (let i = 0; i < 8; i++) {
        const x = 6.45 + i * 0.24;
        const r = 0.042 - i * 0.0035;
        solid(Geo.cyl(0.003, r, 0.19, 5),
          M4.mul(M4.translate(x, 1.52, 0.215 * s), M4.rotZ(Math.PI)), [3, 1, 0]);
        solid(Geo.cyl(0.003, r * 0.9, 0.16, 5),
          M4.translate(x + 0.05, 1.50, 0.205 * s), [4, 1, 0]);
      }
    });
  }

  /* ---- wings ------------------------------------------------------------- */

  function bone(a, b, r0, r1, side, tA, tB) {
    const dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2];
    const len = Math.hypot(dx, dy, dz) || 1e-4;
    const ux = dx/len, uy = dy/len, uz = dz/len;
    const h = Math.hypot(ux, uz);
    const za = Math.atan2(h, uy);
    const ya = h > 1e-5 ? Math.atan2(uz, -ux) : 0;
    const mat = M4.mul(M4.mul(
      M4.translate((a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2),
      M4.rotY(ya)), M4.rotZ(za));
    /* rig t has to vary along the bone, or it shears out of the membrane */
    const base = M.pos.length / 3;
    const src = Geo.cyl(r1, r0, len, 7);
    const tmp = Geo.merge(Geo.empty(), src, mat);
    for (let i = 0; i < tmp.pos.length; i += 3) {
      const ly = src.pos[i + 1];
      M.pos.push(tmp.pos[i], tmp.pos[i+1], tmp.pos[i+2]);
      M.nrm.push(tmp.nrm[i], tmp.nrm[i+1], tmp.nrm[i+2]);
      M.uv.push(0.5, 0.5);
      M.rig.push(1, tA + (tB - tA) * (ly / len + 0.5), side, 0);
    }
    for (let i = 0; i < tmp.idx.length; i++) M.idx.push(tmp.idx[i] + base);
  }

  function wing(side) {
    const z = v => v * side;
    const A  = [-2.20, 0.10, z(0.55)];
    const S  = [ 1.20, 0.75, z(0.80)];
    const E  = [-0.60, 2.10, z(4.10)];
    const R  = [ 2.10, 2.70, z(7.60)];
    const F  = [
      [ 5.20, 2.10, z(10.60)],
      [ 2.10, 1.70, z(12.40)],
      [-1.40, 1.15, z(11.90)],
      [-4.60, 0.55, z(9.60)],
      [-7.00, 0.00, z(6.00)]
    ];
    const T = { A: 0, S: 0.07, E: 0.33, R: 0.60, F: 1 };

    bone(S, E, 0.19, 0.125, side, T.S, T.E);
    bone(E, R, 0.125, 0.082, side, T.E, T.R);
    F.forEach((tp, i) => bone(R, tp, 0.068 - i * 0.007, 0.013, side, T.R, T.F));
    /* the thumb claw at the wrist */
    bone(R, [R[0] + 1.0, R[1] + 0.35, R[2] - z(0.5)], 0.055, 0.010, side, T.R, T.R);

    /* A membrane panel as a subdivided sheet rather than one flat triangle:
       positions come from at(u,v), normals from the grid's own neighbours, so
       the surface shades as a curved skin instead of a set of facets. */
    const sheet = (nu, nv, at, tAt) => {
      const P = [], base = M.pos.length / 3;
      for (let i = 0; i <= nu; i++) {
        const row = [];
        for (let j = 0; j <= nv; j++) row.push(at(i / nu, j / nv));
        P.push(row);
      }
      for (let i = 0; i <= nu; i++) {
        for (let j = 0; j <= nv; j++) {
          const a = P[Math.min(i + 1, nu)][j], b = P[Math.max(i - 1, 0)][j];
          const c = P[i][Math.min(j + 1, nv)], d = P[i][Math.max(j - 1, 0)];
          const u = [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
          const v = [c[0]-d[0], c[1]-d[1], c[2]-d[2]];
          let nx = u[1]*v[2]-u[2]*v[1], ny = u[2]*v[0]-u[0]*v[2], nz = u[0]*v[1]-u[1]*v[0];
          const l = Math.hypot(nx, ny, nz) || 1;
          push(P[i][j], [nx/l, ny/l, nz/l], [i / nu, j / nv],
               [1, tAt(i / nu, j / nv), side, 1]);
        }
      }
      const at2 = (i, j) => base + i * (nv + 1) + j;
      for (let i = 0; i < nu; i++)
        for (let j = 0; j < nv; j++)
          M.idx.push(at2(i, j), at2(i + 1, j), at2(i, j + 1),
                     at2(i, j + 1), at2(i + 1, j), at2(i + 1, j + 1));
    };

    const lerp3 = (a, b, k) => [a[0]+(b[0]-a[0])*k, a[1]+(b[1]-a[1])*k, a[2]+(b[2]-a[2])*k];

    /* One bay: bounded by two fingers and a trailing edge that sags back
       toward the wrist, with the skin billowing like a sail under lift. */
    const bay = (root, a, b, tRoot, sag, billow) => {
      const ia = lerp3(root, a, 0.10), ib = lerp3(root, b, 0.10);
      sheet(10, 8, (u, v) => {
        const inner = lerp3(ia, ib, u);
        const edge = lerp3(a, b, u);
        const k = Math.sin(u * Math.PI) * sag;
        const outer = lerp3(edge, root, k);
        const p = lerp3(inner, outer, v);
        p[1] += Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * billow;
        return p;
      }, (u, v) => tRoot + (T.F - tRoot) * (0.10 + v * 0.90));
    };

    /* A four-cornered panel, same treatment. */
    const panel = (p00, p10, p11, p01, t0, t1, billow) => {
      sheet(7, 7, (u, v) => {
        const p = lerp3(lerp3(p00, p10, u), lerp3(p01, p11, u), v);
        p[1] += Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * billow;
        return p;
      }, (u, v) => t0 + (t1 - t0) * v);
    };

    /* the web in the crook of the arm */
    panel(S, E, R, lerp3(S, R, 0.5), T.S, T.R, 0.12);
    for (let i = 0; i < F.length - 1; i++) bay(R, F[i], F[i + 1], T.R, 0.26, 0.42);
    /* the main sheet, arm to flank */
    panel(A, S, R, lerp3(A, F[4], 0.55), T.A, T.R, 0.30);
    panel(lerp3(A, F[4], 0.55), R, F[4], F[4], T.A, T.F, 0.22);
  }

  /* ---- hind legs, tucked the way a flying dragon carries them ------------- */

  function legs() {
    [1, -1].forEach(s => {
      const hip = [-2.30, -0.55, 0.85 * s];
      const knee = [-3.30, -1.35, 1.05 * s];
      const ankle = [-2.55, -2.05, 1.00 * s];
      const toe = [-3.05, -2.55, 0.95 * s];
      const B = (a, b, r0, r1) => {
        const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2];
        const len=Math.hypot(dx,dy,dz)||1e-4;
        const ux=dx/len, uy=dy/len, uz=dz/len, h=Math.hypot(ux,uz);
        const mat = M4.mul(M4.mul(
          M4.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),
          M4.rotY(h>1e-5?Math.atan2(uz,-ux):0)), M4.rotZ(Math.atan2(h,uy)));
        solid(Geo.cyl(r1, r0, len, 8), mat, [0, 0, 0]);
      };
      solid(Geo.merge(Geo.empty(), Geo.sphere(1, 12), M4.scale(0.52, 0.44, 0.38)),
            M4.translate(hip[0], hip[1] + 0.15, hip[2]), [0, 0, 0]);
      B(hip, knee, 0.34, 0.22);
      B(knee, ankle, 0.22, 0.15);
      B(ankle, toe, 0.15, 0.10);
      for (let k = -1; k <= 1; k++) {
        B(toe, [toe[0] - 0.34, toe[1] - 0.22, toe[2] + k * 0.16], 0.055, 0.012);
      }
    });
  }

  sweepBody() && 0;
  const stations = spline(SPINE, 4);
  crest(stations);
  head();
  legs();
  wing(1);
  wing(-1);

  /* ------------------------------------------------------------- upload -- */

  const mesh = {
    pos: gl.createBuffer(), nrm: gl.createBuffer(),
    uv: gl.createBuffer(), rig: gl.createBuffer(),
    idx: gl.createBuffer(), count: M.idx.length
  };
  const bind = (buf, arr, Type) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Type(arr), gl.STATIC_DRAW);
  };
  bind(mesh.pos, M.pos, Float32Array);
  bind(mesh.nrm, M.nrm, Float32Array);
  bind(mesh.uv, M.uv, Float32Array);
  bind(mesh.rig, M.rig, Float32Array);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);
  const big = M.pos.length / 3 > 65535;
  mesh.type = big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    big ? new Uint32Array(M.idx) : new Uint16Array(M.idx), gl.STATIC_DRAW);

  /* -------------------------------------------------------------- shader -- */

  const prog = program(gl, `
    attribute vec3 aPos;
    attribute vec3 aNrm;
    attribute vec2 aUV;
    attribute vec4 aRig;

    uniform mat4 uProj, uView, uModel, uNrmMat;
    uniform float uTime, uFlap, uPhase, uBreath;

    varying vec3 vN, vW;
    varying vec2 vUV;
    varying float vPart, vT, vWeb;

    void rot(inout vec2 p, float a) {
      float c = cos(a), s = sin(a);
      p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    }

    void main() {
      vec3 p = aPos;
      vec3 n = aNrm;
      float part = aRig.x, t = aRig.y, side = aRig.z;
      float beat = uTime * uFlap + uPhase;

      if (part > 0.5 && part < 1.5) {
        /* wing: rotate about the shoulder line, the tip lagging so the
           membrane whips rather than moving as a board */
        float lag = beat - t * 0.85;
        float sw  = sin(lag);
        float ang = (sw > 0.0 ? sw * 0.38 : sw * 0.50) * (0.22 + t * 0.78) + 0.16;
        vec3  q   = p - vec3(1.20, 0.75, 0.0);
        vec2  yz  = vec2(q.y, q.z * side);
        rot(yz, ang);
        q.y = yz.x; q.z = yz.y * side;
        q.y -= t * t * 0.18;                       /* camber */
        q.y += sin(lag * 2.0 - t * 5.0) * 0.13 * t * t;
        p = q + vec3(1.20, 0.75, 0.0);
        vec2 nyz = vec2(n.y, n.z * side);
        rot(nyz, ang);
        n.y = nyz.x; n.z = nyz.y * side;

      } else if (part > 1.5 && part < 2.5) {
        float w = sin(uTime * 1.6 + uPhase - t * 2.7);
        p.z += w * 1.75 * t * t;
        p.y += sin(uTime * 1.1 + uPhase - t * 2.1) * 0.60 * t * t;

      } else if (part > 2.5 && part < 3.5) {
        p.y += sin(uTime * 0.75 + uPhase) * 0.30 * t;
        p.z += sin(uTime * 0.55 + uPhase * 1.7) * 0.55 * t;
        p.y += uBreath * 0.16 * t;

      } else if (part > 3.5 && part < 4.5) {
        vec3 q = p - vec3(5.60, 1.62, 0.0);        /* jaw hinge */
        vec2 xy = vec2(q.x, q.y);
        rot(xy, -uBreath * 0.38);
        q.x = xy.x; q.y = xy.y;
        p = q + vec3(5.60, 1.62, 0.0);
        p.y += sin(uTime * 0.75 + uPhase) * 0.30;
        p.z += sin(uTime * 0.55 + uPhase * 1.7) * 0.55;

      } else if (part > 4.5) {                      /* eye rides the head */
        p.y += sin(uTime * 0.75 + uPhase) * 0.30;
        p.z += sin(uTime * 0.55 + uPhase * 1.7) * 0.55;
      }

      vec4 world = uModel * vec4(p, 1.0);
      vW = world.xyz;
      vN = mat3(uNrmMat) * n;
      vUV = aUV; vPart = part; vT = t; vWeb = aRig.w;
      gl_Position = uProj * uView * world;
    }`, `
    precision highp float;
    varying vec3 vN, vW;
    varying vec2 vUV;
    varying float vPart, vT, vWeb;
    uniform vec3 uHide, uBelly, uMembrane, uFireCol, uEye;
    uniform float uBreath, uScaleDens;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(41.7, 289.1))) * 43758.5453);
    }

    void main() {
      vec3 N = normalize(vN);
      if (!gl_FrontFacing) N = -N;
      vec3 V = normalize(vec3(0.0, 0.6, 28.0) - vW);

      bool web = vWeb > 0.5;
      bool eye = vPart > 4.5;

      /* ---- surface -------------------------------------------------------
         Overlapping rows of scales, offset every other row, raised in the
         middle and shadowed at the seam. It is a lighting trick rather than a
         real normal map, but at this distance it is what separates hide from
         plastic. */
      float relief = 0.0, tint = 0.0;
      if (!web && !eye) {
        vec2 g = vec2(vUV.x * uScaleDens, vUV.y * uScaleDens * 0.34);
        vec2 gi = floor(g);
        g.x += mod(gi.y, 2.0) * 0.5;
        gi = floor(g);
        vec2 gf = fract(g) - 0.5;
        float d = length(gf * vec2(1.0, 1.5));
        relief = smoothstep(0.52, 0.10, d);          /* domed centre */
        float seam = smoothstep(0.34, 0.52, d);      /* dark edge     */
        relief -= seam * 0.55;
        tint = (hash(gi) - 0.5) * 0.42;
        /* a coarser run of plates over the top, so the rows do not read as
           corduroy at a distance */
        vec2 pg = vec2(vUV.x * uScaleDens * 0.28, vUV.y * uScaleDens * 0.085);
        vec2 pf = fract(pg) - 0.5;
        float pd = length(pf * vec2(1.0, 1.9));
        relief += smoothstep(0.50, 0.16, pd) * 0.35 - smoothstep(0.30, 0.50, pd) * 0.28;
        tint += (hash(floor(pg) + 7.3) - 0.5) * 0.30;
      }
      /* Membrane: skin stretched thin, so it darkens toward the bone it
         hangs from and lets a little light through at the trailing edge.
         No painted veins — the finger bones are geometry already. */
      float thin = 0.0, mottle = 0.0;
      if (web) {
        thin = smoothstep(0.30, 1.0, vT);
        mottle = (hash(floor(vUV * 11.0)) - 0.5) * 0.22;
      }

      /* the belly is paler than the back on every one of them */
      float up = clamp(N.y * -0.5 + 0.5, 0.0, 1.0);
      vec3 base = web ? uMembrane * (0.55 + thin * 0.60) * (1.0 + mottle)
                      : mix(uHide, uBelly, up * 0.75) * (1.0 + tint);
      float shade = 1.0 + relief * 0.70;
      /* the thin outer half of the wing glows when it is between you and the
         light; the thick root does not */
      float thru = web ? pow(max(dot(-normalize(vN), normalize(vec3(-0.40, 0.82, 0.42))), 0.0), 1.8)
                         * 0.34 * thin : 0.0;

      /* ---- lighting ------------------------------------------------------
         A black dragon is black: almost nothing comes back off it diffusely.
         What you actually see of one is the highlight — so the specular does
         the work here, broken up per scale so the sheen crawls over the hide
         in hundreds of separate points rather than one plastic smear. */
      vec3 key  = normalize(vec3(-0.40, 0.82, 0.42));   /* cold sky */
      vec3 fill = normalize(vec3(0.70, -0.45, 0.50));   /* warm ground bounce */
      vec3 rim  = normalize(vec3(0.55, 0.30, -0.85));   /* behind and above */

      float d1 = max(dot(N, key), 0.0);
      float d2 = max(dot(N, fill), 0.0);
      float d3 = max(dot(N, rim), 0.0);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);

      vec3 Hv = normalize(key + V);
      float nh = max(dot(N, Hv), 0.0);
      float gloss = web ? 0.30 : (0.45 + relief * 1.25);
      float spec = pow(nh, web ? 26.0 : 62.0) * gloss
                 + pow(nh, 8.0) * 0.030 * gloss;

      vec3 SKY  = vec3(0.62, 0.72, 0.88);
      vec3 WARM = vec3(1.00, 0.55, 0.22);

      vec3 col = base * (SKY * d1 * (web ? 1.35 : 1.60) * shade
                        + WARM * d2 * (web ? 0.22 : 0.55)
                        + (web ? vec3(0.30, 0.32, 0.38) : vec3(0.11, 0.13, 0.17)))
               + SKY * spec * 1.25
               + WARM * uFireCol * d2 * uBreath * 0.85
               + WARM * thru * 0.80
               + mix(WARM, SKY, 0.45) * d3 * fres * (web ? 0.45 : 0.80);

      if (eye) col = uEye * (1.4 + uBreath * 1.2);

      col = pow(max(col, 0.0), vec3(1.05));
      gl_FragColor = vec4(col, 1.0);
    }`);
  if (!prog) return null;

  /* ------------------------------------------------------------- flight -- */

  /* Colours and proportions taken off the model sheets: Drogon black and red
     and the largest; Rhaegal bronze-green; Viserion as the Night King left
     him — pale, and lit from inside. */
  const FLIGHT = [
    { name: 'drogon',
      hide: [0.055, 0.040, 0.044], belly: [0.072, 0.056, 0.054],
      web:  [0.135, 0.048, 0.040], eye: [1.00, 0.42, 0.10], dens: 24.0,
      scale: 1.95, per: 29, y: -0.60, amp: 0.70, z: 2, flap: 1.55, phase: 0.0, lead: true },
    { name: 'rhaegal',
      hide: [0.072, 0.080, 0.044], belly: [0.094, 0.096, 0.058],
      web:  [0.098, 0.104, 0.058], eye: [0.85, 0.90, 0.25], dens: 22.0,
      scale: 1.20, per: 37, y: 3.30, amp: 0.55, z: -14, flap: 1.95, phase: 2.1 },
    { name: 'viserion',
      hide: [0.160, 0.184, 0.216], belly: [0.190, 0.214, 0.244],
      web:  [0.140, 0.166, 0.196], eye: [0.30, 0.80, 1.00], dens: 22.0,
      scale: 0.86, per: 47, y: -2.60, amp: 0.45, z: -24, flap: 2.25, phase: 4.3, back: true }
  ];

  const FIRE = [0.95, 0.42, 0.12];
  let W = 0, H = 0, t = 0;
  const muzzle = { x: 0, y: 0, dir: 1, on: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function project(proj, view, mat, p) {
    const w = [
      mat[0]*p[0] + mat[4]*p[1] + mat[8]*p[2]  + mat[12],
      mat[1]*p[0] + mat[5]*p[1] + mat[9]*p[2]  + mat[13],
      mat[2]*p[0] + mat[6]*p[1] + mat[10]*p[2] + mat[14], 1
    ];
    const v = M4.mul(proj, view);
    const c = [
      v[0]*w[0] + v[4]*w[1] + v[8]*w[2]  + v[12]*w[3],
      v[1]*w[0] + v[5]*w[1] + v[9]*w[2]  + v[13]*w[3],
      v[2]*w[0] + v[6]*w[1] + v[10]*w[2] + v[14]*w[3],
      v[3]*w[0] + v[7]*w[1] + v[11]*w[2] + v[15]*w[3]
    ];
    if (Math.abs(c[3]) < 1e-5) return null;
    return { x: (c[0] / c[3] * 0.5 + 0.5) * W, y: (1 - (c[1] / c[3] * 0.5 + 0.5)) * H };
  }

  const EYE_Z = 28;

  function step(dt) {
    if (!W) resize();
    if (!W || !H) return;
    t += dt;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const aspect = W / H;
    const proj = M4.perspective(0.62, aspect, 0.5, 300);
    const view = M4.lookAt([0, 0.6, EYE_Z], [0, 0.3, 0], [0, 1, 0]);

    gl.useProgram(prog);
    gl.uniformMatrix4fv(prog.u.uProj, false, proj);
    gl.uniformMatrix4fv(prog.u.uView, false, view);
    gl.uniform1f(prog.u.uTime, t);
    gl.uniform3fv(prog.u.uFireCol, FIRE);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos);
    gl.enableVertexAttribArray(prog.a.aPos);
    gl.vertexAttribPointer(prog.a.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nrm);
    gl.enableVertexAttribArray(prog.a.aNrm);
    gl.vertexAttribPointer(prog.a.aNrm, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uv);
    gl.enableVertexAttribArray(prog.a.aUV);
    gl.vertexAttribPointer(prog.a.aUV, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.rig);
    gl.enableVertexAttribArray(prog.a.aRig);
    gl.vertexAttribPointer(prog.a.aRig, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);

    const halfH = Math.tan(0.31) * EYE_Z;
    const span = halfH * aspect + 16;
    muzzle.on = 0;

    FLIGHT.forEach(f => {
      const u = ((t / f.per) + f.phase * 0.13) % 1;
      const dir = f.back ? -1 : 1;
      const x = dir > 0 ? -span + u * span * 2 : span - u * span * 2;
      const y = f.y + Math.sin(t * 0.42 + f.phase) * f.amp;
      const climb = Math.cos(t * 0.42 + f.phase) * f.amp * 0.42 / f.per * 8;
      const bank = Math.sin(t * 0.42 + f.phase * 1.3) * 0.24;

      let mat = M4.mul(M4.translate(x, y, f.z), M4.scale(f.scale * dir, f.scale, f.scale));
      mat = M4.mul(mat, M4.rotZ(climb * dir));
      mat = M4.mul(mat, M4.rotX(bank * dir));
      mat = M4.mul(mat, M4.rotY(-0.40 * dir + Math.sin(t * 0.2 + f.phase) * 0.10));

      let breath = 0;
      if (f.lead && u > 0.34 && u < 0.52) breath = Math.sin((u - 0.34) / 0.18 * Math.PI);

      gl.uniformMatrix4fv(prog.u.uModel, false, mat);
      gl.uniformMatrix4fv(prog.u.uNrmMat, false, M4.normalFrom(mat));
      gl.uniform1f(prog.u.uFlap, f.flap);
      gl.uniform1f(prog.u.uPhase, f.phase);
      gl.uniform1f(prog.u.uBreath, breath);
      gl.uniform1f(prog.u.uScaleDens, f.dens);
      gl.uniform3fv(prog.u.uHide, f.hide);
      gl.uniform3fv(prog.u.uBelly, f.belly);
      gl.uniform3fv(prog.u.uMembrane, f.web);
      gl.uniform3fv(prog.u.uEye, f.eye);
      gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);

      if (f.lead && breath > 0.05) {
        const p = project(proj, view, mat, [8.4, 1.5, 0]);
        if (p) { muzzle.x = p.x; muzzle.y = p.y; muzzle.dir = dir; muzzle.on = breath; }
      }
    });

    gl.disable(gl.BLEND);
  }

  return { step, resize, muzzle, verts: M.pos.length / 3, tris: M.idx.length / 3 };
}
