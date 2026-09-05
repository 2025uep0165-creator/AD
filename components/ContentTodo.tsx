'use client';

import { useState } from 'react';
import { collectTodos } from '@/lib/todos';

/**
 * Dev-only. Lists everything Udhay still has to send, read straight out of
 * content.ts. Never rendered in a production build — see app/page.tsx.
 */
export default function ContentTodo() {
  const [open, setOpen] = useState(false);
  const todos = collectTodos();
  const facts = todos.filter((t) => t.kind === 'fact');
  const media = todos.filter((t) => t.kind === 'media');

  return (
    <div className="fixed bottom-4 left-4 z-[80] max-w-[min(30rem,calc(100vw-2rem))] print:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="u-mono min-h-[44px] border border-ink bg-ink px-4 text-bone"
      >
        {open ? 'Hide' : `Content TODO · ${todos.length}`}
      </button>

      {open && (
        <div className="mt-2 max-h-[60vh] overflow-auto border border-ink bg-paper p-4">
          <p className="u-mono mb-3 text-smoke">Facts to confirm · {facts.length}</p>
          <ul className="mb-5 space-y-2 text-sm">
            {facts.map((t) => (
              <li key={t.path}>
                <code className="u-mono text-saffron">{t.path}</code>
                <span className="block text-smoke">{t.ask}</span>
              </li>
            ))}
          </ul>
          <p className="u-mono mb-3 text-smoke">Media to send · {media.length}</p>
          <ul className="space-y-2 text-sm">
            {media.map((t) => (
              <li key={t.path}>
                <code className="u-mono text-saffron">{t.path}</code>
                <span className="block text-smoke">{t.ask}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
