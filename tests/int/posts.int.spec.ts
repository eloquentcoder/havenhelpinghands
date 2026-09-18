import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'

let payload: Payload

// `slug` is unique and the test database persists between runs, so titles
// (which the slug is generated from) must be unique per run too — otherwise a
// re-run collides with a document a previous run already created. Matches the
// pattern in access.int.spec.ts and programs.int.spec.ts.
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

describe('posts collection', () => {
  it('generates a slug from the title', async () => {
    const title = `Clean Water Story ${unique()}`

    const doc = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title,
        excerpt: 'A short teaser.',
        body: richTextBody,
        _status: 'draft',
      },
    })

    expect(doc.slug).toBe(slugify(title))
  })

  it('hides drafts from anonymous readers, shows published posts', async () => {
    const draftTitle = `Unpublished Update ${unique()}`

    const createdDraft = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: draftTitle,
        excerpt: 'Still being written.',
        body: richTextBody,
        _status: 'draft',
      },
    })

    // Prove the draft really was created before asserting it is hidden —
    // otherwise a bug that silently drops the create would also make the
    // "hides drafts" assertion pass for the wrong reason.
    const withAccess = await payload.find({
      collection: 'posts',
      overrideAccess: true,
      where: { title: { equals: draftTitle } },
    })
    expect(withAccess.docs).toHaveLength(1)
    expect(withAccess.docs[0].id).toBe(createdDraft.id)

    const draftAnonymous = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      where: { title: { equals: draftTitle } },
    })
    expect(draftAnonymous.docs).toHaveLength(0)

    const publishedTitle = `Published Update ${unique()}`

    await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: publishedTitle,
        slug: slugify(publishedTitle),
        excerpt: 'Live on the site.',
        body: richTextBody,
        _status: 'published',
      },
    })

    const publishedAnonymous = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      where: { title: { equals: publishedTitle } },
    })
    expect(publishedAnonymous.docs).toHaveLength(1)
  })

  it('stamps publishedAt once on first publish and preserves it on later updates', async () => {
    const title = `Milestone Reached ${unique()}`

    const created = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title,
        slug: slugify(title),
        excerpt: 'First publish.',
        body: richTextBody,
        _status: 'published',
      },
    })

    expect(created.publishedAt).toBeTruthy()
    const firstPublishedAt = created.publishedAt

    // Update something unrelated to publishedAt, still published.
    const updated = await payload.update({
      collection: 'posts',
      id: created.id,
      draft: false,
      data: {
        excerpt: 'Updated excerpt, should not touch publishedAt.',
        _status: 'published',
      },
    })

    expect(updated.publishedAt).toBe(firstPublishedAt)
  })

  it('resolves the author relationship', async () => {
    const memberName = `Author Member ${unique()}`

    const member = await payload.create({
      collection: 'team',
      data: {
        name: memberName,
        role: 'Program Officer',
        group: 'staff',
      },
    })

    const title = `Story With Author ${unique()}`

    const created = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title,
        excerpt: 'Has an author.',
        body: richTextBody,
        author: member.id,
        _status: 'draft',
      },
    })

    const found = await payload.findByID({
      collection: 'posts',
      id: created.id,
      depth: 1,
      overrideAccess: true,
    })

    expect(found.author).toBeTruthy()
    expect(typeof found.author === 'object' ? found.author?.name : undefined).toBe(memberName)
  })
})
