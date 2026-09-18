# Helping Hive Initiative — Website Design Spec

**Date:** 2026-09-18
**Status:** Approved

## Purpose

A public website for Helping Hive Initiative, a Nigeria-based NGO. The site must
establish credibility with grantmakers, partners and press; rank in organic
search; and let non-technical staff publish content without a developer.

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

A single Next.js 15 App Router application with Payload CMS 3 mounted inside it.

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

**Stack:** Next.js 15, Payload 3, PostgreSQL (Neon free tier), Cloudflare R2 for
media, Tailwind CSS, TypeScript.

### Hosting

The CMS is free; hosting is not entirely. Vercel's Hobby tier prohibits
commercial use, which a donation-accepting site arguably triggers. Options, in
order of preference:

1. Apply to the Vercel and DigitalOcean nonprofit credit programs.
2. Railway or Render at roughly $5/month, database included, fully compliant.
3. Vercel Hobby + Neon + R2 at zero cost, accepting the terms-of-service grey area.

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
