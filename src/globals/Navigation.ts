import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'
import { revalidatesGlobal } from '@/hooks/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: { read: anyone, update: isAdminOrEditor },
  hooks: revalidatesGlobal([['/', 'layout']]),
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Menu item', plural: 'Menu items' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, admin: { description: 'For example /programs' } },
        {
          name: 'children',
          type: 'array',
          labels: { singular: 'Sub-item', plural: 'Sub-items' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
