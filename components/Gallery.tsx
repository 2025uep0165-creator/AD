'use client';

import { useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { filters, work, type FilterId } from '@/lib/content';
import { EASE } from './Motion';
import { titleFace } from '@/lib/text';
import Frame from './Frame';
import Lightbox from './Lightbox';

/**
 * Section 4 — the work.
 *
 * One piece per screen width on mobile. His pieces are small and the detail IS
 * the product; a 2-up grid on a 390px phone throws that away.
 *
 * Reveal is a clip-path wipe, not a fade-up. Re-keying on the active filter
 * makes the wipe replay when you switch category, which is what makes the
 * filter feel like it did something.
 */
export default function Gallery() {
  const [active, setActive] = useState<FilterId>('all');
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo(
    () => (active === 'all' ? work : work.filter((w) => w.category === active)),
    [active],
  );

  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="u-gutter">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h2 className="u-display text-[clamp(2.25rem,8vw,5rem)]">Work</h2>
          <p className="u-mono text-smoke">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </div>

      {/* Filters. Scrolls horizontally on a phone rather than wrapping into
          three ragged lines. */}
      <div
        className="u-hide-scrollbar mt-8 overflow-x-auto border-y border-ink/15"
        role="group"
        aria-label="Filter work by style"
      >
        <div className="u-gutter flex w-max min-w-full gap-1 py-1">
          {filters.map((f) => {
            const on = f.id === active;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                aria-pressed={on}
                className={`u-mono min-h-[44px] whitespace-nowrap px-4 transition-colors duration-300 ease-ink ${
                  on ? 'bg-ink text-bone' : 'text-smoke hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-x-5 gap-y-14 lg:grid-cols-2 lg:gap-y-24 lg:px-10 xl:px-16">
        {items.map((item, i) => (
          <m.li
            // key includes the filter so the wipe replays on category change
            key={`${active}-${item.id}`}
            initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
            whileInView={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 0.8, ease: EASE, delay: (i % 2) * 0.07 }}
            // Alternating vertical offset on desktop — deliberately not a
            // uniform grid. Collapses to a single rhythm on mobile.
            className={i % 2 === 1 ? 'lg:mt-20' : ''}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full text-left"
              aria-label={`${item.title} — open larger. ${item.placement}, ${item.size}.`}
            >
              <div className="px-5 lg:px-0">
                <Frame
                  media={item.image}
                  label={item.title}
                  sizes="(min-width: 1024px) 44vw, 100vw"
                />
              </div>
              <div className="u-gutter mt-4 flex items-baseline justify-between gap-4 lg:px-0">
                <span className={`${titleFace(item.title)} text-xl`}>{item.title}</span>
                <span className="u-mono shrink-0 text-smoke">
                  {item.placement} · {item.size}
                </span>
              </div>
            </button>
          </m.li>
        ))}
      </ul>

      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
