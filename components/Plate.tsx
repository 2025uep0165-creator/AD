import type { PlateKey } from '@/lib/content';

/**
 * A drawn plate: fine ink linework on bone, in the real 4:5 crop.
 *
 * Every media slot in content.ts falls back to one of these while `src` is
 * null. The point is that the layout is never broken and never implies a
 * photograph exists — and that the page still demonstrates the art direction
 * (delicate black linework on warm bone) with zero image bytes.
 *
 * Replace by setting `src` on the Media object. Nothing else changes.
 */

/**
 * ॐ metrics, measured from Tiro Devanagari Sanskrit via getBBox():
 * the ink is exactly as wide as the advance (so `textAnchor: middle` really
 * does centre it), it is 1.0829em tall, and its centre sits 0.2898em ABOVE
 * the baseline — which is why `dominantBaseline: middle` hangs it too high.
 */
const OM_SIZE = 300;
const OM_INK_ABOVE_BASELINE = 0.2898;

const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/**
 * Sizes text to fill the plate rather than float in the middle of it.
 * `advance` is the average glyph advance as a fraction of the em for the face
 * in question — close enough to fit confidently without measuring.
 */
function fit(lines: string[], { width = 340, advance = 0.54, max = 96, min = 26 }) {
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return Math.round(Math.min(max, Math.max(min, width / (advance * longest))));
}

