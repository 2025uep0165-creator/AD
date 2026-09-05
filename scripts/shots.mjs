import { existsSync, mkdirSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const OUT = process.env.SHOT_DIR ?? '/tmp/shots';
const DEV = process.env.SHOT_DEV ?? 'Pixel 7';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ ...devices[DEV] });
const page = await ctx.newPage();
await page.goto('http://localhost:3100', { waitUntil: 'networkidle' });

// Walk the whole page once so every scroll-triggered reveal has fired.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 30));
  }
});
await page.waitForTimeout(700);

for (const t of process.argv.slice(2)) {
  const [name, sel, offRaw] = t.split('=');
  const off = Number(offRaw ?? 0);
  if (sel && sel !== 'top') {
    await page.evaluate(
      ([s, o]) => {
        const el = document.querySelector(s);
        if (el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top + o);
      },
      [sel, off],
    );
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`${name}.png`);
}
await browser.close();
