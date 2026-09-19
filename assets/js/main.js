/* VFUHO — application logic. */

import { WORKS } from './works.js';
import { BRAND, FIGURES, CHAPTERS, DISCIPLINES, TECHNIQUES, TIMELINE, PLATFORMS, FILTERS } from './site.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOWPOWER = matchMedia('(max-width: 900px)').matches || navigator.hardwareConcurrency <= 4;

/* thumbnails straight from YouTube — vertical posters for Shorts, 16:9 for films */
const thumb = w => w.f === 'short'
  ? `https://i.ytimg.com/vi/${w.id}/oar2.jpg`
  : `https://i.ytimg.com/vi/${w.id}/maxresdefault.jpg`;
const fallback = w => `https://i.ytimg.com/vi/${w.id}/hqdefault.jpg`;

const CATNAME = {
  house: 'Villas & Houses', structure: 'Pillars & Structures', foundation: 'Foundations',
  water: 'Water & Power', detail: 'Stairs & Detail', bridge: 'Bridges'
};

/* =====================================================================
   1 · BUILD THE DOM
   ===================================================================== */

/* -- chapters over the 3D stage -- */
$('#chapters').innerHTML = CHAPTERS.map(c => `
  <article class="chap" data-k="${c.k}">
    <span class="chap__n">Chapter ${c.n}</span>
    <h2 class="chap__title">${c.title}</h2>
    <p class="chap__lead">${c.lead}</p>
    <p class="chap__body">${c.body}</p>
  </article>`).join('');
const CHAPS = $$('.chap');

/* -- HUD ticks -- */
$('#hudRail').innerHTML = CHAPTERS.map(c => `<div class="hud__tick"><span>${c.title}</span></div>`).join('');
const TICKS = $$('.hud__tick');

/* -- legacy figures -- */
$('#figures').innerHTML = FIGURES.map(f => `
  <div class="fig rv">
    <div class="fig__v" data-to="${f.display}" data-sfx="${f.suffix}">
      <span class="fig__num">0</span>${f.suffix ? `<sup>${f.suffix}</sup>` : ''}
    </div>
    <p class="fig__l">${f.label}</p>
    <p class="fig__n">${f.note}</p>
  </div>`).join('');

/* -- marquee of real thumbnails -- */
const strip = WORKS.filter(w => w.f === 'short').slice(0, 30);
$('#marqueeTrack').innerHTML = [...strip, ...strip]
  .map(w => `<img src="${thumb(w)}" alt="" loading="lazy" decoding="async">`).join('');

/* -- craft stack -- */
const stackPicks = ['8bNZvP4wH6c', 'F0GEhfGkYaA', 'cipdD8qpHVY', 'mzAB18R6ucY']
  .map(id => WORKS.find(w => w.id === id)).filter(Boolean);
$('#craftStack').innerHTML = stackPicks.map(w => `
  <figure data-id="${w.id}">
    <img src="${thumb(w)}" alt="${esc(w.t)}" loading="lazy" decoding="async">
    <figcaption>${w.v}</figcaption>
  </figure>`).join('');

/* -- disciplines -- */
$('#discGrid').innerHTML = DISCIPLINES.map((d, i) => {
  const n = WORKS.filter(w => w.c === d.k).length;
  const views = WORKS.filter(w => w.c === d.k).reduce((s, w) => s + w.n, 0);
  const hero = WORKS.find(w => w.id === d.hero) || WORKS.find(w => w.c === d.k);
  return `<article class="disc rv" data-cat="${d.k}" tabindex="0" role="button"
             aria-label="Filter the archive by ${esc(d.name)}">
    <img src="${thumb(hero)}" alt="" loading="lazy" decoding="async">
    <span class="disc__n">${String(i + 1).padStart(2, '0')}</span>
    <h3 class="disc__t">${d.name}</h3>
    <p class="disc__b">${d.blurb}</p>
    <p class="disc__c"><b>${n}</b> builds <i>·</i> <b>${big(views)}</b> views</p>
  </article>`;
}).join('');

