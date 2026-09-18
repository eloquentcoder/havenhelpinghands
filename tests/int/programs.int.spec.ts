import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'

let payload: Payload

// `slug` is unique and the test database persists between runs, so titles
// (which the slug is generated from) must be unique per run too — otherwise a
// re-run collides with a document a previous run already created, and the
// suite fails on a uniqueness error instead of testing the behaviour it is
// meant to test. Matches the pattern already used in access.int.spec.ts.
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

beforeAll(async () => {
  // The config is a promise; await it, matching tests/int/api.int.spec.ts.
  payload = await getPayload({ config: await config })
})

describe('programs collection', () => {
  it('generates a slug from the title', async () => {
    const title = `Clean Water Project ${unique()}`

    const doc = await payload.create({
      collection: 'programs',
      draft: true,
      data: {
        title,
        summary: 'Boreholes for three communities.',
        status: 'ongoing',
        _status: 'draft',
      },
    })

    expect(doc.slug).toBe(slugify(title))
  })

  it('hides drafts from anonymous readers', async () => {
    const title = `Unpublished Outreach ${unique()}`

    const created = await payload.create({
      collection: 'programs',
      draft: true,
      data: {
        title,
        summary: 'Still being written.',
        status: 'ongoing',
        _status: 'draft',
      },
    })

    // Prove the document really was created before asserting it is hidden —
    // otherwise a bug that silently drops the create would also make the
    // "hides drafts" assertion pass for the wrong reason.
    const withAccess = await payload.find({
      collection: 'programs',
      overrideAccess: true,
      where: { title: { equals: title } },
    })
    expect(withAccess.docs).toHaveLength(1)
    expect(withAccess.docs[0].id).toBe(created.id)

    const result = await payload.find({
      collection: 'programs',
      overrideAccess: false,
      where: { title: { equals: title } },
    })

    expect(result.docs).toHaveLength(0)
  })

  it('shows published programs to anonymous readers', async () => {
    const title = `Published Outreach ${unique()}`

    await payload.create({
      collection: 'programs',
      draft: false,
      data: {
        title,
        // Publishing (draft: false) validates the full document, and `slug`
        // is a required field — unlike the draft creates above, TypeScript
        // won't let it be left out here for the hook to fill in on its own.
        slug: slugify(title),
        summary: 'Live on the site.',
        status: 'ongoing',
        _status: 'published',
      },
    })

    const result = await payload.find({
      collection: 'programs',
      overrideAccess: false,
      where: { title: { equals: title } },
    })

    expect(result.docs).toHaveLength(1)
  })
})
