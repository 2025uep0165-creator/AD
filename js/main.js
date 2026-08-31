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

/* Real emblems replace the drawn ones once the manifest has loaded. Panels and
   cards can be built at any time, so this runs over whatever root it is given
   rather than only over the document at startup. */
let sigilsReady = false;
function dropInSigils(root) {
  if (!sigilsReady || !root) return;
  const els = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-sigil]')) : [];
  if (root.dataset && root.dataset.sigil) els.push(root);
  els.forEach(el => {
    if (el.querySelector('.sig-img')) return;
    const url = Assets.sigil(el.dataset.sigil);
    if (url) el.innerHTML = `<img class="sig-img" src="${url}" alt="">`;
  });
}

const houseByKey = {};
HOUSES.forEach(h => houseByKey[h.key] = h);
const hc = key => houseByKey[key] || { c1: '#c9a227', c2: '#8a6d16' };

/* ═════════════════════════════════ REVEALS ════════════════════════════════ */

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

const watchReveal = el => revealObs.observe(el);
const watchAll = sel => $$(sel).forEach(watchReveal);

/* ═════════════════════════════ 0 · THE TITLE ══════════════════════════════ */

/* Five plates behind the title. Each is held while it drifts in or out, then
   crossfades into the next.

   This is driven here rather than from CSS animation delays. Five plates
   sharing one keyframe, each offset by a negative delay, is fragile: if the
   delay fails to resolve on even one of them they all land on the same offset
   and the montage collapses to a single plate that vanishes for most of the
   loop. Moving one class on a timer cannot go wrong in that way, and the
   transform is restarted explicitly so every plate begins its push from the
   same place however long the page has been open. */

const HERO_HOLD = 5200;                       /* how long a plate holds the frame */
const HERO_FADE = 1300;                       /* crossfade between plates          */
const HERO_DRIFT = (HERO_HOLD + HERO_FADE * 2) / 1000;

const heroFrames = $$('.hero-plate .hp-frame');
let heroAt = 0;

function heroShow(i) {
  heroFrames.forEach((f, k) => {
    const on = k === i;
    f.classList.toggle('on', on);
    if (!on) return;
    /* alternate: odd plates pull back out while even ones push in */
    const from = k % 2 ? 1.17 : 1.02;
    const to   = k % 2 ? 1.02 : 1.17;
    f.style.transition = 'none';
    f.style.transform = `scale(${from})`;
    void f.offsetWidth;                       /* commit the reset before animating */
    f.style.transition =
      `transform ${HERO_DRIFT}s linear, opacity ${HERO_FADE}ms ease`;
    f.style.transform = `scale(${to})`;
  });
}

if (heroFrames.length) {
  heroShow(0);
  if (!reduced) {
    setInterval(() => heroShow(heroAt = (heroAt + 1) % heroFrames.length), HERO_HOLD);
  }
}

/* ═══════════════════════════════ 0 · CHROME ═══════════════════════════════ */