/* -- filters -- */
$('#filters').innerHTML = FILTERS.map(f => {
  const n = f.k === 'all' ? WORKS.length : WORKS.filter(w => w.c === f.k).length;
  return `<button data-f="${f.k}" class="${f.k === 'all' ? 'is-on' : ''}">${f.label} <span>${n}</span></button>`;
}).join('');

/* -- hall of fame -- */
const fame = WORKS.slice(0, 8);
$('#fameList').innerHTML = fame.map((w, i) => `
  <div class="fr rv" data-id="${w.id}" tabindex="0" role="button" aria-label="Play ${esc(w.t)}">
    <span class="fr__r">${String(i + 1).padStart(2, '0')}</span>
    <div class="fr__mid">
      <img class="fr__th" src="${thumb(w)}" alt="" loading="lazy" decoding="async">
      <h3 class="fr__t">${esc(w.t)}</h3>
    </div>
    <span class="fr__v">${w.v.replace(/([\d.]+)([KMB])? views/, (_, n, s) => n + (s ? `<sup>${s}</sup>` : ''))}</span>
  </div>`).join('');

/* -- timeline -- */
$('#tl').innerHTML = TIMELINE.map(t => `
  <li><span class="tl__y">${t.year}</span><h3 class="tl__t">${t.title}</h3><p class="tl__b">${t.body}</p></li>`).join('');

/* -- technique ledger -- */
$('#ledger').innerHTML = TECHNIQUES.map(([t, d], i) => `
  <div class="lg rv"><span class="lg__n">${String(i + 1).padStart(2, '0')}</span>
  <span class="lg__t">${t}</span><span class="lg__d">${d}</span></div>`).join('');

/* -- platforms -- */
$('#plat').innerHTML = PLATFORMS.map(p => `
  <a class="pl rv" href="${p.url}" target="_blank" rel="noopener">
    <span class="pl__n">${p.name}</span>
    <span class="pl__s">${p.stat}</span>
    <span class="pl__sl">${p.statLabel}</span>
    <span class="pl__h">${p.handle}</span>
    <span class="pl__e">${p.extra}</span>
    <span class="pl__go">Visit <i>&#8599;</i></span>
  </a>`).join('');

/* =====================================================================
   2 · GALLERY
   ===================================================================== */
const gal = $('#gal'), moreBtn = $('#moreBtn'), workCount = $('#workCount');
const PAGE = 24;
let filter = 'all', shownCount = PAGE, view = WORKS;

function applyFilter(k) {
  filter = k;
  view = k === 'all' ? WORKS : WORKS.filter(w => w.c === k);
  shownCount = PAGE;
  renderGallery();
  $$('#filters button').forEach(b => b.classList.toggle('is-on', b.dataset.f === k));
}

function renderGallery() {
  const list = view.slice(0, shownCount);
  gal.innerHTML = list.map((w, i) => `
    <article class="card${w.n >= 100e6 ? ' card--epic' : ''}" data-id="${w.id}" data-f="${w.f}"
             tabindex="0" role="button" aria-label="Play ${esc(w.t)}"
             style="animation-delay:${Math.min(i, 23) * 26}ms">
      <img src="${thumb(w)}" alt="${esc(w.t)}" loading="lazy" decoding="async"
           onerror="this.onerror=null;this.src='${fallback(w)}'">
      <span class="card__badge">${w.n >= 100e6 ? '★ ' : ''}${w.v.replace(' views', '')}</span>
      <span class="card__play"><i></i></span>
      <div class="card__in">
        <p class="card__t">${esc(w.t)}</p>
        <p class="card__v">${CATNAME[w.c]}${w.d ? ' · ' + w.d : ''}</p>
      </div>
    </article>`).join('');
  moreBtn.style.display = shownCount >= view.length ? 'none' : '';
  workCount.textContent = `Showing ${list.length} of ${view.length} builds`;
}
applyFilter('all');

$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) applyFilter(b.dataset.f);
});
moreBtn.addEventListener('click', () => { shownCount += PAGE; renderGallery(); });

$('#discGrid').addEventListener('click', e => {
  const d = e.target.closest('.disc');
  if (!d) return;
  applyFilter(d.dataset.cat);
  $('#work').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
});
$('#discGrid').addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.disc')) { e.preventDefault(); e.target.click(); }
});

