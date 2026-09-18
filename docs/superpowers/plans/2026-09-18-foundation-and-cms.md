# Foundation & CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js + Payload application with every content schema in place, so Helping Hive staff can log in and enter real content before a single public page exists.

**Architecture:** One Next.js 16 App Router application with Payload CMS 3 mounted inside it. Payload owns `/admin` and the database; the public site (Plan 2) will read content through Payload's in-process Local API rather than over HTTP. Content schemas live in `src/collections/`, reusable field definitions in `src/fields/`, and access rules in `src/access/` so they are unit-testable without booting the CMS.

**Tech Stack:** Next.js 16.3.3, Payload 3.89, SQLite via libSQL, Tailwind CSS 4, TypeScript, Vitest, Playwright.

**Next.js 16, not 15.** `create-payload-app` installed Next 16.3.3. Next 16 makes
breaking changes to App Router APIs, and `next dev` writes an `AGENTS.md` saying
so. Before writing App Router code — especially the metadata, sitemap and
`opengraph-image` work in Plan 2 — read the relevant guide in
`node_modules/next/dist/docs/` rather than relying on Next 15 habits.

**Spec:** `docs/superpowers/specs/2026-09-18-helping-hive-ngo-site-design.md`

**Prerequisite:** Node.js 20 or later. No database server is needed — SQLite is a file.

**What the generator already gave us** (discovered during Task 1; later tasks
build on these rather than replacing them):

- `vitest.config.mts` — integration tests, `tests/int/**/*.int.spec.ts`, jsdom
- `playwright.config.ts` + `tests/e2e/` + `tests/helpers/` — e2e scaffolding
- `src/collections/Users.ts` and `src/collections/Media.ts` — stub collections
- `tsconfig.json` paths for both `@/*` and `@payload-config`
- Scripts: `dev`, `build`, `lint`, `test:int`, `test:e2e`, `generate:types`

Note the convention: integration tests are named `*.int.spec.ts`, not
`*.int.test.ts`. Follow it.

---

## File Structure

Files created by this plan, and what each is responsible for.

| File | Responsibility |
| --- | --- |
| `src/payload.config.ts` | Wires collections, globals, database and storage together |
| `helpinghive.db` | The development database (git-ignored) |
| `src/lib/slug.ts` | Pure string-to-slug conversion |
| `src/fields/formatSlugHook.ts` | Payload hook that derives a slug from another field |
| `src/fields/slug.ts` | Reusable slug field definition |
| `src/fields/seo.ts` | Reusable SEO field group, shared by every routed collection |
| `src/access/roles.ts` | Pure access-control predicates |
| `src/collections/Users.ts` | Auth + roles |
| `src/collections/Media.ts` | Uploads, with required alt text |
| `src/collections/Programs.ts` | Programs/initiatives |
| `src/collections/Categories.ts` | Blog taxonomy |
| `src/collections/Posts.ts` | Blog/news/stories |
| `src/collections/Events.ts` | Events |
| `src/collections/Team.ts` | Staff and board |
| `src/collections/Partners.ts` | Partner organisations |
| `src/collections/Pages.ts` | Block-based page builder |
| `src/collections/Redirects.ts` | Editor-managed redirects |
| `src/collections/Submissions.ts` | Form submissions |
| `src/blocks/*.ts` | Page-builder blocks |
| `src/globals/*.ts` | Site Settings, Navigation, Footer, Homepage |
| `tests/unit/*.test.ts` | Unit tests for pure logic |
| `tests/int/*.int.spec.ts` | Integration tests against a real database |
| `vitest.unit.config.mts` | Unit test config (integration config already exists) |

One file per collection. Collections are the unit that changes independently — an editor asking for a new field on Events should touch exactly one file.

---

## Task 1: Scaffold the application

**Files:**
- Create: entire project skeleton
- Create: `.env`, `.env.test`, `.env.example`
- Modify: `.gitignore`

There is no database server to install or start. `@payloadcms/db-sqlite` ships
`@libsql/client`, so a `file:` URL is a local file and a `libsql:` URL is a Turso
database in production — same adapter, same code, nothing running locally.

- [ ] **Step 1: Scaffold Payload + Next.js**

The project directory already contains `docs/` and `.git`, so scaffold in place:

```bash
npx create-payload-app@latest . \
  --name helping-hive \
  --template blank \
  --db sqlite \
  --db-connection-string "file:./helpinghive.db" \
  --secret "$(openssl rand -hex 32)" \
  --no-git
```

This generates `src/payload.config.ts`, the `src/app/(payload)/` route group holding the admin panel, and the `src/app/(frontend)/` route group for the public site. Answer "yes" if it asks to proceed in a non-empty directory.

Expected: `Launch Application: npm run dev`

- [ ] **Step 2: Confirm the SQLite adapter is wired up**

