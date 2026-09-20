import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'

export const Programs: CollectionConfig = {
  slug: 'programs',
  labels: { singular: 'Program', plural: 'Programs' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'location', 'updatedAt'],
    description: 'The initiatives Haven Healing Hands runs. Each one gets its own page.',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
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
              admin: {
                description:
                  'One or two sentences, shown on the programs listing and used as the search description.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'The large image at the top of the program page.' },
            },
            { name: 'body', type: 'richText' },
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Photo', plural: 'Photos' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'location',
              type: 'text',
              admin: {
                description:
                  'Where this runs, for example "Ikorodu, Lagos State". Used for local search.',
              },
            },
            {
              // The date the work happened, for programmes that have finished.
              // Without it, "What we have done" can only sort on createdAt,
              // which is the seed timestamp - so an outreach added later
              // through the admin would always sort last, whenever it actually
              // took place.
              name: 'completedAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayOnly' },
                description: 'When this finished. Only used for completed programmes.',
                condition: (_, siblingData) => siblingData?.status === 'completed',
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'ongoing',
              options: [
                { label: 'Ongoing', value: 'ongoing' },
                { label: 'Completed', value: 'completed' },
              ],
            },
            {
              name: 'impactStats',
              type: 'array',
              labels: { singular: 'Statistic', plural: 'Statistics' },
              maxRows: 4,
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: { description: 'For example "1,200"' },
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: { description: 'For example "meals served"' },
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField(),
  ],
}
