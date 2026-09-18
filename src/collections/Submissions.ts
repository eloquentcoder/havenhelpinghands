import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@/access/roles'

/**
 * Written to by the server actions in Plan 3. Nothing may create a submission
 * through the API, so this collection cannot be used as a spam target; the
 * server action writes with `overrideAccess`.
 */
export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'formType', 'createdAt'],
    description: 'Messages sent through the contact and volunteer forms.',
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Volunteer', value: 'volunteer' },
      ],
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Tick once someone has replied.' },
    },
  ],
}
