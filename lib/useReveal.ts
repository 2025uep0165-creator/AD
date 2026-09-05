'use client';

import { useEffect } from 'react';

/**
 * One IntersectionObserver for the entire page.
 *
 * Reveal is a CSS clip-path wipe (see globals.css). JS only ever flips one
 * attribute — there is no per-element animation loop, which is what keeps this
 * affordable on a mid-range Android.
 *
 * Usage: <div data-reveal style={{ '--reveal-delay': '120ms' }}>
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal=""], [data-reveal-x=""]');
    if (!nodes.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      nodes.forEach((n) => {
        if (n.hasAttribute('data-reveal')) n.setAttribute('data-reveal', 'shown');
        if (n.hasAttribute('data-reveal-x')) n.setAttribute('data-reveal-x', 'shown');
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          if (el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'shown');
          if (el.hasAttribute('data-reveal-x')) el.setAttribute('data-reveal-x', 'shown');
          io.unobserve(el);
        }
      },
      // threshold MUST stay 0. The hidden state is a clip-path that shrinks the
      // element's visible rect to nothing, so intersectionRatio is always 0 and
      // any non-zero threshold deadlocks: the element can never trigger its own
      // reveal. rootMargin does the timing instead — it fires a little before
      // the element lands, so the wipe finishes on screen.
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}
