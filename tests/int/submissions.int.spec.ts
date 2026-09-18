import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let payload: Payload
let admin: Awaited<ReturnType<Payload['create']>>

// The test database persists between runs, so unique values (emails here)
// must not collide across runs. Matches the pattern in access.int.spec.ts.
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

beforeAll(async () => {
  payload = await getPayload({ config: await config })

  admin = await payload.create({
    collection: 'users',
    data: {
      name: 'Submissions Admin',
      email: `submissions-admin-${unique()}@example.test`,
      password: 'test-password-123',
      role: 'admin',
    },
  })
})

describe('submissions collection', () => {
  // This collection's whole point is that the public API can never be used
  // to write to it — `create: () => false` is the anti-spam guarantee for
  // the contact and volunteer forms. Only a server action, which writes with
  // `overrideAccess: true`, may create a submission.
  it('rejects an anonymous create (the anti-spam guarantee)', async () => {
    const email = `spam-${unique()}@example.test`
    let caughtError: unknown

    try {
      await payload.create({
        collection: 'submissions',
        overrideAccess: false,
        data: {
          formType: 'contact',
          name: 'Spam Bot',
          email,
          message: 'This should never be allowed to land.',
        },
      })
    } catch (error) {
      caughtError = error
    }

    // All required fields (formType, name, email, message) were supplied, so
    // a rejection here cannot be a validation error — it must be an access
    // denial. Assert on the actual error shape rather than just "it threw",
    // so a validation failure masquerading as an access failure would be
    // caught rather than passed for the wrong reason.
    expect(caughtError).toBeDefined()
    const message = caughtError instanceof Error ? caughtError.message : String(caughtError)
    expect(message.toLowerCase()).toMatch(/not allowed|forbidden|permission/)

    // Confirm the create really did not land, rather than merely throwing
    // while still writing (which would be a worse bug than a clean reject).
    const check = await payload.find({
      collection: 'submissions',
      overrideAccess: true,
      where: { email: { equals: email } },
    })
    expect(check.docs).toHaveLength(0)
  })

  // Plan 3's contact/volunteer server actions depend on this working — if
  // both directions were blocked, the forms could never save anything.
  it('lets a privileged write (overrideAccess: true) create a submission, as a server action would', async () => {
    const email = `contact-${unique()}@example.test`

    const created = await payload.create({
      collection: 'submissions',
      // overrideAccess defaults to true; passed explicitly here to mirror
      // exactly what the server action does.
      overrideAccess: true,
      data: {
        formType: 'contact',
        name: 'Real Visitor',
        email,
        message: 'Hello, I would like to volunteer.',
      },
    })

    expect(created.id).toBeTruthy()
    expect(created.email).toBe(email)

    const found = await payload.findByID({
      collection: 'submissions',
      id: created.id,
      overrideAccess: true,
    })
    expect(found.name).toBe('Real Visitor')
  })

  // `update: () => false` means nobody can update a submission through the
  // API, not even an admin — the only supported change (marking it handled)
  // must happen some other way (direct DB access from the admin UI's own
  // privileged path, if any, not the documented access-controlled API).
  it('rejects an update even from an admin user', async () => {
    const created = await payload.create({
      collection: 'submissions',
      overrideAccess: true,
      data: {
        formType: 'volunteer',
        name: 'Needs Reply',
        email: `needs-reply-${unique()}@example.test`,
        message: 'Please get back to me.',
      },
    })

    let caughtError: unknown

    try {
      await payload.update({
        collection: 'submissions',
        id: created.id,
        overrideAccess: false,
        user: admin,
        data: { handled: true },
      })
    } catch (error) {
      caughtError = error
    }

    // `handled` is a valid, optional field, so a rejection here cannot be a
    // validation error — it must be the access-control rule.
    expect(caughtError).toBeDefined()
    const message = caughtError instanceof Error ? caughtError.message : String(caughtError)
    expect(message.toLowerCase()).toMatch(/not allowed|forbidden|permission/)

    const after = await payload.findByID({
      collection: 'submissions',
      id: created.id,
      overrideAccess: true,
    })
    expect(after.handled).toBe(false)
  })
})
