import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'

let payload: Payload

// `slug` is unique and the test database persists between runs, so titles
// (which the slug is generated from) must be unique per run too — otherwise a
// re-run collides with a document a previous run already created. Matches the
// pattern in posts.int.spec.ts and programs.int.spec.ts.
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const richTextBody = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Body copy.', version: 1 }],
        version: 1,
      },
    ],
    direction: null as 'ltr' | 'rtl' | null,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('pages collection', () => {
  it('saves a page built from multiple block types and reads them back', async () => {
    const title = `About Haven Healing Hands ${unique()}`

    const created = await payload.create({
      collection: 'pages',
      draft: false,
      data: {
        title,
        slug: slugify(title),
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            headline: 'Together we grow the hive',
            subtext: 'Community-led programs across Lagos.',
            ctaLabel: 'Donate now',
            ctaUrl: '/donate',
          },
          {
            blockType: 'stats',
            heading: 'Our impact',
            items: [
              { value: '1,200', label: 'meals served' },
              { value: '340', label: 'families reached' },
            ],
          },
          {
            blockType: 'richText',
            content: richTextBody,
          },
          {
            blockType: 'callToAction',
            heading: 'Join the hive',
            body: 'Volunteer with us today.',
            buttonLabel: 'Get involved',
            buttonUrl: '/volunteer',
          },
        ],
      },
    })

    const found = await payload.findByID({
      collection: 'pages',
      id: created.id,
      overrideAccess: true,
    })

    expect(found.layout).toHaveLength(4)
    expect(found.layout.map((block) => block.blockType)).toEqual([
      'hero',
      'stats',
      'richText',
      'callToAction',
    ])

    const hero = found.layout[0]
    if (hero.blockType !== 'hero') throw new Error('expected first block to be hero')
    expect(hero.headline).toBe('Together we grow the hive')

    const stats = found.layout[1]
    if (stats.blockType !== 'stats') throw new Error('expected second block to be stats')
    expect(stats.items).toHaveLength(2)
    expect(stats.items?.[0]?.value).toBe('1,200')
  })

  it('rejects a page slugged "admin" with the reserved-slug message', async () => {
    const title = `Reserved Slug Attempt ${unique()}`
    let caughtError: unknown

    try {
      await payload.create({
        collection: 'pages',
        draft: false,
        data: {
          title,
          slug: 'admin',
          _status: 'published',
          layout: [
            {
              blockType: 'hero',
              headline: 'Should never save',
            },
          ],
        },
      })
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).toBeDefined()
    // Payload's top-level ValidationError message is just a generic "the
    // following field is invalid: Slug" summary — the actual reserved-slug
    // wording lives on the field-level error attached in `.data.errors`.
    // Assert on that specific message, not just "it threw", so an unrelated
    // validation failure (a missing required field, for instance) would be
    // caught rather than passed for the wrong reason.
    const data = (caughtError as { data?: { errors?: { path: string; message: string }[] } })
      ?.data
    const slugError = data?.errors?.find((error) => error.path === 'slug')
    expect(slugError?.message).toBe(
      '"admin" is reserved by the site. Choose a different web address.',
    )

    const check = await payload.find({
      collection: 'pages',
      overrideAccess: true,
      where: { title: { equals: title } },
    })
    expect(check.docs).toHaveLength(0)
  })

  it('does not leak the reserved-slug guard into other collections (Programs may use "admin")', async () => {
    const title = `Admin Outreach Program ${unique()}`

    // Programs uses the plain `slugField()` with no reserved-slug guard, so
    // a Program slugged "admin" must be allowed to save. This is the
    // regression guard against the reserved list being applied globally
    // instead of scoped to Pages.
    const created = await payload.create({
      collection: 'programs',
      draft: false,
      data: {
        title,
        slug: 'admin',
        summary: 'Proves the guard did not leak to other collections.',
        status: 'ongoing',
        _status: 'published',
      },
    })

    expect(created.slug).toBe('admin')

    // Clean up, since "admin" is a slug other test runs might also want to
    // exercise and `slug` is unique per collection.
    await payload.delete({ collection: 'programs', id: created.id, overrideAccess: true })
  })
})
