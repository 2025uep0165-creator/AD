import { hygiene, resolve } from '@/lib/content';
import { stagger } from '@/lib/stagger';

/**
 * Section 9 — hygiene. Short, plain, no icon grid.
 * First-timers are the audience and this is what converts them.
 */
export default function Hygiene() {
  const ink = resolve(hygiene.inkBrand);

  return (
    <section className="py-16 sm:py-20">
      <div className="u-gutter grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
        <div>
          <p className="u-mono text-saffron">{hygiene.eyebrow}</p>
          <h2 className="u-display mt-5 text-[clamp(1.75rem,6vw,3rem)]">{hygiene.heading}</h2>
        </div>

        <ul className="max-w-measure space-y-5">
          {hygiene.points.map((p, i) => (
            <li
              key={p}
              data-reveal=""
              style={stagger(i, 70)}
              className="border-b border-ink/15 pb-5 text-[1.0625rem] leading-relaxed"
            >
              {p}
            </li>
          ))}
          {ink && (
            <li className="border-b border-ink/15 pb-5 text-[1.0625rem] leading-relaxed">
              Ink is {ink}.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
