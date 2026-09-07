import Crest from './Crest';
import LoadTransitionCleanup from './LoadTransitionCleanup';

/**
 * Section 1 — load transition.
 *
 * The studio's gold crest settles onto ink, then a soft-edged brush mask wipes
 * upward to reveal the hero. Hard-capped at 900ms.
 *
 * This used to draw an ॐ stroke by stroke. The devotional framing came out of
 * the site at the client's request, and the drawn mark went with it — the
 * timing and the wipe are unchanged, because those were the parts worth
 * keeping. The crest is the studio's own artwork, which is a better thing to
 * open on than a glyph anyway.
 *
 * The overlay markup is server-rendered and hidden by default; the tiny script
 * below runs before first paint and only then un-hides it. That ordering is the
 * whole trick:
 *
 *   · no flash — the overlay is there from the very first paint, so you never
 *     see the hero get covered up a beat after it appears
 *   · repeat visitors and anyone on prefers-reduced-motion never see it at all,
 *     because the decision is made before paint rather than after hydration
 *   · it does not become the LCP element — the crest renders at 22vmin, far
 *     smaller than the hero headline it sits over, and the audit measures LCP
 *     on every run to keep it that way
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
        <div className="si-mark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Crest className="h-[18vmin] max-h-24" sizes="96px" />
        </div>
      </div>
      <LoadTransitionCleanup />
    </>
  );
}
