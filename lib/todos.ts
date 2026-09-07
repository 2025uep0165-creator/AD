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

/**
 * Media no longer has a pending state — every image slot now ships a real
 * photograph — so what is worth tracking is the handful that are stand-ins.
 * Any object carrying a `need` string is one of those, and unlike a pending
 * field it is still rendered, which is exactly why it needs chasing.
 */
function hasPhotoAsk(v: unknown): v is { need: string } {
  return (
    typeof v === 'object' && v !== null && typeof (v as { need?: unknown }).need === 'string'
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
    if (hasPhotoAsk(node)) out.push({ path, ask: node.need, kind: 'media' });
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
  out.push({
    path: 'hero.proof',
    ask: 'Confirm the "600+ tattoos" figure, or delete that row from hero.proof.',
    kind: 'fact',
  });

  return out;
}
