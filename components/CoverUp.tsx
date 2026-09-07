import { coverUp, waHref } from '@/lib/content';
import Frame from './Frame';

/**
 * Section 6 — cover-ups.
 *
 * This was a before/after slider. It is not any more, because the studio has
 * never published a matched pair, and a slider built from two unrelated
 * photographs would be staging a result that never happened. On a tattoo site
 * that is the one lie that matters: it is the whole basis on which someone
 * hands you their forearm.
 *
 * So the section makes the argument in words, shows a real piece at the
 * density a cover-up needs, and says plainly that it is not one. The slider is
 * a twenty-line component; it comes back the day a real pair arrives.
 */
export default function CoverUp() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="u-gutter grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
        <div className="max-w-measure">
          <p className="u-mono text-saffron">{coverUp.eyebrow}</p>
          <h2 className="u-display mt-5 text-[clamp(2rem,7vw,4rem)]">{coverUp.heading}</h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-smoke">{coverUp.body}</p>
          <a
            href={waHref(coverUp.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="u-mono mt-8 inline-flex min-h-[56px] items-center border border-ink px-7 transition-colors duration-300 ease-ink hover:bg-ink hover:text-bone"
          >
            Send me a photo
          </a>
        </div>

        <figure className="m-0">
          <Frame media={coverUp.image} sizes="(min-width: 1024px) 46vw, 100vw" />
          <figcaption className="u-mono mt-3 text-smoke">{coverUp.imageCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
