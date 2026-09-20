import type { Block } from 'payload'

/**
 * A single picture in the flow of a page.
 *
 * Exported as `ImageBlock` rather than `Image` on purpose: the renderer
 * imports `Image` from `next/image`, and a block named the same thing
 * guarantees a collision the first time someone moves this import around.
 * The `slug` — which is what reaches the database and the editor — is still
 * plain `image`.
 *
 * There is deliberately no `caption` field here. `Media.caption` already
 * exists and is described to editors as "Shown under the image on the page";
 * a second caption field is a trap where the editor fills in the wrong one.
 */
export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'width',
      type: 'select',
      required: true,
      defaultValue: 'wide',
      options: [
        { label: 'Text column', value: 'text' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full bleed', value: 'full' },
      ],
      admin: { description: 'How wide the picture sits on the page.' },
    },
    {
      name: 'aspect',
      type: 'select',
      required: true,
      defaultValue: 'natural',
      options: [
        { label: 'The picture’s own shape', value: 'natural' },
        { label: 'Wide (16:9)', value: '16/9' },
        { label: 'Landscape (4:3)', value: '4/3' },
        { label: 'Letterbox (21:9)', value: '21/9' },
      ],
      admin: {
        description:
          'Cropping to a fixed shape uses the focal point set on the image itself.',
      },
    },
  ],
}
