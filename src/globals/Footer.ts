import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'
import { revalidatesGlobal } from '@/hooks/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: { read: anyone, update: isAdminOrEditor },
  hooks: revalidatesGlobal([['/', 'layout']]),
  fields: [
    { name: 'blurb', type: 'textarea', admin: { description: 'Short paragraph in the first footer column.' } },
    {
      name: 'columns',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Column', plural: 'Columns' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    { name: 'copyright', type: 'text' },
  ],
}