/* gate sigils */
/* drawn now, replaced by the real emblem the moment the manifest lands */
$$('.sig-slot').forEach(el => {
  el.innerHTML = sigilSVG(el.dataset.sigil, '#c9a227', '#e8d9a0');
});

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
    <div class="house-plate" aria-hidden="true">
      <img src="${(window.assetURL || (x=>x))(`assets/houses/${h.key}.jpg`)}" alt="" loading="lazy"
           onerror="this.parentNode.remove()">
    </div>
    <div class="house-sig" data-sigil="${h.key}">${sigilSVG(h.key, h.c1, h.accent)}</div>
    <h3 class="house-name">${h.name}</h3>
    <p class="house-words">${h.words}</p>
    <p class="house-seat">${h.seat} · ${h.region}</p>`;
  houseGrid.appendChild(el);
  watchReveal(el);
});

let openPanel = null;
let openKey = null;

function closeHouse() {
  if (openPanel) { openPanel.remove(); openPanel = null; }
  $$('.house').forEach(c => c.classList.remove('open'));
  openKey = null;
}

function openHouse(key) {
  const h = houseByKey[key];
  if (!h || !h.blurb) return;
  /* clicking the open house again closes it */
  if (openKey === key) { closeHouse(); return; }
  const card = $(`.house[data-key="${key}"]`);
  closeHouse();
  card.classList.add('open');
  openKey = key;

  const panel = document.createElement('div');
  panel.className = 'house-panel';
  panel.style.setProperty('--hc1', h.c1);
  panel.innerHTML = `
    <button class="hp-close" aria-label="Close">close ✕</button>
    <div class="hp-sig" data-sigil="${h.key}">${sigilSVG(h.key, h.c1, h.accent)}</div>
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
      <div class="hp-banners">
        <b>Sworn to ${h.name}</b>
        <p>${(h.banners || []).map(n => `<span>${n}</span>`).join('')}</p>
      </div>
    </div>`;

  /* drop the panel at the end of the card's visual row */
  const cards = $$('.house', houseGrid).filter(c => c !== openPanel);
  const idx = cards.indexOf(card);
  const perRow = Math.max(1, Math.round(houseGrid.clientWidth /
    (card.getBoundingClientRect().width + 24)));
  const insertAfter = cards[Math.min(cards.length - 1,
    Math.floor(idx / perRow) * perRow + perRow - 1)];
  insertAfter.after(panel);
  dropInSigils(panel);
  openPanel = panel;

  panel.querySelector('.hp-close').addEventListener('click', closeHouse);
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

/* ══════════════════════════════ 2 · SEASONS ═══════════════════════════════ */

/* Kept in one narrow band — pewter, bone, gold, dried blood — so the eight
   cards read as one set of objects instead of eight highlighter pens. */
const MOOD_COLOR = {
  stark: '#b6bcc0', wildfire: '#7f9c74', blood: '#96382f', lannister: '#c2a04a',
  ice: '#9cb6c4', green: '#8a9c73', fire: '#b5702f', night: '#93a6b4'
};

const rail = $('#seasonRail');
rail.innerHTML = SEASONS.map(s => `
  <article class="season" style="--sc:${MOOD_COLOR[s.mood] || '#c9a227'}">
    <div class="season-plate" aria-hidden="true">
      <img src="${(window.assetURL || (x=>x))(`assets/seasons/s${s.n}.jpg`)}" alt="" loading="lazy"
           onerror="this.parentNode.remove()">
    </div>
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

/* The deck reads left to right, but nobody should have to find a horizontal
   scrollbar to get past it. So the section is made tall enough to hold the
   whole run, the deck is pinned inside it, and ordinary downward scrolling is
   what walks the cards across. When the last one lands, the section ends and
   the page carries on down as normal.

   The cards stay the size they were designed at. If the pinned frame is
   shorter than a card, the whole deck is scaled to fit rather than the type
   being squeezed — the layout never reflows, so nothing can collide. */
const seasonsSec = $('#seasons');
const railTrack = $('#railTrack');
const railOuter = $('.rail-outer');
const railStage = $('.rail-stage');
const railBar = $('.rail-progress i');
const railPin = $('.rail-pin');
let railSpan = 0, railScale = 1, railAt = 0;
/* the share of the frame the deck may fill, so a card is never flush with an
   edge even when every measurement below is exactly right */
const DECK_FIT = 0.94;

/* How much of the pinned frame is really on screen.

   The frame is 100vh tall, but a vh is not always a height you can see: when
   the page is embedded, the viewport it is told about can be taller than the
   window showing it, and the difference comes off the bottom — which is
   exactly where the last line of a season card lives. Nothing inside the page
   can ask how much of it is on screen, but an IntersectionObserver's implicit
   root is the top-level viewport clipped through every frame in between, so
   the tallest intersection it ever reports for the pinned frame is the band
   the reader can actually see. */
