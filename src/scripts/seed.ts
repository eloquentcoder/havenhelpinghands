import { getPayload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'

/**
 * Seeds the development database with plausible example content so the
 * public site built in Plan 2 has something realistic to render.
 *
 * Idempotent: it checks for a sentinel document (a program with a known
 * slug) before doing anything else, and exits immediately if seeding has
 * already happened. Safe to run repeatedly.
 *
 * Deliberately does NOT seed images (heroImage/coverImage/photo/logo are
 * left empty) except for Partners, where `logo` is a required field — see
 * the note above `seedPartners` for why a real upload is used there instead
 * of weakening the collection.
 *
 * Deliberately does NOT create any user account; the project owner creates
 * their own through the admin UI.
 */

const SENTINEL_TITLE = 'Clean Water & Boreholes for Ikorodu Communities'
const SENTINEL_SLUG = slugify(SENTINEL_TITLE)

const richText = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [
          { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
      },
    ],
  },
})

async function main() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'programs',
    overrideAccess: true,
    where: { slug: { equals: SENTINEL_SLUG } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    payload.logger.info('Seed sentinel found (programs/' + SENTINEL_SLUG + ') — already seeded, exiting.')
    return
  }

  payload.logger.info('No seed sentinel found — seeding example content.')

  // ---------------------------------------------------------------------
  // Team
  // ---------------------------------------------------------------------
  const executiveDirector = await payload.create({
    collection: 'team',
    data: {
      name: 'Adaeze Chukwu',
      role: 'Executive Director',
      group: 'staff',
      bio: 'Adaeze founded Helping Hive Initiative in 2019 after a decade working in public health across Lagos and Ogun States. She leads strategy, partnerships and fundraising.',
      socials: {
        linkedin: 'https://linkedin.com/in/adaeze-chukwu',
        email: 'adaeze@helpinghiveinitiative.org',
      },
      order: 0,
    },
  })

  const programmesLead = await payload.create({
    collection: 'team',
    data: {
      name: 'Ifeoluwa Bankole',
      role: 'Programmes Lead',
      group: 'staff',
      bio: 'Ifeoluwa designs and runs Helping Hive’s field programmes, from borehole drilling to food distribution days, and coordinates our network of community volunteers.',
      socials: {
        twitter: 'https://twitter.com/ifeoluwab',
        email: 'ifeoluwa@helpinghiveinitiative.org',
      },
      order: 1,
    },
  })

  // ---------------------------------------------------------------------
  // Partners
  //
  // `logo` is required on Partners. Rather than weaken the collection to
  // make seeding easier, a real image (tests/fixtures/sample.png) is
  // uploaded as a media document and reused for both partners' logos.
  // ---------------------------------------------------------------------
  const partnerLogo = await payload.create({
    collection: 'media',
    data: { alt: 'Partner organisation logo placeholder' },
    filePath: 'tests/fixtures/sample.png',
  })

  await payload.create({
    collection: 'partners',
    data: {
      name: 'Lagos State Ministry of Health',
      logo: partnerLogo.id,
      url: 'https://health.lagosstate.gov.ng',
      order: 0,
    },
  })

  await payload.create({
    collection: 'partners',
    data: {
      name: 'Sahel Relief Foundation',
      logo: partnerLogo.id,
      url: 'https://sahelrelief.org',
      order: 1,
    },
  })

  // ---------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------
  const fieldNotesTitle = 'Field notes'
  const fieldNotes = await payload.create({
    collection: 'categories',
    data: {
      title: fieldNotesTitle,
      slug: slugify(fieldNotesTitle),
      description: 'Dispatches from our team and volunteers while a programme is running.',
    },
  })

  const announcementsTitle = 'Announcements'
  const announcements = await payload.create({
    collection: 'categories',
    data: {
      title: announcementsTitle,
      slug: slugify(announcementsTitle),
      description: 'Milestones, new partnerships and organisational news.',
    },
  })

  // ---------------------------------------------------------------------
  // Programs
  // ---------------------------------------------------------------------
  const waterProgram = await payload.create({
    collection: 'programs',
    draft: false,
    data: {
      title: SENTINEL_TITLE,
      slug: SENTINEL_SLUG,
      summary:
        'Drilling and maintaining boreholes in underserved Ikorodu communities so families no longer walk miles for clean drinking water.',
      body: richText(
        'Since 2021, Helping Hive Initiative has worked with local community associations across Ikorodu to identify sites, drill boreholes, and train caretakers to maintain them. Each site is handed over to a community water committee, who report usage and upkeep back to our programmes team every quarter.',
      ),
      location: 'Ikorodu, Lagos State',
      status: 'ongoing',
      impactStats: [
        { value: '12', label: 'boreholes drilled' },
        { value: '8,400', label: 'people with clean water access' },
      ],
      _status: 'published',
    },
  })

  const foodProgramTitle = 'Food Security Outreach in Epe'
  const foodProgram = await payload.create({
    collection: 'programs',
    draft: false,
    data: {
      title: foodProgramTitle,
      slug: slugify(foodProgramTitle),
      summary:
        'Monthly food parcel distribution and support for smallholder farming cooperatives in Epe’s riverine communities.',
      body: richText(
        'Rising transport costs have made staple foods harder to reach for many households in Epe. Our food security outreach combines monthly distribution days with longer-term support for farming cooperatives, so communities build their own supply over time rather than depending solely on aid.',
      ),
      location: 'Epe, Lagos State',
      status: 'ongoing',
      impactStats: [
        { value: '3,200', label: 'households fed monthly' },
        { value: '15', label: 'farming cooperatives supported' },
      ],
      _status: 'published',
    },
  })

  const healthProgramTitle = 'Community Health Outreach in Badagry'
  const healthProgram = await payload.create({
    collection: 'programs',
    draft: false,
    data: {
      title: healthProgramTitle,
      slug: slugify(healthProgramTitle),
      summary:
        'Free health screening clinics and volunteer training delivered across Badagry’s coastal communities over eighteen months.',
      body: richText(
        'Working with the Lagos State Ministry of Health, we ran a series of free screening clinics for hypertension, malaria and maternal health across Badagry, alongside training for community health volunteers who continue to run basic checks after the programme wound down.',
      ),
      location: 'Badagry, Lagos State',
      status: 'completed',
      impactStats: [
        { value: '5,600', label: 'people screened' },
        { value: '40', label: 'health volunteers trained' },
      ],
      _status: 'published',
    },
  })

  // ---------------------------------------------------------------------
  // Posts
  // ---------------------------------------------------------------------
  const waterPostTitle = 'Twelve Boreholes and Counting: Our Water Project Hits a Milestone'
  await payload.create({
    collection: 'posts',
    draft: false,
    data: {
      title: waterPostTitle,
      slug: slugify(waterPostTitle),
      excerpt:
        'Our twelfth borehole went live this month, bringing clean water within reach of over 8,000 people across Ikorodu.',
      body: richText(
        'This month, our field team commissioned the twelfth borehole under the Ikorodu clean water programme, in the Agiliti community. Residents who previously walked up to 40 minutes to the nearest working well now have a source within their own compound cluster. The local water committee has already begun its handover training with our technicians.',
      ),
      author: executiveDirector.id,
      category: announcements.id,
      relatedPrograms: [waterProgram.id],
      publishedAt: '2026-05-12T09:00:00.000Z',
      _status: 'published',
    },
  })

  const foodPostTitle = 'Inside a Food Distribution Day in Epe'
  await payload.create({
    collection: 'posts',
    draft: false,
    data: {
      title: foodPostTitle,
      slug: slugify(foodPostTitle),
      excerpt:
        'A first-hand look at how our volunteers organise a monthly food parcel distribution across Epe’s riverine communities.',
      body: richText(
        'By 7am, volunteers are already sorting parcels of rice, beans and garri into household-sized bags at the Epe community hall. Distribution days like this one now reach over 3,200 households a month, coordinated with local cooperative leaders who help us verify need and avoid duplication.',
      ),
      author: programmesLead.id,
      category: fieldNotes.id,
      relatedPrograms: [foodProgram.id],
      publishedAt: '2026-06-03T10:30:00.000Z',
      _status: 'published',
    },
  })

  const healthPostTitle = 'What We Learned Running Health Outreach Clinics in Badagry'
  await payload.create({
    collection: 'posts',
    draft: false,
    data: {
      title: healthPostTitle,
      slug: slugify(healthPostTitle),
      excerpt:
        'Eighteen months of free screening clinics in Badagry taught us as much about trust as it did about logistics.',
      body: richText(
        'When we closed out the Badagry health outreach programme this year, we sat down with the volunteers who kept it running. The biggest lesson was not about equipment or funding, but about trust: uptake tripled once clinics were introduced by community elders rather than by our own staff arriving unannounced.',
      ),
      author: programmesLead.id,
      category: fieldNotes.id,
      relatedPrograms: [healthProgram.id],
      publishedAt: '2026-08-20T08:00:00.000Z',
      _status: 'published',
    },
  })

  // ---------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------
  const galaTitle = 'Annual Fundraising Gala'
  await payload.create({
    collection: 'events',
    draft: false,
    data: {
      title: galaTitle,
      slug: slugify(galaTitle),
      summary:
        'An evening of dinner, live music and storytelling from the field to raise funds for our 2027 programmes.',
      body: richText(
        'Join us for Helping Hive Initiative’s annual fundraising gala, where we share stories from the past year’s water, food security and health programmes, and raise funds for the year ahead. Tickets include dinner and a fixed-price raffle in support of the Ikorodu water programme.',
      ),
      startsAt: '2026-11-20T18:00:00.000Z',
      endsAt: '2026-11-20T22:00:00.000Z',
      venue: 'Eko Hotel & Suites, Victoria Island, Lagos',
      address: '1415 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria',
      registrationUrl: 'https://helpinghiveinitiative.org/donate',
      _status: 'published',
    },
  })

  const walkTitle = 'World Water Day Community Walk'
  await payload.create({
    collection: 'events',
    draft: false,
    data: {
      title: walkTitle,
      slug: slugify(walkTitle),
      summary:
        'A community walk and awareness drive through Ikorodu to mark World Water Day, ending at our newest borehole site.',
      body: richText(
        'To mark World Water Day, staff, volunteers and residents walked together through Ikorodu, stopping at three existing borehole sites before gathering at the newest one for a short handover ceremony with the community water committee.',
      ),
      startsAt: '2026-03-22T08:00:00.000Z',
      endsAt: '2026-03-22T11:00:00.000Z',
      venue: 'Ikorodu Central Square',
      address: 'Ikorodu Central Square, Ikorodu, Lagos State, Nigeria',
      _status: 'published',
    },
  })

  // ---------------------------------------------------------------------
  // Pages
  // ---------------------------------------------------------------------
  const aboutTitle = 'About Us'
  await payload.create({
    collection: 'pages',
    draft: false,
    data: {
      title: aboutTitle,
      slug: slugify(aboutTitle),
      layout: [
        {
          blockType: 'hero',
          headline: 'We build lasting community infrastructure, not one-off aid',
          subtext:
            'Helping Hive Initiative is a Lagos-based non-profit working on clean water, food security and health access across underserved communities in Nigeria.',
          ctaLabel: 'See our programmes',
          ctaUrl: '/programs',
        },
        {
          blockType: 'richText',
          content: richText(
            'Founded in 2019, Helping Hive Initiative partners with community associations, local government and health authorities to run programmes that communities can sustain themselves once we step back. We currently run active water and food security programmes in Lagos State, and have completed a health outreach programme in Badagry. Every programme is handed over to a local committee, with our team providing ongoing training and support rather than running services indefinitely.',
          ),
        },
      ],
      _status: 'published',
    },
  })

  const privacyTitle = 'Privacy Policy'
  await payload.create({
    collection: 'pages',
    draft: false,
    data: {
      title: privacyTitle,
      slug: slugify(privacyTitle),
      layout: [
        {
          blockType: 'hero',
          headline: 'Privacy Policy',
          subtext: 'How Helping Hive Initiative collects, uses and protects your information.',
        },
        {
          blockType: 'richText',
          content: richText(
            'Helping Hive Initiative collects only the information needed to process donations, respond to enquiries and register volunteers. We never sell or share personal information with third parties for marketing purposes. Donation and payment details are processed by our payment partner, Paystack, and are not stored on our own servers. If you have questions about your data, contact us at privacy@helpinghiveinitiative.org.',
          ),
        },
      ],
      _status: 'published',
    },
  })

  // ---------------------------------------------------------------------
  // Globals
  // ---------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      organisationName: 'Helping Hive Initiative',
      tagline: 'Clean water, food security and health access for underserved Nigerian communities.',
      description:
        'Helping Hive Initiative is a Lagos-based non-profit running clean water, food security and community health programmes across Nigeria.',
      registrationNumber: 'CAC/IT/NO/98213',
      email: 'hello@helpinghiveinitiative.org',
      phone: '+234 803 555 0142',
      address: {
        street: '14 Sanya Adepoju Street',
        city: 'Ikorodu',
        state: 'Lagos State',
        country: 'Nigeria',
      },
      socials: [
        { platform: 'facebook', url: 'https://facebook.com/helpinghiveinitiative' },
        { platform: 'instagram', url: 'https://instagram.com/helpinghiveinitiative' },
      ],
      paystackUrl: 'https://paystack.com/pay/helpinghive-initiative',
    },
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      headline: 'Helping communities build what lasts',
      subtext:
        'We work alongside communities across Lagos State on clean water, food security and health access, so progress outlives any single programme.',
      missionHeading: 'Our mission',
      missionBody: richText(
        'Helping Hive Initiative exists to close the gap between emergency aid and lasting infrastructure. Every programme we run is designed to be handed over to the community that hosts it, so the impact continues long after our team moves on to the next site.',
      ),
      impactStats: [
        { value: '12', label: 'boreholes drilled' },
        { value: '3,200', label: 'households fed monthly' },
        { value: '5,600', label: 'people screened for health' },
      ],
      featuredPrograms: [waterProgram.id, foodProgram.id, healthProgram.id],
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      items: [
        { label: 'Home', url: '/' },
        { label: 'About', url: '/about-us' },
        { label: 'Programs', url: '/programs' },
        { label: 'Blog', url: '/blog' },
        { label: 'Events', url: '/events' },
        { label: 'Contact', url: '/contact' },
        { label: 'Donate', url: '/donate' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      blurb:
        'Helping Hive Initiative is a Lagos-based non-profit working on clean water, food security and health access across underserved communities in Nigeria.',
      columns: [
        {
          heading: 'Organisation',
          links: [
            { label: 'About us', url: '/about-us' },
            { label: 'Programs', url: '/programs' },
            { label: 'Events', url: '/events' },
          ],
        },
        {
          heading: 'Resources',
          links: [
            { label: 'Blog', url: '/blog' },
            { label: 'Privacy Policy', url: '/privacy-policy' },
            { label: 'Contact', url: '/contact' },
          ],
        },
      ],
      copyright: '© 2026 Helping Hive Initiative. All rights reserved.',
    },
  })

  payload.logger.info('Seeding complete.')
}

// `payload run` resolves its dynamic `import()` of this file as soon as the
// module's synchronous body finishes, then immediately calls
// `process.exit(0)` — so a fire-and-forget `main().then(...)` would let the
// process exit before any of `main`'s awaited work (which is all of it) had
// a chance to run. A top-level `await` keeps the import — and therefore the
// process — alive until seeding genuinely finishes.
try {
  await main()
} catch (error) {
  console.error('Seed script failed:', error)
  process.exitCode = 1
}
