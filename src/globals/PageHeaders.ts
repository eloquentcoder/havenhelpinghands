import type { Field, GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'

/**
 * The teal band at the top of a listing page.
 *
 * Every field is optional. Left blank, the page keeps the wording written into
 * it, so clearing a field restores the default rather than emptying the page.
 */
const header = (name: string, label: string, path: string): Field => ({
  name,
  type: 'group',
  label,
  admin: { description: `The band at the top of ${path}.` },
  fields: [
    {
      name: 'headline',
      type: 'text',
      admin: { description: 'Leave blank to keep the current wording.' },
    },
    {
      name: 'standfirst',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'The sentence under the heading. Leave blank to keep the current one.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional background picture. The heading sits over a dark teal wash so it stays readable whatever you upload.',
      },
    },
  ],
})

export const PageHeaders: GlobalConfig = {
  slug: 'page-headers',
  label: 'Page headers',
  admin: {
    description:
      'The heading bands at the top of the listing pages. The homepage hero is edited under Homepage, and a programme or post uses its own title and picture.',
  },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'Our work', fields: [header('programs', 'Our work', '/programs')] },
        { label: 'Blog & news', fields: [header('blog', 'Blog & news', '/blog')] },
        { label: 'Events', fields: [header('events', 'Events', '/events')] },
      ],
    },
  ],
}
