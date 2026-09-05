'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

/**
 * Framer Motion, but only the DOM feature bundle and only via <m.*>.
 * The full `motion` export pulls in layout projection and 3D that this site
 * never uses; LazyMotion + domAnimation is roughly a third of the size.
 * That difference is most of the mobile JS budget.
 */
export default function Motion({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>;
}

/** The only easing on this site. */
export const EASE = [0.16, 1, 0.3, 1] as const;
