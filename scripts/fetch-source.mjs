/**
 * Bootstraps a Vercel file-tree deploy from this repository's own source.
 *
 * Vercel's file-tree deploy API takes source text only — it cannot carry the
 * photographs, the logo or the OG card, and hand-copying 130KB of TypeScript
 * into a deploy call risks corrupting it silently. This repository is public,
 * so instead the deploy ships three files (package.json, .npmrc and this
 * script) and unpacks the real tree here before `next build` runs. What goes
 * live is then byte-identical to the commit it was built from.
 *
 * Pin SOURCE_REF to a commit SHA so a rebuild can never pick up different
 * code than the one that was reviewed; it defaults to the working branch.
 *
 * A normal clone already has the source, so this no-ops and never touches the
 * network. It exists only for the deploy path, and stops being needed the
 * moment Vercel can read the repository from GitHub directly.
 *
 *   SOURCE_REF=<sha> node scripts/fetch-source.mjs
 */
import { existsSync } from 'node:fs';
import { writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const REPO = '2025uep0165-creator/AD';
const REF = process.env.SOURCE_REF ?? 'claude/secret-ink-tattoo-site-jom6sx';

// app/page.tsx is the one file the site cannot be built without.
if (existsSync('app/page.tsx')) {
  console.log('source: already present, nothing to fetch');
  process.exit(0);
}

const url = `https://codeload.github.com/${REPO}/tar.gz/${REF}`;
const res = await fetch(url);
if (!res.ok) throw new Error(`source: ${res.status} ${res.statusText} for ${url}`);

const archive = '.source.tar.gz';
await writeFile(archive, Buffer.from(await res.arrayBuffer()));
// --strip-components drops the owner-repo-sha/ wrapper GitHub adds.
execFileSync('tar', ['-xzf', archive, '--strip-components=1'], { stdio: 'inherit' });
await rm(archive);

console.log(`source: unpacked ${REPO}@${REF} into ${process.cwd()}`);
