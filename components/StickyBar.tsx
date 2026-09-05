'use client';

import { useEffect, useRef, useState } from 'react';
import { hero, studio, telHref, waHref } from '@/lib/content';

/**
 * Section 14 — sticky mobile bar. Highest-ROI element on the site.
 *
 * Appears once the hero is behind you, hides again over the booking section so
 * it never covers the form's own submit. Mobile only; desktop has the header.
 */
export default function StickyBar() {
  const [show, setShow] = useState(false);
  const past = useRef(false);
  const atBook = useRef(false);

  useEffect(() => {
    const hero = document.getElementById('hero');
    const book = document.getElementById('book');
    if (!hero) return;

    const sync = () => setShow(past.current && !atBook.current);

    const heroIo = new IntersectionObserver(
      ([e]) => {
        past.current = !e.isIntersecting;
        sync();
      },
      { threshold: 0, rootMargin: '-72% 0px 0px 0px' },
    );
    heroIo.observe(hero);

    let bookIo: IntersectionObserver | undefined;
    if (book) {
      bookIo = new IntersectionObserver(
        ([e]) => {
          atBook.current = e.isIntersecting;
          sync();
        },
        { threshold: 0.12 },
      );
      bookIo.observe(book);
    }

    return () => {
      heroIo.disconnect();
      bookIo?.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-ink/15 bg-paper/95 pb-[env(safe-area-inset-bottom)] transition-transform duration-500 ease-ink lg:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      // Hidden from AT and from tab order while it is off-screen.
      aria-hidden={!show}
      inert={!show}
    >
      <div className="grid grid-cols-[1fr_auto]">
        <a
          href={waHref(hero.waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="u-mono flex min-h-[56px] items-center justify-center bg-saffron px-5 text-bone"
        >
          Book on WhatsApp
        </a>
        <a
          href={telHref}
          className="u-mono flex min-h-[56px] min-w-[88px] items-center justify-center border-l border-ink/15 px-5"
          aria-label={`Call Secret Ink Tattoo on ${studio.phoneDisplay}`}
        >
          Call
        </a>
      </div>
    </div>
  );
}
