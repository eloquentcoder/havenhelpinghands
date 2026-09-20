import type { Block } from 'payload'

/**
 * A grid of photographs.
 *
 * The inner array mirrors `Programs.gallery` exactly, so one `<PhotoGrid>`
 * component serves this block, the programme page and the event page.
 *
 * `minRows` is 1, not 2: forcing a second upload before the first can be
 * saved is a bad way to treat an editor who is part-way through.
 */
export const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'columns',
      type: 'select',
      required: true,
      defaultValue: '3',
      options: [
        { label: 'Two across', value: '2' },
        { label: 'Three across', value: '3' },
        { label: 'Four across', value: '4' },
      ],
      admin: { description: 'How many pictures sit side by side on a wide screen.' },
    },
    {
      name: 'images',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Photos' },
      minRows: 1,
      maxRows: 12,
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}
