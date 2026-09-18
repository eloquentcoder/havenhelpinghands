import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'
import { seoField } from '@/fields/seo'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'headline', type: 'text', required: true },
            { name: 'subtext', type: 'textarea' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'primaryCtaLabel', type: 'text', defaultValue: 'Donate' },
            { name: 'primaryCtaUrl', type: 'text', defaultValue: '/donate' },
            { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Our programs' },
            { name: 'secondaryCtaUrl', type: 'text', defaultValue: '/programs' },
          ],
        },
        {
          label: 'Sections',
          fields: [
            { name: 'missionHeading', type: 'text' },
            { name: 'missionBody', type: 'richText' },
            {
              name: 'impactStats',
              type: 'array',
              maxRows: 4,
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
            {
              name: 'featuredPrograms',
              type: 'relationship',
              relationTo: 'programs',
              hasMany: true,
              maxRows: 3,
              admin: { description: 'Up to three programs to show on the homepage.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
}
