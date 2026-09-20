import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { revalidates } from '@/hooks/revalidate'

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
  hooks: revalidates((doc) => [['/events'], [`/events/${doc.slug}`]]),
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
            {
              // Same shape as Programs.gallery on purpose, so one photo-grid
              // component serves both. What an event is worth after the date
              // has passed is largely the photographs.
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Photo', plural: 'Photos' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
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
