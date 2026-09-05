'use client';

import { useEffect } from 'react';

/** Takes the finished overlay back out of the layer stack. Purely tidiness — the
 *  CSS wipe has already hidden it and it never accepted pointer events. */
export default function LoadTransitionCleanup() {
  useEffect(() => {
    if (!document.documentElement.hasAttribute('data-intro')) return;
    const t = window.setTimeout(() => document.documentElement.removeAttribute('data-intro'), 950);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
