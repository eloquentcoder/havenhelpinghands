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

/**
 * Restricts a public query to published documents.
 *
 * Payload's Local API defaults to `overrideAccess: true`, so the
 * `publishedOrSignedIn` rule in src/access/roles.ts never runs for anything
 * this site renders — a document saved as a draft was being served to
 * visitors. Passing `overrideAccess: false` instead would also apply
 * field-level read access written for the HTTP layer, with no user present,
 * so the narrow fix is the safer one.
 *
 * Only for collections with `versions.drafts` enabled — programs, posts,
 * events and pages. The others have no `_status` column.
 */
export const publishedOnly = { _status: { equals: 'published' } } as const
