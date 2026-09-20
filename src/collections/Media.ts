import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'
import { revalidates } from '@/hooks/revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

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
    // Uploads live on local disk outside the build tree, the way Laravel keeps
    // them in storage/app/public. They are served at /media/... by a rewrite in
    // next.config.ts rather than from Next's public folder: Next snapshots
    // public/ at server startup, so anything an editor uploaded afterwards
    // would 404 until the next restart.
    staticDir: path.resolve(dirname, '../../storage/media'),
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 768, height: undefined, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    focalPoint: true,
  },
  // Replacing a file changes its URL, and any page showing it still holds the
  // old one. Which pages those are cannot be known from here, so the whole
  // site goes -- media edits are rare enough for that to be the cheap option.
  hooks: revalidates(() => [['/', 'layout']]),
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
