import type { Block } from 'payload'

/**
 * The people, pulled live from the Team collection.
 *
 * This block stores a filter, not a list of people. Two reasons.
 *
 * `Team` already has `defaultSort: 'order'` and an `order` field whose
 * description reads "Lower numbers appear first on the About page" — the
 * collection was built to be the ordering authority, and a curated
 * relationship here would create a second, competing one. Adding a colleague
 * would then mean editing two places, and forgetting the second is silent.
 *
 * It also keeps the migration to plain CREATE TABLEs. `Pages` has no
 * relationship fields today and therefore no `pages_rels` junction table; a
 * `hasMany` relationship inside a Pages block would create two new ones.
 */
export const TeamGrid: Block = {
  slug: 'team',
  labels: { singular: 'Team grid', plural: 'Team grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      // Values mirror Team.group, plus "all". Keep them in step by hand;
      // there are three of them.
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'Everyone', value: 'all' },
        { label: 'Staff', value: 'staff' },
        { label: 'Board', value: 'board' },
        { label: 'Volunteers', value: 'volunteer' },
      ],
      admin: {
        description:
          'Which people to show. They appear in the order set by the "Order" number on each team member.',
      },
    },
    {
      name: 'showBio',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show each person’s short bio under their name.' },
    },
  ],
}
