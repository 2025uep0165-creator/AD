import LoadTransitionCleanup from './LoadTransitionCleanup';

/**
 * Section 1 — load transition.
 *
 * A single ink line draws the ॐ, then a soft-edged brush mask wipes upward to
 * reveal the hero. Hard-capped at 900ms.
 *
 * The overlay markup is server-rendered and hidden by default; the tiny script
 * below runs before first paint and only then un-hides it. That ordering is the
 * whole trick:
 *
 *   · no flash — the overlay is there from the very first paint, so you never
 *     see the hero get covered up a beat after it appears
 *   · repeat visitors and anyone on prefers-reduced-motion never see it at all,
 *     because the decision is made before paint rather than after hydration
 *   · it is never the LCP element — a stroked SVG path and a flat background
 *     are not LCP candidates, so LCP is still measured against the hero
 *   · if JS is off or fails, the CSS animation has already wiped it away and it
 *     is pointer-events:none regardless
 *
 * The animation is pure CSS keyframes (see globals.css) — no JS animation loop,
 * no library.
 */

const DECIDE = `(function(){
try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return}catch(e){}
try{if(sessionStorage.getItem('si-intro'))return;sessionStorage.setItem('si-intro','1')}catch(e){}
document.documentElement.setAttribute('data-intro','')})()`;

export default function LoadTransition() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: DECIDE }} />
      <div className="si-intro pointer-events-none fixed inset-0 z-[90] bg-ink" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 h-[38vmin] w-[38vmin] -translate-x-1/2 -translate-y-1/2">
          <g fill="none" stroke="var(--brass)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* The ॐ, drawn as a skeleton in three strokes. Path lengths are
                measured, not guessed — see scripts/measure-intro.mjs. */}
            <path
              className="si-draw"
              style={{ ['--len' as string]: 283, animationDelay: '0ms', animationDuration: '420ms' }}
              d="M46 76C52 56 84 48 100 64c12 12 4 28-14 26 24 2 36 20 34 42-2 24-28 38-52 30-18-6-26-22-22-36"
            />
            {/* the right stroke, curling into its loop */}
            <path
              className="si-draw"
              style={{ ['--len' as string]: 135, animationDelay: '360ms', animationDuration: '210ms' }}
              d="M118 116c16-12 34-18 48-10 14 8 14 30 0 38-14 8-28-2-24-16"
            />
            {/* chandra */}
            <path
              className="si-draw"
              style={{ ['--len' as string]: 49, animationDelay: '540ms', animationDuration: '130ms' }}
              d="M130 58c8 16 32 18 42 6"
            />
            {/* bindu */}
            <circle className="si-dot" cx="151" cy="40" r="5.5" fill="var(--brass)" stroke="none" />
          </g>
        </svg>
      </div>
      <LoadTransitionCleanup />
    </>
  );
}