```bash
grep -n "sqliteAdapter" src/payload.config.ts
```

Expected: an import from `@payloadcms/db-sqlite` and a `db: sqliteAdapter({ client: { url: process.env.DATABASE_URI } })` entry. If the generator produced something different, correct it to match.

- [ ] **Step 3: Add the test environment file**

Create `.env.test`:

```
DATABASE_URI=file:./helpinghive-test.db
PAYLOAD_SECRET=test-secret-not-used-in-production
```

Create `.env.example` (committed; `.env` and `.env.test` are not):

```
DATABASE_URI=file:./helpinghive.db
PAYLOAD_SECRET=generate-with-openssl-rand-hex-32
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production only — a Turso libSQL database.
# DATABASE_URI=libsql://<name>.turso.io
# DATABASE_AUTH_TOKEN=

# Cloudflare R2 (Task 14)
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_PUBLIC_URL=
```

- [ ] **Step 4: Ignore the database files and confirm env files are ignored**

Append to `.gitignore`:

```
*.db
*.db-journal
*.db-wal
*.db-shm
.env.test
```

Then verify:

```bash
grep -E '^\.env|^\*\.db' .gitignore
```

Expected: output includes `.env`, `.env.test` and `*.db`. A committed database file would leak content and cause constant merge conflicts.

- [ ] **Step 5: Support the Turso auth token**

A local file needs no credentials, but Turso does. In `src/payload.config.ts`, extend the adapter config so the token is passed when present:

```ts
db: sqliteAdapter({
  client: {
    url: process.env.DATABASE_URI || '',
    // Ignored for local `file:` URLs; required for a remote Turso database.
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
}),
```

- [ ] **Step 6: Verify the admin panel boots**

```bash
npm run dev
```

Open `http://localhost:3000/admin`. Expected: the "Create first user" screen. Create an account with your own email — you will need it throughout. Then stop the server with Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 + Payload 3 with SQLite"
```

---

## Task 2: Add Tailwind CSS

**Files:**
- Modify: `postcss.config.mjs`
- Modify: `src/app/(frontend)/styles.css`

Tailwind 4 is configured in CSS, not a JavaScript config file. The Payload admin panel lives in a separate route group with its own layout that does not import this stylesheet, so admin styling stays untouched.

- [ ] **Step 1: Install**

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

- [ ] **Step 2: Configure PostCSS**

Replace `postcss.config.mjs` with:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 3: Import Tailwind**

Add as the first line of `src/app/(frontend)/styles.css`:

```css
@import 'tailwindcss';
```

- [ ] **Step 4: Verify it compiles**

Edit `src/app/(frontend)/page.tsx` and wrap the existing content in a styled element:

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8 text-2xl font-bold text-emerald-700">
      Helping Hive Initiative
    </main>
  )
}
```

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: bold emerald text, centred, with padding. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add Tailwind CSS 4"
```

---

## Task 3: Set up Vitest and the slug utility

**Files:**
- Create: `vitest.unit.config.mts`
- Create: `tests/unit/slug.test.ts`
- Create: `src/lib/slug.ts`
- Modify: `package.json`

Vitest, `vite-tsconfig-paths` and `dotenv` are already installed, and
`vitest.config.mts` already exists for integration tests. Do not touch it — add a
second config for unit tests instead. They need different settings: unit tests
want a plain `node` environment and no database, integration tests want jsdom and
a real Payload instance.

- [ ] **Step 1: Add the unit test config**

Create `vitest.unit.config.mts`:

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
```

Add to the `scripts` block in `package.json`, and extend `test` to run both suites:

```json
"test:unit": "cross-env NODE_OPTIONS=--no-deprecation vitest run --config ./vitest.unit.config.mts",
"test": "npm run test:unit && npm run test:int"
```

`test:e2e` stays available on its own; it needs a running server, so it is not
part of the default `test` run.

- [ ] **Step 3: Write the failing test**

Create `tests/unit/slug.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Clean Water Project')).toBe('clean-water-project')
  })

  it('strips apostrophes rather than turning them into hyphens', () => {
    expect(slugify("Omolola's Fund")).toBe('omololas-fund')
  })

  it('collapses runs of whitespace and punctuation into one hyphen', () => {
    expect(slugify('Health  &  Nutrition')).toBe('health-nutrition')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Hello World!  ')).toBe('hello-world')
  })

  it('removes accents instead of dropping the letter', () => {
    expect(slugify('Café Outreach')).toBe('cafe-outreach')
  })

  it('returns an empty string for input with no usable characters', () => {
    expect(slugify('!!!')).toBe('')
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npm run test:unit
```

Expected: FAIL — `Failed to resolve import "@/lib/slug"`

- [ ] **Step 5: Write the implementation**

Create `src/lib/slug.ts`:

