'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { lettering, waHref } from '@/lib/content';
import Crest from './Crest';

/**
 * Section 3 — the inverted section. The only flip on the page.
 *
 * One of his real pieces, set enormous and drawn on letter by letter as you
 * scroll, so the section shows the lettering instead of talking about it.
 *
 * The line is split into grapheme clusters rather than code points — that is
 * what keeps a combining mark attached to its base character, so this still
 * works unchanged if the line is ever set in a script that needs it.
 *
 * Failure is designed for: a 2s watchdog un-hides the text if GSAP never
 * arrives. With no JS, a broken chunk, or reduced motion, the line is simply
 * there, fully drawn.
 */
export default function Lettering() {
  const root = useRef<HTMLDivElement>(null);
  const phrase = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  const lines = useMemo(
    () =>
      lettering.lines.map((line) => {
        const Seg = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
        if (Seg) {
          return Array.from(new Seg('en', { granularity: 'grapheme' }).segment(line), (s) => s.segment);
        }
        return line.split('');
      }),
    [],
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setArmed(true);
  }, []);

  useEffect(() => {
    const el = root.current;
    const target = phrase.current;
    if (!el || !target || !armed) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    // If GSAP does not turn up, show the text rather than hide it forever.
    const watchdog = window.setTimeout(() => {
      if (!cancelled) setArmed(false);
    }, 2000);

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([gsapMod, stMod]) => {
        if (cancelled) return;
        window.clearTimeout(watchdog);
        const gsap = gsapMod.gsap;
        const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          gsap.to('[data-glyph]', {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            stagger: { amount: 0.75 },
            // Measured against the phrase itself, not the whole section. The
            // section is tall — crest, phrase, caption, two paragraphs, CTA —
            // so ending on ITS bottom meant the last letters only inked in
            // once the phrase had already scrolled off the top and you never
            // got to read it whole. Ending on the phrase block's own bottom at
            // 70% of the viewport means it is fully drawn while still sitting
            // in the upper third, well above the halfway mark.
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
      id="lettering"
      className="is-inverted relative overflow-hidden bg-ink py-24 text-bone sm:py-32 lg:py-40"
    >
      <div ref={root} className={`u-gutter ${armed ? 'dv-armed' : ''}`}>
        <div className="flex items-center gap-4">
          <Crest className="h-11 shrink-0" />
          <p className="u-mono text-brass">{lettering.eyebrow}</p>
        </div>

        <div ref={phrase} className="mt-14 sm:mt-20">
          {lines.map((glyphs, li) => (
            <p key={li} className="u-display text-[clamp(2.75rem,13vw,8rem)]">
              {/* Screen readers get the whole line as one string. */}
              <span className="sr-only">{lettering.lines[li]}</span>
              <span aria-hidden="true">
                {glyphs.map((g, gi) => (
                  <span key={gi} data-glyph className="dv-glyph inline-block whitespace-pre">
                    {g}
                  </span>
                ))}
              </span>
            </p>
          ))}
        </div>

        <p className="u-mono mt-8 text-bone/60">{lettering.caption}</p>

        <div className="mt-16 grid gap-10 border-t border-white/15 pt-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
          <div className="max-w-measure">
            <p className="u-display text-[clamp(1.5rem,4.5vw,2.25rem)] leading-tight text-bone">
              {lettering.lead}
            </p>
            <div className="mt-6 space-y-4">
              {lettering.body.map((p) => (
                <p key={p} className="text-[1.0625rem] leading-relaxed text-bone/85">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <a
            href={waHref(lettering.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="u-mono inline-flex min-h-[56px] shrink-0 items-center justify-center border border-brass px-8 text-brass transition-colors duration-300 ease-ink hover:bg-brass hover:text-ink"
          >
            {lettering.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
