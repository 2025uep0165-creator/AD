import * as C from './content';

/**
 * Walks content.ts and collects everything still outstanding.
 *
 * Used by the dev-only checklist panel and, more importantly, it means the
 * launch checklist cannot drift out of date — it IS the content file.
 */
export type Todo = { path: string; ask: string; kind: 'fact' | 'media' };

function isPending(v: unknown): v is { pending: true; ask: string } {
  return typeof v === 'object' && v !== null && (v as { pending?: unknown }).pending === true;
}

function isMedia(v: unknown): v is C.Media {
  return (
    typeof v === 'object' &&
    v !== null &&
    'plate' in (v as object) &&
    'need' in (v as object) &&
    'src' in (v as object)
  );
}

export function collectTodos(): Todo[] {
  const out: Todo[] = [];
  const seen = new WeakSet<object>();

  const walk = (node: unknown, path: string) => {
    if (typeof node !== 'object' || node === null) return;
    if (seen.has(node)) return;
    seen.add(node);

    if (isPending(node)) {
      out.push({ path, ask: node.ask, kind: 'fact' });
      return;
    }
    if (isMedia(node)) {
      if (node.src === null) out.push({ path, ask: node.need, kind: 'media' });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
  };

  for (const [k, v] of Object.entries(C)) {
    if (typeof v === 'function') continue;
    walk(v, k);
  }

  // Assets that have no slot in content.ts because they are file-system paths.
  out.push({ path: 'public/og.jpg', ask: C.seo.ogImageNeed, kind: 'media' });
  out.push({
    path: 'public/crest.svg',
    ask: 'The original gold crest file, so components/Crest.tsx can stop drawing a stand-in.',
    kind: 'media',
  });
  out.push({
    path: 'hero.proof',
    ask: 'Confirm the "600+ tattoos" figure, or delete that row from hero.proof.',
    kind: 'fact',
  });

  return out;
}
