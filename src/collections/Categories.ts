import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    slugField(),
  ],
}
