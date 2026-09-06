/**
 * Refills the binary assets that a file-tree deploy cannot carry.
 *
 * The photographs, the logo and the OG card are committed to git, so a normal
 * clone already has them and this script does nothing. Vercel's file-tree
 * deploy API takes source text only, so a deploy made that way arrives without
 * them; this pulls the exact committed bytes back from the public raw endpoint
 * before `next build` runs, which keeps the deployed site identical to the
 * repository rather than pointing the browser at someone else's origin.
 *
 * Set ASSET_REF to build against a different branch or commit.
 *
 *   node scripts/fetch-assets.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';

const REPO = '2025uep0165-creator/AD';
const REF = process.env.ASSET_REF ?? 'claude/secret-ink-tattoo-site-jom6sx';
const PATHS = [
  'public/images/hand-mandala.jpg',
  'public/images/udhay.jpg',
  'public/images/crest.png',
  'app/opengraph-image.png',
];

const missing = PATHS.filter((p) => !existsSync(p));
if (missing.length === 0) {
  console.log('assets: all present, nothing to fetch');
  process.exit(0);
}

for (const path of missing) {
  const url = `https://raw.githubusercontent.com/${REPO}/${REF}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`assets: ${res.status} ${res.statusText} for ${url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  console.log(`assets: ${path} ${bytes.length}b`);
}
