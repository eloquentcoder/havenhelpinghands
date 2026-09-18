import type { Field } from 'payload'

/**
 * Attached to every publicly-routed collection so SEO is uniform across the
 * site. Every field is optional: Plan 2 falls back to the document's own title
 * and summary, so a page is never missing a title or description even when an
 * editor skips this tab entirely.
 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 70,
      admin: {
        description:
          'Shown as the headline in Google. Aim for under 60 characters. Defaults to the title.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 170,
      admin: {
        description:
          'The grey text under the headline in Google. Aim for 150-160 characters. Defaults to the summary.',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The picture shown when this page is shared on WhatsApp, Facebook or X. Defaults to the hero image.',
      },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: {
        description:
          'Only fill this in if this content was first published elsewhere and that version should rank instead.',
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide this page from Google. The page stays reachable by anyone with the link.',
      },
    },
  ],
}
