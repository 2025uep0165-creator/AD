/* ==========================================================================
   scene-hero.js — the clockwork astrolabe.
   A sun at the centre of a brass orrery: gears, armillary rings, and seven
   towers riding the outer band. Camera orbits; scroll dollies it back.
   ========================================================================== */

const HERO_VS = `
precision highp float;
attribute vec3 aPos;
attribute vec3 aNrm;
uniform mat4 uProj, uView, uModel, uNormal;
varying vec3 vPos, vNrm;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vPos = wp.xyz;
  vNrm = (uNormal * vec4(aNrm, 0.0)).xyz;
  gl_Position = uProj * uView * wp;
}`;

const HERO_FS = `
precision highp float;
varying vec3 vPos, vNrm;
uniform vec3 uCam, uBase, uSpec, uEmit;
uniform float uRough, uRim, uFogNear, uFogFar;

/* cheap studio environment: warm above, cold below, ember horizon */
vec3 env(vec3 d) {
  float up = d.y * 0.5 + 0.5;
  vec3 sky   = vec3(0.10, 0.09, 0.11);
  vec3 grnd  = vec3(0.02, 0.02, 0.03);
  vec3 band  = vec3(0.75, 0.36, 0.10) * pow(1.0 - abs(d.y), 8.0);
  return mix(grnd, sky, up) + band;
}

void main() {
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCam - vPos);
  if (dot(N, V) < 0.0) N = -N;

  /* the sun sits at the origin and is the only real light source */
  vec3 Ld = -vPos;
  float dist = length(Ld);
  vec3 L = Ld / max(dist, 0.001);
  float att = 14.0 / (1.0 + 0.55 * dist * dist);

  float diff = max(dot(N, L), 0.0) * att;
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), mix(120.0, 8.0, uRough)) * att;

  /* a second, dim fill so silhouettes never go fully black */
  float fill = max(dot(N, normalize(vec3(-0.4, 0.8, 0.5))), 0.0) * 0.22;

  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 refl = env(reflect(-V, N)) * (0.35 + fres * 1.4);

  vec3 lightCol = vec3(1.0, 0.62, 0.28);
  vec3 col = uBase * (0.05 + diff * 0.9 + fill)
           + uSpec * spec * 1.5
           + uBase * refl
           + vec3(1.0, 0.5, 0.2) * fres * uRim
           + uEmit;
  col *= lightCol * 0.55 + 0.55;

  float fog = clamp((length(uCam - vPos) - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  col = mix(col, vec3(0.0), fog * 0.92);

  gl_FragColor = vec4(col, 1.0);
}`;

/* The glowing core gets its own additive shader so it reads as light. */
const SUN_FS = `
precision highp float;
varying vec3 vPos, vNrm;
uniform vec3 uCam;
uniform float uTime;

float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                    mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                    mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
  return n;
}

void main() {
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCam - vPos);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.0);

  float n = noise(N * 4.0 + vec3(0.0, uTime * 0.25, uTime * 0.12));
  n = n * 0.6 + noise(N * 11.0 - vec3(uTime * 0.4, 0.0, 0.0)) * 0.4;

  vec3 hot  = vec3(1.0, 0.95, 0.72);
  vec3 mid  = vec3(1.0, 0.52, 0.12);
  vec3 cool = vec3(0.55, 0.10, 0.02);
  vec3 col = mix(cool, mid, smoothstep(0.25, 0.62, n));
  col = mix(col, hot, smoothstep(0.62, 0.92, n));
  col += vec3(1.0, 0.55, 0.2) * fres * 1.6;

  gl_FragColor = vec4(col, 1.0);
}`;

