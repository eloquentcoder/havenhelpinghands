import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let editor: Awaited<ReturnType<Payload['create']>>
let otherUserId: string | number

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

beforeAll(async () => {
  payload = await getPayload({ config: await config })

  editor = await payload.create({
    collection: 'users',
    data: {
      name: 'Volunteer Editor',
      email: `editor-${unique()}@example.test`,
      password: 'test-password-123',
      role: 'editor',
    },
  })

  const other = await payload.create({
    collection: 'users',
    data: {
      name: 'Other Staff',
      email: `other-${unique()}@example.test`,
      password: 'test-password-123',
      role: 'editor',
    },
  })
  otherUserId = other.id
})

describe('editor account permissions', () => {
  it('lets an editor rename their own account', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { name: 'Renamed Self' },
      overrideAccess: false,
      user: editor,
    })

    expect(updated.name).toBe('Renamed Self')
  })

  it('lets an editor change their own password', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: editor.id,
        data: { password: 'a-new-password-456' },
        overrideAccess: false,
        user: editor,
      }),
    ).resolves.toBeDefined()
  })

  it('stops an editor editing somebody else', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: otherUserId,
        data: { name: 'Should Not Happen' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('stops an editor promoting themselves to admin', async () => {
    // Payload does not reject this write. Field-level access silently discards
    // the `role` value and keeps the stored one, so asserting that it throws
    // would pass for the wrong reason — assert on what was actually stored.
    await payload.update({
      collection: 'users',
      id: editor.id,
      data: { role: 'admin' },
      overrideAccess: false,
      user: editor,
    })

    const after = await payload.findByID({ collection: 'users', id: editor.id })
    expect(after.role).toBe('editor')
  })
})
