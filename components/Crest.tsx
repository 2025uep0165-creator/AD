import Image from 'next/image';

/**
 * The real gold crest — the owl, the two machines, the banner. Taken from the
 * existing site (/images/logo.png), re-cut to 384px and palette-quantised from
 * 251KB to 30KB, because it never renders larger than about 64px.
 *
 * The gold only reads on --ink, so this appears on the inverted section and in
 * the footer and nowhere else. Never on --bone.
 *
 * Sized by height with width:auto — the artwork is 335×384, so forcing a
 * square would squash the owl.
 */
export default function Crest({ className = '', title }: { className?: string; title?: string }) {
  return (
    <Image
      src="/images/crest.png"
      alt={title ?? ''}
      width={335}
      height={384}
      className={`w-auto ${className}`}
      aria-hidden={title ? undefined : true}
      priority={false}
    />
  );
}
