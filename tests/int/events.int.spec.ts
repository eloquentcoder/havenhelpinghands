import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'

let payload: Payload

// `slug` is unique and the test database persists between runs, so titles
// (which the slug is generated from) must be unique per run too — otherwise a
// re-run collides with a document a previous run already created. Matches the
// pattern in posts.int.spec.ts and access.int.spec.ts.
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('events collection', () => {
  it('generates a slug from the title', async () => {
    const title = `Beach Cleanup Day ${unique()}`

    const doc = await payload.create({
      collection: 'events',
      draft: true,
      data: {
        title,
        summary: 'A short summary of the event.',
        startsAt: new Date().toISOString(),
        _status: 'draft',
      },
    })

    expect(doc.slug).toBe(slugify(title))
  })

  it('hides drafts from anonymous readers, shows published events', async () => {
    const draftTitle = `Unpublished Fundraiser ${unique()}`

    const createdDraft = await payload.create({
      collection: 'events',
      draft: true,
      data: {
        title: draftTitle,
        summary: 'Still being planned.',
        startsAt: new Date().toISOString(),
        _status: 'draft',
      },
    })

    // Prove the draft really was created before asserting it is hidden —
    // otherwise a bug that silently drops the create would also make the
    // "hides drafts" assertion pass for the wrong reason.
    const withAccess = await payload.find({
      collection: 'events',
      overrideAccess: true,
      where: { title: { equals: draftTitle } },
    })
    expect(withAccess.docs).toHaveLength(1)
    expect(withAccess.docs[0].id).toBe(createdDraft.id)

    const draftAnonymous = await payload.find({
      collection: 'events',
      overrideAccess: false,
      where: { title: { equals: draftTitle } },
    })
    expect(draftAnonymous.docs).toHaveLength(0)

    const publishedTitle = `Community Health Fair ${unique()}`

    await payload.create({
      collection: 'events',
      draft: false,
      data: {
        title: publishedTitle,
        slug: slugify(publishedTitle),
        summary: 'Live on the site.',
        startsAt: new Date().toISOString(),
        _status: 'published',
      },
    })

    const publishedAnonymous = await payload.find({
      collection: 'events',
      overrideAccess: false,
      where: { title: { equals: publishedTitle } },
    })
    expect(publishedAnonymous.docs).toHaveLength(1)
  })
})
