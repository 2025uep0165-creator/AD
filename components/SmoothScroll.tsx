'use client';

import { useEffect } from 'react';

/**
 * Lenis, loaded lazily and only where it is an improvement.
 *
 * Deliberately NOT enabled on touch: hijacking momentum on a mid-range Android
 * is the single fastest way to make a site feel broken. Lenis here smooths the
 * wheel on pointer:fine devices and leaves touch scrolling entirely native.
 * Also skipped under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let raf = 0;
    let cancelled = false;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 0.9,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false, // native momentum on touch, always
      });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
