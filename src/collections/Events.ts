import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'venue', '_status'],
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              maxLength: 300,
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            { name: 'body', type: 'richText' },
          ],
        },
        {
          label: 'When & where',
          fields: [
            {
              name: 'startsAt',
              type: 'date',
              required: true,
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'endsAt',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'venue',
              type: 'text',
              admin: { description: 'For example "Freedom Park, Lagos Island".' },
            },
            { name: 'address', type: 'textarea' },
            {
              name: 'registrationUrl',
              type: 'text',
              admin: {
                description:
                  'Where people sign up. Leave blank if no registration is needed.',
              },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField(),
  ],
}
