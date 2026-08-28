/* ==========================================================================
   scene-dragons.js — three dragons as actual geometry.

   The mesh is built once on the CPU: a tapered ribcage, a segmented neck and
   tail, a skull with jaw and horns, folded hind legs, and a wing built the way
   a bat's is — humerus, forearm, four fingers, and membrane panels stretched
   between them.

   Nothing is animated on the CPU. Every vertex carries a rig attribute

       aRig = (part, t, side, seg)

         part  0 body · 1 wing · 2 tail · 3 neck · 4 jaw
         t     0..1 along that part, from its root
         side  -1 / +1, which wing
         seg   index down the tail, for the travelling wave

   and the vertex shader flaps, sways and banks from that. One draw call per
   dragon, three dragons, no skinning matrices.
   ========================================================================== */

function DragonGL(canvas) {
  const gl = makeGL(canvas);
  if (!gl) return null;

  /* ---------------------------------------------------------------- mesh -- */

  /* Geo.merge only carries pos/nrm/idx, so this wraps it and tags every vertex
     it appended with rig values. `rig` is either four constants for the whole
     piece, or a function of the source vertex — which is what a long bone needs,
     because a bone whose ends carry different rig t has to bend with the
     membrane stretched between them rather than shear out through it. */
  function part(dst, src, mat, rig) {
    const before = dst.pos.length / 3;
    Geo.merge(dst, src, mat || M4.ident());
    const after = dst.pos.length / 3;
    const fn = typeof rig === 'function';
    for (let i = before; i < after; i++) {
      const j = (i - before) * 3;
      const r = fn ? rig(src.pos[j], src.pos[j+1], src.pos[j+2]) : rig;
      dst.rig.push(r[0], r[1], r[2], r[3]);
    }
    return dst;
  }

  /* Flat n-gons for the wing membrane, which is a surface rather than a solid.
     The normal comes from the first three corners; the fragment shader flips it
     toward the viewer, so which way round they are wound does not matter. */
  function face(pts) {
    const [a, b, c] = pts;
    const u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
    const v = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
    let nx = u[1]*v[2] - u[2]*v[1],
        ny = u[2]*v[0] - u[0]*v[2],
        nz = u[0]*v[1] - u[1]*v[0];
    const l = Math.hypot(nx, ny, nz) || 1; nx/=l; ny/=l; nz/=l;
    const pos = [], nrm = [], idx = [];
    pts.forEach(q => { pos.push(q[0], q[1], q[2]); nrm.push(nx, ny, nz); });
    for (let i = 1; i < pts.length - 1; i++) idx.push(0, i, i + 1);
    return { pos, nrm, idx };
  }

  const ell = (rx, ry, rz, seg) =>
    Geo.merge(Geo.empty(), Geo.sphere(1, seg || 14), M4.scale(rx, ry, rz));

  /* A tapered bone running from a to b. Geo.cyl is built along +Y, so this
     works out the rotation that carries +Y onto the bone's direction:
     rotZ tips it away from vertical, rotY swings it round. */
  function bone(m, a, b, r0, r1, side, tA, tB) {
    const dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2];
    const len = Math.hypot(dx, dy, dz) || 1e-4;
    const ux = dx/len, uy = dy/len, uz = dz/len;
    const h  = Math.hypot(ux, uz);
    const za = Math.atan2(h, uy);
    const ya = h > 1e-5 ? Math.atan2(uz, -ux) : 0;
    const mat = M4.mul(M4.mul(
      M4.translate((a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2),
      M4.rotY(ya)), M4.rotZ(za));
    /* Geo.cyl runs along +Y: local +h/2 is the b end, -h/2 is the a end */
    part(m, Geo.cyl(r1, r0, len, 6), mat,
         (x, y) => [1, tA + (tB - tA) * (y / len + 0.5), side, 0]);
  }

  /* One wing, laid out spanwise along ±Z: humerus, forearm, four fingers, and
     the membrane panels stretched between them and back to the flank. Rig t
     runs 0 at the flank to 1 at the finger tips, so the shader can flap the
     whole surface about the shoulder with the tip travelling furthest. */
  function wing(m, side) {
    const z = v => v * side;
    const A  = [-1.15, 0.06, z(0.26)];   /* flank anchor, behind the shoulder */
    const S  = [ 0.30, 0.42, z(0.32)];   /* shoulder  */
    const E  = [-0.35, 1.02, z(1.70)];   /* elbow, swept back and up */
    const R  = [ 0.75, 1.12, z(3.30)];   /* wrist, forward again */
    const F  = [                          /* four fingers fanning back */
      [ 2.15, 0.96, z(5.10)],
      [ 0.40, 0.76, z(5.60)],
      [-1.45, 0.44, z(5.15)],
      [-3.10, 0.10, z(4.05)]
    ];

    const T = { A: 0.0, S: 0.08, E: 0.36, R: 0.64, F: 1.0 };

    bone(m, S, E, 0.17, 0.125, side, T.S, T.E);
    bone(m, E, R, 0.125, 0.085, side, T.E, T.R);
    F.forEach((tp, i) => bone(m, R, tp, 0.075 - i * 0.009, 0.016, side, T.R, T.F));

    /* membrane */
    const skin = (pts, ts) => {
      const before = m.pos.length / 3;
      Geo.merge(m, face(pts), M4.ident());
      const added = m.pos.length / 3 - before;
      for (let i = 0; i < added; i++) m.rig.push(1, ts[i], side, 0);
    };

    /* Between two fingers the trailing edge sags inward rather than running
       straight, which is most of what makes a wing read as a wing. */
    const scallop = (root, a, b, tRoot, depth) => {
      const mid = [(a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2];
      const pull = [mid[0] + (root[0]-mid[0]) * depth,
                    mid[1] + (root[1]-mid[1]) * depth,
                    mid[2] + (root[2]-mid[2]) * depth];
      skin([root, a, pull], [tRoot, T.F, T.F - depth * 0.35]);
      skin([root, pull, b], [tRoot, T.F - depth * 0.35, T.F]);
    };

    skin([S, E, R], [T.S, T.E, T.R]);                       /* elbow web  */
    for (let i = 0; i < F.length - 1; i++) scallop(R, F[i], F[i + 1], T.R, 0.17);
    /* main sheet, its trailing edge sagging back toward the flank */
    scallop(S, R, F[3], T.S, 0.0);
    skin([S, R, F[3], A], [T.S, T.R, T.F, T.A]);
  }

  function build() {
    const m = Geo.empty(); m.rig = [];

    /* ribcage and hips */
    part(m, ell(1.35, 0.62, 0.60, 18), M4.translate(0.05, 0, 0), [0, 0, 0, 0]);
    part(m, ell(0.72, 0.50, 0.48, 14), M4.translate(-1.05, -0.06, 0), [0, 0, 0, 0]);
    /* keel down the chest */
    part(m, ell(0.85, 0.30, 0.14, 10), M4.translate(0.45, -0.48, 0), [0, 0, 0, 0]);
    /* shoulder blocks so the wings have something to leave from */
    [1, -1].forEach(s =>
      part(m, ell(0.42, 0.34, 0.26, 10), M4.translate(0.25, 0.26, 0.34 * s), [0, 0, 0, 0]));

    /* neck: eight segments arcing up and forward */
    const NECK = 8;
    for (let i = 0; i < NECK; i++) {
      const t = i / (NECK - 1);
      const x = 1.15 + t * 1.95;
      const y = 0.18 + Math.sin(t * 1.5) * 0.72;
      const r = 0.34 - t * 0.16;
      part(m, ell(r * 1.15, r, r, 10), M4.translate(x, y, 0), [3, t, 0, 0]);
    }

    /* skull */
    const HX = 3.34, HY = 1.02;
    part(m, ell(0.44, 0.24, 0.24, 12), M4.translate(HX, HY, 0), [3, 1, 0, 0]);
    part(m, ell(0.34, 0.13, 0.14, 10), M4.translate(HX + 0.52, HY - 0.02, 0), [3, 1, 0, 0]);
    /* lower jaw, hinged so it can drop when the dragon breathes */
    part(m, ell(0.40, 0.09, 0.13, 10), M4.translate(HX + 0.44, HY - 0.16, 0), [4, 1, 0, 0]);
    /* brow horns and the crest running back over the skull */
    [1, -1].forEach(s => {
      part(m, Geo.cyl(0.012, 0.055, 0.62, 6),
        M4.mul(M4.mul(M4.translate(HX - 0.16, HY + 0.30, 0.14 * s), M4.rotZ(-0.55)),
               M4.rotX(0.35 * s)), [3, 1, 0, 0]);
      part(m, Geo.cyl(0.010, 0.040, 0.42, 6),
        M4.mul(M4.mul(M4.translate(HX - 0.34, HY + 0.24, 0.19 * s), M4.rotZ(-0.15)),
               M4.rotX(0.55 * s)), [3, 1, 0, 0]);
    });

    /* spine crest: a row of flat plates from the shoulders to the tail tip */
    for (let i = 0; i < 22; i++) {
      const t = i / 21;
      const x = 0.95 - t * 5.4;
      const y = 0.52 - t * 0.30 - Math.max(0, t - 0.7) * 0.5;
      const h = 0.30 * (1 - t * 0.75);
      const isTail = x < -1.0;
      part(m, Geo.box(0.10, h, 0.05), M4.translate(x, y + h / 2, 0),
           isTail ? [2, (-1.0 - x) / 4.6, 0, i] : [0, 0, 0, 0]);
    }

    /* tail: twelve tapering segments */
    const TAIL = 12;
    for (let i = 0; i < TAIL; i++) {
      const t = i / (TAIL - 1);
      const x = -1.55 - t * 4.4;
      const y = -0.10 - t * 0.30;
      const r = 0.42 * (1 - t * 0.93) + 0.02;
      part(m, ell(r * 1.3, r, r, 9), M4.translate(x, y, 0), [2, t, 0, i]);
    }
    /* the spade on the end */
    part(m, Geo.box(0.55, 0.03, 0.30), M4.translate(-6.15, -0.42, 0), [2, 1, 0, TAIL]);

    /* hind legs, tucked up the way a flying dragon carries them */
    [1, -1].forEach(s => {
      part(m, ell(0.30, 0.22, 0.20, 9), M4.translate(-0.85, -0.34, 0.34 * s), [0, 0, 0, 0]);
      part(m, Geo.cyl(0.09, 0.13, 0.66, 7),
        M4.mul(M4.translate(-1.15, -0.60, 0.36 * s), M4.rotZ(0.75)), [0, 0, 0, 0]);
      part(m, Geo.cyl(0.06, 0.09, 0.52, 7),
        M4.mul(M4.translate(-1.48, -0.86, 0.34 * s), M4.rotZ(-0.5)), [0, 0, 0, 0]);
      /* three toes */
      for (let k = -1; k <= 1; k++) {
        part(m, Geo.cyl(0.012, 0.045, 0.26, 5),
          M4.mul(M4.mul(M4.translate(-1.66, -1.05, 0.34 * s + k * 0.09), M4.rotZ(-0.2)),
                 M4.rotX(k * 0.3)), [0, 0, 0, 0]);
      }
    });

    wing(m, 1);
    wing(m, -1);
    return m;
  }

  const raw = build();

  const mesh = Geo.upload(gl, raw);
  const rigBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rigBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(raw.rig), gl.STATIC_DRAW);

  /* -------------------------------------------------------------- shader -- */

  const prog = program(gl, `
    attribute vec3 aPos;
    attribute vec3 aNrm;
    attribute vec4 aRig;

    uniform mat4 uProj, uView, uModel, uNrmMat;
    uniform float uTime, uFlap, uPhase, uBreath;

    varying vec3 vN, vW;
    varying float vPart, vT;

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
        /* wing — rotate about the shoulder line, tip travelling furthest,
           with the outer half lagging so the membrane whips */
        float lag  = beat - t * 0.85;
        /* biased so the powerful downstroke is quicker than the recovery, and
           capped well short of vertical */
        float sw   = sin(lag);
        float ang  = (sw > 0.0 ? sw * 0.52 : sw * 0.68) * (0.22 + t * 0.78) + 0.10;
        vec3  q    = p - vec3(0.25, 0.30, 0.0);
        vec2  yz   = vec2(q.y, q.z * side);
        rot(yz, ang);
        q.y = yz.x; q.z = yz.y * side;
        /* a permanent camber, plus a ripple running out along the membrane */
        q.y -= t * t * 0.30;
        q.y += sin(lag * 2.0 - t * 5.0) * 0.06 * t * t;
        p = q + vec3(0.25, 0.30, 0.0);

        vec2 nyz = vec2(n.y, n.z * side);
        rot(nyz, ang);
        n.y = nyz.x; n.z = nyz.y * side;

      } else if (part > 1.5 && part < 2.5) {
        /* tail — a wave travelling from the hips out to the spade */
        float w = sin(uTime * 1.7 + uPhase - t * 2.6);
        p.z += w * 0.85 * t * t;
        p.y += sin(uTime * 1.15 + uPhase - t * 2.0) * 0.30 * t * t;

      } else if (part > 2.5 && part < 3.5) {
        /* neck — slow lift and turn, so the head is never quite still */
        p.y += sin(uTime * 0.75 + uPhase) * 0.16 * t;
        p.z += sin(uTime * 0.55 + uPhase * 1.7) * 0.30 * t;
        p.y += uBreath * 0.10 * t;

      } else if (part > 3.5) {
        /* jaw — drops open on the breath */
        vec3 q = p - vec3(3.10, 1.02, 0.0);
        vec2 xy = vec2(q.x, q.y);
        rot(xy, -uBreath * 0.42);
        q.x = xy.x; q.y = xy.y;
        p = q + vec3(3.10, 1.02, 0.0);
        p.y += sin(uTime * 0.75 + uPhase) * 0.16;
        p.z += sin(uTime * 0.55 + uPhase * 1.7) * 0.30;
      }

      vec4 world = uModel * vec4(p, 1.0);
      vW = world.xyz;
      vN = mat3(uNrmMat) * n;
      vPart = part; vT = t;
      gl_Position = uProj * uView * world;
    }`, `
    precision highp float;
    varying vec3 vN, vW;
    varying float vPart, vT;
    uniform vec3 uHide, uMembrane, uFireCol;
    uniform float uBreath, uFade;

    void main() {
      vec3 N = normalize(vN);
      if (!gl_FrontFacing) N = -N;           /* the membrane is a single sheet */

      vec3 V = normalize(vec3(0.0, 0.6, 21.0) - vW);
      vec3 key  = normalize(vec3(-0.55, 0.85, 0.35));   /* cold sky above */
      vec3 fill = normalize(vec3(0.7, -0.55, 0.5));     /* fire from below */

      float d1 = max(dot(N, key), 0.0);
      float d2 = max(dot(N, fill), 0.0);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

      bool web = vPart > 0.5 && vPart < 1.5 && vT > 0.55;
      vec3 base = web ? uMembrane : uHide;

      /* the membrane is thin: light comes through it from behind */
      float thru = web ? pow(max(dot(-N, key), 0.0), 2.2) * 0.13 : 0.0;

      vec3 col = base * (0.14 + d1 * 1.35)
               + vec3(0.32, 0.40, 0.52) * d1 * 0.11
               + uFireCol * d2 * (0.10 + uBreath * 0.55)
               + uFireCol * thru
               + vec3(0.60, 0.67, 0.78) * fres * 0.28;

      /* held back so they read as shapes against the sky, not toys */
      col = pow(max(col, 0.0), vec3(1.06));
      gl_FragColor = vec4(col * uFade, uFade);
    }`);
  if (!prog) return null;

  /* ------------------------------------------------------------- flight -- */

  /* Drogon leads, low and close enough to fill the frame; Rhaegal rides high
     and behind him; Viserion crosses the other way, further out. */
  const FLIGHT = [
    { hide: [0.150, 0.112, 0.120], web: [0.245, 0.085, 0.076],
      scale: 1.80, per: 23, y: -0.35, amp: 0.80, z: 3, flap: 1.85, phase: 0.0, lead: true },
    { hide: [0.115, 0.150, 0.102], web: [0.140, 0.185, 0.112],
      scale: 0.92, per: 29, y: 3.45, amp: 0.62, z: -10, flap: 2.35, phase: 2.1 },
    { hide: [0.190, 0.180, 0.150], web: [0.225, 0.205, 0.160],
      scale: 0.56, per: 37, y: 1.60, amp: 0.50, z: -19, flap: 2.75, phase: 4.3, back: true }
  ];

  const FIRE = [0.95, 0.42, 0.12];
  let W = 0, H = 0, t = 0;
  const model = M4.ident();
  /* where the lead dragon's mouth ended up on screen, for the flame plume */
  const muzzle = { x: 0, y: 0, dir: 1, on: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /* the same transform the shader uses, run once on the CPU so the 2D flame
     canvas knows where the jaw is */
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

  function step(dt) {
    if (!W) resize();
    if (!W || !H) return;
    t += dt;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);                /* the membrane has two sides */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const aspect = W / H;
    const proj = M4.perspective(0.62, aspect, 0.5, 200);
    const view = M4.lookAt([0, 0.6, 21], [0, 0.2, 0], [0, 1, 0]);

    gl.useProgram(prog);
    gl.uniformMatrix4fv(prog.u.uProj, false, proj);
    gl.uniformMatrix4fv(prog.u.uView, false, view);
    gl.uniform1f(prog.u.uTime, t);
    gl.uniform3fv(prog.u.uFireCol, FIRE);
    Geo.bind(gl, prog, mesh);
    gl.bindBuffer(gl.ARRAY_BUFFER, rigBuf);
    gl.enableVertexAttribArray(prog.a.aRig);
    gl.vertexAttribPointer(prog.a.aRig, 4, gl.FLOAT, false, 0, 0);

    /* How far a dragon travels before it wraps. Derived from the frustum, so
       it clears the frame by roughly its own length and no more — a wider path
       than this leaves the sky empty most of the time. */
    const halfH = Math.tan(0.31) * 21;
    const span  = halfH * aspect + 9;

    muzzle.on = 0;

    FLIGHT.forEach(f => {
      const u = ((t / f.per) + f.phase * 0.13) % 1;
      const dir = f.back ? -1 : 1;
      const x = dir > 0 ? -span + u * span * 2 : span - u * span * 2;
      const y = f.y + Math.sin(t * 0.42 + f.phase) * f.amp;

      /* a lazy bank into the drift, and a nose-up as it climbs */
      const climb = Math.cos(t * 0.42 + f.phase) * f.amp * 0.42 / f.per * 8;
      const bank = Math.sin(t * 0.42 + f.phase * 1.3) * 0.26;

      let mat = M4.mul(M4.translate(x, y, f.z), M4.scale(f.scale * dir, f.scale, f.scale));
      mat = M4.mul(mat, M4.rotZ(climb * dir));
      mat = M4.mul(mat, M4.rotX(bank * dir));
      /* turn the whole animal a little off the screen plane so it is never
         a flat side-on silhouette */
      mat = M4.mul(mat, M4.rotY(-0.42 * dir + Math.sin(t * 0.2 + f.phase) * 0.10));

      /* the lead dragon breathes twice a circuit, on the way past */
      /* one long breath per pass, timed for the middle of the frame */
      let breath = 0;
      if (f.lead && u > 0.34 && u < 0.52) {
        breath = Math.sin((u - 0.34) / 0.18 * Math.PI);
      }

      gl.uniformMatrix4fv(prog.u.uModel, false, mat);
      gl.uniformMatrix4fv(prog.u.uNrmMat, false, M4.normalFrom(mat));
      gl.uniform1f(prog.u.uFlap, f.flap);
      gl.uniform1f(prog.u.uPhase, f.phase);
      gl.uniform1f(prog.u.uBreath, breath);
      gl.uniform1f(prog.u.uFade, 1);
      gl.uniform3fv(prog.u.uHide, f.hide);
      gl.uniform3fv(prog.u.uMembrane, f.web);
      gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);

      if (f.lead && breath > 0.05) {
        const p = project(proj, view, mat, [3.9, 0.95, 0]);
        if (p) { muzzle.x = p.x; muzzle.y = p.y; muzzle.dir = dir; muzzle.on = breath; }
      }
    });

    gl.disable(gl.BLEND);
  }

  return { step, resize, muzzle };
}
