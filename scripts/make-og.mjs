/**
 * Renders the OG share card to a PNG.
 *
 * Why a script and not next/og: Satori (which powers ImageResponse) does not
 * shape Devanagari — it cannot even parse Tiro's GSUB table, and if it could,
 * the matras would land in the wrong places. A share card that misspells a
 * shloka would undercut the exact claim the site makes about getting them
 * right, so this renders through a real browser text engine instead.
 *
 * Run:  npm run og
 * Out:  app/opengraph-image.png  (Next picks it up by filename)
 *
 * Replace it the moment Udhay sends a photograph of his best Devanagari piece:
 * drop that in as app/opengraph-image.jpg and delete the PNG.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);

const LINES = ['ॐ नमः पार्वती पतये', 'हर हर महादेव'];
const PHONE = '+91 96825 16002';

async function fontDataUri() {
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36' } },
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error('Could not find the Tiro Devanagari woff2 in the Google Fonts CSS');
  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
}

const html = (font) => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Tiro; src: url(${font}) format('woff2'); font-display: block; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0A0A0A; color: #EFEAE1;
         font-family: ui-sans-serif, system-ui, sans-serif;
         padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
  .label { font-size: 22px; letter-spacing: .3em; text-transform: uppercase; color: #C9A227; }
  .shloka { font-family: Tiro, serif; font-size: 92px; line-height: 1.45; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end;
          border-top: 1px solid rgba(239,234,225,.2); padding-top: 26px;
          font-size: 22px; letter-spacing: .28em; text-transform: uppercase; color: rgba(239,234,225,.72); }
  .phone { color: #E08A3C; }
</style>
<div class="label">Secret Ink Tattoo</div>
<div><div class="shloka">${LINES[0]}</div><div class="shloka">${LINES[1]}</div></div>
<div class="foot"><span>Janipur Colony · Jammu</span><span class="phone">${PHONE}</span></div>`;

const font = await fontDataUri();
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html(font), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

writeFileSync(new URL('../app/opengraph-image.png', import.meta.url), png);
console.log(`app/opengraph-image.png written — ${(png.length / 1024).toFixed(0)} KB`);
