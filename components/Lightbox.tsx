'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import type { Work } from '@/lib/content';
import { EASE } from './Motion';
import { titleFace } from '@/lib/text';
import Frame from './Frame';

/**
 * Gallery lightbox.
 *
 * Swipe down to dismiss, swipe sideways to move between pieces. The drag is
 * native Pointer Events rather than Framer's drag gesture — that keeps the
 * bundle on the small `domAnimation` feature set, and it lets the handler
 * decide per-gesture whether the finger is scrolling or dismissing.
 *
 * Focus is trapped, Escape closes, and focus returns to the thumbnail that
 * opened it.
 */
export default function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: Work[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndex((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const root = panel.current;
    root?.querySelector<HTMLElement>('button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowRight') return go(1);
      if (e.key === 'ArrowLeft') return go(-1);
      if (e.key !== 'Tab' || !root) return;
      const f = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
      if (!f.length) return;
      const [first, last] = [f[0], f[f.length - 1]];
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
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose, go]);

  // --- native pointer drag -------------------------------------------------
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || e.pointerId !== s.id) return;
    setDrag({ x: e.clientX - s.x, y: e.clientY - s.y, active: true });
  };

  const onPointerUp = () => {
    const { x, y } = drag;
    start.current = null;
    setDrag({ x: 0, y: 0, active: false });
    if (y > 110 && Math.abs(y) > Math.abs(x)) return onClose();
    if (Math.abs(x) > 70 && Math.abs(x) > Math.abs(y)) return go(x < 0 ? 1 : -1);
  };

  return (
    <AnimatePresence>
      {open && item && (
        <m.div
          key="lightbox"
          className="fixed inset-0 z-[70] bg-ink/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title}. Piece ${index + 1} of ${items.length}.`}
            className="is-inverted flex h-full flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <p className="u-mono text-bone/60">
                {index + 1} / {items.length}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="u-mono -mr-2 flex h-11 min-w-[44px] items-center justify-end px-2 text-bone"
              >
                Close
              </button>
            </div>

            <div
              className="flex flex-1 touch-pan-y items-center justify-center px-5"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="w-full max-w-[min(92vw,30rem)]"
                style={{
                  transform: `translate3d(${drag.x}px, ${Math.max(0, drag.y)}px, 0)`,
                  opacity: 1 - Math.min(0.6, Math.max(0, drag.y) / 400),
                  transition: drag.active ? 'none' : 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <Frame media={item.image} label={item.title} sizes="(min-width: 640px) 30rem, 92vw" inverted />
              </div>
            </div>

            <div className="border-t border-white/15 px-5 py-5">
              <p className={`${titleFace(item.title)} mb-3 text-2xl text-bone`}>{item.title}</p>
              <dl className="u-mono grid grid-cols-3 gap-3 text-bone/60">
                <div>
                  <dt>Placement</dt>
                  <dd className="mt-1 text-bone">{item.placement}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd className="mt-1 text-bone">{item.size}</dd>
                </div>
                <div>
                  <dt>Session</dt>
                  <dd className="mt-1 text-bone">{item.session}</dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="u-mono h-11 flex-1 border border-white/25 text-bone"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="u-mono h-11 flex-1 border border-white/25 text-bone"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
