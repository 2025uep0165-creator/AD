/**
 * Renders the OG share card to a PNG.
 *
 * This card is what a WhatsApp forward actually shows, which on this site is
 * the single most common way anyone arrives. It used to be a shloka set in
 * Devanagari; that line has been removed from the site, so a card still
 * advertising it was showing people content the page no longer contains.
 *
 * It is a photograph now rather than type, for the same reason the rest of the
 * site is: a thumbnail of real work outsells a thumbnail of a nice font.
 *
 * Why a script and not next/og: Satori (which powers ImageResponse) cannot
 * embed a JPEG from disk without a fetchable URL, and could not shape the
 * Devanagari this card used to carry either. A real browser does both.
 *
 * Run:  npm run og
 * Out:  app/opengraph-image.jpg  (Next picks it up by filename)
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

const PHONE = '+91 96825 16002';
const PHOTO = new URL('../public/images/hand-mandala.jpg', import.meta.url);

/** Fraunces, so the card is set in the same face as the headline it quotes. */
async function fraunces() {
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap',
    { headers: { 'User-Agent': UA } },
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error('Could not find the Fraunces woff2 in the Google Fonts CSS');
  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
}

const photo = `data:image/jpeg;base64,${readFileSync(PHOTO).toString('base64')}`;

const html = (font) => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Fraunces; src: url(${font}) format('woff2'); font-display: block; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0A0A0A; color: #EFEAE1;
         font-family: ui-sans-serif, system-ui, sans-serif; display: flex; }
  .panel { width: 660px; padding: 64px 56px 64px 72px;
           display: flex; flex-direction: column; justify-content: space-between; }
  .label { font-size: 21px; letter-spacing: .3em; text-transform: uppercase; color: #C9A227; }
  .head { font-family: Fraunces, Georgia, serif; font-size: 76px; line-height: 1.04;
          letter-spacing: -.015em; text-transform: uppercase; }
  .head em { font-style: normal; color: #E08A3C; }
  .foot { border-top: 1px solid rgba(239,234,225,.2); padding-top: 24px;
          font-size: 21px; letter-spacing: .22em; text-transform: uppercase;
          color: rgba(239,234,225,.72); display: flex; justify-content: space-between; }
  .phone { color: #E08A3C; }
  .shot { position: relative; flex: 1; overflow: hidden; }
  .shot img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%;
              filter: saturate(.82) contrast(1.03); }
  /* Feathers the photo into the panel so there is no hard seam down the card. */
  .shot::after { content: ''; position: absolute; inset: 0;
                 background: linear-gradient(90deg, #0A0A0A 0%, rgba(10,10,10,.55) 22%, transparent 60%); }
</style>
<div class="panel">
  <div class="label">Secret Ink Tattoo</div>
  <div class="head">Small<br>tattoos.<br><em>Permanent<br>meaning.</em></div>
  <div class="foot"><span>Janipur · Jammu</span><span class="phone">${PHONE}</span></div>
</div>
<div class="shot"><img src="${photo}" alt=""></div>`;

const font = await fraunces();
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html(font), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// JPEG, not PNG: the card is a photograph now, and the PNG of it was 421KB —
// five times the page's whole JS budget, fetched by every crawler and every
// chat client that unfurls the link.
const jpg = await page.screenshot({ type: 'jpeg', quality: 82 });
await browser.close();

writeFileSync(new URL('../app/opengraph-image.jpg', import.meta.url), jpg);
console.log(`app/opengraph-image.jpg written — ${(jpg.length / 1024).toFixed(0)} KB`);