```ts
/**
 * Convert arbitrary text into a URL-safe slug.
 *
 * Apostrophes are removed rather than replaced so "Omolola's" becomes
 * "omololas", not "omolola-s". Accented characters are decomposed and
 * stripped of their marks so "Café" becomes "cafe" rather than "caf".
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npm run test:unit
```

Expected: PASS — `6 passed`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add slugify utility with Vitest setup"
```

---

## Task 4: Reusable slug field

**Files:**
- Create: `tests/unit/formatSlugHook.test.ts`
- Create: `src/fields/formatSlugHook.ts`
- Create: `src/fields/slug.ts`

The hook logic is extracted from the field definition so it can be tested without booting Payload.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/formatSlugHook.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatSlugHook } from '@/fields/formatSlugHook'

const hook = formatSlugHook('title')
const run = (args: { value?: unknown; data?: Record<string, unknown> }) =>
  // The hook only reads `value` and `data`; the rest of Payload's hook
  // argument object is irrelevant here.
  (hook as (a: unknown) => unknown)(args)

describe('formatSlugHook', () => {
  it('derives a slug from the fallback field when no value is given', () => {
    expect(run({ data: { title: 'Clean Water Project' } })).toBe('clean-water-project')
  })

  it('normalises a value the editor typed by hand', () => {
    expect(run({ value: 'Clean Water!', data: { title: 'Ignored' } })).toBe('clean-water')
  })

  it('falls back to the title when the editor clears the field', () => {
    expect(run({ value: '', data: { title: 'Clean Water Project' } })).toBe('clean-water-project')
  })

  it('returns undefined when there is nothing to derive a slug from', () => {
    expect(run({ data: {} })).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm run test:unit
```

Expected: FAIL — `Failed to resolve import "@/fields/formatSlugHook"`

- [ ] **Step 3: Write the implementation**

Create `src/fields/formatSlugHook.ts`:

```ts
import type { FieldHook } from 'payload'
import { slugify } from '@/lib/slug'

/**
 * Derives a slug on save. An editor-supplied value wins; otherwise the slug is
 * generated from `fallbackField` (normally the title). Either way the result is
 * normalised, so a hand-typed slug can never contain invalid characters.
 */
export const formatSlugHook =
  (fallbackField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return slugify(value)
    }

    const fallback = data?.[fallbackField]
    if (typeof fallback === 'string' && fallback.trim().length > 0) {
      return slugify(fallback)
    }

    return undefined
  }
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm run test:unit
```

Expected: PASS — `10 passed`

- [ ] **Step 5: Add the field definition**

Create `src/fields/slug.ts`:

```ts
import type { Field } from 'payload'
import { formatSlugHook } from './formatSlugHook'

/**
 * The URL segment for a routed document. Left blank, it is generated from the
 * title, so editors never have to think about it — but it stays editable,
 * because a published URL should not silently change when a title is reworded.
 */
export const slugField = (fallbackField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'The web address for this page. Generated from the title if left blank.',
  },
  hooks: {
    beforeValidate: [formatSlugHook(fallbackField)],
  },
})
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add reusable slug field with auto-generation"
```

---

## Task 5: Access control and Users

**Files:**
- Create: `tests/unit/roles.test.ts`
- Create: `src/access/roles.ts`
- Modify: `src/collections/Users.ts`

Two roles. **Admins** manage users and delete content. **Editors** create and update content but cannot delete or change who has access — the common case for NGO staff and volunteer contributors.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/roles.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'

const as = (role?: string) =>
  ({ req: { user: role ? { role } : null } }) as never

describe('isAdmin', () => {
  it('allows an admin', () => {
    expect(isAdmin(as('admin'))).toBe(true)
  })

  it('denies an editor', () => {
    expect(isAdmin(as('editor'))).toBe(false)
  })

  it('denies an anonymous visitor', () => {
    expect(isAdmin(as())).toBe(false)
  })
})

describe('isAdminOrEditor', () => {
  it('allows an editor', () => {
    expect(isAdminOrEditor(as('editor'))).toBe(true)
  })

  it('allows an admin', () => {
    expect(isAdminOrEditor(as('admin'))).toBe(true)
  })

  it('denies an anonymous visitor', () => {
    expect(isAdminOrEditor(as())).toBe(false)
  })
})

