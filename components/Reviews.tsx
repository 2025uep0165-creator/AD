import { resolve, reviewQuotes, studio } from '@/lib/content';
import { stagger } from '@/lib/stagger';

/**
 * Section 11 — reviews.
 *
 * The aggregate is real: 4.8 from 21 Google reviews. The quotes are not ours
 * to write, so until the real ones are pasted into content.ts this section
 * shows the rating and sends people straight to Google. One real review beats
 * five invented ones — and an invented one is the fastest way to lose a
 * first-timer who checks.
 */
export default function Reviews() {
  const quotes = reviewQuotes
    .map((r) => ({ quote: resolve(r.quote), name: resolve(r.name) }))
    .filter((r): r is { quote: string; name: string } => Boolean(r.quote));

  const url = resolve(studio.reviews.url);
  const stars = Math.round(studio.reviews.rating);

  return (
    <section className="border-t border-ink/15 py-20 sm:py-24">
      <div className="u-gutter">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <p className="u-mono text-saffron">Reviews</p>
            <p className="u-display mt-5 text-[clamp(3rem,14vw,7rem)] leading-none">
              {studio.reviews.rating.toFixed(1)}
              <span className="text-saffron">★</span>
            </p>
            <p className="u-mono mt-3 text-smoke">
              <span className="sr-only">{stars} out of 5 stars. </span>
              {studio.reviews.count} Google reviews
            </p>
          </div>

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono inline-flex min-h-[56px] items-center border border-ink px-7 transition-colors duration-300 ease-ink hover:bg-ink hover:text-bone"
            >
              Read them on Google
            </a>
          ) : null}
        </div>

        {quotes.length > 0 && (
          <ul className="mt-14 grid gap-px border-t border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((r, i) => (
              <li key={r.name + i} data-reveal="" style={stagger(i, 70)} className="bg-bone p-6 sm:p-7">
                <blockquote className="text-[1.0625rem] leading-relaxed">“{r.quote}”</blockquote>
                <p className="u-mono mt-5 text-smoke">{r.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
