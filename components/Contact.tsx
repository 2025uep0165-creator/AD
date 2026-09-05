'use client';

import { useState } from 'react';
import { contact, resolve, studio, telHref, waHref } from '@/lib/content';

/**
 * Section 13 — booking.
 *
 * There is no backend and there is no dead form. On submit this composes the
 * WhatsApp message for you and opens the chat, so the message lands in the one
 * inbox he actually reads — and you can still edit it before you send.
 *
 * wa.me cannot carry an attachment, so the reference photo is handled honestly:
 * ticking the box adds a line saying one is coming, and you attach it in the
 * chat. Better than a file input that silently drops the file.
 */
export default function Contact() {
  const [ref, setRef] = useState(false);
  const email = resolve(studio.email);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '').trim();

    const lines = [
      `Hi Udhay, I'd like to book a tattoo.`,
      ``,
      `Name: ${get('name')}`,
      `Phone: ${get('phone')}`,
      `Style: ${get('style')}`,
      `Placement: ${get('placement')}`,
      `Rough size: ${get('size')}`,
    ];
    if (get('date')) lines.push(`Preferred date: ${get('date')}`);
    if (get('notes')) lines.push(``, `Idea: ${get('notes')}`);
    if (ref) lines.push(``, `I'm sending a reference photo next.`);

    window.open(waHref(lines.join('\n')), '_blank', 'noopener,noreferrer');
  };

  const field =
    'u-mono min-h-[48px] w-full border border-ink/25 bg-paper px-3 text-ink placeholder:text-smoke-soft focus:border-ink';
  const labelCls = 'u-mono mb-2 block text-smoke';

  return (
    <section id="book" className="border-t border-ink/15 py-20 sm:py-28">
      <div className="u-gutter grid gap-14 lg:grid-cols-2 lg:gap-20">
        {/* ---- details ---- */}
        <div>
          <p className="u-mono text-saffron">{contact.eyebrow}</p>
          <h2 className="u-display mt-5 text-[clamp(2.25rem,8vw,4.5rem)]">{contact.heading}</h2>

          <dl className="mt-12 border-t border-ink/15">
            <div className="flex justify-between gap-6 border-b border-ink/15 py-4">
              <dt className="u-mono text-smoke">Studio</dt>
              <dd className="text-right text-[0.95rem] leading-relaxed">
                {studio.address.line1}
                <br />
                {studio.address.line2}
                <br />
                {studio.address.city} {studio.address.postalCode}
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-ink/15 py-4">
              <dt className="u-mono text-smoke">Open</dt>
              <dd className="text-right text-[0.95rem]">{studio.hours.label}</dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-ink/15 py-4">
              <dt className="u-mono text-smoke">Phone</dt>
              <dd className="text-right text-[0.95rem]">
                <a
                  href={telHref}
                  className="inline-flex min-h-[44px] items-center underline decoration-ink/25 underline-offset-4"
                >
                  {studio.phoneDisplay}
                </a>
              </dd>
            </div>
            {/* Email is rendered only if a real, monitored inbox exists. */}
            {email && (
              <div className="flex justify-between gap-6 border-b border-ink/15 py-4">
                <dt className="u-mono text-smoke">Email</dt>
                <dd className="text-right text-[0.95rem]">
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-[44px] items-center underline decoration-ink/25 underline-offset-4"
                  >
                    {email}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-8 aspect-[4/3] w-full border border-ink/15 bg-paper">
            <iframe
              title={`Map to ${studio.name}, ${studio.address.line2}, ${studio.address.city}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(studio.mapsEmbedQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              // Tinted blue on request. Note this is the one colour on the
              // site outside the bone/ink/saffron palette.
              className="h-full w-full [filter:grayscale(1)_sepia(1)_hue-rotate(175deg)_saturate(2.1)_brightness(0.98)_contrast(0.95)]"
            />
          </div>
          {/* Not decoration: an embed can fail, and most people would rather
              open directions in their own maps app anyway. */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.mapsEmbedQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="u-mono inline-flex min-h-[44px] items-center text-saffron underline decoration-saffron/40 underline-offset-4"
          >
            Get directions →
          </a>
        </div>

        {/* ---- form ---- */}
        <div>
          <p className="max-w-measure text-[1.0625rem] leading-relaxed text-smoke">{contact.body}</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="name" className={labelCls}>Name</label>
              <input id="name" name="name" required autoComplete="name" className={field} />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="phone" className={labelCls}>Phone</label>
              <input
                id="phone"
                name="phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91"
                className={field}
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="style" className={labelCls}>Style</label>
              <select id="style" name="style" className={field} defaultValue={contact.styleOptions[0]}>
                {contact.styleOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="size" className={labelCls}>Rough size</label>
              <select id="size" name="size" className={field} defaultValue={contact.sizeOptions[1]}>
                {contact.sizeOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="placement" className={labelCls}>Placement</label>
              <input id="placement" name="placement" required placeholder="Forearm" className={field} />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="date" className={labelCls}>Preferred date</label>
              <input id="date" name="date" type="date" className={field} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className={labelCls}>Your idea</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Wording, or what it means to you"
                className={`${field} min-h-[96px] resize-y py-3 normal-case tracking-normal`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={ref}
                  onChange={(e) => setRef(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[var(--saffron)]"
                />
                <span className="text-[0.95rem] leading-snug text-smoke">
                  I have a reference photo — I&apos;ll attach it in the chat
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="u-mono min-h-[56px] bg-saffron px-8 text-bone transition-colors duration-300 ease-ink hover:bg-ink sm:col-span-2"
            >
              {contact.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
