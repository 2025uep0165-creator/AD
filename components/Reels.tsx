'use client';

import { useEffect, useRef, useState } from 'react';
import { reels, resolve, studio } from '@/lib/content';
import Plate from './Plate';

/**
 * Section 5 — reels.
 *
 * Self-hosted MP4s in a snapping row, never Instagram embeds: an embed pulls
 * several hundred KB of third-party JS, blocks paint, and breaks the moment
 * the post is edited.
 *
 * Clips only play while they are actually on screen, and only ever start
 * muted — tap unmutes. Nothing autoplays with sound, ever.
 */
function Reel({ reel, i }: { reel: (typeof reels)[number]; i: number }) {
  const src = resolve(reel.src);
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => {});
        else {
          v.pause();
          setMuted(true);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <li className="w-[72vw] max-w-[17rem] shrink-0 snap-center">
      <div className="relative aspect-[9/16] w-full overflow-hidden border border-ink/15 bg-paper">
        {src ? (
          <>
            <video
              ref={ref}
              className="h-full w-full object-cover [filter:saturate(0.85)]"
              src={src}
              poster={reel.poster.src ?? undefined}
              muted={muted}
              loop
              playsInline
              preload="none"
              aria-label={reel.poster.alt}
            />
            <button
              type="button"
              onClick={() => {
                const v = ref.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
                void v.play().catch(() => {});
              }}
              className="u-mono absolute inset-x-0 bottom-0 flex min-h-[44px] items-center justify-center bg-ink/70 text-bone"
            >
              {muted ? 'Tap for sound' : 'Mute'}
            </button>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-[12%]">
            <Plate plate={reel.poster.plate} />
          </div>
        )}
      </div>
      <p className="u-mono mt-3 text-smoke">
        {String(i + 1).padStart(2, '0')} · {reel.caption}
      </p>
    </li>
  );
}

export default function Reels() {
  return (
    <section className="border-t border-ink/15 py-16 sm:py-20">
      <div className="u-gutter flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 className="u-display text-[clamp(1.9rem,6.5vw,3.5rem)]">In the chair</h2>
        <p className="u-mono text-smoke">Sound off by default</p>
      </div>

      <ul className="u-hide-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:px-10 xl:px-16">
        {reels.map((r, i) => (
          <Reel key={r.id} reel={r} i={i} />
        ))}

        <li className="w-[72vw] max-w-[17rem] shrink-0 snap-center">
          <a
            href={studio.instagram.studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex aspect-[9/16] w-full flex-col justify-between border border-ink bg-ink p-5 text-bone transition-colors duration-300 ease-ink hover:bg-saffron"
          >
            <span className="u-mono text-bone/60">Instagram</span>
            <span>
              <span className="u-display block text-3xl leading-tight">@{studio.instagram.studio}</span>
              <span className="u-mono mt-3 block text-bone/60">
                {studio.instagram.followers} followers →
              </span>
            </span>
          </a>
          <p className="u-mono mt-3 text-smoke">Everything, as it happens</p>
        </li>
      </ul>
    </section>
  );
}
