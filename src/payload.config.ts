import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Programs } from './collections/Programs'
import { Team } from './collections/Team'
import { Partners } from './collections/Partners'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'
import { Events } from './collections/Events'
import { Redirects } from './collections/Redirects'
import { Submissions } from './collections/Submissions'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Footer } from './globals/Footer'
import { Homepage } from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Programs,
    Team,
    Partners,
    Categories,
    Posts,
    Events,
    Redirects,
    Submissions,
    Pages,
  ],
  globals: [SiteSettings, Navigation, Footer, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
      // Ignored for local `file:` URLs; required for a remote Turso database.
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    // Dev schema sync, on everywhere except the test suite. Each integration
    // test file boots its own Payload instance, and letting all of them push
    // the schema raced on "index ... already exists". The suite pushes once in
    // tests/int/globalSetup.ts instead.
    push: process.env.PAYLOAD_PUSH !== 'false',
  }),
  sharp,
  plugins: [],
})
