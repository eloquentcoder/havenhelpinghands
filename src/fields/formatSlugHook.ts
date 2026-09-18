import type { FieldHook } from 'payload'
import { slugify } from '@/lib/slug'

/**
 * Derives a slug on save. An editor-supplied value wins; otherwise the slug is
 * generated from `fallbackField` (normally the title). Either way the result is
 * normalised, so a hand-typed slug can never contain invalid characters.
 */
export const formatSlugHook =
  (fallbackField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return slugify(value)
    }

    const fallback = data?.[fallbackField]
    if (typeof fallback === 'string' && fallback.trim().length > 0) {
      return slugify(fallback)
    }

    return undefined
  }
