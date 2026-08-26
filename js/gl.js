/* ==========================================================================
   gl.js — a very small WebGL helper: 4x4 math, shader plumbing and a handful
   of procedural meshes. No three.js, no CDN, ~everything the scenes need.
   ========================================================================== */

const M4 = {
  ident: () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),

  mul(a, b, out) {
    out = out || new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      const b0 = b[c*4], b1 = b[c*4+1], b2 = b[c*4+2], b3 = b[c*4+3];
      out[c*4]   = a[0]*b0 + a[4]*b1 + a[8]*b2  + a[12]*b3;
      out[c*4+1] = a[1]*b0 + a[5]*b1 + a[9]*b2  + a[13]*b3;
      out[c*4+2] = a[2]*b0 + a[6]*b1 + a[10]*b2 + a[14]*b3;
      out[c*4+3] = a[3]*b0 + a[7]*b1 + a[11]*b2 + a[15]*b3;
    }
    return out;
  },

  perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([
      f/aspect,0,0,0,  0,f,0,0,  0,0,(far+near)*nf,-1,  0,0,2*far*near*nf,0
    ]);
  },

  lookAt(eye, center, up) {
    let z0 = eye[0]-center[0], z1 = eye[1]-center[1], z2 = eye[2]-center[2];
    let len = Math.hypot(z0,z1,z2) || 1; z0/=len; z1/=len; z2/=len;
    let x0 = up[1]*z2 - up[2]*z1, x1 = up[2]*z0 - up[0]*z2, x2 = up[0]*z1 - up[1]*z0;
    len = Math.hypot(x0,x1,x2) || 1; x0/=len; x1/=len; x2/=len;
    const y0 = z1*x2 - z2*x1, y1 = z2*x0 - z0*x2, y2 = z0*x1 - z1*x0;
    return new Float32Array([
      x0,y0,z0,0, x1,y1,z1,0, x2,y2,z2,0,
      -(x0*eye[0]+x1*eye[1]+x2*eye[2]),
      -(y0*eye[0]+y1*eye[1]+y2*eye[2]),
      -(z0*eye[0]+z1*eye[1]+z2*eye[2]), 1
    ]);
  },

  translate(x, y, z) {
    const m = M4.ident(); m[12]=x; m[13]=y; m[14]=z; return m;
  },
  scale(x, y, z) {
    if (y === undefined) { y = x; z = x; }
    const m = M4.ident(); m[0]=x; m[5]=y; m[10]=z; return m;
  },
  rotX(a) { const c=Math.cos(a), s=Math.sin(a), m=M4.ident();
    m[5]=c; m[6]=s; m[9]=-s; m[10]=c; return m; },
  rotY(a) { const c=Math.cos(a), s=Math.sin(a), m=M4.ident();
    m[0]=c; m[2]=-s; m[8]=s; m[10]=c; return m; },
  rotZ(a) { const c=Math.cos(a), s=Math.sin(a), m=M4.ident();
    m[0]=c; m[1]=s; m[4]=-s; m[5]=c; return m; },

  /* Inverse-transpose of the upper 3x3, packed as a mat4 for the normal matrix. */
  normalFrom(m) {
    const a00=m[0],a01=m[1],a02=m[2], a10=m[4],a11=m[5],a12=m[6], a20=m[8],a21=m[9],a22=m[10];
    const b01 =  a22*a11 - a12*a21, b11 = -a22*a10 + a12*a20, b21 =  a21*a10 - a11*a20;
    let det = a00*b01 + a01*b11 + a02*b21;
    const o = M4.ident();
    if (!det) return o;
    det = 1/det;
    o[0]=b01*det;                    o[1]=(-a22*a01 + a02*a21)*det;  o[2]=(a12*a01 - a02*a11)*det;
    o[4]=b11*det;                    o[5]=(a22*a00 - a02*a20)*det;   o[6]=(-a12*a00 + a02*a10)*det;
    o[8]=b21*det;                    o[9]=(-a21*a00 + a01*a20)*det;  o[10]=(a11*a00 - a01*a10)*det;
    return o;
  }
};

/* ---------------------------------------------------------------- shaders -- */

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('shader:', gl.getShaderInfoLog(s), src);
    return null;
  }
  return s;
}

function program(gl, vsSrc, fsSrc) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn('link:', gl.getProgramInfoLog(p)); return null;
  }
  /* Cache every uniform and attribute location up front. */
  p.u = {}; p.a = {};
  const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nu; i++) {
    const info = gl.getActiveUniform(p, i);
    p.u[info.name.replace('[0]','')] = gl.getUniformLocation(p, info.name);
  }
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) {
    const info = gl.getActiveAttrib(p, i);
    p.a[info.name] = gl.getAttribLocation(p, info.name);
  }
  return p;
}

