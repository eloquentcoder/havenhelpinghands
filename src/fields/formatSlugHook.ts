import type { FieldHook } from 'payload'
import { slugify } from '@/lib/slug'

/**
 * Derives a slug on save. An editor-supplied value wins; otherwise the slug is
 * generated from `fallbackField` (normally the title). Either way the result is
 * normalised, so a hand-typed slug can never contain invalid characters.
 *
 * Each branch asks whether the text yields a *usable* slug, not merely whether
 * text was present. Typing "???" into the slug box normalises to nothing, so it
 * falls through to the title rather than failing validation as though the
 * editor had left the field blank.
 *
 * On a partial update Payload passes the existing document's slug as `value`
 * (see beforeValidate/promise.js), so an established URL survives a title
 * change rather than being regenerated.
 */
export const formatSlugHook =
  (fallbackField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string') {
      const normalised = slugify(value)
      if (normalised) return normalised
    }

    const fallback = data?.[fallbackField]
    if (typeof fallback === 'string') {
      const normalised = slugify(fallback)
      if (normalised) return normalised
    }

    return undefined
  }
