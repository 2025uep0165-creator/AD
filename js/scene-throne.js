/* ==========================================================================
   scene-throne.js — the Iron Throne.

   A thousand swords surrendered to Aegon, beaten together by dragonfire.
   Here: ~200 procedural swords baked into a single mesh, each vertex tagged
   with its sword's base point so the whole chair can be melted down in the
   vertex shader as you scroll the final section.
   ========================================================================== */

const THRONE_VS = `
precision highp float;
attribute vec3 aPos;
attribute vec3 aNrm;
attribute vec4 aInfo;          /* xyz = sword base point, w = melt weight   */
uniform mat4 uProj, uView, uModel, uNormal;
uniform float uMelt, uTime;
varying vec3 vPos, vNrm;
varying float vMelt, vHeight, vStone;

void main() {
  /* a negative weight marks the stone dais: it never melts */
  vStone = step(aInfo.w, -0.5);
  float w = max(aInfo.w, 0.0);
  /* capped below 1 so the chair slumps into recognisable slag rather than
     disappearing into the floor entirely */
  float m = clamp(uMelt * w * 1.45, 0.0, 0.86);

  vec3 p = aPos;
  vec3 base = aInfo.xyz;

  /* each sword slumps down and spreads outward, the way metal actually runs */
  vec3 pooled = vec3(base.x * 1.18, -0.04 + base.y * 0.10, base.z * 1.18);
  p = mix(p, pooled, m * m);

  /* sag and run while it goes */
  p.y -= m * 0.55 * (0.3 + w);
  p.x += sin(aPos.y * 5.0 + uTime * 1.6 + base.x * 3.0) * 0.07 * m;
  p.z += cos(aPos.y * 4.2 + uTime * 1.3 + base.z * 3.0) * 0.07 * m;

  vMelt = m;
  vHeight = aPos.y;

  vec4 wp = uModel * vec4(p, 1.0);
  vPos = wp.xyz;
  vNrm = (uNormal * vec4(aNrm, 0.0)).xyz;
  gl_Position = uProj * uView * wp;
}`;

const THRONE_FS = `
precision highp float;
varying vec3 vPos, vNrm;
varying float vMelt, vHeight, vStone;
uniform vec3 uCam;
uniform float uTime, uMelt;

void main() {
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCam - vPos);
  if (dot(N, V) < 0.0) N = -N;

  /* cold key from high windows, warm fill from the torches on the walls */
  vec3 L1 = normalize(vec3(-0.55, 0.95, 0.45));
  vec3 L2 = normalize(vec3(0.75, 0.25, 0.6));

  float d1 = max(dot(N, L1), 0.0);
  float d2 = max(dot(N, L2), 0.0);

  vec3 cool = vec3(0.62, 0.72, 0.86);
  vec3 warm = vec3(1.00, 0.52, 0.20);

  /* blades are steel; the dais under them is dark, matte stone */
  vec3 steel = mix(vec3(0.30, 0.31, 0.35), vec3(0.075, 0.072, 0.080), vStone);

  vec3 H1 = normalize(L1 + V);
  float s1 = pow(max(dot(N, H1), 0.0), 64.0);
  vec3 H2 = normalize(L2 + V);
  float s2 = pow(max(dot(N, H2), 0.0), 26.0);

  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.2);

  /* glow rising from the floor: braziers when cold, molten steel when melting.
     Kept low so it warms the base without washing the whole chair orange. */
  float floorGlow = exp(-max(vPos.y + 1.0, 0.0) * 1.35);
  float shine = 1.0 - vStone * 0.75;   /* stone barely specs */

  vec3 col = steel * (0.16 + d1 * 0.95)
           + cool * s1 * 1.15 * shine
           + warm * d2 * 0.34
           + warm * s2 * 0.55 * shine
           + warm * floorGlow * (0.10 + uMelt * 0.45 * (1.0 - vStone))
           + cool * fres * 0.42 * shine;

  /* molten: the metal starts emitting from the inside out */
  float heat = vMelt;
  vec3 molten = mix(vec3(0.85, 0.16, 0.02), vec3(1.0, 0.86, 0.45),
                    clamp(heat * 1.2 - 0.15 + sin(vPos.y * 7.0 + uTime * 2.0) * 0.12, 0.0, 1.0));
  col = mix(col, molten, smoothstep(0.05, 0.90, heat) * 0.86);
  col += molten * heat * heat * 0.42;

  /* fade only the far edges into the dark of the hall — the camera sits
     about 17 units out, so the falloff has to start beyond that */
  float fog = clamp((length(uCam - vPos) - 19.0) / 14.0, 0.0, 1.0);
  col = mix(col, vec3(0.008, 0.009, 0.012), fog * 0.85);

  gl_FragColor = vec4(col, 1.0);
}`;

