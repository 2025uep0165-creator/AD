/* ==========================================================================
   main.js — builds every section from the data, runs one rAF loop for all
   the canvases, and drives the scroll choreography.
   ========================================================================== */

(() => {
'use strict';

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------- sigil SVG -- */

function sigilSVG(key, c1, c2) {
  const body = SIGILS[key] || SIGILS.watch;
  return `<svg viewBox="0 0 100 100" class="sig" aria-hidden="true"
    style="--sigc:${c1 || 'var(--gold)'};--sigc2:${c2 || c1 || 'var(--gold-lt)'}">${body}</svg>`;
}
function paintSigil(el, key, c1, c2) {
  el.innerHTML = SIGILS[key] || SIGILS.watch;
  el.style.setProperty('--sigc', c1 || 'var(--gold)');
  el.style.setProperty('--sigc2', c2 || c1 || 'var(--gold-lt)');
}

const houseByKey = {};
HOUSES.forEach(h => houseByKey[h.key] = h);
MINOR_HOUSES.forEach(h => houseByKey[h.key] = h);
const hc = key => houseByKey[key] || { c1: '#c9a227', c2: '#8a6d16' };

/* ═════════════════════════════════ REVEALS ════════════════════════════════ */

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

const watchReveal = el => revealObs.observe(el);
const watchAll = sel => $$(sel).forEach(watchReveal);

/* ═══════════════════════════════ 0 · CHROME ═══════════════════════════════ */

/* stagger the hero wordmark */
$$('.megatitle span, .megatitle em').forEach((el, i) => el.style.setProperty('--i', i));

/* gate sigils */
paintSigil($('.sig-gate'), 'targaryen', '#c9a227', '#e8d9a0');
paintSigil($('.sig-end'), 'stark', '#c9a227', '#e8d9a0');

/* production table */
$('.prod-table').innerHTML = PRODUCTION
  .map(r => `<div class="prod-row"><b>${r.k}</b><span>${r.v}</span></div>`).join('');

/* nav dots */
const sections = $$('.sec');
const dotsHost = $('#dots');
dotsHost.innerHTML = sections
  .map(s => `<button data-target="${s.id}" aria-label="${s.dataset.dot || s.id}">
               <span>${s.dataset.dot || s.id}</span></button>`).join('');
$$('#dots button').forEach(b => b.addEventListener('click', () => {
  const t = document.getElementById(b.dataset.target);
  if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* ═══════════════════════════════ 1 · HOUSES ═══════════════════════════════ */

const houseGrid = $('#houseGrid');
HOUSES.forEach((h, i) => {
  const el = document.createElement('article');
  el.className = 'house';
  el.style.setProperty('--hc1', h.c1);
  el.style.setProperty('--hc2', h.c2);
  el.style.setProperty('--d', (i % 4) * 0.07 + 's');
  el.dataset.key = h.key;
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.innerHTML = `
    <div class="house-sig">${sigilSVG(h.key, h.c1, h.accent)}</div>
    <h3 class="house-name">${h.name}</h3>
    <p class="house-words">${h.words}</p>
    <p class="house-seat">${h.seat} · ${h.region}</p>`;
  houseGrid.appendChild(el);
  watchReveal(el);
});

let openPanel = null;
function openHouse(key) {
  const h = houseByKey[key];
  if (!h || !h.blurb) return;
  const card = $(`.house[data-key="${key}"]`);
  if (openPanel) { openPanel.remove(); openPanel = null; }

  const panel = document.createElement('div');
  panel.className = 'house-panel';
  panel.style.setProperty('--hc1', h.c1);
  panel.innerHTML = `
    <button class="hp-close" aria-label="Close">close ✕</button>
    <div class="hp-sig">${sigilSVG(h.key, h.c1, h.accent)}</div>
    <div>
      <h3 class="hp-name">House ${h.name}</h3>
      <p class="hp-words">“${h.words}”</p>
      <p class="hp-blurb">${h.blurb}</p>
      <div class="hp-meta">
        <div><b>Seat</b><span>${h.seat}</span></div>
        <div><b>Region</b><span>${h.region}</span></div>
        <div><b>Sigil</b><span>${h.beast}</span></div>
        <div><b>Known by</b><span>${h.heads.join(' · ')}</span></div>
      </div>
      <p class="hp-fact">${h.fact}</p>
    </div>`;

  /* drop the panel at the end of the card's visual row */
  const cards = $$('.house', houseGrid).filter(c => c !== openPanel);
  const idx = cards.indexOf(card);
  const perRow = Math.max(1, Math.round(houseGrid.clientWidth /
    (card.getBoundingClientRect().width + 24)));
  const insertAfter = cards[Math.min(cards.length - 1,
    Math.floor(idx / perRow) * perRow + perRow - 1)];
  insertAfter.after(panel);
  openPanel = panel;

  panel.querySelector('.hp-close').addEventListener('click', () => {
    panel.remove(); openPanel = null;
  });
  panel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
}

houseGrid.addEventListener('click', e => {
  const card = e.target.closest('.house');
  if (card) openHouse(card.dataset.key);
});
houseGrid.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.house');
  if (card) { e.preventDefault(); openHouse(card.dataset.key); }
});

/* minor houses strip */
$('#houseMinor').innerHTML = MINOR_HOUSES.map(h => `
  <div class="minor" style="--mc1:${h.c1}">
    ${sigilSVG(h.key, h.c1, h.c2)}
    <div><b>${h.name}</b><span>${h.words}</span></div>
  </div>`).join('');

/* ══════════════════════════════ 2 · SEASONS ═══════════════════════════════ */

const MOOD_COLOR = {
  stark: '#cfd8dc', wildfire: '#2fe08a', blood: '#d33b34', lannister: '#e0b23c',
  ice: '#7fd3f0', green: '#4ade80', fire: '#ff8a2b', night: '#8fd3f4'
};

const rail = $('#seasonRail');
rail.innerHTML = SEASONS.map(s => `
  <article class="season" style="--sc:${MOOD_COLOR[s.mood] || '#c9a227'}">
    <div class="season-n">0${s.n}</div>
    <p class="season-yr">${s.year} · ${s.eps} episodes</p>
    <h3 class="season-title">${s.title}</h3>
    <p class="season-tag">${s.tag}</p>
    <ul class="season-events">${s.events.map(e => `<li>${e}</li>`).join('')}</ul>
    <div class="season-foot">
      <div><b>Season's centre</b><span>${s.hero}</span></div>
    </div>
    <p class="season-close">${s.close}</p>
  </article>`).join('');

/* drag-to-scroll + wheel + arrow keys on the rail */
(() => {
  let down = false, startX = 0, startL = 0, moved = 0;
  rail.addEventListener('pointerdown', e => {
    down = true; moved = 0;
    startX = e.clientX; startL = rail.scrollLeft;
    rail.classList.add('dragging');
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    rail.scrollLeft = startL - dx;
  });
  const up = () => { down = false; rail.classList.remove('dragging'); };
  rail.addEventListener('pointerup', up);
  rail.addEventListener('pointercancel', up);

  rail.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;   /* trackpad already h-scrolls */
    const atStart = rail.scrollLeft <= 1;
    const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
    if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;  /* let the page take over */
    e.preventDefault();
    rail.scrollLeft += e.deltaY;
  }, { passive: false });

  rail.setAttribute('tabindex', '0');
  rail.addEventListener('keydown', e => {
    const step = rail.clientWidth * 0.7;
    if (e.key === 'ArrowRight') { rail.scrollLeft += step; e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { rail.scrollLeft -= step; e.preventDefault(); }
  });
})();

/* ══════════════════════════════ 3 · MOMENTS ═══════════════════════════════ */

const FX_COLOR = {
  blood: '#d33b34', fire: '#ff8a2b', wildfire: '#2fe08a',
  ice: '#7fd3f0', poison: '#c084fc', dust: '#d6c39b'
};

const momentStack = $('#momentStack');
const momentFx = [];

MOMENTS.forEach((m, i) => {
  const sec = document.createElement('section');
  sec.className = 'moment';
  sec.style.setProperty('--mc', FX_COLOR[m.fx] || '#c9a227');
  sec.style.zIndex = i + 1;
  sec.innerHTML = `
    <canvas aria-hidden="true"></canvas>
    <div class="moment-inner">
      <p class="moment-label">${m.label}</p>
      <h3 class="moment-title">${m.title}</h3>
      <p class="moment-text">${m.text}</p>
      ${m.quote ? `<p class="moment-quote">“${m.quote}”</p>
                   <p class="moment-who">${m.who}</p>` : ''}
      <p class="moment-note">${m.note}</p>
    </div>`;
  momentStack.appendChild(sec);
  if (!reduced) {
    momentFx.push({ el: sec, fx: MomentFX(sec.querySelector('canvas'), m.fx), vis: 0 });
  }
});

/* ════════════════════════════════ 4 · MAP ═════════════════════════════════ */

const mapSvg = buildMap($('#mapHost'));
const mapCard = $('#mapCard');

function showLocation(loc) {
  $$('.pin', mapSvg).forEach(p => p.classList.toggle('on', p.dataset.id === loc.id));
  const h = hc(loc.house);
  mapCard.innerHTML = `
    <div class="map-card-inner">
      <p class="map-card-region" style="color:${h.c1}">${loc.region}</p>
      <h3 class="map-card-name">${loc.name}</h3>
      <p class="map-card-tag">${loc.tag}</p>
      <p class="map-card-text">${loc.text}</p>
    </div>`;
  mapCard.style.borderColor = h.c1 + '55';
}

mapSvg.addEventListener('click', e => {
  const pin = e.target.closest('.pin');
  if (!pin) return;
  const loc = LOCATIONS.find(l => l.id === pin.dataset.id);
  if (loc) showLocation(loc);
});
mapSvg.addEventListener('pointerover', e => {
  const pin = e.target.closest('.pin');
  if (!pin) return;
  const loc = LOCATIONS.find(l => l.id === pin.dataset.id);
  if (loc) showLocation(loc);
});
mapSvg.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const pin = e.target.closest('.pin');
  if (!pin) return;
  e.preventDefault();
  const loc = LOCATIONS.find(l => l.id === pin.dataset.id);
  if (loc) showLocation(loc);
});

