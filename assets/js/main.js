/* VFUHO — application logic. */

import { WORKS } from './works.js';
import { BRAND, FIGURES, CHAPTERS, DISCIPLINES, TECHNIQUES, TIMELINE, PLATFORMS, FILTERS, MOTION } from './site.js';

document.documentElement.classList.add('js');

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NARROW   = matchMedia('(max-width: 900px)').matches;
/* Render quality steps down on small screens and modest CPUs. */
const LOWPOWER = NARROW || navigator.hardwareConcurrency <= 4;
/* Looping video is a bandwidth question, not a CPU one — gate it on
   screen size, motion preference and the user's own data-saver setting. */
const NET = navigator.connection || {};
const CAN_AUTOPLAY = !NARROW && !REDUCED && !NET.saveData && !/(^|-)2g$/.test(NET.effectiveType || '');

/* thumbnails straight from YouTube — vertical posters for Shorts, 16:9 for films */
const thumb = w => w.f === 'short'
  ? `https://i.ytimg.com/vi/${w.id}/oar2.jpg`
  : `https://i.ytimg.com/vi/${w.id}/maxresdefault.jpg`;
const fallback = w => `https://i.ytimg.com/vi/${w.id}/hqdefault.jpg`;
const onerr = w => `onerror="this.onerror=null;this.src='${fallback(w)}'"`;

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
  .map(w => `<img src="${thumb(w)}" alt="" loading="lazy" decoding="async" ${onerr(w)}>`).join('');

/* -- craft stack -- */
const stackPicks = ['8bNZvP4wH6c', 'F0GEhfGkYaA', 'cipdD8qpHVY', 'mzAB18R6ucY']
  .map(id => WORKS.find(w => w.id === id)).filter(Boolean);
$('#craftStack').innerHTML = stackPicks.map(w => `
  <figure data-id="${w.id}">
    <img src="${thumb(w)}" alt="${esc(w.t)}" loading="lazy" decoding="async" ${onerr(w)}>
    <figcaption>${w.v}</figcaption>
  </figure>`).join('');

/* -- disciplines: an index you read, with a plate that answers it -- */
const discData = DISCIPLINES.map(d => {
  const of = WORKS.filter(w => w.c === d.k);
  return { ...d, n: of.length, views: of.reduce((s, w) => s + w.n, 0),
           hero: WORKS.find(w => w.id === d.hero) || of[0] };
});
$('#discList').innerHTML = discData.map((d, i) => `
  <li class="di rv${i === 0 ? ' is-on' : ''}" data-cat="${d.k}" data-i="${i}" tabindex="0" role="button"
      aria-label="Show ${esc(d.name)} in the archive">
    <span class="di__n mono">${String(i + 1).padStart(2, '0')}</span>
    <span class="di__body">
      <span class="di__t">${d.name}</span>
      <span class="di__b">${d.blurb}</span>
    </span>
    <span class="di__c mono"><b>${d.n}</b> builds<i></i><b>${big(d.views)}</b> views</span>
  </li>`).join('');

$('#discPlate').innerHTML = discData.map((d, i) => `
  <figure class="dp${i === 0 ? ' is-on' : ''}" data-i="${i}">
    <img src="${thumb(d.hero)}" alt="" loading="lazy" decoding="async" ${onerr(d.hero)}>
    <figcaption><span class="mono">${d.hero.v}</span>${esc(d.hero.t)}</figcaption>
  </figure>`).join('');

const discItems = $$('.di'), discPlates = $$('.dp');
let discActive = 0;
function showDiscipline(i) {
  if (i === discActive) return;
  discActive = i;
  discItems.forEach((el, k) => el.classList.toggle('is-on', k === i));
  discPlates.forEach((el, k) => el.classList.toggle('is-on', k === i));
}
$('#discList').addEventListener('pointerover', e => {
  const li = e.target.closest('.di'); if (li) showDiscipline(+li.dataset.i);
});
$('#discList').addEventListener('focusin', e => {
  const li = e.target.closest('.di'); if (li) showDiscipline(+li.dataset.i);
});

