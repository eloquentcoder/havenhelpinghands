import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'group', 'order'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, admin: { description: 'Job title.' } },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Staff', value: 'staff' },
        { label: 'Board', value: 'board' },
        { label: 'Volunteer', value: 'volunteer' },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'linkedin', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first on the About page.',
      },
    },
  ],
}
