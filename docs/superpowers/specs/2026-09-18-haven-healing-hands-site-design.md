# Haven Healing Hands Initiative — Website Design Spec

**Date:** 2026-09-18
**Status:** Approved

## Purpose

A public website for Haven Healing Hands Initiative (HHHI), a faith-based
international non-profit based in Abuja, Nigeria, registered in 2025 and founded
by Dr. Favour Charles. The site must establish credibility with grantmakers,
partners and press; rank in organic search; and let non-technical staff publish
content without a developer.

HHHI works through four integrated systems — the Healing System, the Shelter
System, the Empowerment System, and the MENtal Rehab. "MENtal" is a deliberate
wordplay; the capitalisation is preserved everywhere.

**Authoritative content:** `docs/content/hhhi-source-content.md`. Where it
conflicts with anything here, it wins.

### Content integrity rules

HHHI is a real registered organisation, so placeholder copy on this site reads
as a factual claim about it. An earlier build seeded invented programmes and an
invented founder, which only became dangerous once the organisation name was
corrected — the filler stopped looking like filler.

- **Never invent content.** Where the owner has not supplied something, the field
  stays empty. Currently unsupplied: CAC registration number, phone, street
  address, all photography, team members beyond the founder, partner logos.
- **`partners` stays empty.** The source document's "Collaborators & Partners"
  are categories — churches, community health centres — not named organisations.
  They appear as prose on Get Involved.
- **UN Women, WHO, UNICEF and USAID must never render as current partners.** The
  source lists them as potential future collaborations and as bodies the
  2025–2030 goals aspire to work with. Presenting them otherwise is a real
  reputational risk. SMAP is the only real named partner in the document, via
  the Momcation retreat.
- **No invented statistics.** The owner has supplied goals for 2025–2030, not
  achieved numbers, so the homepage seeds no impact figures.
- **The faith framing is deliberate**, including "establishing God's kingdom on
  earth". A softer secular framing was offered to the owner and declined. Do not
  soften it for funder appeal.

Three goals, delivered in phases: credibility and SEO first, donations second,
program and volunteer intake third.

## Constraints

These shaped every decision below.

- **Editors are non-technical NGO staff.** The CMS needs a real admin UI, not a
  markdown file in a git repo.
- **Budget is effectively zero.** No per-seat CMS licensing. Free tiers only.
- **Donors are Nigerian and diaspora.** Payments must support NGN cards, bank
  transfer and USSD locally, and international cards from abroad.
- **SEO is a primary requirement**, not a later optimization.

## Approaches considered

| Approach | Verdict |
| --- | --- |
| **Payload CMS 3 embedded in Next.js** | **Chosen.** MIT-licensed, unlimited editors, one repo and one deploy, direct in-process database reads. |
| Sanity free tier | Rejected. Best editing experience, but capped at 3 editor seats — a hard ceiling as volunteer contributors are added — and vendor-dependent pricing. |
| Keystatic (git-based markdown) | Rejected. Free and simple, but the editing experience is too weak for non-technical staff and every edit triggers a full rebuild. |

## Architecture

A single Next.js 16 App Router application with Payload CMS 3 mounted inside it.

```
app/
  (frontend)/          public site — SSR/ISR
  (payload)/admin/     CMS admin panel
collections/           content schemas
globals/               site-wide singletons
lib/                   seo, payload client, validation
```

Public pages read content through Payload's Local API — an in-process database
query, not an HTTP request. There is no network hop between the site and the
CMS, no API key to manage, and no rate limit to hit.

Rendering: static generation where content is stable, with on-demand
revalidation fired by a Payload `afterChange` hook. An editor's published change
goes live within seconds without a full site rebuild.

**Stack:** Next.js 16, Payload 3, SQLite via libSQL, local-disk media storage,
Tailwind CSS, TypeScript.

### Media storage

Uploads are stored on local disk in `storage/media`, outside the build tree, the
way Laravel keeps them in `storage/app/public`. They are served at `/media/...`
through a rewrite to Payload's file route.

Laravel's `public/storage` symlink has no working equivalent here, and this was
verified rather than assumed. Next.js reads the `public/` directory listing once
at server startup: a file present at startup is served, and a file an editor
uploads afterwards returns 404 until the process restarts. The symlink itself
resolves fine — the runtime lookup is what fails. Laravel's version works because
nginx resolves the path per request. The rewrite restores that behaviour, since
Payload's file route reads from disk on every request.

Known limitation: a file missing from disk returns HTTP 500 rather than 404.
That is Payload's own file route, reproduced without the rewrite. It should not
arise in normal use, because Payload deletes files together with their records.

### Why SQLite

Payload offers no MySQL adapter — the official list is Postgres, MongoDB, SQLite
and D1. SQLite was chosen from what is supported because it needs no database
server at all: development runs against a local file, and production runs against
Turso, a hosted libSQL service with a free tier.

Both use the same `@payloadcms/db-sqlite` adapter, which ships `@libsql/client`,
so there is no difference in code between local and production. Turso being
network-accessible also means the site can deploy to serverless hosting, which a
plain SQLite file cannot do — a serverless filesystem does not persist.

