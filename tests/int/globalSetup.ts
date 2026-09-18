import { config as loadEnv } from 'dotenv'

/**
 * Creates the test database schema exactly once, before any test file runs.
 *
 * Each integration test file boots its own Payload instance in its own worker.
 * When every one of them also pushed the schema, they intermittently collided
 * with "SQLITE_ERROR: index ... already exists". `.env.test` sets
 * PAYLOAD_PUSH=false so the workers skip it; this process turns it back on for
 * itself and does the push once.
 */
export default async function setup() {
  loadEnv({ path: '.env.test', override: true })
  process.env.PAYLOAD_PUSH = 'true'

  // Imported dynamically so the env above is set before the config is read.
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')

  const payload = await getPayload({ config: await config })
  await payload.db.destroy?.()
}