/* ----------------------------------------------------------------- meshes -- */
/* A mesh is { pos:[], nrm:[], idx:[] } in plain arrays until uploaded. */

const Geo = {
  empty: () => ({ pos: [], nrm: [], idx: [] }),

  /* Append `src` into `dst`, transformed by a 4x4. */
  merge(dst, src, mat) {
    const base = dst.pos.length / 3;
    const nm = mat ? M4.normalFrom(mat) : null;
    for (let i = 0; i < src.pos.length; i += 3) {
      const x = src.pos[i], y = src.pos[i+1], z = src.pos[i+2];
      if (mat) {
        dst.pos.push(mat[0]*x + mat[4]*y + mat[8]*z  + mat[12],
                     mat[1]*x + mat[5]*y + mat[9]*z  + mat[13],
                     mat[2]*x + mat[6]*y + mat[10]*z + mat[14]);
      } else dst.pos.push(x, y, z);
      const nx = src.nrm[i], ny = src.nrm[i+1], nz = src.nrm[i+2];
      if (nm) {
        let a = nm[0]*nx + nm[4]*ny + nm[8]*nz,
            b = nm[1]*nx + nm[5]*ny + nm[9]*nz,
            c = nm[2]*nx + nm[6]*ny + nm[10]*nz;
        const l = Math.hypot(a,b,c) || 1;
        dst.nrm.push(a/l, b/l, c/l);
      } else dst.nrm.push(nx, ny, nz);
    }
    for (let i = 0; i < src.idx.length; i++) dst.idx.push(src.idx[i] + base);
    return dst;
  },

  box(w, h, d) {
    w/=2; h/=2; d/=2;
    const p = [], n = [], idx = [];
    const faces = [
      [[ 1,0,0], [[w,-h,-d],[w,h,-d],[w,h,d],[w,-h,d]]],
      [[-1,0,0], [[-w,-h,d],[-w,h,d],[-w,h,-d],[-w,-h,-d]]],
      [[0, 1,0], [[-w,h,-d],[-w,h,d],[w,h,d],[w,h,-d]]],
      [[0,-1,0], [[-w,-h,d],[-w,-h,-d],[w,-h,-d],[w,-h,d]]],
      [[0,0, 1], [[-w,-h,d],[w,-h,d],[w,h,d],[-w,h,d]]],
      [[0,0,-1], [[w,-h,-d],[-w,-h,-d],[-w,h,-d],[w,h,-d]]]
    ];
    faces.forEach(([nor, quad], f) => {
      quad.forEach(v => { p.push(v[0],v[1],v[2]); n.push(nor[0],nor[1],nor[2]); });
      const b = f*4; idx.push(b,b+1,b+2, b,b+2,b+3);
    });
    return { pos: p, nrm: n, idx };
  },

  /* Cylinder / cone / drum along +Y, centred at the origin. */
  cyl(rTop, rBot, h, seg, capped) {
    seg = seg || 24;
    const p = [], n = [], idx = [];
    const slope = Math.atan2(rBot - rTop, h);
    const cs = Math.cos(slope), sn = Math.sin(slope);
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      p.push(c*rTop, h/2, s*rTop);  n.push(c*cs, sn, s*cs);
      p.push(c*rBot, -h/2, s*rBot); n.push(c*cs, sn, s*cs);
    }
    for (let i = 0; i < seg; i++) {
      const b = i*2; idx.push(b, b+1, b+2, b+1, b+3, b+2);
    }
    if (capped !== false) {
      [[rTop, h/2, 1], [rBot, -h/2, -1]].forEach(([r, y, dir]) => {
        if (r <= 0.0001) return;
        const c0 = p.length/3;
        p.push(0, y, 0); n.push(0, dir, 0);
        for (let i = 0; i <= seg; i++) {
          const a = i/seg*Math.PI*2;
          p.push(Math.cos(a)*r, y, Math.sin(a)*r); n.push(0, dir, 0);
        }
        for (let i = 0; i < seg; i++) {
          if (dir > 0) idx.push(c0, c0+1+i, c0+2+i);
          else         idx.push(c0, c0+2+i, c0+1+i);
        }
      });
    }
    return { pos: p, nrm: n, idx };
  },

  sphere(r, seg) {
    seg = seg || 20;
    const p = [], n = [], idx = [], rings = Math.max(6, seg>>1);
    for (let y = 0; y <= rings; y++) {
      const v = y/rings, phi = v*Math.PI;
      for (let x = 0; x <= seg; x++) {
        const u = x/seg, th = u*Math.PI*2;
        const nx = Math.sin(phi)*Math.cos(th), ny = Math.cos(phi), nz = Math.sin(phi)*Math.sin(th);
        p.push(nx*r, ny*r, nz*r); n.push(nx, ny, nz);
      }
    }
    for (let y = 0; y < rings; y++) for (let x = 0; x < seg; x++) {
      const a = y*(seg+1)+x, b = a+seg+1;
      idx.push(a, b, a+1, b, b+1, a+1);
    }
    return { pos: p, nrm: n, idx };
  },

  /* Flat ring / annulus in the XZ plane, given some thickness in Y. */
  ring(rIn, rOut, thick, seg) {
    seg = seg || 64;
    const p = [], n = [], idx = [];
    const push = (r, y, ny) => {
      for (let i = 0; i <= seg; i++) {
        const a = i/seg*Math.PI*2;
        p.push(Math.cos(a)*r, y, Math.sin(a)*r);
        n.push(ny === 0 ? Math.cos(a) : 0, ny, ny === 0 ? Math.sin(a) : 0);
      }
    };
    const strip = (o1, o2) => {
      for (let i = 0; i < seg; i++) idx.push(o1+i, o2+i, o1+i+1, o2+i, o2+i+1, o1+i+1);
    };
    const t = thick/2;
    const a0 = 0;            push(rIn, t, 1);    // top inner
    const a1 = (seg+1);      push(rOut, t, 1);   // top outer
    const a2 = (seg+1)*2;    push(rIn, -t, -1);
    const a3 = (seg+1)*3;    push(rOut, -t, -1);
    const a4 = (seg+1)*4;    push(rOut, t, 0);   // outer wall
    const a5 = (seg+1)*5;    push(rOut, -t, 0);
    strip(a0, a1); strip(a3, a2); strip(a4, a5);
    return { pos: p, nrm: n, idx };
  },

  /* A cog: a disc with `teeth` extruded blocks around its rim. */
  gear(rIn, rOut, thick, teeth) {
    const g = Geo.merge(Geo.empty(), Geo.cyl(rOut, rOut, thick, 40), M4.ident());
    const toothW = (2*Math.PI*rOut) / (teeth * 2.4);
    for (let i = 0; i < teeth; i++) {
      const a = i/teeth*Math.PI*2;
      const m = M4.mul(M4.rotY(-a), M4.translate(rOut + rIn*0.16, 0, 0));
      Geo.merge(g, Geo.box(rIn*0.34, thick*0.9, toothW), m);
    }
    return g;
  },

  /* A crenellated tower — the building block for every castle on the map. */
  tower(r, h, merlons) {
    const g = Geo.empty();
    Geo.merge(g, Geo.cyl(r*0.92, r, h, 14), M4.translate(0, h/2, 0));
    Geo.merge(g, Geo.cyl(r*1.18, r*1.18, h*0.06, 14), M4.translate(0, h*1.0, 0));
    const m = merlons === undefined ? 8 : merlons;
    for (let i = 0; i < m; i++) {
      const a = i/m*Math.PI*2;
      const mat = M4.mul(M4.rotY(-a), M4.translate(r*1.02, h*1.09, 0));
      Geo.merge(g, Geo.box(r*0.28, h*0.11, r*0.34), mat);
    }
    return g;
  },

  upload(gl, m) {
    const mesh = {
      pos: gl.createBuffer(), nrm: gl.createBuffer(), idx: gl.createBuffer(),
      count: m.idx.length
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.pos), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nrm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.nrm), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);
    const big = m.pos.length/3 > 65535;
    mesh.type = big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      big ? new Uint32Array(m.idx) : new Uint16Array(m.idx), gl.STATIC_DRAW);
    return mesh;
  },

  bind(gl, prog, mesh) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos);
    gl.enableVertexAttribArray(prog.a.aPos);
    gl.vertexAttribPointer(prog.a.aPos, 3, gl.FLOAT, false, 0, 0);
    if (prog.a.aNrm !== undefined && prog.a.aNrm >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nrm);
      gl.enableVertexAttribArray(prog.a.aNrm);
      gl.vertexAttribPointer(prog.a.aNrm, 3, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);
  }
};

/* Create a context with a uint32-index extension where available. */
function makeGL(canvas) {
  const opts = { antialias: true, alpha: true, premultipliedAlpha: false,
                 powerPreference: 'high-performance' };
  const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
  if (gl) gl.getExtension('OES_element_index_uint');
  return gl;
}
