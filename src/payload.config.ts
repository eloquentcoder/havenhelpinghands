import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { PageHeaders } from './globals/PageHeaders'

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
  globals: [SiteSettings, Navigation, Footer, Homepage, PageHeaders],
  // Payload's default feature set ships only the inline toolbar — the popup
  // that appears over a selection. It overlaps the line beneath it and closes
  // the moment the selection is lost, which makes a format easy to apply and
  // just as easy to lose before the document is saved. The fixed toolbar sits
  // above the field and stays there.
  //
  // `features` replaces the defaults outright, so defaultFeatures is spread
  // back in — returning only the toolbar would take bold, links and headings
  // with it.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
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
    // Schema is managed by migrations in src/migrations, not by dev push.
    //
    // Drizzle's push repeatedly tried to CREATE INDEX for indexes that already
    // existed ("index site_settings_logo_idx already exists"), which broke the
    // running dev server, not just the test suite. Migrations are explicit,
    // reviewable and the same mechanism production needs, so push is off
    // everywhere except when a test run is building a throwaway database.
    push: process.env.PAYLOAD_PUSH === 'true',
  }),
  sharp,
  plugins: [],
})
