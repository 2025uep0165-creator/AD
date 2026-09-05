/**
 * Fine film grain across the whole page. Server-rendered inline SVG — no JS,
 * no image request. pointer-events:none so it never eats a tap.
 */
export default function Grain() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.04] mix-blend-multiply"
      aria-hidden="true"
      focusable="false"
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
