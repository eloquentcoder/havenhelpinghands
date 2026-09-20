import type { Media } from '@/payload-types'

/** A Payload upload field before population: an id, a populated doc, or nothing. */
export type MediaField = number | string | Media | null | undefined

export type MediaVariant = 'thumbnail' | 'card' | 'hero' | 'original'

export const isMedia = (value: unknown): value is Media =>
  typeof value === 'object' && value !== null && 'url' in value

/**
 * A populated Media doc, or null.
 *
 * An upload field comes back as a bare id when the query's `depth` did not
 * reach it — most easily missed on `gallery[].image`, which sits one level
 * deeper than `heroImage` and so needs depth 2, not 1.
 */
export const resolveMedia = (value: MediaField): Media | null =>
  isMedia(value) ? value : null

type Source = { src: string; width: number; height: number }

/** Largest first, so the fallback walk below degrades downwards. */
const ORDER = ['hero', 'card', 'thumbnail'] as const

/**
 * The best available source at or below `prefer`.
 *
 * The variants are not guaranteed to exist. Media's imageSizes set a width
 * with `height: undefined`, and Payload skips generating a size entirely when
 * the original is narrower than the target — so a small upload has a
 * `thumbnail` and nothing else. Reading `media.sizes.hero.url` directly is a
 * crash waiting for the first image an editor uploads from a phone.
 */
export function mediaSource(media: Media, prefer: MediaVariant = 'original'): Source | null {
  const original =
    media.url && media.width && media.height
      ? { src: media.url, width: media.width, height: media.height }
      : null

  if (prefer === 'original') return original

  const start = ORDER.indexOf(prefer as (typeof ORDER)[number])
  for (const name of ORDER.slice(start === -1 ? 0 : start)) {
    const size = media.sizes?.[name]
    if (size?.url && size.width && size.height) {
      return { src: size.url, width: size.width, height: size.height }
    }
  }
  return original
}

/**
 * The focal point as a CSS object-position.
 *
 * Payload stores these as percentages. Only has an effect together with
 * object-cover — without a crop there is nothing to reposition.
 */
export const focalPosition = (media: Media): string =>
  `${media.focalX ?? 50}% ${media.focalY ?? 50}%`

/**
 * An Open Graph image from the first candidate that resolves.
 *
 * Relative to the site root, so `metadataBase` must be set in the root layout
 * or social scrapers drop it.
 */
export function ogImage(...candidates: MediaField[]) {
  for (const candidate of candidates) {
    const media = resolveMedia(candidate)
    if (!media) continue
    const source = mediaSource(media, 'hero')
    if (source) {
      return [{ url: source.src, width: source.width, height: source.height, alt: media.alt }]
    }
  }
  return undefined
}