function HeroScene(canvas) {
  const gl = makeGL(canvas);
  if (!gl) return null;

  const prog = program(gl, HERO_VS, HERO_FS);
  const sunProg = program(gl, HERO_VS, SUN_FS);
  if (!prog || !sunProg) return null;

  /* ---------------------------------------------------------- geometry -- */

  const GOLD  = [0.72, 0.52, 0.18];
  const BRASS = [0.55, 0.40, 0.16];
  const STEEL = [0.34, 0.36, 0.40];
  const BONE  = [0.62, 0.58, 0.48];

  const meshes = {
    sun:    Geo.upload(gl, Geo.sphere(1.05, 40)),
    gearA:  Geo.upload(gl, Geo.gear(1.0, 2.35, 0.26, 18)),
    gearB:  Geo.upload(gl, Geo.gear(1.0, 3.9, 0.20, 30)),
    ringA:  Geo.upload(gl, Geo.ring(5.0, 5.5, 0.34, 96)),
    ringB:  Geo.upload(gl, Geo.ring(6.6, 6.9, 0.20, 96)),
    ringC:  Geo.upload(gl, Geo.ring(8.4, 9.1, 0.42, 110)),
    band:   Geo.upload(gl, Geo.ring(3.1, 3.35, 0.9, 80)),
    spoke:  Geo.upload(gl, Geo.box(0.16, 0.16, 3.2)),
    orb:    Geo.upload(gl, Geo.sphere(0.34, 18)),
    pin:    Geo.upload(gl, Geo.cyl(0.07, 0.07, 1.6, 10)),
    axle:   Geo.upload(gl, Geo.cyl(0.11, 0.11, 3.6, 10))
  };

  /* Seven castles for seven kingdoms, each a small cluster of towers. */
  function castle(seed) {
    const g = Geo.empty();
    const rnd = (i) => {
      const x = Math.sin(seed * 91.7 + i * 37.13) * 43758.5453;
      return x - Math.floor(x);
    };
    const keepH = 1.1 + rnd(0) * 0.9;
    Geo.merge(g, Geo.box(1.0, keepH, 1.0), M4.translate(0, keepH / 2, 0));
    Geo.merge(g, Geo.tower(0.30, keepH * 1.75, 8), M4.translate(0, 0, 0));
    const n = 3 + Math.floor(rnd(1) * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(i + 2) * 0.6;
      const r = 0.62 + rnd(i + 9) * 0.22;
      const h = 0.7 + rnd(i + 5) * 1.15;
      Geo.merge(g, Geo.tower(0.17 + rnd(i + 7) * 0.08, h, 6),
        M4.translate(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    /* curtain wall */
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2 + Math.PI / 4;
      const m = M4.mul(M4.rotY(-a), M4.translate(0.95, 0.22, 0));
      Geo.merge(g, Geo.box(0.12, 0.44, 1.3), m);
    }
    return g;
  }

  const castleMeshes = [];
  for (let i = 0; i < 7; i++) castleMeshes.push(Geo.upload(gl, castle(i + 1)));

  /* --------------------------------------------------------- draw list -- */

  const draws = [];
  const push = (mesh, base, spec, rough, rim, fn, emit) =>
    draws.push({ mesh, base, spec: spec || [1, 0.85, 0.6], rough: rough === undefined ? 0.35 : rough,
                 rim: rim === undefined ? 0.35 : rim, fn, emit: emit || [0, 0, 0] });

  /* Short central axle tucked inside the cogs — sells the machine, stays out
     of the composition. */
  push(meshes.axle, [0.20, 0.17, 0.13], [0.5, 0.4, 0.3], 0.8, 0.1,
    () => M4.translate(0, -0.6, 0));

  /* Two counter-rotating cogs stacked under the sun. */
  push(meshes.gearA, GOLD, [1, 0.9, 0.65], 0.18, 0.5,
    (t) => M4.mul(M4.translate(0, -0.05, 0), M4.rotY(t * 0.22)));
  push(meshes.gearB, BRASS, [1, 0.8, 0.5], 0.30, 0.4,
    (t) => M4.mul(M4.translate(0, -0.72, 0), M4.rotY(-t * 0.14)));

  /* The engraved band. */
  push(meshes.band, [0.42, 0.30, 0.12], [1, 0.85, 0.55], 0.25, 0.6,
    (t) => M4.mul(M4.translate(0, 0.55, 0), M4.rotY(t * 0.09)));

  /* Armillary rings, each tipped on a different axis. */
  push(meshes.ringA, GOLD, [1, 0.9, 0.7], 0.15, 0.7,
    (t) => M4.mul(M4.rotZ(0.42), M4.mul(M4.rotX(t * 0.10), M4.rotY(t * 0.06))));
  push(meshes.ringB, STEEL, [0.9, 0.95, 1.0], 0.12, 0.9,
    (t) => M4.mul(M4.rotX(1.05), M4.mul(M4.rotZ(-t * 0.13), M4.rotY(t * 0.05))));
  push(meshes.ringC, BRASS, [1, 0.85, 0.6], 0.28, 0.5,
    (t) => M4.mul(M4.rotZ(-0.24), M4.rotY(t * 0.045)));

  /* Spokes tying the inner cog to the outer band. */
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    push(meshes.spoke, [0.40, 0.30, 0.14], [1, 0.85, 0.6], 0.4, 0.35,
      (t) => M4.mul(M4.translate(0, 0.55, 0),
             M4.mul(M4.rotY(t * 0.09 + a), M4.translate(0, 0, 2.3))));
  }

  /* Orbiting bodies on the middle ring. */
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2, sp = 0.18 + i * 0.05;
    push(meshes.orb, i % 2 ? [0.50, 0.16, 0.06] : [0.30, 0.34, 0.40],
      [1, 0.9, 0.8], 0.1, 1.1,
      (t) => M4.mul(M4.rotX(1.05), M4.mul(M4.rotY(a + t * sp), M4.translate(6.75, 0, 0))));
  }

  /* Seven castles riding the outer ring, each on its own little pin. */
  castleMeshes.forEach((m, i) => {
    const a = i / 7 * Math.PI * 2;
    const scale = 0.62;
    push(meshes.pin, [0.35, 0.28, 0.14], [1, 0.85, 0.6], 0.5, 0.3,
      (t) => M4.mul(M4.rotZ(-0.24), M4.mul(M4.rotY(-t * 0.045 + a),
             M4.mul(M4.translate(8.75, 0.62, 0), M4.rotZ(0)))));
    push(m, BONE, [0.9, 0.85, 0.75], 0.65, 0.55,
      (t) => M4.mul(M4.rotZ(-0.24), M4.mul(M4.rotY(-t * 0.045 + a),
             M4.mul(M4.translate(8.75, 1.35, 0),
             M4.mul(M4.rotY(t * 0.3 + i), M4.scale(scale))))));
  });

  /* ------------------------------------------------------------ render -- */

  let W = 1, H = 1, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  const state = { pointerX: 0, pointerY: 0 };

  function render(t, scroll) {
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Scroll pulls the camera up and away; pointer adds a little parallax.
       The look-at sits below the orrery so the machine rides high in frame,
       leaving the lower third clear for the wordmark. */
    const s = scroll || 0;
    const orbit = t * 0.045 + state.pointerX * 0.35;

    /* Pull back far enough that the outer ring of castles fits. On a wide
       screen height binds; on a phone width does, so the aspect goes into
       the distance directly (capped, or a phone would push it into orbit). */
    const aspect = W / Math.max(H, 1);
    const RADIUS = 11.5, TAN_HALF_FOV = Math.tan(Math.PI / 9.6);
    const fit = RADIUS / (TAN_HALF_FOV * Math.min(aspect, 1.0));
    const dist = Math.max(33, Math.min(fit, 54)) + s * 18.0;
    const height = 7.6 + s * 10.0 + state.pointerY * 1.8;
    const eye = [Math.sin(orbit) * dist, height, Math.cos(orbit) * dist];
    const view = M4.lookAt(eye, [0, -2.4 + s * 2.0, 0], [0, 1, 0]);
    const proj = M4.perspective(Math.PI / 4.8, W / Math.max(H, 1), 0.5, 240);

    /* opaque brass first */
    gl.useProgram(prog);
    gl.uniformMatrix4fv(prog.u.uProj, false, proj);
    gl.uniformMatrix4fv(prog.u.uView, false, view);
    gl.uniform3fv(prog.u.uCam, eye);
    gl.uniform1f(prog.u.uFogNear, 26.0);
    gl.uniform1f(prog.u.uFogFar, 62.0 + s * 24.0);

    for (const d of draws) {
      const model = d.fn(t);
      gl.uniformMatrix4fv(prog.u.uModel, false, model);
      gl.uniformMatrix4fv(prog.u.uNormal, false, M4.normalFrom(model));
      gl.uniform3fv(prog.u.uBase, d.base);
      gl.uniform3fv(prog.u.uSpec, d.spec);
      gl.uniform3fv(prog.u.uEmit, d.emit);
      gl.uniform1f(prog.u.uRough, d.rough);
      gl.uniform1f(prog.u.uRim, d.rim);
      Geo.bind(gl, prog, d.mesh);
      gl.drawElements(gl.TRIANGLES, d.mesh.count, d.mesh.type, 0);
    }

    /* the core */
    gl.useProgram(sunProg);
    gl.uniformMatrix4fv(sunProg.u.uProj, false, proj);
    gl.uniformMatrix4fv(sunProg.u.uView, false, view);
    const sm = M4.scale(1.0 + Math.sin(t * 0.8) * 0.03);
    gl.uniformMatrix4fv(sunProg.u.uModel, false, sm);
    gl.uniformMatrix4fv(sunProg.u.uNormal, false, M4.normalFrom(sm));
    gl.uniform3fv(sunProg.u.uCam, eye);
    gl.uniform1f(sunProg.u.uTime, t);
    Geo.bind(gl, sunProg, meshes.sun);
    gl.drawElements(gl.TRIANGLES, meshes.sun.count, meshes.sun.type, 0);
  }

  return { render, resize, state, gl };
}
