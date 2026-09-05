'use client';

import { useEffect, useRef, useState } from 'react';
import { hero, resolve, studio, waHref } from '@/lib/content';
import Image from 'next/image';
import { useSaveData } from '@/lib/useMediaQuery';
import Plate from './Plate';

/**
 * Section 2 — hero.
 *
 * Two states, both deliberate:
 *   · with a hero clip confirmed in content.ts, it plays full-bleed behind the
 *     type, muted and playsInline, and drops to the poster on a slow
 *     connection or under prefers-reduced-motion
 *   · until then, an oversized ink drawing bleeds off the right edge. No grey
 *     box, no "image coming soon".
 *
 * The type is the LCP element either way, which is what keeps LCP fast on 4G.
 */
export default function Hero() {
  const videoSrc = resolve(hero.video.src);
  const slow = useSaveData();
  const [canPlay, setCanPlay] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoSrc || slow) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setCanPlay(true);
  }, [videoSrc, slow]);

  const [w1, ...rest] = hero.line2.split(' ');
  const line2Lead = rest.length ? w1 + ' ' : '';
  const accent = rest.length ? rest.join(' ') : hero.line2;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-10 pt-24"
    >
      {/* ---- backdrop ---- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {canPlay && videoSrc ? (
          <>
            <video
              ref={ref}
              className="h-full w-full object-cover"
              src={videoSrc}
              poster={hero.video.poster.src ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
            />
            {/* scrim so the display type keeps its contrast over any frame */}
            <div className="absolute inset-0 bg-bone/70" />
          </>
        ) : hero.video.poster.src ? (
          <>
            <Image
              src={hero.video.poster.src}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-[50%_22%] [filter:saturate(0.78)_contrast(1.05)]"
            />
            {/* The photo is allowed to read at the top, where there is no type.
                A single gradient carries it down to solid bone behind the
                headline, so the display type keeps its full contrast without
                flattening the whole image to grey. */}
            <div className="absolute inset-0 bg-bone/20" />
            {/* Bone at the top too: the header wordmark and the strapline are
                --ink, and without this they sat dark-on-dark over the photo.
                The mandala still reads in the band between the two gradients. */}
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-bone via-bone/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-bone via-bone/95 to-transparent" />
          </>
        ) : (
          <div className="absolute -right-[14%] top-[7%] aspect-[4/5] h-[52svh] text-ink opacity-[0.085] sm:-right-[2%] sm:h-[62svh] lg:right-[4%]">
            <Plate plate="needle" />
          </div>
        )}
      </div>

      {/* Strapline sits at the top and the headline at the foot: the full
          viewport height is used deliberately rather than padded out. */}
      <p className="u-gutter u-mono relative text-smoke">
        {hero.strapline.join(' · ')}
        {/* EST. year is deliberately absent — see studio.established in content.ts */}
        {resolve(studio.established) ? ` · Est. ${resolve(studio.established)}` : ''}
      </p>

      <div className="u-gutter relative">
        {/* Constrained by height as well as width: 12.5vw alone is right on a
            phone but pushes the CTA below the fold on a short laptop screen. */}
        <h1 className="u-display text-[clamp(2.9rem,min(12.5vw,13svh),9.5rem)]">
          <span className="block">{hero.line1}</span>
          <span className="block">
            {line2Lead}
            <span className="text-saffron">{accent}</span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-6 border-t border-ink/15 pt-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <a
              href={waHref(hero.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono flex min-h-[56px] items-center justify-center bg-saffron px-8 text-bone transition-colors duration-300 ease-ink hover:bg-ink sm:justify-start"
            >
              {hero.cta}
            </a>
            <a
              href="#work"
              className="u-mono inline-flex min-h-[44px] items-center gap-2 self-start text-smoke transition-colors duration-300 ease-ink hover:text-ink"
            >
              <span className="underline decoration-ink/25 underline-offset-[6px]">
                {hero.ctaSecondary}
              </span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* Live proof strip. The separator is attached to the END of each
              item, so a wrap never leaves a dot orphaned at the start of a
              line — which is exactly what a leading separator does at 390px. */}
          <ul className="u-mono flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 text-smoke">
            {hero.proof.map((p, i) => (
              <li key={p.label} className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-ink">{p.value}</span>
                <span>{p.label}</span>
                {i < hero.proof.length - 1 && (
                  <span className="pl-1 text-ink/25" aria-hidden="true">
                    ·
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
