import Image from 'next/image';
import type { Media } from '@/lib/content';

/**
 * Uniform matting for every piece of work.
 *
 * His photos are phone shots against cling film and studio chairs, so they get
 * normalised on the way in: one fixed 4:5 crop, a consistent slight
 * desaturation, and the same bone mat and hairline around every one. That
 * consistency is what makes a phone camera roll read as a gallery wall.
 */
export default function Frame({
  media,
  sizes = '100vw',
  priority = false,
  className = '',
  inverted = false,
}: {
  media: Media;
  sizes?: string;
  priority?: boolean;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden border ${
        inverted ? 'border-white/15 bg-white/[0.03]' : 'border-ink/15 bg-paper'
      } ${className}`}
    >
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        // A remote src is served pre-optimised, so skip our optimiser: it
        // avoids a pointless second pass and the remotePatterns allowlist.
        unoptimized={/^https?:\/\//.test(media.src)}
        // The normalisation pass. Adjust once here, applies to every photo.
        className="object-cover [filter:saturate(0.82)_contrast(1.03)]"
      />
    </div>
  );
}
