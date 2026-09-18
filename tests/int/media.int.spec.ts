import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('media collection', () => {
  it('refuses an image with no alt text', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: {} as never,
        filePath: 'tests/fixtures/sample.png',
      }),
    ).rejects.toThrow()
  })

  it('accepts an image with alt text', async () => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'Volunteers handing out food parcels in Ikorodu' },
      filePath: 'tests/fixtures/sample.png',
    })

    expect(doc.alt).toBe('Volunteers handing out food parcels in Ikorodu')
    expect(doc.filename).toBeTruthy()
  })
})