/* -- filters -- */
$('#filters').innerHTML = FILTERS.map(f => {
  const n = f.k === 'all' ? WORKS.length : WORKS.filter(w => w.c === f.k).length;
  return `<button data-f="${f.k}" class="${f.k === 'all' ? 'is-on' : ''}">${f.label} <span>${n}</span></button>`;
}).join('');

/* -- hall of fame -- */
const fame = WORKS.slice(0, 8);
const fameMax = fame[0].n;
$('#fameList').innerHTML = fame.map((w, i) => `
  <div class="fr rv" data-id="${w.id}" tabindex="0" role="button" aria-label="Play ${esc(w.t)}"
       style="--bar:${(w.n / fameMax * 100).toFixed(1)}%">
    <span class="fr__bar" aria-hidden="true"></span>
    <span class="fr__r">${String(i + 1).padStart(2, '0')}</span>
    <div class="fr__mid">
      <img class="fr__th" src="${thumb(w)}" alt="" loading="lazy" decoding="async" ${onerr(w)}>
      <h3 class="fr__t">${esc(w.t)}</h3>
    </div>
    <span class="fr__v">${w.v.replace(/([\d.]+)([KMB])? views/, (_, n, s) => n + (s ? `<sup>${s}</sup>` : ''))}</span>
  </div>`).join('');

/* -- timeline -- */
$('#tl').innerHTML = TIMELINE.map((t, i) => `
  <li data-n="${String(i + 1).padStart(2, '0')}">
    <span class="tl__y">${t.year}</span>
    <h3 class="tl__t">${t.title}</h3>
    <p class="tl__b">${t.body}</p>
  </li>`).join('');