/* =====================================================================
   3 · LIGHTBOX
   ===================================================================== */
const lb = $('#lb'), lbFrame = $('#lbFrame');
let lbList = [], lbIdx = 0;

function openLb(id, list) {
  lbList = list || view;
  lbIdx = Math.max(0, lbList.findIndex(w => w.id === id));
  if (lbIdx < 0) lbIdx = 0;
  lb.hidden = false;
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => lb.classList.add('is-on'));
  paintLb();
}
function paintLb() {
  const w = lbList[lbIdx];
  if (!w) return;
  lbFrame.classList.toggle('is-wide', w.f === 'film');
  lbFrame.innerHTML =
    `<iframe src="https://www.youtube-nocookie.com/embed/${w.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
       title="${esc(w.t)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
       allowfullscreen loading="lazy"></iframe>`;
  $('#lbTitle').textContent = w.t;
  $('#lbViews').textContent = w.v;
  $('#lbCat').textContent = CATNAME[w.c] + (w.d ? ' · ' + w.d : '');
  $('#lbOut').href = w.f === 'short'
    ? `https://www.youtube.com/shorts/${w.id}`
    : `https://www.youtube.com/watch?v=${w.id}`;
}
function closeLb() {
  lb.classList.remove('is-on');
  document.body.classList.remove('is-locked');
  setTimeout(() => { lb.hidden = true; lbFrame.innerHTML = ''; }, 420);
}
const step = d => { lbIdx = (lbIdx + d + lbList.length) % lbList.length; paintLb(); };

$('#lbX').addEventListener('click', closeLb);
$('#lbPrev').addEventListener('click', () => step(-1));
$('#lbNext').addEventListener('click', () => step(1));
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb__stage')) closeLb(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

gal.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) openLb(c.dataset.id, view); });
gal.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.card')) { e.preventDefault(); e.target.click(); }
});
$('#fameList').addEventListener('click', e => { const r = e.target.closest('.fr'); if (r) openLb(r.dataset.id, fame); });
$('#fameList').addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.fr')) { e.preventDefault(); e.target.click(); }
});
$('#craftStack').addEventListener('click', e => {
  const f = e.target.closest('figure'); if (f) openLb(f.dataset.id, stackPicks);
});

/* =====================================================================
   4 · NAV + REVEALS + COUNTERS
   ===================================================================== */
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('is-stuck', scrollY > 40), { passive: true });
$('#burger').addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  $('#burger').setAttribute('aria-expanded', open);
});
$$('.nav__links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));

const revealer = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealer.unobserve(e.target); } });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
$$('.rv, .tl li').forEach(el => revealer.observe(el));

const counters = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    counters.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.to), num = $('.fig__num', el);
    const dec = (el.dataset.to.split('.')[1] || '').length;
    if (REDUCED) { num.textContent = el.dataset.to; return; }
    const t0 = performance.now(), dur = 1700;
    (function tick(now) {
      const t = clamp((now - t0) / dur);
      num.textContent = (to * easeInOut(t)).toFixed(dec);
      if (t < 1) requestAnimationFrame(tick); else num.textContent = el.dataset.to;
    })(t0);
  });
}, { threshold: 0.5 });
$$('.fig__v').forEach(el => counters.observe(el));

/* =====================================================================
   5 · THE 3D STAGE
   ===================================================================== */
const canvas = $('#gl');
const stage = $('#build');
const hero = $('#hero');
const hudPct = $('#hudPct');
const scrollcue = $('#scrollcue');
const dragcue = $('#dragcue');
const boot = $('#boot'), bootBar = $('#bootBar');

/* scroll → build progress.
   0.00–0.10  house stands complete, hero copy
   0.10–0.19  the build strips back to bare ground
   0.19–1.00  the nine chapters rebuild it                            */
const HERO_END = 0.10, STRIP_END = 0.19;
function progressFromScroll(s) {
  if (s <= HERO_END) return 1;
  if (s < STRIP_END) return 1 - easeInOut((s - HERO_END) / (STRIP_END - HERO_END));
  return (s - STRIP_END) / (1 - STRIP_END);
}

