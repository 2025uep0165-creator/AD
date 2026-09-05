'use client';

import { useEffect, useState } from 'react';

/** SSR-safe. Always false on the server, so nothing motion-dependent renders early. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const on = () => setMatches(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);

  return matches;
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

/**
 * True when the connection is slow enough that we should not pull a video.
 * navigator.connection is Chromium-only — which is exactly the audience here.
 */
export function useSaveData() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const c = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean };
      }
    ).connection;
    if (!c) return;
    const t = c.effectiveType ?? '';
    setSlow(Boolean(c.saveData) || t === 'slow-2g' || t === '2g' || t === '3g');
  }, []);
  return slow;
}
