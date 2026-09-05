import type { CSSProperties } from 'react';

/**
 * Reveal delay for a list item. 60–80ms per step, as specified.
 * Plain module (no 'use client') so server components can use it too.
 */
export const stagger = (i: number, step = 70): CSSProperties =>
  ({ '--reveal-delay': `${i * step}ms` }) as CSSProperties;
