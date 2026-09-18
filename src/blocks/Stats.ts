import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  labels: { singular: 'Statistics', plural: 'Statistics blocks' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'For example "1,200"' } },
        { name: 'label', type: 'text', required: true, admin: { description: 'For example "meals served"' } },
      ],
    },
  ],
}
