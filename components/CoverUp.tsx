'use client';

import { useCallback, useRef, useState } from 'react';
import { coverUp, waHref } from '@/lib/content';
import Frame from './Frame';

/**
 * Section 6 — cover-up before/after.
 *
 * Touch-first: the whole image area is the drag target, not a 20px handle, and
 * it is also a real ARIA slider so it works from the keyboard. Almost no small
 * studio site actually demonstrates a cover-up, and he already markets them.
 */
export default function CoverUp() {
  const [pos, setPos] = useState(52);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPos((p) => Math.max(0, p - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPos((p) => Math.min(100, p + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPos(100);
    }
  };

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
          <div
            ref={box}
            role="slider"
            tabIndex={0}
            aria-label="Compare before and after the cover-up"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% of the way from the original tattoo to the finished cover-up`}
            onKeyDown={onKey}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              setFromClientX(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
            onPointerUp={(e) => {
              dragging.current = false;
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={() => (dragging.current = false)}
            className="relative w-full cursor-ew-resize touch-pan-y select-none"
          >
            <Frame media={coverUp.after} label="Cover-up" sizes="(min-width: 1024px) 46vw, 100vw" />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
              aria-hidden="true"
            >
              <Frame media={coverUp.before} label="Old name" sizes="(min-width: 1024px) 46vw, 100vw" />
            </div>

            {/* handle */}
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-ink"
              style={{ left: `${pos}%` }}
              aria-hidden="true"
            >
              <div className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink bg-bone">
                <span className="u-mono text-[0.6rem] tracking-normal">↔</span>
              </div>
            </div>

            <span className="u-mono absolute left-3 top-3 bg-bone/90 px-2 py-1">Before</span>
            <span className="u-mono absolute right-3 top-3 bg-ink/90 px-2 py-1 text-bone">After</span>
          </div>
          <figcaption className="u-mono mt-3 text-smoke">
            Drag, or use the arrow keys
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