let scene = null, raf = 0, last = performance.now();
let introAt = 0, introRunning = false, userScrolled = false;

async function startScene() {
  // The 3D stage is a progressive enhancement: if WebGL or the engine is
  // unavailable, the rest of the site still renders in full.
  try {
    const { createScene } = await import('./scene.js');
    scene = createScene(canvas, { lowPower: LOWPOWER });
  } catch (err) {
    console.warn('[vfuho] 3D stage unavailable — falling back to the still stage.', err);
    document.documentElement.classList.add('no-gl');
    stage.style.height = 'auto';
    finishBoot();
    return;
  }
  sizeScene();
  scene.jump(0);
  introRunning = !REDUCED;
  introAt = performance.now();
  if (REDUCED) scene.jump(1);
  last = performance.now();
  raf = requestAnimationFrame(loop);
  finishBoot();
  if (!LOWPOWER) setTimeout(() => {
    dragcue.classList.add('is-on');
    setTimeout(() => dragcue.classList.remove('is-on'), 4600);
  }, 6200);
}

function sizeScene() {
  if (!scene) return;
  scene.resize(stage.clientWidth || innerWidth, canvas.clientHeight || innerHeight);
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const rect = stage.getBoundingClientRect();
  const span = stage.offsetHeight - innerHeight;
  const s = clamp(-rect.top / (span || 1));
  const visible = rect.top < innerHeight && rect.bottom > 0;

  if (visible) {
    let p;
    if (introRunning && !userScrolled) {
      // on arrival the house assembles itself, then hands over to the scroll
      const t = clamp((now - introAt) / 4200);
      p = easeInOut(t);
      if (t >= 1) introRunning = false;
    } else {
      introRunning = false;
      p = progressFromScroll(s);
    }
    scene.setProgress(p);
    scene.render(dt);

    // chapter + HUD state
    const inChapters = s >= STRIP_END - 0.005 && !introRunning;
    const idx = inChapters ? Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length)) : -1;
    CHAPS.forEach((c, i) => c.classList.toggle('is-on', i === idx));
    TICKS.forEach((t, i) => {
      t.classList.toggle('is-on', i === idx);
      t.classList.toggle('is-done', idx > -1 && i < idx);
    });
    hero.classList.toggle('is-out', s > HERO_END * 0.62 && !introRunning);
    scrollcue.classList.toggle('is-out', s > 0.03);
    hudPct.textContent = Math.round(p * 100);
  }

  raf = requestAnimationFrame(loop);
}

addEventListener('scroll', () => { if (scrollY > 8) userScrolled = true; }, { passive: true, once: false });
addEventListener('resize', debounce(sizeScene, 160));
addEventListener('orientationchange', () => setTimeout(sizeScene, 320));

/* pause the loop when the tab is hidden */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (scene && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
});

/* =====================================================================
   6 · BOOT
   ===================================================================== */
function finishBoot() {
  bootBar.style.width = '100%';
  setTimeout(() => boot.classList.add('is-done'), 380);
  setTimeout(() => boot.remove(), 1400);
}

(function preload() {
  // warm the first screenful of thumbnails so nothing pops in empty
  const warm = [...strip.slice(0, 10), ...WORKS.slice(0, 10)];
  let done = 0;
  const total = warm.length;
  const bump = () => { done++; bootBar.style.width = Math.min(92, (done / total) * 92) + '%'; };
  warm.forEach(w => { const i = new Image(); i.onload = i.onerror = bump; i.src = thumb(w); });
  setTimeout(startScene, 620);            // don't hold the stage hostage to images
  setTimeout(finishBoot, 6000);           // hard failsafe
})();

/* =====================================================================
   utilities
   ===================================================================== */
function esc(s = '') {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function big(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return Math.round(n / 1e6) + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'K';
  return String(n);
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

console.log(`%c${BRAND.name}%c — ${BRAND.tagline}\nArchive: ${WORKS.length} builds · since ${BRAND.joined}`,
  'font:600 15px serif;color:#c2643b', 'color:#9a9088');
