/* ==========================================================================
   audio.js — the score.

   The real Game of Thrones main title is Ramin Djawadi's copyrighted
   composition, so it is not shipped here. Two options instead:

   1. DEFAULT — an original piece synthesised live in the browser with the
      Web Audio API: a cello ostinato under a slow minor-key theme, with the
      instrumentation shifting as you scroll through the site.

   2. YOUR OWN FILE — drop an audio file at  assets/theme.mp3  and it is
      picked up automatically on load, in place of the synth. Nothing else
      to change. (Only do that with a file you have the right to use.)
   ========================================================================== */

const Score = (() => {
  let ctx = null, master = null, wet = null, comp = null;
  let started = false, muted = false;
  let fileEl = null, usingFile = false;

  /* Voice buses, so a mood change can crossfade whole sections in and out. */
  const bus = {};
  const mood = { cello: 1, melody: 1, drums: 0.5, drone: 1, bells: 0, tempo: 84, cutoff: 1400 };
  const target = Object.assign({}, mood);

  const A = 440;
  /* note name -> Hz, e.g. n('Eb4') */
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function n(name) {
    const m = /^([A-G])(b|#)?(-?\d)$/.exec(name);
    if (!m) return 440;
    let s = SEMI[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0);
    const midi = s + (parseInt(m[3], 10) + 1) * 12;
    return A * Math.pow(2, (midi - 69) / 12);
  }

  /* ---------------------------------------------------------------- setup */

  function reverbIR(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        /* slightly coloured noise so the tail is not hissy */
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (1 - t * 0.4);
      }
    }
    return buf;
  }

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.ratio.value = 4;
    comp.attack.value = 0.008; comp.release.value = 0.3;

    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(comp).connect(ctx.destination);

    const conv = ctx.createConvolver();
    conv.buffer = reverbIR(4.2, 2.6);
    wet = ctx.createGain(); wet.gain.value = 0.42;
    conv.connect(wet).connect(master);

    /* one gain node per section, all feeding dry + reverb */
    ['cello', 'melody', 'drums', 'drone', 'bells'].forEach(k => {
      const g = ctx.createGain();
      g.gain.value = k === 'bells' ? 0 : 0.7;
      g.connect(master); g.connect(conv);
      bus[k] = g;
    });
    return true;
  }

  /* --------------------------------------------------------------- voices */

  /* Bowed string: two detuned saws through a moving lowpass. */
  function cello(freq, at, dur, gain, busName) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 1.1;
    f.frequency.setValueAtTime(Math.min(freq * 2.2, mood.cutoff * 0.7), at);
    f.frequency.linearRampToValueAtTime(Math.min(freq * 5.5, mood.cutoff), at + dur * 0.35);
    f.frequency.linearRampToValueAtTime(Math.min(freq * 2.0, mood.cutoff * 0.6), at + dur);

    /* slow bow swell rather than a plucked attack */
    const peak = gain;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + Math.min(0.16, dur * 0.3));
    g.gain.setValueAtTime(Math.max(peak, 0.0002), at + dur * 0.72);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    const vib = ctx.createOscillator();
    const vibG = ctx.createGain();
    vib.frequency.value = 4.8 + Math.random() * 0.7;
    vibG.gain.value = freq * 0.006;
    vib.connect(vibG);

    [-6, 5].forEach((cents, i) => {
      const o = ctx.createOscillator();
      o.type = i ? 'sawtooth' : 'triangle';
      o.frequency.value = freq;
      o.detune.value = cents;
      vibG.connect(o.detune);
      o.connect(f);
      o.start(at); o.stop(at + dur + 0.1);
    });

    vib.start(at); vib.stop(at + dur + 0.1);
    f.connect(g).connect(bus[busName || 'cello']);
  }

  /* Sustained pad for the low drone. */
  function drone(freq, at, dur, gain) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 520;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 1.6);
    g.gain.setValueAtTime(gain, at + dur - 1.6);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    [1, 1.005, 0.5].forEach(mult => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq * mult;
      o.connect(f);
      o.start(at); o.stop(at + dur + 0.1);
    });
    f.connect(g).connect(bus.drone);
  }

  /* Struck metal / ice — used in the northern sections. */
  function bell(freq, at, gain) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 3.4);
    [1, 2.76, 5.4].forEach((m, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * m;
      const og = ctx.createGain();
      og.gain.value = 1 / (i + 1.4);
      o.connect(og).connect(g);
      o.start(at); o.stop(at + 3.5);
    });
    g.connect(bus.bells);
  }

  /* War drum: pitched thump plus a short noise slap. */
  function drum(at, gain) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(120, at);
    o.frequency.exponentialRampToValueAtTime(42, at + 0.16);
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    o.connect(g).connect(bus.drums);
    o.start(at); o.stop(at + 0.55);

    const len = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1800;
    const ng = ctx.createGain(); ng.gain.value = gain * 0.35;
    src.connect(nf).connect(ng).connect(bus.drums);
    src.start(at);
  }

  /* ------------------------------------------------------------- the piece */
  /* Original theme in C minor: i — VI — III — VII, eight bars, looping.     */

  const OSTINATO = [                       /* eighth notes, per bar          */
    ['C3','G3','C4','G3','C3','G3','C4','Eb4'],
    ['C3','G3','C4','G3','C3','G3','Eb4','D4'],
    ['Ab2','Eb3','Ab3','Eb3','Ab2','Eb3','Ab3','C4'],
    ['Ab2','Eb3','Ab3','Eb3','Ab2','C4','Bb3','Ab3'],
    ['Eb3','Bb3','Eb4','Bb3','Eb3','Bb3','Eb4','G4'],
    ['Eb3','Bb3','Eb4','Bb3','Eb3','G4','F4','Eb4'],
    ['Bb2','F3','Bb3','F3','Bb2','F3','Bb3','D4'],
    ['Bb2','F3','Bb3','D4','F4','D4','Bb3','F3']
  ];

  /* [note, beats] — the tune that sits on top. */
  const MELODY = [
    [['G4',2],['Eb4',1],['F4',1]],
    [['G4',3],[null,1]],
    [['Ab4',2],['G4',1],['F4',1]],
    [['Eb4',4]],
    [['Bb4',2],['G4',1],['Ab4',1]],
    [['G4',4]],
    [['F4',2],['Eb4',1],['D4',1]],
    [['C4',3],[null,1]]
  ];

  const ROOTS = ['C2','C2','Ab1','Ab1','Eb2','Eb2','Bb1','Bb1'];

  let bar = 0, nextTime = 0, timer = null;
  const LOOKAHEAD = 0.15, SCHEDULE_WINDOW = 0.6;

  function scheduleBar(at) {
    const beat = 60 / mood.tempo;
    const barLen = beat * 4;
    const i = bar % 8;

    /* drone: one long note every two bars */
    if (i % 2 === 0 && mood.drone > 0.01) {
      drone(n(ROOTS[i]), at, barLen * 2 + 0.4, 0.055 * mood.drone);
    }

    /* ostinato */
    if (mood.cello > 0.01) {
      OSTINATO[i].forEach((name, k) => {
        const t = at + k * beat / 2;
        const accent = (k % 4 === 0) ? 1.25 : 1;
        cello(n(name), t, beat * 0.52, 0.085 * mood.cello * accent, 'cello');
      });
    }

    /* melody */
    if (mood.melody > 0.01) {
      let t = at;
      MELODY[i].forEach(([name, beats]) => {
        if (name) cello(n(name), t, beat * beats * 0.94, 0.075 * mood.melody, 'melody');
        t += beat * beats;
      });
    }

    /* drums on 1 and 3, with a double on the last bar of the phrase */
    if (mood.drums > 0.01) {
      drum(at, 0.30 * mood.drums);
      drum(at + beat * 2, 0.20 * mood.drums);
      if (i === 7) { drum(at + beat * 3, 0.22 * mood.drums);
                     drum(at + beat * 3.5, 0.26 * mood.drums); }
    }

    /* ice bells drift over the top in the cold moods */
    if (mood.bells > 0.01 && Math.random() < 0.75) {
      const pick = ['Eb5','G5','Bb5','C6','Ab5'][Math.floor(Math.random() * 5)];
      bell(n(pick), at + Math.random() * barLen, 0.06 * mood.bells);
    }

    bar++;
    return barLen;
  }

  function tick() {
    /* ease the live mix toward the target mood */
    for (const k in target) {
      if (k === 'tempo' || k === 'cutoff') mood[k] += (target[k] - mood[k]) * 0.06;
      else {
        mood[k] += (target[k] - mood[k]) * 0.05;
        if (bus[k]) bus[k].gain.setTargetAtTime(0.7 * (mood[k] > 0.02 ? 1 : 0), ctx.currentTime, 0.4);
      }
    }
    while (nextTime < ctx.currentTime + SCHEDULE_WINDOW) {
      if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
      nextTime += scheduleBar(nextTime);
    }
  }

  /* ----------------------------------------------------------------- API  */

  const MOODS = {
    main:     { cello: 1.0, melody: 1.0, drums: 0.55, drone: 0.9, bells: 0.0, tempo: 84,  cutoff: 1500 },
    map:      { cello: 0.9, melody: 0.5, drums: 0.35, drone: 1.0, bells: 0.2, tempo: 80,  cutoff: 1300 },
    houses:   { cello: 1.0, melody: 0.8, drums: 0.45, drone: 0.8, bells: 0.0, tempo: 86,  cutoff: 1700 },
    north:    { cello: 0.45, melody: 0.7, drums: 0.0,  drone: 1.0, bells: 1.0, tempo: 66, cutoff: 900 },
    war:      { cello: 1.0, melody: 0.9, drums: 1.0,  drone: 0.7, bells: 0.0, tempo: 96,  cutoff: 2400 },
    grief:    { cello: 0.8, melody: 0.35, drums: 0.0, drone: 1.0, bells: 0.15, tempo: 60, cutoff: 780 },
    fire:     { cello: 0.9, melody: 1.0, drums: 0.9,  drone: 0.8, bells: 0.0, tempo: 92,  cutoff: 2600 },
    quiet:    { cello: 0.35, melody: 0.5, drums: 0.0, drone: 0.9, bells: 0.35, tempo: 62, cutoff: 800 },
    end:      { cello: 0.55, melody: 0.9, drums: 0.15, drone: 1.0, bells: 0.5, tempo: 58, cutoff: 1000 }
  };

  let currentMood = 'main';

  function setMood(name) {
    if (!MOODS[name] || name === currentMood) return;
    currentMood = name;
    Object.assign(target, MOODS[name]);
    if (usingFile && fileEl) {
      /* with a real track loaded, moods only nudge the volume */
      fileEl.volume = muted ? 0 : (name === 'quiet' || name === 'grief' ? 0.34 : 0.55);
    }
  }

  /* Look for a user-supplied track before falling back to the synth. The
     path comes from assets/manifest.json when one names it. */
  function tryFile() {
    const src = (typeof Assets !== 'undefined' && Assets.audio())
      ? Assets.audio() : 'assets/theme.mp3';
    return new Promise(resolve => {
      const el = new Audio(src);
      el.loop = true; el.preload = 'auto'; el.volume = 0;
      let settled = false;
      const done = ok => { if (!settled) { settled = true; resolve(ok ? el : null); } };
      el.addEventListener('canplaythrough', () => done(true), { once: true });
      el.addEventListener('error', () => done(false), { once: true });
      setTimeout(() => done(false), 2500);
    });
  }

  async function start() {
    if (started) return;
    started = true;

    if (typeof Assets !== 'undefined') { try { await Assets.ready; } catch (e) {} }
    const el = await tryFile();
    if (el) {
      usingFile = true;
      fileEl = el;
      try {
        await el.play();
        const fade = setInterval(() => {
          el.volume = Math.min(0.55, el.volume + 0.02);
          if (el.volume >= 0.54) clearInterval(fade);
        }, 60);
        return;
      } catch (e) { usingFile = false; fileEl = null; }
    }

    if (!build()) return;
    if (ctx.state === 'suspended') await ctx.resume();
    nextTime = ctx.currentTime + 0.12;
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 3.0);
    timer = setInterval(tick, LOOKAHEAD * 1000);
  }

  function toggle() {
    muted = !muted;
    if (usingFile && fileEl) fileEl.volume = muted ? 0 : 0.55;
    else if (master) master.gain.setTargetAtTime(muted ? 0.0001 : 0.5, ctx.currentTime, 0.25);
    return !muted;
  }

  return {
    start, toggle, setMood,
    get on() { return started && !muted; },
    get isSynth() { return started && !usingFile; },
    get playing() { return started && !muted; }
  };
})();
