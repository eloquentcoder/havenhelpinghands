import type { Field } from 'payload'
import { formatSlugHook } from './formatSlugHook'

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
export const slugField = (fallbackField = 'title'): Field => ({
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
})
