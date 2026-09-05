'use client';

import { useId, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { faq, waHref } from '@/lib/content';
import { EASE } from './Motion';

/**
 * Section 12 — FAQ. These are the questions he actually gets DM'd.
 *
 * Where an answer has not been confirmed yet (deposits, walk-ins) the question
 * still appears and points at WhatsApp. That is true and useful; making up a
 * deposit policy would not be.
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section className="bg-paper py-20 sm:py-24">
      <div className="u-gutter grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
        <h2 className="u-display text-[clamp(2rem,7vw,3.5rem)] lg:sticky lg:top-24 lg:self-start">
          Questions
          <br />
          I get asked
        </h2>

        <ul className="border-t border-ink/15">
          {faq.map((item, i) => {
            const isOpen = open === i;
            const bodyId = `${uid}-p-${i}`;
            const btnId = `${uid}-b-${i}`;
            const answer =
              typeof item.a === 'string'
                ? item.a
                : 'Message me on WhatsApp and I will tell you straight away.';

            return (
              <li key={item.q} className="border-b border-ink/15">
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-baseline justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-[1.0625rem] leading-snug">{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="u-mono shrink-0 text-smoke transition-transform duration-500 ease-ink"
                      style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                    >
                      +
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      key="panel"
                      id={bodyId}
                      role="region"
                      aria-labelledby={btnId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-measure pb-6 pr-8 text-[1.0625rem] leading-relaxed text-smoke">
                        {answer}
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="u-gutter mt-12 lg:pl-[calc(20rem+5rem)]">
        <a
          href={waHref('Hi Udhay, I have a question before I book.')}
          target="_blank"
          rel="noopener noreferrer"
          className="u-mono inline-flex min-h-[56px] items-center border border-ink px-7 transition-colors duration-300 ease-ink hover:bg-ink hover:text-bone"
        >
          Ask me anything else
        </a>
      </div>
    </section>
  );
}
