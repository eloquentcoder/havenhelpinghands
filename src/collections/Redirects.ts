import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'permanent'],
    description:
      'Send an old web address to a new one, so links shared in the past keep working.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The old path, starting with a slash. For example /old-program' },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'The new path or full URL. For example /programs/clean-water' },
    },
    {
      name: 'permanent',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Leave ticked unless this is temporary. Permanent redirects pass search ranking to the new address.',
      },
    },
  ],
}
