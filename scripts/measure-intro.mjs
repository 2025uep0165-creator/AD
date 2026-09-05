/**
 * Prints getTotalLength() for each stroke in the load transition, so the
 * --len values in components/LoadTransition.tsx are measured rather than
 * guessed. A --len longer than the real path makes the stroke sit invisible
 * and then snap; shorter makes it start already partly drawn.
 *
 *   ./scripts/preview.sh && node scripts/measure-intro.mjs
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage();
await p.goto(process.env.AUDIT_URL ?? 'http://localhost:3100', { waitUntil: 'domcontentloaded' });
const lens = await p.$$eval('.si-draw', (ns) =>
  ns.map((n) => ({ len: Math.round(n.getTotalLength()), set: getComputedStyle(n).strokeDasharray })),
);
lens.forEach((l, i) => console.log(`stroke ${i + 1}: actual ${l.len}  currently set ${l.set}`));
await b.close();
