import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { revalidates, revalidatesGlobal } from '@/hooks/revalidate'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const revalidated = vi.mocked(revalidatePath)

// The hooks read only `doc`, `previousDoc` and `req.payload.logger`. Payload's
// hook argument types carry a dozen more required members, none of which these
// touch, so the argument is cast rather than stubbed.
const req = { payload: { logger: { info: vi.fn() } } }

const hooks = revalidates((doc) => [['/programs'], [`/programs/${doc.slug}`], ['/']])

const change = (doc: { slug: string }, previousDoc?: { slug: string }) =>
  hooks.afterChange[0]({ doc, previousDoc, req } as never)

describe('revalidates', () => {
  // Braces matter: mockReset() returns the mock, and a function returned from
  // beforeEach is treated as a teardown callback -- Vitest would call the mock
  // again after the test.
  beforeEach(() => {
    revalidated.mockReset()
  })

  it('clears every route the document appears on', async () => {
    await change({ slug: 'clean-water' })

    expect(revalidated.mock.calls).toEqual([
      ['/programs', undefined],
      ['/programs/clean-water', undefined],
      ['/', undefined],
    ])
  })

  it('also clears the old URL when the slug changes', async () => {
    await change({ slug: 'clean-water' }, { slug: 'water-project' })

    expect(revalidated.mock.calls).toContainEqual(['/programs/water-project', undefined])
  })

  it('clears each path once when the slug is unchanged', async () => {
    await change({ slug: 'clean-water' }, { slug: 'clean-water' })

    expect(revalidated).toHaveBeenCalledTimes(3)
  })

  it('clears the route a deleted document used to occupy', async () => {
    await hooks.afterDelete[0]({ doc: { slug: 'clean-water' }, req } as never)

    expect(revalidated.mock.calls).toContainEqual(['/programs/clean-water', undefined])
  })

  it('returns the document so the write still completes', async () => {
    const doc = { slug: 'clean-water' }

    expect(await change(doc)).toBe(doc)
  })

  // `npm run seed` writes through the same hooks from the CLI, where there is
  // no Next request and revalidatePath throws. A seed must not fail because of
  // a cache that isn't running.
  it('survives revalidatePath throwing outside a request context', async () => {
    revalidated.mockImplementation(() => {
      throw new Error('Invariant: static generation store missing')
    })
    const doc = { slug: 'clean-water' }

    expect(await change(doc)).toBe(doc)
    expect(revalidated).toHaveBeenCalledTimes(3)
  })
})

describe('revalidatesGlobal', () => {
  beforeEach(() => {
    revalidated.mockReset()
  })

  it('clears the fixed routes a global feeds, with their path type', async () => {
    const hook = revalidatesGlobal([['/', 'layout']])
    const doc = { items: [] }

    expect(await hook.afterChange[0]({ doc, req } as never)).toBe(doc)
    expect(revalidated.mock.calls).toEqual([['/', 'layout']])
  })
})
