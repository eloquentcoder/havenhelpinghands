import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { Hero } from '@/blocks/Hero'
import { RichText } from '@/blocks/RichText'
import { Stats } from '@/blocks/Stats'
import { CallToAction } from '@/blocks/CallToAction'
import { ImageBlock } from '@/blocks/ImageBlock'
import { Gallery } from '@/blocks/Gallery'
import { TeamGrid } from '@/blocks/TeamGrid'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Standalone pages such as About, Impact or Privacy.',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'layout',
              type: 'blocks',
              required: true,
              minRows: 1,
              blocks: [Hero, RichText, ImageBlock, Gallery, Stats, TeamGrid, CallToAction],
              admin: { description: 'Build the page by adding and reordering sections.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title', { reserved: true }),
  ],
}
