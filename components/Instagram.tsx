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
          className="group flex flex-col gap-8 border border-ink bg-ink p-7 text-bone transition-colors duration-300 ease-ink hover:bg-saffron sm:flex-row sm:items-end sm:justify-between sm:p-10"
        >
          <span>
            <span className="u-mono block text-bone/60">Every piece, as it happens</span>
            <span className="u-display mt-4 block text-[clamp(1.9rem,7vw,3.5rem)] leading-none">
              @{studio.instagram.studio}
            </span>
          </span>
          <span className="u-mono shrink-0 text-bone/60 group-hover:text-bone">
            {studio.instagram.followers} followers →
          </span>
        </a>
      </div>
    </section>
  );
}
