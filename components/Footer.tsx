import { hero, resolve, studio, telHref, waHref } from '@/lib/content';
import Crest from './Crest';

/**
 * Footer. Dark, because the brass crest only reads on --ink — the brief is
 * explicit that the crest lives on the inverted section and here.
 */
export default function Footer() {
  const est = resolve(studio.established);

  return (
    <footer className="is-inverted bg-ink pb-[calc(5rem+env(safe-area-inset-bottom))] pt-16 text-bone lg:pb-16">
      <div className="u-gutter">
        <div className="flex flex-col gap-10 border-b border-white/15 pb-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <Crest className="h-16 w-16 shrink-0" title={`${studio.name} crest`} />
            <div>
              <p className="u-display text-2xl leading-tight">{studio.name}</p>
              <p className="u-mono mt-2 text-bone/60">
                Janipur Colony · Jammu{est ? ` · Est. ${est}` : ''}
              </p>
            </div>
          </div>

          <a
            href={waHref(hero.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="u-mono inline-flex min-h-[56px] shrink-0 items-center justify-center bg-bone px-8 text-ink transition-colors duration-300 ease-ink hover:bg-brass"
          >
            {hero.cta}
          </a>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-3">
          <div>
            <p className="u-mono mb-4 text-bone/60">Studio</p>
            <address className="text-[0.95rem] not-italic leading-relaxed text-bone/85">
              {studio.address.line1}
              <br />
              {studio.address.line2}
              <br />
              {studio.address.city} {studio.address.postalCode}
            </address>
          </div>

          <div>
            <p className="u-mono mb-4 text-bone/60">Hours</p>
            <p className="text-[0.95rem] leading-relaxed text-bone/85">{studio.hours.label}</p>
            <a href={telHref} className="mt-1 inline-flex min-h-[44px] items-center text-[0.95rem] text-bone/85 underline underline-offset-4">
              {studio.phoneDisplay}
            </a>
          </div>

          <div>
            <p className="u-mono mb-4 text-bone/60">Instagram</p>
            <a
              href={studio.instagram.studioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-[0.95rem] text-bone/85 underline underline-offset-4"
            >
              @{studio.instagram.studio}
            </a>
            <a
              href={studio.instagram.personalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-[0.95rem] text-bone/85 underline underline-offset-4"
            >
              @{studio.instagram.personal}
            </a>
          </div>
        </div>

        <p className="u-mono border-t border-white/15 pt-8 text-bone/60">
          © {new Date().getFullYear()} {studio.name} · Jammu
        </p>
      </div>
    </footer>
  );
}
