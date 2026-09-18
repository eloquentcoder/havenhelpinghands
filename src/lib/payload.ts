import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null

/**
 * Payload instance for Server Components. This reads the database in-process —
 * there is no HTTP request between the site and the CMS, so no API key, no
 * network hop and nothing to rate-limit.
 */
export const getPayloadClient = (): Promise<Payload> => {
  cached ??= getPayload({ config })
  return cached
}