describe('publishedOrSignedIn', () => {
  it('gives a signed-in user unrestricted read access', () => {
    expect(publishedOrSignedIn(as('editor'))).toBe(true)
  })

  it('restricts anonymous visitors to published documents', () => {
    expect(publishedOrSignedIn(as())).toEqual({ _status: { equals: 'published' } })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm run test:unit
```

Expected: FAIL — `Failed to resolve import "@/access/roles"`

- [ ] **Step 3: Write the implementation**

Create `src/access/roles.ts`:

```ts
import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

export const isAdminOrEditor: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'editor'

/**
 * Read access for drafted content. Signed-in staff see everything, including
 * drafts they are still working on. Anonymous visitors — and therefore the
 * public site — only ever see published documents.
 */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm run test:unit
```

Expected: PASS — `18 passed`

- [ ] **Step 5: Add roles to Users**

Replace `src/collections/Users.ts` with:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only an admin may change roles — an editor must not be able to
        // promote themselves.
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        description: 'Editors can write and publish content. Admins also manage users.',
      },
    },
  ],
}
```

- [ ] **Step 6: Promote your existing account**

The account created in Task 1 predates the role field and defaults to `editor`.

First run `npm run dev` once so Payload pushes the new `role` column to the database, then stop it and run:

```bash
sqlite3 helpinghive.db "UPDATE users SET role = 'admin';"
```

Verify:

```bash
sqlite3 helpinghive.db "SELECT email, role FROM users;"
```

Expected: your email paired with `admin`. `sqlite3` ships with macOS; if it is missing, `brew install sqlite`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add admin and editor roles with access control"
```

---

## Task 6: SEO field group and Media

**Files:**
- Create: `src/fields/seo.ts`
- Modify: `src/collections/Media.ts` (a stub already exists from the generator)
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the shared SEO field group**

Create `src/fields/seo.ts`:

```ts
import type { Field } from 'payload'

/**
 * Attached to every publicly-routed collection so SEO is uniform across the
 * site. Every field is optional: Plan 2 falls back to the document's own title
 * and summary, so a page is never missing a title or description even when an
 * editor skips this tab entirely.
 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 70,
      admin: {
        description:
          'Shown as the headline in Google. Aim for under 60 characters. Defaults to the title.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 170,
      admin: {
        description:
          'The grey text under the headline in Google. Aim for 150-160 characters. Defaults to the summary.',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The picture shown when this page is shared on WhatsApp, Facebook or X. Defaults to the hero image.',
      },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: {
        description:
          'Only fill this in if this content was first published elsewhere and that version should rank instead.',
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide this page from Google. The page stays reachable by anyone with the link.',
      },
    },
  ],
}
```

- [ ] **Step 2: Replace the Media collection**

The generator created a stub at `src/collections/Media.ts`. Replace its contents with:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 768, height: undefined, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe what is in the picture, for people using screen readers and for image search. Example: "Volunteers handing out food parcels in Ikorodu".',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional. Shown under the image on the page.' },
    },
  ],
}
```

Alt text is `required` deliberately. An optional alt field is never filled in, and both accessibility and image search depend on it.

- [ ] **Step 3: Register both in the config**

In `src/payload.config.ts`, replace the generated `collections` array entry for Media (or add it) so the imports and array read:

```ts
import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
```

```ts
collections: [Users, Media],
```

- [ ] **Step 4: Verify in the admin panel**

```bash
npm run dev
```

Open `http://localhost:3000/admin/collections/media/create`. Upload any image and try to save without alt text.

Expected: the save is rejected with a validation error on the Alt field. Fill it in, save successfully, then stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SEO field group and Media collection"
```

---

## Task 7: Programs collection

**Files:**
- Create: `src/collections/Programs.ts`
- Create: `tests/int/programs.int.spec.ts`
- Modify: `src/payload.config.ts`, `package.json`

- [ ] **Step 1: Write the collection**

Create `src/collections/Programs.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'

export const Programs: CollectionConfig = {
  slug: 'programs',
  labels: { singular: 'Program', plural: 'Programs' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'location', 'updatedAt'],
    description: 'The initiatives Helping Hive runs. Each one gets its own page.',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'One or two sentences, shown on the programs listing and used as the search description.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'The large image at the top of the program page.' },
            },
            { name: 'body', type: 'richText' },
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Photo', plural: 'Photos' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'location',
              type: 'text',
              admin: {
                description:
                  'Where this runs, for example "Ikorodu, Lagos State". Used for local search.',
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'ongoing',
              options: [
                { label: 'Ongoing', value: 'ongoing' },
                { label: 'Completed', value: 'completed' },
              ],
            },
            {
              name: 'impactStats',
              type: 'array',
              labels: { singular: 'Statistic', plural: 'Statistics' },
              maxRows: 4,
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: { description: 'For example "1,200"' },
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: { description: 'For example "meals served"' },
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField(),
  ],
}
```

`heroImage` is deliberately not required. Editors draft in stages, and a required image blocks saving a half-written program.

- [ ] **Step 2: Register it**

In `src/payload.config.ts`:

```ts
import { Programs } from '@/collections/Programs'
```

```ts
collections: [Users, Media, Programs],
```

- [ ] **Step 3: Point integration tests at the test database**

`vitest.config.mts` and the `test:int` script already exist. The problem is
`vitest.setup.ts`, which currently does a bare `import 'dotenv/config'` — that
loads `.env`, so integration tests run against the **development** database and
would corrupt real content.

Replace `vitest.setup.ts` with:

```ts
import { config } from 'dotenv'

// Point Payload at the throwaway test database, never the development one.
// `override` matters: dotenv will not replace an already-set variable without it.
config({ path: '.env.test', override: true })
```

Then give integration tests room to boot Payload. In `vitest.config.mts`, add to
the `test` block, leaving `include` and `environment` as they are:

```ts
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
```

- [ ] **Step 3b: Verify the redirection worked**

```bash
npm run test:int && ls -la helpinghive-test.db
```

Expected: the existing `api.int.spec.ts` still passes AND `helpinghive-test.db`
now exists. If it does not, the tests are still hitting `.env` — stop and fix
that before continuing, or Task 15's seed data will end up in the test database.

- [ ] **Step 4: Write the integration test**

This one is written after the collection rather than before it. The behaviour under test — slug generation and draft access — lives in Payload's own machinery reacting to configuration, so there is no meaningful red state to observe first. The unit tests in Tasks 3 to 5 cover the logic we actually wrote; this test proves the configuration wires it up correctly.

Create `tests/int/programs.int.spec.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let payload: Payload

beforeAll(async () => {
  // The config is a promise; await it, matching tests/int/api.int.spec.ts.
  payload = await getPayload({ config: await config })
})

describe('programs collection', () => {
  it('generates a slug from the title', async () => {
    const doc = await payload.create({
      collection: 'programs',
      data: {
        title: 'Clean Water Project',
        summary: 'Boreholes for three communities.',
        status: 'ongoing',
        _status: 'draft',
      },
    })

    expect(doc.slug).toBe('clean-water-project')
  })

  it('hides drafts from anonymous readers', async () => {
    await payload.create({
      collection: 'programs',
      data: {
        title: 'Unpublished Outreach',
        summary: 'Still being written.',
        status: 'ongoing',
        _status: 'draft',
      },
    })

    const result = await payload.find({
      collection: 'programs',
      overrideAccess: false,
      where: { title: { equals: 'Unpublished Outreach' } },
    })

    expect(result.docs).toHaveLength(0)
  })
})
```

- [ ] **Step 5: Run it**

```bash
npm run test:int
```

Expected: PASS — `3 passed` across two files (the generator's `api.int.spec.ts` plus these two). The test database file is created automatically on first run; delete `helpinghive-test.db` to reset it. If the second test fails because a draft *was* returned, check that `publishedOrSignedIn` is wired to `access.read` in `src/collections/Programs.ts`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Programs collection with integration tests"
```

---

## Task 8: Categories and Posts

**Files:**
- Create: `src/collections/Categories.ts`
- Create: `src/collections/Posts.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create Categories**

Create `src/collections/Categories.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    slugField(),
  ],
}
```

- [ ] **Step 2: Create Posts**

Create `src/collections/Posts.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Blog & News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Stories, news and updates. This is the main source of search traffic.',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'A short teaser shown on the blog listing and used as the search description.',
              },
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            { name: 'body', type: 'richText', required: true },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'author', type: 'relationship', relationTo: 'team' },
            { name: 'category', type: 'relationship', relationTo: 'categories' },
            {
              name: 'tags',
              type: 'array',
              labels: { singular: 'Tag', plural: 'Tags' },
              fields: [{ name: 'tag', type: 'text', required: true }],
            },
            {
              name: 'relatedPrograms',
              type: 'relationship',
              relationTo: 'programs',
              hasMany: true,
              admin: { description: 'Link this story to the programs it is about.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Set automatically when you first publish.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField(),
  ],
}
```

- [ ] **Step 3: Register both**

In `src/payload.config.ts`:

```ts
import { Categories } from '@/collections/Categories'
import { Posts } from '@/collections/Posts'
```

```ts
collections: [Users, Media, Programs, Categories, Posts],
```

Posts references the `team` collection, which does not exist until Task 10. Complete Task 10 before running the app, or temporarily comment out the `author` field.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Categories and Posts collections"
```

---

## Task 9: Events collection

**Files:**
- Create: `src/collections/Events.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the collection**

Create `src/collections/Events.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'venue', '_status'],
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              maxLength: 300,
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            { name: 'body', type: 'richText' },
          ],
        },
        {
          label: 'When & where',
          fields: [
            {
              name: 'startsAt',
              type: 'date',
              required: true,
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'endsAt',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'venue',
              type: 'text',
              admin: { description: 'For example "Freedom Park, Lagos Island".' },
            },
            { name: 'address', type: 'textarea' },
            {
              name: 'registrationUrl',
              type: 'text',
              admin: {
                description:
                  'Where people sign up. Leave blank if no registration is needed.',
              },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField(),
  ],
}
```

- [ ] **Step 2: Register it**

```ts
import { Events } from '@/collections/Events'
```

```ts
collections: [Users, Media, Programs, Categories, Posts, Events],
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Events collection"
```

---

## Task 10: Team and Partners

**Files:**
- Create: `src/collections/Team.ts`
- Create: `src/collections/Partners.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create Team**

Create `src/collections/Team.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'group', 'order'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, admin: { description: 'Job title.' } },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Staff', value: 'staff' },
        { label: 'Board', value: 'board' },
        { label: 'Volunteer', value: 'volunteer' },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'linkedin', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first on the About page.',
      },
    },
  ],
}
```

- [ ] **Step 2: Create Partners**

Create `src/collections/Partners.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'

export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'url', 'order'] },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'url', type: 'text', admin: { description: "The partner's website." } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
```

- [ ] **Step 3: Register both**

```ts
import { Team } from '@/collections/Team'
import { Partners } from '@/collections/Partners'
```

```ts
collections: [Users, Media, Programs, Categories, Posts, Events, Team, Partners],
```

- [ ] **Step 4: Verify the whole config loads**

```bash
npm run dev
```

Open `http://localhost:3000/admin`. Expected: the sidebar lists Programs, Blog & News, Events, Team, Partners, Categories, Media and Users. Create one Team member and confirm it can be selected as a Post author. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Team and Partners collections"
```

---

## Task 11: Page builder blocks and Pages

**Files:**
- Create: `src/blocks/Hero.ts`, `src/blocks/RichText.ts`, `src/blocks/Stats.ts`, `src/blocks/CallToAction.ts`
- Create: `src/collections/Pages.ts`
- Modify: `src/payload.config.ts`

Four blocks cover every static page in the spec. More can be added when a real page needs one — not before.

- [ ] **Step 1: Create the blocks**

Create `src/blocks/Hero.ts`:

```ts
import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subtext', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: { description: 'Button text, for example "Donate now".' },
    },
    { name: 'ctaUrl', type: 'text' },
  ],
}
```

Create `src/blocks/RichText.ts`:

```ts
import type { Block } from 'payload'

export const RichText: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [{ name: 'content', type: 'richText', required: true }],
}
```

Create `src/blocks/Stats.ts`:

```ts
import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  labels: { singular: 'Statistics', plural: 'Statistics blocks' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'For example "1,200"' } },
        { name: 'label', type: 'text', required: true, admin: { description: 'For example "meals served"' } },
      ],
    },
  ],
}
```

Create `src/blocks/CallToAction.ts`:

```ts
import type { Block } from 'payload'

export const CallToAction: Block = {
  slug: 'callToAction',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true },
  ],
}
```

- [ ] **Step 2: Create the Pages collection**

Create `src/collections/Pages.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { Hero } from '@/blocks/Hero'
import { RichText } from '@/blocks/RichText'
import { Stats } from '@/blocks/Stats'
import { CallToAction } from '@/blocks/CallToAction'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Standalone pages such as About, Impact or Privacy.',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrSignedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'layout',
              type: 'blocks',
              required: true,
              minRows: 1,
              blocks: [Hero, RichText, Stats, CallToAction],
              admin: { description: 'Build the page by adding and reordering sections.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField(),
  ],
}
```

- [ ] **Step 3: Register it**

```ts
import { Pages } from '@/collections/Pages'
```

```ts
collections: [Users, Media, Pages, Programs, Categories, Posts, Events, Team, Partners],
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Create a page titled "About Us", add a Hero block and a Text block, and save as draft. Expected: the slug sidebar field shows `about-us`. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add page builder blocks and Pages collection"
```

---

## Task 12: Redirects and Submissions

**Files:**
- Create: `src/collections/Redirects.ts`
- Create: `src/collections/Submissions.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create Redirects**

Create `src/collections/Redirects.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrEditor } from '@/access/roles'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'permanent'],
    description:
      'Send an old web address to a new one, so links shared in the past keep working.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The old path, starting with a slash. For example /old-program' },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'The new path or full URL. For example /programs/clean-water' },
    },
    {
      name: 'permanent',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Leave ticked unless this is temporary. Permanent redirects pass search ranking to the new address.',
      },
    },
  ],
}
```

- [ ] **Step 2: Create Submissions**

Create `src/collections/Submissions.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@/access/roles'

/**
 * Written to by the server actions in Plan 3. Nothing may create a submission
 * through the API, so this collection cannot be used as a spam target; the
 * server action writes with `overrideAccess`.
 */
export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'formType', 'createdAt'],
    description: 'Messages sent through the contact and volunteer forms.',
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Volunteer', value: 'volunteer' },
      ],
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Tick once someone has replied.' },
    },
  ],
}
```

- [ ] **Step 3: Register both**

```ts
import { Redirects } from '@/collections/Redirects'
import { Submissions } from '@/collections/Submissions'
```

```ts
collections: [
  Users,
  Media,
  Pages,
  Programs,
  Categories,
  Posts,
  Events,
  Team,
  Partners,
  Redirects,
  Submissions,
],
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Redirects and Submissions collections"
```

---

## Task 13: Globals

**Files:**
- Create: `src/globals/SiteSettings.ts`, `src/globals/Navigation.ts`, `src/globals/Footer.ts`, `src/globals/Homepage.ts`
- Modify: `src/payload.config.ts`

Globals are edit-once singletons. Site Settings in particular feeds the organisation-level structured data that Plan 2 emits, so the address and social links matter for search.

- [ ] **Step 1: Create Site Settings**

Create `src/globals/SiteSettings.ts`:

```ts
import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Organisation',
          fields: [
            { name: 'organisationName', type: 'text', required: true, defaultValue: 'Helping Hive Initiative' },
            {
              name: 'tagline',
              type: 'text',
              admin: { description: 'One line describing what the organisation does.' },
            },
            {
              name: 'description',
              type: 'textarea',
              maxLength: 300,
              admin: { description: 'Used as the search description on pages that have none of their own.' },
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Shown when a page with no image of its own is shared.' },
            },
            {
              name: 'registrationNumber',
              type: 'text',
              admin: { description: 'CAC registration number. Shown in the footer as a trust signal.' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            {
              name: 'address',
              type: 'group',
              admin: { description: 'Used for local search results. Fill this in fully.' },
              fields: [
                { name: 'street', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'state', type: 'text' },
                { name: 'country', type: 'text', defaultValue: 'Nigeria' },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socials',
              type: 'array',
              labels: { singular: 'Profile', plural: 'Profiles' },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'X (Twitter)', value: 'twitter' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                  ],
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Donations',
          fields: [
            {
              name: 'paystackUrl',
              type: 'text',
              admin: {
                description:
                  'The hosted Paystack payment page link. Every Donate button points here.',
              },
            },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Create Navigation**

Create `src/globals/Navigation.ts`:

```ts
import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Menu item', plural: 'Menu items' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, admin: { description: 'For example /programs' } },
        {
          name: 'children',
          type: 'array',
          labels: { singular: 'Sub-item', plural: 'Sub-items' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 3: Create Footer**

Create `src/globals/Footer.ts`:

```ts
import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    { name: 'blurb', type: 'textarea', admin: { description: 'Short paragraph in the first footer column.' } },
    {
      name: 'columns',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Column', plural: 'Columns' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    { name: 'copyright', type: 'text' },
  ],
}
```

- [ ] **Step 4: Create Homepage**

Create `src/globals/Homepage.ts`:

```ts
import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@/access/roles'
import { seoField } from '@/fields/seo'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'headline', type: 'text', required: true },
            { name: 'subtext', type: 'textarea' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'primaryCtaLabel', type: 'text', defaultValue: 'Donate' },
            { name: 'primaryCtaUrl', type: 'text', defaultValue: '/donate' },
            { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Our programs' },
            { name: 'secondaryCtaUrl', type: 'text', defaultValue: '/programs' },
          ],
        },
        {
          label: 'Sections',
          fields: [
            { name: 'missionHeading', type: 'text' },
            { name: 'missionBody', type: 'richText' },
            {
              name: 'impactStats',
              type: 'array',
              maxRows: 4,
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
            {
              name: 'featuredPrograms',
              type: 'relationship',
              relationTo: 'programs',
              hasMany: true,
              maxRows: 3,
              admin: { description: 'Up to three programs to show on the homepage.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
}
```

- [ ] **Step 5: Register all four**

```ts
import { SiteSettings } from '@/globals/SiteSettings'
import { Navigation } from '@/globals/Navigation'
import { Footer } from '@/globals/Footer'
import { Homepage } from '@/globals/Homepage'
```

Add to the config object:

```ts
globals: [SiteSettings, Navigation, Footer, Homepage],
```

- [ ] **Step 6: Verify and fill in**

```bash
npm run dev
```

Open the admin panel. Expected: a Globals section with Site settings, Navigation, Footer and Homepage. Fill in Site settings with the real organisation name, address and email — Plan 2 reads these for structured data. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add site settings, navigation, footer and homepage globals"
```

---

## Task 14: Cloudflare R2 media storage

**Files:**
- Modify: `src/payload.config.ts`
- Modify: `.env`, `.env.example`

Local disk storage does not survive a redeploy on a hosting platform. R2 has a free tier with no egress charges, and it speaks the S3 API.

- [ ] **Step 1: Install the adapter**

```bash
npm install @payloadcms/storage-s3
```

- [ ] **Step 2: Create the bucket**

In the Cloudflare dashboard, create an R2 bucket named `helpinghive-media`, enable public access for it, and create an API token with Object Read & Write. Record the account-specific S3 endpoint and the public bucket URL.

- [ ] **Step 3: Add the credentials to `.env`**

```
R2_BUCKET=helpinghive-media
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

- [ ] **Step 4: Wire up the plugin**

In `src/payload.config.ts`:

```ts
import { s3Storage } from '@payloadcms/storage-s3'
```

Add to the config object:

```ts
plugins: [
  s3Storage({
    // Disabled when credentials are absent, so local development and the test
    // suite keep writing to disk and need no cloud account.
    enabled: Boolean(process.env.R2_BUCKET),
    collections: {
      media: {
        prefix: 'media',
        generateFileURL: ({ filename, prefix }) =>
          `${process.env.R2_PUBLIC_URL}/${prefix}/${filename}`,
      },
    },
    bucket: process.env.R2_BUCKET || '',
    config: {
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    },
  }),
],
```

- [ ] **Step 5: Verify**

```bash
npm run dev
```

Upload an image in the admin panel. Expected: the image preview loads, and its URL begins with the `R2_PUBLIC_URL` value. Confirm the object appears in the R2 bucket. Stop the server.

- [ ] **Step 6: Confirm tests still pass without credentials**

```bash
npm test
```

Expected: PASS for both suites. `.env.test` has no R2 variables, so the plugin stays disabled.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: store media in Cloudflare R2"
```

---

## Task 15: Seed script and final verification

**Files:**
- Create: `src/scripts/seed.ts`
- Modify: `package.json`

A seed gives Plan 2 realistic content to render against, and gives staff a worked example of each content type.

- [ ] **Step 1: Write the seed script**

Create `src/scripts/seed.ts`:

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Creates one published document in each routed collection so the public site
 * has something real to render. Safe to re-run: it skips anything already there.
 */
const seed = async () => {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'programs',
    where: { slug: { equals: 'clean-water-project' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    payload.logger.info('Seed data already present, nothing to do.')
    process.exit(0)
  }

  const member = await payload.create({
    collection: 'team',
    data: {
      name: 'Omolola Adeyemi',
      role: 'Executive Director',
      group: 'staff',
      bio: 'Leads programme delivery and partnerships.',
      order: 0,
    },
  })

  const category = await payload.create({
    collection: 'categories',
    data: { title: 'Field notes', slug: 'field-notes' },
  })

  const program = await payload.create({
    collection: 'programs',
    data: {
      title: 'Clean Water Project',
      summary: 'Boreholes and water access for three underserved communities in Lagos State.',
      location: 'Ikorodu, Lagos State',
      status: 'ongoing',
      impactStats: [
        { value: '3', label: 'communities reached' },
        { value: '1,200', label: 'people with clean water' },
      ],
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'posts',
    data: {
      title: 'What we learned drilling our first borehole',
      excerpt: 'Six months in Ikorodu taught us more about logistics than about water.',
      author: member.id,
      category: category.id,
      relatedPrograms: [program.id],
      body: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'text',
                  text: 'Replace this with the real story.',
                  format: 0,
                  detail: 0,
                  mode: 'normal',
                  style: '',
                  version: 1,
                },
              ],
            },
          ],
        },
      },
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title: 'Community Health Outreach',
      summary: 'Free health screening and advice for families in Ikorodu.',
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      venue: 'Ikorodu Town Hall',
      _status: 'published',
    },
  })

  payload.logger.info('Seed complete.')
  process.exit(0)
}

void seed()
```

- [ ] **Step 2: Add the script**

In `package.json` `scripts`:

```json
"seed": "cross-env NODE_OPTIONS=--no-deprecation payload run src/scripts/seed.ts"
```

Install the helper if it is not already present:

```bash
npm install -D cross-env
```

- [ ] **Step 3: Run it**

```bash
npm run seed
```

Expected: `Seed complete.` Run it a second time and expect `Seed data already present, nothing to do.`

- [ ] **Step 4: Verify the seeded content in the admin panel**

```bash
npm run dev
```

Expected: Programs contains a published "Clean Water Project" with slug `clean-water-project`, Blog & News contains one published post attributed to Omolola Adeyemi, and Events contains one upcoming event. Stop the server.

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: PASS — `18 passed` unit, then `3 passed` integration.

- [ ] **Step 6: Verify the build**

```bash
npm run build
```

Expected: `Compiled successfully`. Fix any TypeScript errors before continuing — Payload regenerates `src/payload-types.ts` on dev start, so run `npm run dev` once if types look stale.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add seed script with example content"
```

---

## Done when

- `/admin` loads and a non-technical editor can create a Program, Post, Event, Team member, Partner and Page without touching code.
- Slugs generate automatically from titles.
- Drafts are invisible to anonymous readers.
- Images upload to R2 and cannot be saved without alt text.
- Editors cannot promote themselves to admin.
- `npm test` (unit + integration) and `npm run build` both pass.

## Next

Plan 2 — Public site & SEO: renders every page from this content, adds metadata, JSON-LD, sitemap, OG images and on-demand revalidation.