let visibleFrame = 0;
if (railPin && window.IntersectionObserver) {
  new IntersectionObserver(entries => {
    let found = 0;
    entries.forEach(e => { found = Math.max(found, e.intersectionRect.height); });
    if (found > visibleFrame + 4) { visibleFrame = found; measureRail(); }
  }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(railPin);
}

function measureRail() {
  const off = window.matchMedia('(max-width: 760px)').matches || reduced;
  if (off) {
    railTrack.style.height = '';
    railStage.style.removeProperty('--rs');
    rail.style.transform = '';
    railSpan = 0;
    return;
  }
  /* offsetHeight/scrollWidth are layout values, so the transform already on
     the stage does not feed back into the measurement */
  const deckH = rail.offsetHeight;

  /* the part of the frame that is off the bottom of the window, if any */
  const lost = visibleFrame
    ? clamp(railPin.clientHeight - visibleFrame, 0, railPin.clientHeight * 0.4)
    : 0;
  const availH = Math.max(200, railOuter.clientHeight - lost) * DECK_FIT;
  railScale = clamp(availH / Math.max(deckH, 1), 0.55, 1);
  railStage.style.setProperty('--rs', railScale.toFixed(4));
  /* the deck is centred in its frame, so centring it in the visible band is
     a lift of half whatever the window is cutting off */
  railStage.style.setProperty('--ry', (-lost / 2).toFixed(1) + 'px');

  /* travel is in screen pixels, so one pixel of scroll is one pixel of card */
  railSpan = Math.max(0, rail.scrollWidth * railScale - railOuter.clientWidth);
  railTrack.style.height = (window.innerHeight + railSpan) + 'px';
}

function updateRail(dt) {
  if (!railSpan) return;
  const top = railTrack.getBoundingClientRect().top;
  const target = clamp(-top / railSpan, 0, 1) * railSpan;
  /* a wheel notch is a jump of a hundred-odd pixels; easing toward the target
     turns that into a glide without ever losing sync with the scrollbar */
  railAt += (target - railAt) * (1 - Math.exp(-dt * 11));
  if (Math.abs(target - railAt) < 0.15) railAt = target;
  rail.style.transform =
    `translate3d(${(-railAt / railScale).toFixed(2)}px,0,0)`;
  if (railBar) railBar.style.transform = `scaleX(${(railAt / railSpan).toFixed(4)})`;
}

measureRail();
/* The deck's height depends on how the copy wraps, which depends on the
   webfont — and that can land well after first paint. Measuring only once
   leaves the cards taller than the frame that was sized for the fallback
   face, which shows up as the last line of every card being cut off. */
window.addEventListener('load', measureRail);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureRail);
if (window.ResizeObserver) new ResizeObserver(measureRail).observe(rail);

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
  sec.dataset.moment = m.id;
  sec.style.setProperty('--mc', FX_COLOR[m.fx] || '#c9a227');
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
    momentFx.push({ el: sec, id: m.id, fx: MomentFX(sec.querySelector('canvas'), m), vis: 0 });
  }
});

/* Anything supplied in assets/manifest.json takes over from what the code
   draws — backdrops, sigils, portraits, the throne, the score. See
   js/assets.js for the format. */
