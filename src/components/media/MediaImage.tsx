import NextImage from 'next/image'
import { focalPosition, mediaSource, resolveMedia, type MediaField, type MediaVariant } from '@/lib/media'
import { ArchFallback } from './ArchFallback'

type Props = {
  media: MediaField
  /** `sizes` is required so every call site has to think about it once. */
  sizes: string
  /** Pass '' for decorative images. Otherwise the Media doc's own alt wins. */
  alt?: string
  fill?: boolean
  variant?: MediaVariant
  /** `priority` is deprecated in Next 16; this maps to the `preload` prop. */
  preload?: boolean
  className?: string
  fallbackClassName?: string
}

/**
 * A Payload upload rendered through next/image, with the branded fallback
 * when there is nothing to render.
 *
 * No `placeholder="blur"`: Payload produces no blurDataURL, and generating
 * one would mean base64-ing a file at build time. No `quality` either —
 * `images.qualities` defaults to [75] in Next 16 and any other value is
 * coerced with a warning.
 */
export function MediaImage({
  media,
  sizes,
  alt,
  fill = false,
  variant = 'original',
  preload = false,
  className = '',
  fallbackClassName = '',
}: Props) {
  const doc = resolveMedia(media)
  const source = doc ? mediaSource(doc, variant) : null

  if (!doc || !source) {
    return <ArchFallback className={fallbackClassName || className} />
  }

  const common = {
    src: source.src,
    alt: alt ?? doc.alt ?? '',
    sizes,
    preload,
    className,
  }

  return fill ? (
    <NextImage {...common} fill style={{ objectPosition: focalPosition(doc) }} />
  ) : (
    <NextImage {...common} width={source.width} height={source.height} />
  )
}
