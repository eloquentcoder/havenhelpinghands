import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload

// `title` isn't unique on programs, but keep the pattern used elsewhere in
// this suite so re-runs against the persisted test database are easy to
// tell apart in the admin UI if something needs debugging.
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('globals are reachable with their defaults', () => {
  it('site-settings returns organisationName default before ever being written', async () => {
    const doc = await payload.findGlobal({ slug: 'site-settings' })
    expect(doc.organisationName).toBe('Helping Hands Initiative')
  })

  it('navigation is reachable', async () => {
    const doc = await payload.findGlobal({ slug: 'navigation' })
    expect(doc).toBeDefined()
  })

  it('footer is reachable', async () => {
    const doc = await payload.findGlobal({ slug: 'footer' })
    expect(doc).toBeDefined()
  })

  it('homepage is reachable', async () => {
    const doc = await payload.findGlobal({ slug: 'homepage' })
    expect(doc).toBeDefined()
  })
})

describe('site-settings access control', () => {
  it('allows anonymous read', async () => {
    await expect(
      payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    ).resolves.toBeDefined()
  })

  it('denies anonymous update with an access error, not a validation error', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { tagline: 'x' },
        overrideAccess: false,
      }),
    ).rejects.toThrow('You are not allowed to perform this action.')
  })
})

describe('homepage featuredPrograms relationship', () => {
  it('resolves the populated program title at depth 1', async () => {
    const title = `Featured Program ${unique()}`

    const program = await payload.create({
      collection: 'programs',
      overrideAccess: true,
      draft: false,
      data: {
        title,
        slug: `featured-program-${unique()}`,
        summary: 'A program featured on the homepage.',
        status: 'ongoing',
        _status: 'published',
      },
    })

    await payload.updateGlobal({
      slug: 'homepage',
      overrideAccess: true,
      data: {
        headline: 'Test headline',
        featuredPrograms: [program.id],
      },
    })

    const homepage = await payload.findGlobal({
      slug: 'homepage',
      depth: 1,
      overrideAccess: true,
    })

    expect(homepage.featuredPrograms).toBeDefined()
    const [populated] = homepage.featuredPrograms as unknown as Array<{
      id: string | number
      title: string
    }>
    expect(populated.title).toBe(title)
  })
})
