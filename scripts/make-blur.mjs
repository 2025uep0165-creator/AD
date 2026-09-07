/**
 * Generates the blur-up placeholders in lib/blur.ts.
 *
 * Every photograph on this site is a phone shot of dark ink on skin, and on a
 * slow connection each one is a second or more of blank grey box before it
 * appears. A 16px-wide JPEG of the same photo, inlined into the HTML as a data
 * URI, means the shape and colour are there from first paint and the real file
 * fades in over it — the page stops looking broken while it loads.
 *
 * They cost about 500 bytes each in the document, which is far less than the
 * perceived second they buy back.
 *
 * Run this after adding or replacing anything in public/images.
 *
 *   node scripts/make-blur.mjs
 */
import { readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../public/images/', import.meta.url).pathname;

/** Every image under public/images, as the web path the site uses. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(jpe?g|png)$/i.test(name) ? [full] : [];
  });
}

const entries = [];
for (const file of walk(ROOT).sort()) {
  const web = '/images/' + relative(ROOT, file);
  const buf = await sharp(file)
    .resize(16, null, { fit: 'inside' })
    .jpeg({ quality: 40 })
    .toBuffer();
  entries.push([web, `data:image/jpeg;base64,${buf.toString('base64')}`]);
  console.log(`${web} — ${buf.length}b`);
}

const out = `/**
 * Blur-up placeholders, one per photograph, inlined into the HTML so a slow
 * connection shows the shape of the image instead of an empty box.
 *
 * GENERATED — do not edit by hand. Run \`node scripts/make-blur.mjs\` after
 * adding or replacing anything in public/images.
 */
export const blur: Record<string, string> = {
${entries.map(([k, v]) => `  '${k}': '${v}',`).join('\n')}
};
`;
writeFileSync(new URL('../lib/blur.ts', import.meta.url), out);
console.log(`\nlib/blur.ts written — ${entries.length} placeholders, ${(out.length / 1024).toFixed(1)}KB`);