function Lettering({ label, cap = 96, cy = 250 }: { label: string; cap?: number; cy?: number }) {
  const words = label.replace(/[“”"]/g, '').split(' ');
  const lines: string[] = [];
  if (words.length <= 1) lines.push(words[0] ?? '');
  else if (words.length === 2) lines.push(words[0], words[1]);
  else {
    const mid = Math.ceil(words.length / 2);
    lines.push(words.slice(0, mid).join(' '), words.slice(mid).join(' '));
  }
  const size = fit(lines, { max: cap });
  const start = cy - ((lines.length - 1) * size * 1.15) / 2;
  return (
    <>
      {lines.map((l, i) => (
        <text
          key={i}
          x="200"
          y={start + i * size * 1.15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-display), Georgia, serif"
          fontSize={size}
          fontWeight="600"
          letterSpacing="-0.02em"
          fill="currentColor"
        >
          {l}
        </text>
      ))}
    </>
  );
}

function Devanagari({ label }: { label: string }) {
  const words = label.split(' ');
  const lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [label];
  // Devanagari needs headroom for matras, so it sits a touch smaller and the
  // optical centre is nudged down.
  const size = fit(lines, { advance: 0.62, max: 84 });
  const start = 262 - ((lines.length - 1) * size * 1.5) / 2;
  return (
    <>
      {lines.map((l, i) => (
        <text
          key={i}
          x="200"
          y={start + i * size * 1.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-deva), serif"
          fontSize={size}
          fill="currentColor"
        >
          {l}
        </text>
      ))}
    </>
  );
}

function Body({ plate, label }: { plate: PlateKey; label?: string }) {
  switch (plate) {
    case 'om':
      return (
        <text
          x="200"
          y={250 + OM_INK_ABOVE_BASELINE * OM_SIZE}
          textAnchor="middle"
          fontFamily="var(--font-deva), serif"
          fontSize={OM_SIZE}
          fill="currentColor"
        >
          ॐ
        </text>
      );

    case 'shloka':
      return <Devanagari label={label && /[ऀ-ॿ]/.test(label) ? label : 'हर हर महादेव'} />;

    case 'trishul':
      return (
        <g {...S} strokeWidth="2.4">
          <path d="M200 432V152" />
          <path d="M164 152h72" />
          <path d="M200 152V60" />
          <path d="M200 44l-9 34 9 14 9-14-9-34z" />
          <path d="M182 152c-36-14-50-48-39-90 17 30 31 46 47 66" />
          <path d="M218 152c36-14 50-48 39-90-17 30-31 46-47 66" />
          <path d="M186 250h28M186 262h28" />
          <path d="M200 432l-6 16M200 432l6 16" />
        </g>
      );

    case 'heartbeat':
      return (
        <g>
          {label ? <Lettering label={label} cap={70} cy={212} /> : null}
          <g {...S} strokeWidth="2.4">
            <path d="M64 366h62l14-32 17 66 19-98 19 81 15-17h116" />
          </g>
        </g>
      );

    case 'script':
      return (
        <g>
          <Lettering label={label ?? 'Believe'} />
          <g {...S} strokeWidth="1.6">
            <path d="M132 330c26 10 62 14 68 0 4-10-10-12-14-4-6 12 14 20 82 8" />
          </g>
        </g>
      );

    case 'bird':
      return (
        <g {...S} strokeWidth="2.2">
          <g transform="translate(120 200) scale(1.5)">
            <path d="M0 0c9-12 20-12 27 0c7-12 18-12 27 0" />
          </g>
          <g transform="translate(210 268) scale(1.1)">
            <path d="M0 0c9-12 20-12 27 0c7-12 18-12 27 0" />
          </g>
          <g transform="translate(146 318) scale(0.8)">
            <path d="M0 0c9-12 20-12 27 0c7-12 18-12 27 0" />
          </g>
        </g>
      );

    case 'hourglass':
      return (
        <g {...S} strokeWidth="2.2">
          <path d="M118 104h164M118 396h164" />
          <path d="M136 104v292M264 104v292" />
          <path d="M148 116h104L200 250z" />
          <path d="M148 384h104L200 250z" />
          <path d="M200 250v88" />
          <path d="M168 384c10-26 22-38 32-38s22 12 32 38" />
          <path d="M164 132h72" strokeWidth="1.4" />
        </g>
      );

    case 'sun':
      return (
        <g {...S} strokeWidth="2.2">
          <path d="M64 330h272" />
          <path d="M122 330a78 78 0 01156 0" />
          <path d="M200 176V128M262 202l32-34M138 202l-32-34M300 262l42-18M100 262l-42-18" />
          <path d="M92 372h96M212 372h96" strokeWidth="1.4" />
        </g>
      );

    case 'deer':
      return (
        <g {...S} strokeWidth="2.2">
          {/* head: wide cranium tapering to the muzzle */}
          <path d="M200 248c24 0 36 18 34 42-2 24-14 48-22 68-4 12-8 26-12 26s-8-14-12-26c-8-20-20-44-22-68-2-24 10-42 34-42z" />
          {/* ears */}
          <path d="M170 266c-18-10-30-6-36 4 10 10 24 12 38 8M230 266c18-10 30-6 36 4-10 10-24 12-38 8" />
          {/* eyes and muzzle */}
          <circle cx="184" cy="292" r="3.2" fill="currentColor" stroke="none" />
          <circle cx="216" cy="292" r="3.2" fill="currentColor" stroke="none" />
          <path d="M194 362c2-5 10-5 12 0-2 6-10 6-12 0z" />
          {/* antlers */}
          <path d="M182 250c-8-26-18-44-30-62M170 222c-12-6-20-16-24-28M160 204c-10-4-16-12-19-22M152 188c-4-12-4-24 0-34" />
          <path d="M218 250c8-26 18-44 30-62M230 222c12-6 20-16 24-28M240 204c10-4 16-12 19-22M248 188c4-12 4-24 0-34" />
        </g>
      );

    case 'floral':
      return (
        <g {...S} strokeWidth="1.9">
          <path d="M200 410c0-72 2-134 0-196" />
          <path d="M200 350c-22-2-36-14-40-34 22 0 36 10 40 26M200 320c22-2 36-14 40-34-22 0-36 10-40 26" />
          <path d="M200 288c-20-2-32-14-36-32 20 0 32 10 36 24M200 258c20-2 32-14 36-32-20 0-32 10-36 24" />
          <path d="M200 214c-8-16-4-32 0-42 4 10 8 26 0 42z" />
          <circle cx="200" cy="160" r="9" />
        </g>
      );

    case 'couple':
      return (
        <g {...S} strokeWidth="2.2">
          <circle cx="168" cy="250" r="58" />
          <circle cx="232" cy="250" r="58" />
          <path d="M168 176l-8-14h16z" />
          <path d="M232 176l-8-14h16z" />
          <path d="M126 366h148" strokeWidth="1.4" />
        </g>
      );

    case 'coverup':
      return (
        <g>
          {/* the old piece, still faintly there at the edges */}
          <g opacity="0.14">
            <Lettering label={label && !/cover/i.test(label) ? label : 'Old name'} cap={42} cy={308} />
          </g>
          {/* what goes over it: darker, larger, bolder — that is the trade */}
          <g {...S} strokeWidth="5">
            <path d="M200 96c54 44 90 90 90 136 0 56-40 96-90 118-50-22-90-62-90-118 0-46 36-92 90-136z" />
          </g>
          <g {...S} strokeWidth="3.2">
            <path d="M200 156c32 30 54 60 54 88 0 36-24 62-54 76-30-14-54-40-54-76 0-28 22-58 54-88z" />
          </g>
          <g {...S} strokeWidth="2">
            <path d="M200 186v190M164 244c24 10 48 10 72 0M158 292c28 12 56 12 84 0M166 340c22 10 46 10 68 0" />
          </g>
        </g>
      );

    case 'needle':
      return (
        <g {...S} strokeWidth="2.2">
          <path d="M52 392c74-18 222-18 296 0" />
          <path d="M118 348l84-176 30 14-72 178z" />
          <path d="M160 364l-6 24-14-18z" />
          <path d="M147 380v14" strokeWidth="1.6" />
          <path d="M186 156l52 24 12-26-52-24z" />
          <path d="M188 402c34-8 78-10 112-4" strokeWidth="1.4" opacity="0.6" />
        </g>
      );

    case 'portrait':
      return (
        <g {...S} strokeWidth="2.2">
          {/* the client's forearm */}
          <path d="M36 302c92-28 236-28 328 0M36 398c92-26 236-26 328 0" />
          {/* the machine, coming in at working angle */}
          <path d="M238 92l60 32-58 114-60-32z" />
          <path d="M182 208l24 44 28-26z" />
          <path d="M214 250l10 30" strokeWidth="1.8" />
          {/* the hand on the grip */}
          <path d="M176 158c-30 12-44 38-34 64 10 26 40 36 68 24" />
          <path d="M150 184c14-8 32-8 46-2M144 208c16-8 34-8 48-2M146 232c14-6 30-6 42 0" strokeWidth="1.7" />
          {/* fresh line on the skin */}
          <path d="M196 344c40-10 92-12 132-6" strokeWidth="1.5" opacity="0.55" />
        </g>
      );
  }
}

export default function Plate({
  plate,
  label,
  className = '',
}: {
  plate: PlateKey;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 500"
      className={`h-full w-full text-ink ${className}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <Body plate={plate} label={label} />
    </svg>
  );
}
