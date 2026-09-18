import type { Field } from 'payload'
import { formatSlugHook } from './formatSlugHook'

/**
 * The URL segment for a routed document. Left blank, it is generated from the
 * title, so editors never have to think about it — but it stays editable,
 * because a published URL should not silently change when a title is reworded.
 */
export const slugField = (fallbackField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'The web address for this page. Generated from the title if left blank.',
  },
  hooks: {
    beforeValidate: [formatSlugHook(fallbackField)],
  },
})
