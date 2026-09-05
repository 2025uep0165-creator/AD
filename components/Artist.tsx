import { artist, resolve, studio, waHref } from '@/lib/content';
import Frame from './Frame';

/**
 * Section 10 — the artist.
 *
 * First person. No experience claim is made anywhere here: the brief flagged
 * "EST. 2014" against "3 years experience" and until Udhay says which is true,
 * writing either would be inventing. See studio.established in content.ts.
 */
export default function Artist() {
  const detail = resolve(artist.detail);
  const est = resolve(studio.established);

  return (
    <section id="studio" className="py-20 sm:py-28">
      <div className="u-gutter grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
        <div data-reveal="" className="lg:sticky lg:top-24 lg:self-start">
          <Frame media={artist.portrait} label="Udhay" sizes="(min-width: 1024px) 26rem, 100vw" />
        </div>

        <div>
          <p className="u-mono text-saffron">{artist.eyebrow}</p>
          <h2 className="u-display mt-5 text-[clamp(2.5rem,10vw,6rem)]">{artist.name}</h2>
          <p className="u-mono mt-4 text-smoke">
            {est ? `Tattooing since ${est} · ` : ''}
            {studio.address.line2.split(',')[0]}, {studio.address.city}
          </p>

          <div className="mt-9 max-w-measure space-y-5 text-[1.0625rem] leading-relaxed">
            {artist.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {detail && <p>{detail}</p>}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={waHref(artist.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono inline-flex min-h-[56px] items-center bg-ink px-7 text-bone transition-colors duration-300 ease-ink hover:bg-saffron"
            >
              Talk it through
            </a>
            <a
              href={studio.instagram.personalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono inline-flex min-h-[56px] items-center px-1 text-smoke underline decoration-ink/25 underline-offset-[6px] transition-colors duration-300 ease-ink hover:text-ink"
            >
              @{studio.instagram.personal}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
