import Image from 'next/image';
import { images } from '@/lib/content';

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
export default function Crest({
  className = '',
  title,
  sizes = '96px',
}: {
  className?: string;
  title?: string;
  /**
   * Without it the browser sizes the request off the 335px intrinsic width and
   * fetches an 828px PNG — 21KB — for a mark that renders at 44px.
   *
   * Every call site passes the same 96px on purpose. The crest appears three
   * times (intro, lettering, footer) at three different rendered sizes, and
   * asking for three different widths fetched three separate files totalling
   * 40KB. One shared variant is 5.7KB downloaded once.
   */
  sizes?: string;
}) {
  return (
    <Image
      src={images.crest}
      alt={title ?? ''}
      width={335}
      height={384}
      sizes={sizes}
      className={`w-auto ${className}`}
      aria-hidden={title ? undefined : true}
      unoptimized={/^https?:\/\//.test(images.crest)}
      priority={false}
    />
  );
}
