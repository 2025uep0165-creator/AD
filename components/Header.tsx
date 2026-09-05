'use client';

import { useEffect, useRef, useState } from 'react';
import { hero, nav, studio, waHref } from '@/lib/content';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus trap + Escape + scroll lock while the menu is open.
  useEffect(() => {
    if (!open) return;
    const root = panel.current;
    if (!root) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-ink ${
        lifted ? 'border-b border-ink/15 bg-bone' : 'border-b border-transparent'
      }`}
    >
      <div className="u-gutter flex h-16 items-center justify-between">
        <a href="#hero" className="u-mono inline-flex min-h-[44px] items-center text-ink" aria-label={`${studio.name}, home`}>
          Secret&nbsp;Ink
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="u-mono py-2 text-smoke transition-colors duration-300 ease-ink hover:text-ink">
              {n.label}
            </a>
          ))}
          <a
            href={waHref(hero.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="u-mono flex min-h-[44px] items-center bg-ink px-5 text-bone transition-colors duration-300 ease-ink hover:bg-saffron"
          >
            WhatsApp
          </a>
        </nav>

        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-panel"
          className="u-mono -mr-2 flex h-11 min-w-[44px] items-center justify-end px-2 lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div
        id="menu-panel"
        ref={panel}
        /* Dialog semantics only while it is actually open. A permanently
           mounted aria-modal="true" tells assistive tech the rest of the page
           is inert even when the menu is shut. */
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? 'Menu' : undefined}
        className={`fixed inset-0 top-16 bg-bone transition-[clip-path] duration-500 ease-ink lg:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
        }`}
        inert={!open}
      >
        <div className="u-gutter flex h-full flex-col justify-between pb-10 pt-6">
          <ul>
            {nav.map((n, i) => (
              <li key={n.href} className="border-b border-ink/15">
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="u-display block py-5 text-[2.5rem] leading-none"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={waHref(hero.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="u-mono flex min-h-[56px] items-center justify-center bg-saffron text-bone"
          >
            Book on WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
