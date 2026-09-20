import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { revalidates } from '@/hooks/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Blog & News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Stories, news and updates. This is the main source of search traffic.',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: revalidates((doc) => [['/blog'], [`/blog/${doc.slug}`]]),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'A short teaser shown on the blog listing and used as the search description.',
              },
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            { name: 'body', type: 'richText', required: true },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'author', type: 'relationship', relationTo: 'team' },
            { name: 'category', type: 'relationship', relationTo: 'categories' },
            {
              name: 'tags',
              type: 'array',
              labels: { singular: 'Tag', plural: 'Tags' },
              fields: [{ name: 'tag', type: 'text', required: true }],
            },
            {
              name: 'relatedPrograms',
              type: 'relationship',
              relationTo: 'programs',
              hasMany: true,
              admin: { description: 'Link this story to the programs it is about.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Set automatically when you first publish.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField(),
  ],
}
