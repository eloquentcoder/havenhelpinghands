import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 768, height: undefined, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe what is in the picture, for people using screen readers and for image search. Example: "Volunteers handing out food parcels in Ikorodu".',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional. Shown under the image on the page.' },
    },
  ],
}
