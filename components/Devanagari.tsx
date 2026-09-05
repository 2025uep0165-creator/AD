'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { devanagari, waHref } from '@/lib/content';
import Crest from './Crest';

/**
 * Section 3 — the inverted section. The only flip on the page.
 *
 * The shloka is live text in Tiro Devanagari Sanskrit, not an image and not an
 * SVG tracing: that is the whole claim being made here, so the matras have to
 * be real. It is split into grapheme clusters (Intl.Segmenter, so a matra
 * never detaches from its base character) and GSAP ScrollTrigger scrubs an
 * ink-wipe across them as you scroll — letter by letter, left to right, the
 * way it is actually laid down.
 *
 * Failure is designed for. The glyphs are only hidden once JS has committed to
 * animating them, and a 2s watchdog un-hides them if GSAP never arrives. With
 * no JS, a broken chunk, or prefers-reduced-motion, the shloka is simply there.
 */
export default function Devanagari() {
  const root = useRef<HTMLDivElement>(null);
  const shloka = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  const lines = useMemo(
    () =>
      devanagari.lines.map((line) => {
        const Seg = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
        if (Seg) {
          return Array.from(new Seg('hi', { granularity: 'grapheme' }).segment(line), (s) => s.segment);
        }
        // Fallback: split on whitespace only. Never by code point — that
        // detaches matras from their base characters.
        return line.split(/(\s+)/);
      }),
    [],
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setArmed(true);
  }, []);

  useEffect(() => {
    const el = root.current;
    const target = shloka.current;
    if (!el || !target || !armed) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    // If GSAP does not turn up, show the text rather than hide it forever.
    const watchdog = window.setTimeout(() => !cancelled && setArmed(false), 2000);

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([{ gsap }, mod]) => {
        if (cancelled) return;
        window.clearTimeout(watchdog);
        const ScrollTrigger = mod.ScrollTrigger ?? mod.default;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          gsap.to('[data-glyph]', {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            stagger: { amount: 0.75 },
            // Measured against the shloka itself, not the whole section.
            // The section is tall (crest, shloka, translit, two paragraphs,
            // CTA), so ending on ITS bottom meant the last glyphs only inked
            // in once the shloka had already scrolled off the top — you never
            // got to read it whole. Ending on the shloka block's OWN bottom at
            // 70% of the viewport means the last glyph inks in while the line
            // is still in the upper third — fully readable well before it
            // reaches the middle of the screen, which is what was asked for.
            scrollTrigger: {
              trigger: target,
              start: 'top 92%',
              end: 'bottom 70%',
              scrub: 0.5,
            },
          });
        }, el);
      })
      .catch(() => {
        if (!cancelled) setArmed(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      ctx?.revert();
    };
  }, [armed]);

  return (
    <section
      id="devotional"
      className="is-inverted relative overflow-hidden bg-ink py-24 text-bone sm:py-32 lg:py-40"
    >
      <div ref={root} className={`u-gutter ${armed ? 'dv-armed' : ''}`}>
        <div className="flex items-center gap-4">
          <Crest className="h-11 w-11 shrink-0" />
          <p className="u-mono text-brass">{devanagari.eyebrow}</p>
        </div>

        <div ref={shloka} className="mt-14 sm:mt-20">
          {lines.map((clusters, li) => (
            <p key={li} className="u-deva text-[clamp(2rem,9.5vw,6.5rem)]">
              {/* Screen readers get the whole line as one string. */}
              <span className="sr-only" lang="sa">
                {devanagari.lines[li]}
              </span>
              <span aria-hidden="true">
                {clusters.map((c, ci) => (
                  <span key={ci} data-glyph className="dv-glyph inline-block whitespace-pre">
                    {c}
                  </span>
                ))}
              </span>
            </p>
          ))}
        </div>

        <p className="u-mono mt-8 text-bone/60">{devanagari.transliteration}</p>

        <div className="mt-16 grid gap-10 border-t border-white/15 pt-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
          <div className="max-w-measure">
            <p className="u-display text-[clamp(1.5rem,4.5vw,2.25rem)] leading-tight text-bone">
              {devanagari.lead}
            </p>
            <div className="mt-6 space-y-4">
              {devanagari.body.map((p) => (
                <p key={p} className="text-[1.0625rem] leading-relaxed text-bone/85">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <a
            href={waHref(devanagari.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="u-mono inline-flex min-h-[56px] shrink-0 items-center justify-center border border-brass px-8 text-brass transition-colors duration-300 ease-ink hover:bg-brass hover:text-ink"
          >
            {devanagari.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