Assets.ready.then(() => {
  /* backdrops */
  momentFx.forEach(m => {
    const url = Assets.scene(m.id);
    if (url) m.fx.setImage(url);
  });
  Object.keys(BACKDROPS).forEach(id => {
    const url = Assets.scene(id);
    if (url) BACKDROPS[id].setImage(url);
  });

  /* house emblems, wherever they appear — including anything built later */
  sigilsReady = true;
  dropInSigils(document);

  /* cast portraits */
  $$('[data-portrait]').forEach(el => {
    const url = Assets.cast(el.dataset.portrait);
    if (!url) return;
    el.innerHTML = `<img src="${url}" alt="">`;
    el.classList.add('has-img');
    el.closest('.cast-card').classList.add('has-photo');
  });

  /* a clip supplied as "hero" replaces the still sequence behind the title */
  const heroClip = Assets.hero();
  if (heroClip) {
    const v = $('#heroVideo');
    v.src = heroClip;
    v.addEventListener('canplay', () => {
      $('.hero-plate').classList.add('has-video');
      v.play().catch(() => $('.hero-plate').classList.remove('has-video'));
    }, { once: true });
    v.addEventListener('error', () => $('.hero-plate').classList.remove('has-video'), { once: true });
  }

  /* the manifest can point the throne section's opening plate elsewhere */
  const throneShot = Assets.throne();
  if (throneShot) $('#throneShot .ts').src = throneShot;
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
    <div class="cast-photo" data-portrait="${c.name}"></div>
    <div class="cast-sig" data-sigil="${c.house}">${sigilSVG(c.house, h.c1, h.accent || h.c2)}</div>
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

const embers  = reduced ? null : EmberField($('#heroEmbers'), { count: 46 });
const gateEmb = reduced ? null : EmberField($('#gateEmbers'), { count: 54 });
const endEmb  = reduced ? null : EmberField($('#endEmbers'), { count: 80 });
const snow    = reduced ? null : SnowField($('#snowFx'), { count: 240 });

/* Painted backdrops for the two big atmospheric sections. They run
   backdrop-only, since each already has its own particle system on top. */
const BACKDROPS = {};
if (!reduced) {
  BACKDROPS.thewall = MomentFX($('#lnBg'),
    { fx: 'ice', scene: 'wall', sceneSeed: 501, noParticles: true });
  BACKDROPS.dragons = MomentFX($('#dragonBg'),
    { fx: 'fire', scene: 'pyre', sceneSeed: 502, noParticles: true });
}
const cursor  = (reduced || matchMedia('(pointer: coarse)').matches)
  ? null : CursorTrail($('#cursorFx'));

$('#swordCount').textContent = '1,000';

/* pointer parallax for the two GL scenes */
const heroPlate = $('#heroImg');
window.addEventListener('pointermove', e => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  /* a hand's width of drift on the hero plate, so it never sits dead still */
  if (heroPlate && !reduced) {
    heroPlate.style.setProperty('--px', (nx * -14).toFixed(1) + 'px');
    heroPlate.style.setProperty('--py', (ny * -10).toFixed(1) + 'px');
  }
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

/* Each panel's copy settles as the panel takes the frame and lifts away as it
   leaves, so the sequence still moves without one panel sliding over another.
   The falloff is steep on purpose: a moment holds full weight while its centre
   is within a fifth of a screen of yours and is all but dark by the halfway
   mark, so you are reading one of them at a time rather than two ghosts. */
function updateMoments() {
  const vh = window.innerHeight;
  momentFx.forEach(m => {
    if (visible.get(m.el) === false) { m.vis = 0; return; }
    const r = m.el.getBoundingClientRect();
    /* -1 below the frame, 0 centred, +1 above it */
    const off = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
    const centred = 1 - Math.min(1, Math.abs(off) * 1.8);
    m.vis = centred;
    const inner = m.el.querySelector('.moment-inner');
    inner.style.opacity = String(smooth(clamp(centred * 1.6, 0, 1)));
    inner.style.transform =
      `translateY(${(off * 52).toFixed(1)}px) scale(${(0.965 + centred * 0.035).toFixed(3)})`;
  });
}

/* throne: spin through the section, melt across the last stretch */
const throneSec = $('#throne');
const throneSteps = $$('.throne-step');
const thronePlates = $$('#throneShot .ts');
let throneAt = 0;
function updateThrone(dt) {
  const r = throneSec.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  const target = clamp(-r.top / Math.max(total, 1), 0, 1);
  throneAt += (target - throneAt) * (1 - Math.exp(-dt * 9));
  if (Math.abs(target - throneAt) < 0.0004) throneAt = target;
  const p = throneAt;
  /* a slow push into the chair, then the heat coming up under it */
  const shot = $('#throneShot');
  if (shot) {
    const melt = smooth(clamp((p - 0.45) / 0.35, 0, 1));
    shot.style.setProperty('--z', (1.02 + p * 0.16).toFixed(3));
    shot.style.setProperty('--dy', (p * -2.5).toFixed(2) + '%');
    shot.style.setProperty('--melt', melt.toFixed(3));
  }

  const step = p < 0.34 ? 0 : p < 0.62 ? 1 : 2;
  throneSteps.forEach(s => s.classList.toggle('on', +s.dataset.step === step));
  thronePlates.forEach(i => i.classList.toggle('on', +i.dataset.step === step));
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
  updateThrone(dt);
  updateRail(dt);

  /* the gate is a shot too, so it gets its own embers until it is dismissed */
  if (gateEmb && !entered) gateEmb.step(dt, 1);

  /* hero: embers over the plate, and the plate lifts away as you leave */
  if (isVis('#hero')) {
    const hp = clamp(scrollY / Math.max(window.innerHeight, 1), 0, 1);
    if (embers) embers.step(dt, 1 - hp * 0.75);
    const plate = $('.hero-plate');
    if (plate && !reduced) {
      plate.style.transform = `translate3d(0, ${(hp * 12).toFixed(2)}%, 0)`;
      plate.style.opacity = String(1 - hp * 0.35);
    }
    const copy = $('.hero-copy');
    if (copy && !reduced) {
      copy.style.transform = `translate3d(0, ${(hp * -34).toFixed(1)}px, 0)`;
      copy.style.opacity = String(clamp(1 - hp * 1.5, 0, 1));
    }
  }


  /* dragons + snow + end embers */
  if (isVis('#dragons')) {
    BACKDROPS.dragons.step(dt, 1);
  }
  if (snow && isVis('#longnight')) {
    BACKDROPS.thewall.step(dt, 1);
    snow.step(dt, 1);
  }
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
  measureRail();
  [embers, gateEmb, endEmb, snow, cursor].forEach(o => o && o.resize && o.resize());
  Object.keys(BACKDROPS).forEach(k => BACKDROPS[k].resize());
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
  document.documentElement.classList.remove('pre-enter');
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
  el.textContent = Score.playing ? 'Now playing — Main Title.' : 'Main Title.';
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
  if (e.key === 'Escape' && openPanel) closeHouse();
});

/* if someone lands mid-page (a refresh at scroll position), skip the gate */
if (window.scrollY > window.innerHeight * 0.5) enter(false);

})();
