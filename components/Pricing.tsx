import { pricing, resolve, waHref } from '@/lib/content';
import { stagger } from '@/lib/stagger';

/**
 * Section 7 — pricing.
 *
 * His audience asks price first. Mono rows on hairlines, no cards, no tiers,
 * no "starting from just". A price that has not been confirmed says so and
 * points at WhatsApp — it never guesses a number.
 */
export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="u-gutter">
        <p className="u-mono text-saffron">{pricing.eyebrow}</p>
        <h2 className="u-display mt-5 max-w-measure text-[clamp(2rem,7vw,4rem)]">{pricing.heading}</h2>

        <dl className="mt-12 border-t border-ink/15">
          {pricing.rows.map((row, i) => {
            const value =
              row.from === 'consult'
                ? 'Quoted after consultation'
                : resolve(row.from) !== undefined
                  ? `from ₹${resolve(row.from)!.toLocaleString('en-IN')}`
                  : null;

            return (
              <div
                key={row.label}
                data-reveal-x=""
                style={stagger(i, 60)}
                className="flex min-h-[68px] flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-ink/15 py-3"
              >
                <dt className="u-mono text-ink">{row.label}</dt>
                {value ? (
                  <dd className="u-mono text-smoke">{value}</dd>
                ) : (
                  <dd className="u-mono">
                    <a
                      href={waHref(`Hi Udhay, what does ${row.label.toLowerCase()} start at?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center text-saffron underline decoration-saffron/40 underline-offset-4"
                    >
                      Ask on WhatsApp
                    </a>
                  </dd>
                )}
              </div>
            );
          })}
        </dl>

        <p className="u-mono mt-6 text-smoke">{pricing.footnote}</p>
      </div>
    </section>
  );
}