/* ════════════════════════════════ 5 · CAST ════════════════════════════════ */

const castGrid = $('#castGrid');
CHARACTERS.forEach((c, i) => {
  const h = hc(c.house);
  const el = document.createElement('article');
  el.className = 'cast-card' + (c.alive ? ' alive' : '');
  el.style.setProperty('--cc', h.c1);
  el.style.setProperty('--d', (i % 5) * 0.06 + 's');
  el.innerHTML = `
    <div class="cast-sig">${sigilSVG(c.house, h.c1, h.accent || h.c2)}</div>
    <h3 class="cast-name">${c.name}</h3>
    <p class="cast-actor">${c.actor}</p>
    <p class="cast-title">${c.title}</p>
    ${c.quote ? `<p class="cast-quote">${c.quote}</p>` : ''}
    <p class="cast-fate"><i></i><span>${c.fate}</span></p>`;
  castGrid.appendChild(el);
  watchReveal(el);
});

/* ═══════════════════════════════ 6 · THE LIST ═════════════════════════════ */

const LIST = [
  { n: 'Cersei Lannister',  d: 'Crushed in the cellars of the Red Keep' },
  { n: 'Joffrey Baratheon', d: 'Poisoned at his own wedding feast' },
  { n: 'Walder Frey',       d: 'Throat cut by Arya, wearing his own face' },
  { n: 'Ser Meryn Trant',   d: 'Killed by Arya in a Braavosi brothel' },
  { n: 'Ser Ilyn Payne',    d: 'Swung the sword that took Ned Stark\'s head' },
  { n: 'Tywin Lannister',   d: 'Shot on the privy by his youngest son' },
  { n: 'The Mountain',      d: 'Went into the fire holding his brother' },
  { n: 'The Hound',         d: 'She took him off the list herself' },
  { n: 'Melisandre',        d: 'Walked into the snow at dawn and let go' },
  { n: 'Beric Dondarrion',  d: 'Died holding a corridor at Winterfell' },
  { n: 'Thoros of Myr',     d: 'Died of his wounds beyond the Wall' }
];
$('#nameList').innerHTML = LIST
  .map(x => `<li title="${x.d}">${x.n}</li>`).join('');

