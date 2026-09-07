import { studio } from '@/lib/content';

/**
 * Section 5 — Instagram.
 *
 * This was a strip of six reel cards. The studio has no self-hosted MP4s and
 * no way to get them, so every card was a poster with no clip behind it; when
 * the placeholder artwork came out, the posters became photographs the visitor
 * had just scrolled past in the gallery, captioned as if they were videos.
 * A second, smaller look at the same ten pieces is not worth a section.
 *
 * What the strip was actually carrying is the follower count — the strongest
 * proof on the page after the review rating — so that is what is left. If real
 * clips ever arrive, a strip belongs here again.
 */
export default function Instagram() {
  return (
    <section className="border-t border-ink/15 py-16 sm:py-20">
      <div className="u-gutter">
        <a
          href={studio.instagram.studioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block border border-ink bg-ink p-7 text-bone transition-colors duration-300 ease-ink hover:bg-saffron sm:p-10"
        >
          <span className="u-mono block text-bone/60">Every piece, as it happens</span>

          {/* items-baseline, not items-end: the handle has descenders (_j), so
              aligning boxes put the follower count visibly above its baseline.
              Baseline alignment is what the eye actually reads as level. */}
          <span className="mt-5 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
            <span className="u-display text-[clamp(1.5rem,5.4vw,2.75rem)] leading-[1.15]">
              {/* Fraunces draws @ with no right sidebearing — its ink runs to
                  the edge of its box — so next to a letter the two read as
                  touching even though the boxes do not overlap. 0.18em is the
                  smallest gap that looks deliberate at display size, and there
                  is over 100px of spare width on a 412px phone to spend on it.
                  A margin on the @ alone, rather than tracking, keeps the rest
                  of the handle set normally. */}
              <span className="mr-[0.18em] inline-block">@</span>
              {studio.instagram.studio}
            </span>
            <span className="u-mono shrink-0 text-bone/60 transition-colors duration-300 ease-ink group-hover:text-bone">
              {studio.instagram.followers} followers →
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
