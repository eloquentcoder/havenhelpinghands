import type { Field, TextFieldSingleValidation } from 'payload'
import { validations } from 'payload'
import { formatSlugHook } from './formatSlugHook'

/** Slugs that would shadow a real route if a Page claimed them. */
const RESERVED = new Set(['admin', 'api', 'programs', 'blog', 'events', 'donate', 'next'])

/**
 * Rejects a reserved slug while preserving the built-in `text` field
 * validation (most importantly the `required` check) that a custom
 * `validate` function would otherwise silently replace — Payload only
 * applies its default validator when a field defines none of its own, so
 * calling it explicitly here is what keeps `required` working.
 */
const reservedSlugValidation: TextFieldSingleValidation = (value, options) => {
  const defaultResult = validations.text(value, options)
  if (defaultResult !== true) return defaultResult

  return typeof value === 'string' && RESERVED.has(value)
    ? `"${value}" is reserved by the site. Choose a different web address.`
    : true
}

/**
 * The URL segment for a routed document. Left blank, it is generated from the
 * title, so editors never have to think about it — but it stays editable,
 * because a published URL should not silently change when a title is reworded.
 *
 * `unique` is intentionally left to fail loudly on a collision rather than
 * quietly appending "-2": handing an editor a URL they did not choose would
 * undermine the same guarantee. Payload converts the constraint violation into
 * a validation error bound to this field, so the editor sees it inline.
 */
export const slugField = (
  fallbackField = 'title',
  { reserved = false }: { reserved?: boolean } = {},
): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  // `unique` already creates the index; adding `index: true` would imply a
  // second one exists.
  unique: true,
  admin: {
    position: 'sidebar',
    description:
      'The web address for this page. Leave blank to generate it from the title. If another entry already uses the same address, type a different one here.',
  },
  hooks: {
    beforeValidate: [formatSlugHook(fallbackField)],
  },
  validate: reserved ? reservedSlugValidation : undefined,
})
