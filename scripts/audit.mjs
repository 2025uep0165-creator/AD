/**
 * Accessibility, behaviour and performance checks against a running build.
 *
 *   npm run build
 *   npx next start -p 3100     (or: ./scripts/preview.sh)
 *   npm run audit
 *
 * These are the checks behind the claims in the README: axe-core clean on
 * mobile and desktop, every touch target at least 44px, the booking form
 * composing a real WhatsApp message, prefers-reduced-motion fully honoured,
 * and LCP under 2.5s on throttled Slow 4G with a 4x CPU penalty.
 */
import { existsSync, readFileSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const URL = process.env.AUDIT_URL ?? 'http://localhost:3100';
const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);

const pass = [];
const fail = [];
const check = (name, ok, detail = '') => (ok ? pass : fail).push(name + (detail ? ` — ${detail}` : ''));

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

/** Walk the page so every scroll-triggered reveal has fired. */
const settle = async (p) => {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 25));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(900);
};

/* -------------------------------------------------------------------------- */
/*  1 · axe-core, mobile and desktop                                          */
/* -------------------------------------------------------------------------- */
for (const device of ['Pixel 7', 'Desktop Chrome']) {
  const ctx = await browser.newContext({ ...devices[device] });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await settle(p);
  await p.addScriptTag({ content: axe });
  const res = await p.evaluate(() =>
    window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    }),
  );
  check(`axe-core clean on ${device}`, res.violations.length === 0, `${res.violations.length} violations`);
  for (const v of res.violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
    v.nodes.slice(0, 3).forEach((n) => console.log('     ', n.html.slice(0, 130).replace(/\s+/g, ' ')));
  }
  await ctx.close();
}

/* -------------------------------------------------------------------------- */
/*  2 · behaviour                                                             */
/* -------------------------------------------------------------------------- */
{
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });

  const bar = p.locator('div.fixed.inset-x-0.bottom-0').first();
  const hero = await p.locator('#hero a[href*="wa.me"]').first().getAttribute('href');
  check('hero CTA targets the studio WhatsApp', /wa\.me\/919682516002\?text=./.test(hero));

  check('sticky bar hidden over the hero', await bar.evaluate((e) => e.classList.contains('translate-y-full')));
  await p.locator('#work').scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  check('sticky bar appears past the hero', await bar.evaluate((e) => e.classList.contains('translate-y-0')));
  await p.locator('#book').scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  check('sticky bar hides over the booking form', await bar.evaluate((e) => e.classList.contains('translate-y-full')));

  await p.locator('#work').scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  const all = await p.locator('#work ul > li').count();
  await p.getByRole('button', { name: 'Devotional', exact: true }).click();
  await p.waitForTimeout(500);
  const some = await p.locator('#work ul > li').count();
  check('gallery filters narrow the list', some > 0 && some < all, `${all} → ${some}`);
  await p.getByRole('button', { name: 'All', exact: true }).click();
  await p.waitForTimeout(400);

  await p.locator('#work ul > li button').first().click();
  await p.waitForTimeout(500);
  const dlg = p.locator('[role="dialog"][aria-modal="true"]:not(#menu-panel)');
  check('lightbox opens as a modal dialog', (await dlg.count()) === 1);
  check('lightbox locks body scroll', await p.evaluate(() => document.body.style.overflow === 'hidden'));
  const first = await dlg.getAttribute('aria-label');
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(350);
  check('arrow keys move between pieces', (await dlg.getAttribute('aria-label')) !== first);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(450);
  check('Escape closes the lightbox', (await p.locator('[role="dialog"][aria-modal="true"]:not(#menu-panel)').count()) === 0);
  check('scroll lock released on close', await p.evaluate(() => document.body.style.overflow !== 'hidden'));

  const q = p.getByRole('button', { name: /Does it hurt/ });
  await q.scrollIntoViewIfNeeded();
  check('FAQ starts collapsed', (await q.getAttribute('aria-expanded')) === 'false');
  await q.click();
  await p.waitForTimeout(500);
  check('FAQ expands', (await q.getAttribute('aria-expanded')) === 'true');
  check(
    'FAQ panel is a labelled region',
    (await p.locator(`#${await q.getAttribute('aria-controls')}`).getAttribute('role')) === 'region',
  );

  await p.locator('#book').scrollIntoViewIfNeeded();
  await p.fill('#name', 'Test Person');
  await p.fill('#phone', '+919999999999');
  await p.fill('#placement', 'Forearm');
  await p.selectOption('#style', 'Devanagari / Sanskrit');
  // Capture rather than navigate — this asserts the composed URL, not wa.me.
  await p.evaluate(() => {
    window.__opened = null;
    window.open = (u) => ((window.__opened = u), null);
  });
  await p.getByRole('button', { name: 'Open WhatsApp' }).click();
  await p.waitForTimeout(200);
  const composed = (await p.evaluate(() => window.__opened)) ?? '';
  check('form composes a wa.me link', composed.startsWith('https://wa.me/919682516002?text='));
  const msg = decodeURIComponent(composed.split('text=')[1] ?? '');
  check('message carries the answers', ['Test Person', 'Devanagari / Sanskrit', 'Forearm'].every((s) => msg.includes(s)));

  const small = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a[href], button, input, select, [role="slider"]')) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      // A checkbox inside a large <label> is tapped via the label.
      const box = el.closest('label')?.getBoundingClientRect() ?? r;
      if (box.height < 44 || box.width < 44) out.push(`${el.tagName} ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
    return out;
  });
  check('every touch target is at least 44px', small.length === 0, small.slice(0, 5).join(', '));
  await ctx.close();
}

/* -------------------------------------------------------------------------- */
/*  3 · prefers-reduced-motion                                                */
/* -------------------------------------------------------------------------- */
{
  const ctx = await browser.newContext({ ...devices['Pixel 7'], reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => ({
    intro: document.documentElement.hasAttribute('data-intro'),
    glyphClip: getComputedStyle(document.querySelector('.dv-glyph')).clipPath,
    stillHidden: [...document.querySelectorAll('[data-reveal],[data-reveal-x]')].filter(
      (e) => getComputedStyle(e).clipPath !== 'none' && getComputedStyle(e).opacity !== '1',
    ).length,
    gsap: !!window.gsap,
  }));
  check('reduced motion: intro overlay never plays', r.intro === false);
  check('reduced motion: shloka is fully inked', r.glyphClip === 'none');
  check('reduced motion: GSAP is never loaded', r.gsap === false);
  check('reduced motion: nothing stays hidden', r.stillHidden === 0);
  await ctx.close();
}

/* -------------------------------------------------------------------------- */
/*  4 · LCP and CLS on Slow 4G with a 4x CPU penalty                          */
/* -------------------------------------------------------------------------- */
{
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
    latency: 400,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  const m = await p.evaluate(
    () =>
      new Promise((res) => {
        const out = { lcp: 0, cls: 0, el: '' };
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            out.lcp = e.startTime;
            out.el = e.element?.tagName ?? '';
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => res(out), 400);
      }),
  );
  check('LCP under 2.5s on Slow 4G', m.lcp < 2500, `${Math.round(m.lcp)}ms on <${m.el.toLowerCase()}>`);
  check('CLS under 0.1', m.cls < 0.1, m.cls.toFixed(4));
  await ctx.close();
}

await browser.close();

console.log('');
pass.forEach((x) => console.log('  ✓', x));
if (fail.length) {
  console.log('');
  fail.forEach((x) => console.log('  ✗', x));
}
console.log(`\n${pass.length} passed, ${fail.length} failed`);
process.exit(fail.length ? 1 : 0);
