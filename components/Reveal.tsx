'use client';

import { useReveal } from '@/lib/useReveal';

/** Mounts the single page-wide reveal observer. Renders nothing. */
export default function Reveal() {
  useReveal();
  return null;
}
