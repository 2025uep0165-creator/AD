/**
 * PLACEHOLDER FOR THE REAL GOLD CREST.
 *
 * Udhay already has a gold crest logo — it is a real asset and it stays. Drop
 * the original at /public/crest.svg and swap the body of this component for
 * an <img>/next/image of it. The rules that matter:
 *   · brass reads correctly on --ink and nowhere else, so this only ever
 *     appears on the inverted section and in the footer
 *   · never on --bone
 */
export default function Crest({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`text-brass ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="60" cy="60" r="52" />
      <circle cx="60" cy="60" r="45" strokeWidth="0.9" />
      <path d="M60 22l6 12 6-12" strokeWidth="1.4" />
      <path d="M60 96l6-12 6 12" strokeWidth="1.4" transform="rotate(180 63 90)" />
      <text
        x="60"
        y="66"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-deva), serif"
        fontSize="42"
        fill="currentColor"
        stroke="none"
      >
        ॐ
      </text>
      <path d="M30 78c14 8 46 8 60 0" strokeWidth="1" />
    </svg>
  );
}
