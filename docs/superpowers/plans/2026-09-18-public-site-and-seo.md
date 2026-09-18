# Public Site & SEO Implementation Plan (Plan 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every public page from the CMS built in Plan 1, with the SEO foundation wired in from the start rather than bolted on.

**Architecture:** Server Components read content through Payload's in-process Local API — a direct database call, no HTTP hop, no API key. Pages are statically generated where content is stable and revalidated on demand when an editor publishes. A shared `resolveSeo` helper turns any document into Next `Metadata`, falling back document → global → default so a page is never missing a title or description.

**Tech Stack:** Next.js 16 App Router, Payload 3.89 Local API, Tailwind CSS 4, TypeScript, Playwright, Vitest.

**Design direction:** Warm and human, photography-led. Real brand logo and colours supplied by the owner (see Task 2 — do not invent a palette).

**Depends on:** `docs/superpowers/plans/2026-09-18-foundation-and-cms.md` (complete).

**Prerequisite reading:** Next 16 changes App Router APIs. Before writing route or metadata code, read the relevant guide in `node_modules/next/dist/docs/01-app/` rather than relying on Next 15 habits.

---

## Carried forward from Plan 1

Facts established by building the CMS. Do not rediscover them.

- **Uploads** are on local disk in `storage/media`, served at `/media/...` via a rewrite in `next.config.ts` to Payload's file route. `next/image` `localPatterns` already allows `/media/**`.
- **A file missing from disk returns 500, not 404** — Payload's own file route. Image components must not assume a URL resolves.
- **Drafts** are hidden from anonymous reads by `publishedOrSignedIn`. Public pages need no extra filtering, but draft PREVIEW needs an authenticated Payload call.
- **The reserved-slug list** lives in `src/fields/slug.ts` as `RESERVED`. **Every new top-level route added by this plan must be added to it**, or a Page could shadow that route. Currently: `admin`, `api`, `programs`, `blog`, `events`, `donate`, `next`.
- **Seed data contains no images.** Every layout must render correctly with a missing image. This is a feature — it surfaces the real degraded state.
- **Integration tests** run on `node`, write to `helpinghive-test.db`, and the schema is pushed once by `tests/int/globalSetup.ts`.
- **A custom field `validate` replaces Payload's `required` check** — delegate to `validations.<type>` first if adding one.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/payload.ts` | Cached `getPayload` accessor for Server Components |
| `src/lib/seo.ts` | `resolveSeo()` — document → Next `Metadata`, with fallbacks |
| `src/lib/schema.ts` | JSON-LD builders (Organization/NGO, Article, Event, Breadcrumb) |
| `src/lib/format.ts` | Date and number formatting, Nigeria-appropriate |
| `src/components/layout/` | Header, Footer, Nav, MobileNav, Container |
| `src/components/ui/` | Button, Card, Badge, Prose, Stat, SectionHeading |
| `src/components/media/` | `CmsImage` — wraps `next/image`, handles a missing image |
| `src/components/blocks/` | One renderer per page-builder block, plus `RenderBlocks` |
| `src/components/seo/JsonLd.tsx` | Emits a JSON-LD script tag |
| `src/app/(frontend)/layout.tsx` | Root layout: header, footer, fonts, Organization JSON-LD |
| `src/app/(frontend)/page.tsx` | Homepage, from the `homepage` global |
| `src/app/(frontend)/programs/` | Index + `[slug]` |
| `src/app/(frontend)/blog/` | Index, `[slug]`, `category/[slug]` |
| `src/app/(frontend)/events/` | Index + `[slug]` |
| `src/app/(frontend)/[slug]/page.tsx` | CMS Pages (About, Privacy, …) — must be LAST |
| `src/app/(frontend)/contact/page.tsx` | Contact page (form arrives in Plan 3) |
| `src/app/(frontend)/donate/page.tsx` | Donate page, CTA to hosted Paystack link |
| `src/app/sitemap.ts`, `src/app/robots.ts` | Generated from published content |
| `src/app/(frontend)/**/opengraph-image.tsx` | Social cards |
| `src/middleware.ts` | Applies the Redirects collection |

Each block renderer is its own file: block renderers change independently and a single switch statement grows unwieldy.

---

## Task order and rationale

1. **Data access + SEO helpers** — everything depends on them; pure logic, unit-testable
2. **Brand tokens** — needs the owner's real logo and colours; blocks all visual work
3. **Layout shell** — header, footer, nav from globals
4. **Homepage**
5. **Programs** index + detail
6. **Blog** index, post, category
7. **Events** index + detail
8. **CMS Pages + block renderers** (the catch-all route, deliberately last)
9. **Contact + Donate**
10. **Sitemap, robots, redirects middleware**
11. **OG images**
12. **On-demand revalidation + draft preview**
13. **Playwright coverage + Lighthouse CI**

Tasks 1 and 2 can run in parallel. Tasks 4–9 depend on 3.

---

## Detailed tasks

> Tasks are written out as implementation proceeds, so each one can incorporate
> what the previous task actually discovered. Plan 1 showed that writing fifteen
> tasks up front produces detail that later turns out wrong — the jsdom
> assumption, the draft-flag requirement and the `validate`/`required` trap were
> all invisible until the code was written.

### Task 1: Data access and SEO helpers

**Files:**
- Create: `src/lib/payload.ts`, `src/lib/seo.ts`, `src/lib/schema.ts`
- Create: `tests/unit/seo.test.ts`, `tests/unit/schema.test.ts`

- [ ] **Step 1: Cached Payload accessor**

Server Components call this on every render, so the instance is cached per request.

```ts
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null

/** Payload instance for Server Components. Reads the database in-process. */
export const getPayloadClient = (): Promise<Payload> => {
  cached ??= getPayload({ config })
  return cached
}
```

Verify `config` needs awaiting here as it does in tests, and adjust if so.

- [ ] **Step 2: SEO resolution, test first**

`resolveSeo` must never return an empty title or description. Write the test
first, covering: document SEO wins; falls back to the document's own title and
summary/excerpt; falls back again to site settings; `noindex` produces
`robots: { index: false }`; a canonical override is honoured; an absent OG image
falls back to the site default.

Then implement `src/lib/seo.ts` returning Next `Metadata`.

- [ ] **Step 3: JSON-LD builders, test first**

`src/lib/schema.ts` exports builders for `NGO`/`Organization`, `Article`,
`Event` and `BreadcrumbList`. Test that each emits required properties and omits
keys whose source data is absent rather than emitting `undefined` or empty
strings — invalid structured data is worse than none.

- [ ] **Step 4: Verify**

`npm run test:unit`, `npx tsc --noEmit`, `npm run lint`, then commit.

### Task 2: Brand tokens — BLOCKED pending assets

Needs the owner's logo files and hex colours. Do not invent a palette; a
placeholder palette would have to be undone across every component.

When assets arrive: define colour, type and spacing tokens as CSS custom
properties in `src/app/(frontend)/styles.css` under `@theme`, self-host the
typeface with `next/font`, and delete the template's black `html`/`body` rules
and the `.home` styles left over from the Payload blank template.

### Tasks 3 onward

Written once Tasks 1 and 2 land.
