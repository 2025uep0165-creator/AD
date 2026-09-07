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
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Image
      src={images.crest}
      alt={title ?? ''}
      // The artwork is 335x384, but declaring that made Next emit a srcSet
      // spanning every device size up to 1920 — 1.4KB of markup per instance,
      // three instances — and default to an 828px file for a mark that renders
      // at 44px. Declaring the size it is actually drawn at keeps the same
      // aspect ratio, emits a two-entry 1x/2x srcSet, and asks for a file
      // measured in kilobytes.
      width={84}
      height={96}
      quality={62}
      className={`w-auto ${className}`}
      aria-hidden={title ? undefined : true}
      unoptimized={/^https?:\/\//.test(images.crest)}
      priority={false}
    />
  );
}
