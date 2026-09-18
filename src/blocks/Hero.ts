import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: { description: 'Button text, for example "Donate now".' },
    },
    { name: 'ctaUrl', type: 'text' },
  ],
}