/* -- technique ledger -- */
const techWorks = TECHNIQUES.map(([, , id]) => WORKS.find(w => w.id === id)).filter(Boolean);
$('#ledger').innerHTML = TECHNIQUES.map(([t, d, id], i) => {
  const w = WORKS.find(x => x.id === id);
  return `<div class="lg rv${w ? '' : ' is-flat'}"${w ? ` data-id="${id}" tabindex="0" role="button"
       aria-label="Watch a build that shows ${esc(t)}"` : ''}>
    <span class="lg__n">${String(i + 1).padStart(2, '0')}</span>
    <span class="lg__t">${t}</span>
    <span class="lg__d">${d}</span>
    ${w ? `<span class="lg__go mono"><img src="${thumb(w)}" alt="" loading="lazy" decoding="async" ${onerr(w)}>Watch <i>&#8599;</i></span>` : ''}
  </div>`;
}).join('');
$('#ledger').addEventListener('click', e => {
  const g = e.target.closest('.lg[data-id]');
  if (g) openLb(g.dataset.id, techWorks);
});
$('#ledger').addEventListener('keydown', e => {
  const g = e.target.closest('.lg[data-id]');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); g.click(); }
});

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

/* -- "In motion": three builds that play on loop where they stand -- */
const motionPicks = MOTION.map(id => WORKS.find(w => w.id === id)).filter(Boolean);
$('#motionRow').innerHTML = motionPicks.map(w => `
  <figure class="mo" data-id="${w.id}">
    <div class="mo__screen">
      <img src="${thumb(w)}" alt="${esc(w.t)}" loading="lazy" decoding="async" ${onerr(w)}>
      <span class="mo__play"><i></i></span>
    </div>
    <figcaption>
      <p class="mo__t">${esc(w.t)}</p>
      <p class="mo__v mono">${w.v}</p>
    </figcaption>
  </figure>`).join('');

/* Autoplay is opt-in by viewport and never on metered/low-power devices:
   the poster stays put on mobile and the tap opens the full player instead. */
if (CAN_AUTOPLAY) {
  const YT_ORIGIN = /(^|\.)youtube(-nocookie)?\.com$/;

  /* A player is only faded in once it reports that it is genuinely playing.
     If it is region-locked, has embedding disabled, or autoplay is refused,
     the iframe is dropped and the poster stays — a visitor never meets
     YouTube's "Video unavailable" panel. */
  function goLive(fig) {
    if (fig.querySelector('iframe')) return;
    const id = fig.dataset.id;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}`
          + `?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1`
          + `&rel=0&playsinline=1&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    f.title = 'Looping preview';
    f.setAttribute('allow', 'autoplay; encrypted-media');
    f.setAttribute('tabindex', '-1');
    f.setAttribute('aria-hidden', 'true');

    let settled = false;
    const stop = () => { settled = true; removeEventListener('message', onMsg); clearTimeout(timer); };
    const drop = () => { if (settled) return; stop(); fig.classList.remove('is-live'); f.remove(); };

    const onMsg = e => {
      if (!YT_ORIGIN.test(new URL(e.origin).hostname) || e.source !== f.contentWindow) return;
      let d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return; } }
      if (!d || typeof d !== 'object') return;
      if (d.event === 'onError' || d.info?.errorCode) return drop();
      // playerState 1 === playing
      const st = d.info?.playerState ?? (d.event === 'onStateChange' ? d.info : undefined);
      if (st === 1) { stop(); fig.classList.add('is-live'); }
    };
    addEventListener('message', onMsg);
    const timer = setTimeout(drop, 8000);

    f.addEventListener('load', () => {
      try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id }), '*'); } catch {}
    });
    fig.querySelector('.mo__screen').appendChild(f);
  }

  const player = new IntersectionObserver((es) => {
    es.forEach(e => {
      const fig = e.target;
      if (e.isIntersecting) goLive(fig);
      else { fig.classList.remove('is-live'); fig.querySelector('iframe')?.remove(); }
    });
  }, { threshold: 0.45 });
  $$('.mo').forEach(f => player.observe(f));
}

$('#motionIndex').innerHTML = motionPicks.map((w, i) => `
  <li data-id="${w.id}" tabindex="0" role="button" aria-label="Play ${esc(w.t)}">
    <span class="mono">${String(i + 1).padStart(2, '0')}</span>
    <span class="mi__t">${esc(w.t)}</span>
    <span class="mi__v mono">${w.v}</span>
  </li>`).join('');
$('#motionIndex').addEventListener('click', e => {
  const li = e.target.closest('li'); if (li) openLb(li.dataset.id, motionPicks);
});

$('#motionRow').addEventListener('click', e => {
  const f = e.target.closest('.mo');
  if (f) openLb(f.dataset.id, motionPicks);
});

/* -- the wall: a dense field of everything that has been finished -- */
const wallPicks = WORKS.filter(w => w.f === 'short').slice(0, 54);
$('#wallGrid').innerHTML = wallPicks
  .map(w => `<img src="${thumb(w)}" alt="" loading="lazy" decoding="async" data-id="${w.id}" ${onerr(w)}>`).join('');
$('#wallGrid').addEventListener('click', e => {
  if (e.target.dataset.id) openLb(e.target.dataset.id, wallPicks);
});

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

$('#discList').addEventListener('click', e => {
  const d = e.target.closest('.di');
  if (!d) return;
  applyFilter(d.dataset.cat);
  $('#work').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
});
$('#discList').addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.di')) { e.preventDefault(); e.target.closest('.di').click(); }
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

/* which section am I in? */
const navLinks = $$('.nav__links a');
const spy = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    navLinks.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === '#' + id));
  });
}, { threshold: 0.01, rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(a => {
  const el = document.querySelector(a.getAttribute('href'));
  if (el) spy.observe(el);
});

/* how far down the whole page am I? */
const prog = $('#prog');
let progQueued = false;
addEventListener('scroll', () => {
  if (progQueued) return;
  progQueued = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;
    progQueued = false;
  });
}, { passive: true });

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
let booted = false;
function finishBoot() {
  if (booted) return;
  booted = true;
  bootBar.style.width = '100%';
  setTimeout(() => boot.classList.add('is-done'), 380);
  setTimeout(() => { boot.remove(); hero.classList.add('is-lit'); }, 900);
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