/* ══════════════════════════════ 7 · QUOTES ════════════════════════════════ */

$('#quoteWall').innerHTML = QUOTES.map((q, i) => `
  <figure class="quote-card" style="--qc:${hc(q.h).c1};--d:${(i % 6) * .06}s">
    <p>${q.t}</p>
    <cite>${q.w}</cite>
  </figure>`).join('');
watchAll('.quote-card');

/* ═══════════════════════════════ 8 · SCORE ════════════════════════════════ */

$('#scoreGrid').innerHTML = MUSIC_NOTES.map((m, i) => `
  <article class="score-card" style="--d:${i * .08}s">
    <h3>${m.title}</h3>
    <p class="by">${m.by}</p>
    <p>${m.text}</p>
  </article>`).join('');
watchAll('.score-card');

const eq = $('#eq');
eq.innerHTML = new Array(22).fill('<i></i>').join('');
const eqBars = $$('#eq i');

/* ═══════════════════════════════ 9 · STATS ════════════════════════════════ */

$('#statGrid').innerHTML = STATS.map(s => `
  <div class="stat">
    <b data-to="${s.n}" data-suffix="${s.suffix || ''}">0</b>
    <em>${s.label}</em>
    <span>${s.note}</span>
  </div>`).join('');

const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    statObs.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, sfx = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1500;
    const tick = now => {
      const p = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toLocaleString() + (p === 1 ? sfx : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$('.stat b').forEach(b => statObs.observe(b));

watchAll('.reveal');

/* ══════════════════════════════ 10 · CANVASES ═════════════════════════════ */

const hero    = reduced ? null : HeroScene($('#heroGL'));
const throne  = ThroneScene($('#throneGL'));
const embers  = reduced ? null : EmberField($('#heroEmbers'), { count: 110 });
const endEmb  = reduced ? null : EmberField($('#endEmbers'), { count: 80 });
const snow    = reduced ? null : SnowField($('#snowFx'), { count: 240 });
const dragons = reduced ? null : DragonScene($('#dragonFx'));
const cursor  = (reduced || matchMedia('(pointer: coarse)').matches)
  ? null : CursorTrail($('#cursorFx'));

if (throne) $('#swordCount').textContent = '1,000';

/* pointer parallax for the two GL scenes */
window.addEventListener('pointermove', e => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  if (hero)   { hero.state.pointerX = nx; hero.state.pointerY = -ny * 0.6; }
  if (throne) { throne.state.pointerX = nx * 0.4; throne.state.pointerY = -ny * 0.5; }
}, { passive: true });

/* which sections are on screen — so we only animate what is visible */
const visible = new Map();
const visObs = new IntersectionObserver(entries => {
  entries.forEach(e => visible.set(e.target, e.isIntersecting));
}, { rootMargin: '20% 0px 20% 0px' });
['#hero', '#dragons', '#longnight', '#throne', '#end'].forEach(s => visObs.observe($(s)));
momentFx.forEach(m => visObs.observe(m.el));
const isVis = sel => visible.get(typeof sel === 'string' ? $(sel) : sel) !== false;

/* ══════════════════════════ 11 · SCROLL CHOREOGRAPHY ══════════════════════ */

const progressBar = $('#progress i');
let scrollY = window.scrollY;
let currentMood = '';

function onScroll() {
  scrollY = window.scrollY;
}
window.addEventListener('scroll', onScroll, { passive: true });

/* mood + active dot, cheap enough to recompute on an observer instead of scroll */
const moodObs = new IntersectionObserver(entries => {
  /* pick the most visible section */
  let best = null, bestRatio = 0;
  entries.forEach(e => { if (e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = e.target; } });
  if (!best) return;
  const mood = best.dataset.mood;
  if (mood && mood !== currentMood) { currentMood = mood; Score.setMood(mood); }
  $$('#dots button').forEach(b => b.classList.toggle('on', b.dataset.target === best.id));
}, { threshold: [0.15, 0.4, 0.7] });
sections.forEach(s => moodObs.observe(s));

/* moments: the outgoing card in the stack recedes as the next slides over it */
function updateMoments() {
  const vh = window.innerHeight;
  momentFx.forEach(m => {
    if (visible.get(m.el) === false) { m.vis = 0; return; }
    const r = m.el.getBoundingClientRect();
    /* how far this card has been covered by the next one */
    const covered = clamp(-r.top / Math.max(r.height, 1), 0, 1);
    const entering = clamp(1 - r.top / vh, 0, 1);
    m.vis = entering * (1 - covered * 0.9);
    const inner = m.el.querySelector('.moment-inner');
    inner.style.opacity = String(clamp(1 - covered * 1.8, 0, 1));
    inner.style.transform = `scale(${1 - covered * 0.10}) translateY(${covered * -30}px)`;
  });
}

/* throne: spin through the section, melt across the last stretch */
const throneSec = $('#throne');
const throneSteps = $$('.throne-step');
function updateThrone() {
  const r = throneSec.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  const p = clamp(-r.top / Math.max(total, 1), 0, 1);
  if (throne) {
    /* stay near a frontal three-quarter view — a pure side profile of the
       chair reads as a fan of sticks rather than a throne */
    throne.state.spin = -0.55 + p * 1.15;
    throne.state.melt = smooth(clamp((p - 0.45) / 0.35, 0, 1));
  }
  const step = p < 0.34 ? 0 : p < 0.62 ? 1 : 2;
  throneSteps.forEach(s => s.classList.toggle('on', +s.dataset.step === step));
  const meta = $('.throne-meta');
  if (meta) meta.style.opacity = String(1 - clamp((p - 0.9) / 0.1, 0, 1));
}

/* Arya's list: strike each name as it crosses the middle of the screen */
const listItems = $$('#nameList li');
function updateList() {
  const mid = window.innerHeight * 0.62;
  listItems.forEach(li => {
    const r = li.getBoundingClientRect();
    li.classList.toggle('struck', r.top < mid);
  });
}

/* ═══════════════════════════════ 12 · THE LOOP ════════════════════════════ */

let last = performance.now();
let t = 0;
let entered = false;

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  t += dt;

  /* progress bar */
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (clamp(scrollY / Math.max(max, 1), 0, 1) * 100) + '%';

  if (!reduced) {
    updateMoments();
    updateList();
  }
  updateThrone();

  /* hero */
  if (hero && isVis('#hero')) {
    const hp = clamp(scrollY / Math.max(window.innerHeight, 1), 0, 1);
    hero.render(t, hp);
    if (embers) embers.step(dt, 1 - hp * 0.7);
  }

  /* throne */
  if (throne && isVis('#throne')) throne.render(t);

  /* dragons + snow + end embers */
  if (dragons && isVis('#dragons')) dragons.step(dt, 1);
  if (snow && isVis('#longnight')) snow.step(dt, 1);
  if (endEmb && isVis('#end')) endEmb.step(dt, 1);

  /* moment atmospheres */
  momentFx.forEach(m => { if (m.vis > 0.01) m.fx.step(dt, m.vis); });

  /* cursor sparks */
  if (cursor) cursor.step(dt);

  /* equaliser */
  if (entered && eqBars.length) {
    const on = Score.on;
    eqBars.forEach((b, i) => {
      const h = on
        ? 18 + Math.abs(Math.sin(t * (1.6 + i * 0.19) + i)) * 74 * (0.45 + Math.sin(t * 0.7 + i) * 0.3 + 0.3)
        : 12;
      b.style.height = clamp(h, 8, 100) + '%';
    });
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('resize', () => {
  [hero, throne, embers, endEmb, snow, dragons, cursor].forEach(o => o && o.resize && o.resize());
  momentFx.forEach(m => m.fx.resize());
}, { passive: true });

/* ═══════════════════════════════ 13 · THE GATE ════════════════════════════ */

const gate = $('#gate');
const soundBtn = $('#soundBtn');

function enter(withSound) {
  if (entered) return;
  entered = true;
  gate.classList.add('gone');
  document.body.classList.remove('pre-enter');
  setTimeout(() => { gate.style.display = 'none'; }, 1200);
  dotsHost.classList.add('on');
  soundBtn.classList.add('on');
  if (withSound) {
    Score.start().then(() => {
      soundBtn.classList.add('playing');
      updateScoreState();
    });
  } else {
    soundBtn.classList.add('muted');
  }
}

function updateScoreState() {
  const el = $('#scoreState');
  if (!el) return;
  el.textContent = Score.isSynth
    ? 'Playing now: an original score, generated live in your browser.'
    : 'Playing now: your own file from assets/theme.mp3.';
}

$('#enterBtn').addEventListener('click', () => enter(true));
$('#enterSilent').addEventListener('click', () => enter(false));

/* toggling sound also starts it the first time */
function toggleSound() {
  if (!Score.on && !soundBtn.classList.contains('muted')) {
    /* never started — start it now */
    Score.start().then(() => {
      soundBtn.classList.remove('muted');
      soundBtn.classList.add('playing');
      updateScoreState();
    });
    return;
  }
  const on = Score.toggle();
  soundBtn.classList.toggle('muted', !on);
  soundBtn.classList.toggle('playing', on);
}
soundBtn.addEventListener('click', toggleSound);
$('#soundBtn2').addEventListener('click', toggleSound);
$('#endSound').addEventListener('click', toggleSound);

$$('[data-goto]').forEach(b => b.addEventListener('click', () => {
  const t = document.getElementById(b.dataset.goto);
  if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* keyboard: M mutes, Escape closes an open house panel */
window.addEventListener('keydown', e => {
  if (e.key === 'm' || e.key === 'M') toggleSound();
  if (e.key === 'Escape' && openPanel) { openPanel.remove(); openPanel = null; }
});

/* if someone lands mid-page (a refresh at scroll position), skip the gate */
if (window.scrollY > window.innerHeight * 0.5) enter(false);

})();
