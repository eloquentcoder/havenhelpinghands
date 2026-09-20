import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'
import { revalidatesGlobal } from '@/hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: { read: anyone, update: isAdminOrEditor },
  // Read by the header, the footer and the homepage's stats band.
  hooks: revalidatesGlobal([['/', 'layout']]),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Organisation',
          fields: [
            {
              name: 'organisationName',
              type: 'text',
              required: true,
              defaultValue: 'Haven Healing Hands Initiative',
            },
            {
              name: 'tagline',
              type: 'text',
              admin: { description: 'One line describing what the organisation does.' },
            },
            {
              name: 'description',
              type: 'textarea',
              maxLength: 300,
              admin: { description: 'Used as the search description on pages that have none of their own.' },
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Shown when a page with no image of its own is shared.' },
            },
            {
              name: 'registrationNumber',
              type: 'text',
              admin: { description: 'CAC registration number. Shown in the footer as a trust signal.' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            {
              name: 'address',
              type: 'group',
              admin: { description: 'Used for local search results. Fill this in fully.' },
              fields: [
                { name: 'street', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'state', type: 'text' },
                { name: 'country', type: 'text', defaultValue: 'Nigeria' },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socials',
              type: 'array',
              labels: { singular: 'Profile', plural: 'Profiles' },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'X (Twitter)', value: 'twitter' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                  ],
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Donations',
          fields: [
            {
              name: 'paystackUrl',
              type: 'text',
              admin: {
                description:
                  'The hosted Paystack payment page link. Every Donate button points here.',
              },
            },
          ],
        },
      ],
    },
  ],
}