function ThroneScene(canvas) {
  const gl = makeGL(canvas);
  if (!gl) return null;
  const prog = program(gl, THRONE_VS, THRONE_FS);
  if (!prog) return null;

  /* -------------------------------------------------- one sword, reused -- */

  function swordMesh(len, wide) {
    const g = Geo.empty();
    const bw = 0.055 * wide, bt = 0.018 * wide;
    /* blade — a flat tapered bar with a point on the end */
    Geo.merge(g, Geo.box(bw * 2, len, bt * 2), M4.translate(0, len / 2, 0));
    Geo.merge(g, Geo.cyl(0.0, bw * 1.45, 0.18 * wide, 4),
      M4.mul(M4.translate(0, len + 0.07 * wide, 0), M4.rotY(0.785)));
    /* fuller ridge, so the blade catches a highlight down its centre */
    Geo.merge(g, Geo.box(bw * 0.5, len * 0.9, bt * 2.9),
      M4.translate(0, len * 0.47, 0));
    /* crossguard, grip, pommel */
    Geo.merge(g, Geo.box(bw * 5.2, 0.05 * wide, bt * 2.6), M4.translate(0, -0.02, 0));
    Geo.merge(g, Geo.cyl(0.035 * wide, 0.04 * wide, 0.20 * wide, 8),
      M4.translate(0, -0.13 * wide, 0));
    Geo.merge(g, Geo.sphere(0.052 * wide, 10), M4.translate(0, -0.25 * wide, 0));
    return g;
  }

  /* ------------------------------------------------ assemble the throne -- */

  const big = Geo.empty();
  const info = [];

  let seed = 1337;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  function addSword(mat, base, meltW, len, wide) {
    const before = big.pos.length / 3;
    Geo.merge(big, swordMesh(len, wide), mat);
    const after = big.pos.length / 3;
    for (let v = before; v < after; v++) info.push(base[0], base[1], base[2], meltW);
  }

  function addBlock(mesh, mat, meltW) {
    const before = big.pos.length / 3;
    Geo.merge(big, mesh, mat);
    const after = big.pos.length / 3;
    for (let v = before; v < after; v++) info.push(0, 0, 0, meltW || 0);
  }

  /* dais: three steps of dark stone, marked -1 so they never melt */
  for (let i = 0; i < 3; i++) {
    const w = 5.0 - i * 0.85, d = 3.6 - i * 0.65, h = 0.24;
    addBlock(Geo.box(w, h, d), M4.translate(0, -1.20 + i * h, 0.30 - i * 0.08), -1);
  }

  /* the seat itself — a slab of hammered blades, kept shallow so the fan
     behind it reads instead of a bright flat top face */
  addBlock(Geo.box(2.9, 0.20, 1.4), M4.translate(0, -0.06, 0.28), 0.85);
  for (let i = 0; i < 11; i++) {
    const x = -1.1 + (i / 10) * 2.2;
    addSword(M4.mul(M4.translate(x, 0.14, 0.28), M4.rotX(1.5708 + (rnd() - 0.5) * 0.1)),
      [x, 0.14, 0.28], 0.55, 0.85 + rnd() * 0.2, 0.85);
  }

  /* The back: rows of blades fanning up and OUT. The real chair is a wall of
     steel far wider at the top than at the seat, so the half-width more than
     doubles on the way up while the rows stay tightly stacked. */
  const ROWS = 12;
  for (let r = 0; r < ROWS; r++) {
    const rt = r / (ROWS - 1);
    const count = 11 + Math.round(rt * 4);
    const y = 0.05 + r * 0.30;
    const halfW = 1.45 + rt * 1.75;
    for (let j = 0; j < count; j++) {
      const u = count === 1 ? 0 : (j / (count - 1)) * 2 - 1;
      const x = u * halfW;
      const z = -0.60 - rt * 0.30 + Math.abs(u) * 0.30;
      const lean = -0.10 - rt * 0.16 + (rnd() - 0.5) * 0.09;      /* tips back  */
      const splay = u * (0.10 + rt * 0.55) + (rnd() - 0.5) * 0.12; /* fans out   */
      const len = 0.80 + rnd() * 0.80 + rt * 0.70;
      const wide = 0.8 + rnd() * 0.55;
      const mat = M4.mul(M4.translate(x, y, z),
                  M4.mul(M4.rotZ(-splay), M4.mul(M4.rotX(lean), M4.rotY(rnd() * 3.14))));
      addSword(mat, [x, y, z], 0.55 + rt * 0.45, len, wide);
    }
  }

  /* crown of long blades over the top */
  for (let j = 0; j < 13; j++) {
    const u = (j / 12) * 2 - 1;
    const x = u * 3.05;
    const y = 0.05 + ROWS * 0.30;
    const z = -0.92 + Math.abs(u) * 0.30;
    const mat = M4.mul(M4.translate(x, y, z),
                M4.mul(M4.rotZ(-u * 0.62), M4.rotX(-0.32 + (rnd() - 0.5) * 0.2)));
    addSword(mat, [x, y, z], 1.0, 1.4 + rnd() * 1.0, 0.9 + rnd() * 0.5);
  }

  /* arms: blades laid across, points outward */
  [-1, 1].forEach(side => {
    for (let k = 0; k < 7; k++) {
      const y = 0.55 + k * 0.14;
      const z = 0.55 - k * 0.16;
      const x = side * (1.45 + k * 0.05);
      const mat = M4.mul(M4.translate(x, y, z),
                  M4.mul(M4.rotZ(side * (1.35 - k * 0.05)), M4.rotX((rnd() - 0.5) * 0.3)));
      addSword(mat, [x, y, z], 0.7, 0.7 + rnd() * 0.55, 0.8 + rnd() * 0.4);
    }
  });

  /* a few blades jutting off the front lip of the seat */
  for (let j = 0; j < 8; j++) {
    const x = -1.15 + (j / 7) * 2.3;
    const mat = M4.mul(M4.translate(x, -0.10, 0.92),
                M4.mul(M4.rotX(2.30 + (rnd() - 0.5) * 0.4), M4.rotZ((rnd() - 0.5) * 0.4)));
    addSword(mat, [x, -0.10, 0.92], 0.6, 0.40 + rnd() * 0.35, 0.75);
  }

  /* --------------------------------------------------------- upload it -- */

  const mesh = Geo.upload(gl, big);
  const infoBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, infoBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(info), gl.STATIC_DRAW);

  let W = 1, H = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  const state = { melt: 0, pointerX: 0, pointerY: 0, spin: 0 };

  function render(t) {
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);

    const ang = state.spin + state.pointerX * 0.5 + Math.sin(t * 0.09) * 0.12;
    /* The chair stands about 7.8 units tall and 6.4 wide, so fit it from the
       aspect: height binds on a wide screen, width binds on a phone. */
    const aspect = W / Math.max(H, 1);
    const fit = 5.6 / (Math.tan(Math.PI / 10) * Math.min(aspect, 1.0));
    const dist = Math.max(17, Math.min(fit, 32)) - state.melt * 4.0;
    const eye = [Math.sin(ang) * dist, 5.0 + state.pointerY * 1.2 - state.melt * 2.6,
                 Math.cos(ang) * dist];
    const view = M4.lookAt(eye, [0, 2.8 - state.melt * 2.5, 0], [0, 1, 0]);
    const proj = M4.perspective(Math.PI / 5.0, W / Math.max(H, 1), 0.1, 100);
    const model = M4.ident();

    gl.uniformMatrix4fv(prog.u.uProj, false, proj);
    gl.uniformMatrix4fv(prog.u.uView, false, view);
    gl.uniformMatrix4fv(prog.u.uModel, false, model);
    gl.uniformMatrix4fv(prog.u.uNormal, false, M4.normalFrom(model));
    gl.uniform3fv(prog.u.uCam, eye);
    gl.uniform1f(prog.u.uTime, t);
    gl.uniform1f(prog.u.uMelt, state.melt);

    Geo.bind(gl, prog, mesh);
    gl.bindBuffer(gl.ARRAY_BUFFER, infoBuf);
    gl.enableVertexAttribArray(prog.a.aInfo);
    gl.vertexAttribPointer(prog.a.aInfo, 4, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
  }

  return { render, resize, state, swords: info.length / 4 };
}