The limit worth naming: SQLite takes one writer at a time. For a content site
where a handful of staff publish and everyone else reads, this is irrelevant. If
the site later needs concurrent high-volume writes, the adapter swaps to Postgres
without touching a single collection definition.

### Hosting

The CMS is free; hosting is not entirely. Vercel's Hobby tier prohibits
commercial use, which a donation-accepting site arguably triggers. Options, in
order of preference:

1. Apply to the Vercel and DigitalOcean nonprofit credit programs.
2. Railway or Render at roughly $5/month, fully compliant, with a persistent
   disk holding both the SQLite file and `storage/media`.

**Serverless hosting is ruled out.** Storing uploads on local disk needs a
persistent filesystem, so Vercel and other serverless platforms are not options
while media is stored this way. This is a deliberate trade, consistent with
choosing SQLite. Moving to object storage later is a contained change: swap the
upload adapter and the `/media` rewrite; no collection definition changes.

This is a deployment decision, not a blocker on building.

## Content model

Each collection is a self-contained schema owning one kind of content.

| Collection | Key fields | URL |
| --- | --- | --- |
| **Programs** | title, slug, summary, rich body, hero image, gallery, location, impact stats, status (ongoing/completed) | `/programs/[slug]` |
| **Posts** | title, slug, excerpt, body, cover, author (→Team), category, tags, publishedAt | `/blog/[slug]` |
| **Events** | title, slug, start/end datetime, venue, body, registration URL, cover | `/events/[slug]` |
| **Team** | name, role, photo, bio, socials | rendered on `/about` |
| **Partners** | name, logo, URL | rendered on `/about` and footer |
| **Media** | image, alt text (**required**), caption | library |
| **Pages** | block-based page builder | `/[slug]` |
| **Submissions** | form payloads from contact and volunteer forms | admin only |
| **Redirects** | from path, to path, permanent flag | resolved in middleware |

**Globals** (edit-once, site-wide): Site Settings, Navigation, Footer, Homepage.

### Shared SEO field group

Every publicly-routed collection includes the same SEO group: meta title, meta
description, OG image, canonical URL override, and a `noindex` toggle.

Alt text on Media is a required field. Accessibility and image search both
depend on it, and an optional alt field never gets filled in.

### Drafts and preview

Draft/publish is enabled on Programs, Posts, Events and Pages. Staff can write
and preview the real rendered page before it goes public.

## SEO

Built into the foundation rather than added afterward.

- **Metadata API** per route, resolving page → global → default so a page is
  never missing a title or description.
- **JSON-LD structured data:** `NGO`/`Organization` sitewide, `Article` on
  posts, `Event` on events, `BreadcrumbList` on nested routes, `FAQPage` where
  relevant. Article and Event schema are what earn rich results in Google.
- **Dynamic `sitemap.xml`** generated from published content; `robots.ts`
  alongside it.
- **`opengraph-image.tsx`** generating social cards at the edge.
- **Core Web Vitals:** `next/image` with AVIF/WebP, `next/font` self-hosted to
  avoid a render-blocking font request, React Server Components by default to
  keep the client bundle small.
- **Clean URL taxonomy** as tabled above, with the Redirects collection so an
  editor can fix a changed slug without a developer.
- **Local signals:** `NGO` schema carrying a real Nigerian address, a linked
  Google Business Profile, and program pages naming their actual locations.

## Pages

Home, About (mission, team, partners), Programs index and detail, Blog index,
category and post, Events index and detail, Gallery, Impact/Reports, Contact,
Donate, Privacy, Terms.

## Donate — Phase 1

A fully designed donation page: suggested amounts in naira, impact framing
("₦10,000 feeds a family for a week"), and trust signals. The call to action
links out to a **hosted Paystack payment page**.

Paystack covers NGN cards, bank transfer and USSD for local donors, and
international cards for diaspora donors. Phase 1 writes no payment code, holds
no card data and exposes no PCI surface.

Phase 2 replaces the outbound link with an on-site flow.

## Forms

Contact and volunteer forms submit through a Next.js server action with Zod
schema validation and a honeypot field for spam. Each submission is written to
the `Submissions` collection first, then emailed via Resend's free tier. Writing
to the database first means a mail delivery failure never loses an enquiry.

## Error handling

- `not-found.tsx` and `error.tsx` boundaries per route segment.
- A failed CMS read falls back to cached content rather than erroring the page.
- Form failures return field-level messages and preserve what the user typed.

## Testing

- **Vitest** — utilities, SEO metadata resolution, structured-data generators.
- **Playwright** — critical paths: page renders, form submission, donate CTA,
  admin login.
- **Lighthouse CI** in the pipeline, failing the build on performance or SEO
  regressions.

## Phasing

**Phase 1 (this spec):** full site, all content types, complete SEO foundation,
forms, donate page linking out to Paystack.

**Phase 2:** integrated Paystack checkout, recurring giving, webhook-verified
donation records, emailed receipts.

**Phase 3:** program applications, volunteer intake, event registration,
newsletter.

## Out of scope

Multi-language content, a donor login portal, and an events ticketing system.
None are needed to meet the Phase 1 goals.
