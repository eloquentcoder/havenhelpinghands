import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only an admin may change roles — an editor must not be able to
        // promote themselves.
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        description: 'Editors can write and publish content. Admins also manage users.',
      },
    },
  ],
}
