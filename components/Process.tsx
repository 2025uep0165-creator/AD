import { process } from '@/lib/content';
import { stagger } from '@/lib/stagger';

/** Section 8 — process. Big mono numerals, no icons. */
export default function Process() {
  return (
    <section className="border-y border-ink/15 bg-paper py-20 sm:py-24">
      <div className="u-gutter">
        <p className="u-mono text-saffron">{process.eyebrow}</p>

        <ol className="mt-12 grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((s, i) => (
            <li
              key={s.n}
              data-reveal=""
              style={stagger(i, 80)}
              className="bg-paper p-6 sm:p-7 lg:p-8"
            >
              <span className="u-mono block text-[2.75rem] leading-none tracking-tight text-ink/60">
                {s.n}
              </span>
              <h3 className="u-display mt-6 text-2xl">{s.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-smoke">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
