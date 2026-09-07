import Image from 'next/image';
import type { Media } from '@/lib/content';
import { blur } from '@/lib/blur';

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
  quality = 62,
  className = '',
  inverted = false,
}: {
  media: Media;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  inverted?: boolean;
}) {
  const placeholder = blur[media.src];
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
        quality={quality}
        // A 16px inline copy of the same photo, so the crop is filled with
        // roughly the right colours from first paint rather than sitting empty
        // for a second. See scripts/make-blur.mjs.
        {...(placeholder ? { placeholder: 'blur' as const, blurDataURL: placeholder } : {})}
        // A remote src is served pre-optimised, so skip our optimiser: it
        // avoids a pointless second pass and the remotePatterns allowlist.
        unoptimized={/^https?:\/\//.test(media.src)}
        // The normalisation pass. Adjust once here, applies to every photo.
        className="object-cover [filter:saturate(0.82)_contrast(1.03)]"
      />
    </div>
  );
}
