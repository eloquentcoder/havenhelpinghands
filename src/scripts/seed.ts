import { getPayload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'
import {
  PLACEHOLDER_PREFIX,
  placeholderAlt,
  renderPlaceholderPng,
} from '@/lib/placeholderArt'

/**
 * Seeds the real content supplied by the owner, transcribed in
 * docs/content/hhhi-source-content.md. That file is authoritative.
 *
 * Nothing here is invented. Where the owner has not supplied something — a
 * registration number, a phone number, photographs, team members beyond the
 * founder, named partners — the field is left empty rather than filled with
 * plausible-looking filler. HHHI is a real registered organisation, so
 * placeholder copy here reads as a factual claim about it.
 *
 * Consequently `partners`, `posts`, `events` and `categories` seed empty.
 *
 * Photographs are the one exception, and only because they are not
 * photographs: `src/lib/placeholderArt.ts` generates abstract arch artwork
 * from the brand's own geometry. A stock or generated *photo* on this site
 * would read as a picture of someone HHHI actually helped, which would be a
 * false claim about a real charity. A drawing of an arch claims nothing.
 *
 * DESTRUCTIVE. This deletes every program, page, team member, partner,
 * category, post and event before rewriting them, and deletes the media it
 * generated previously. Once an editor has replaced a placeholder or reworded
 * a page in the admin, running this throws that work away. Before the site
 * goes live, put a confirmation guard in front of it.
 */

const textNode = (text: string) => ({
  type: 'text',
  text,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (text: string) => ({
  type: 'paragraph',
  format: '' as const,
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [textNode(text)],
})

const bulletList = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  format: '' as const,
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: items.map((text, i) => ({
    type: 'listitem',
    value: i + 1,
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [textNode(text)],
  })),
})

const richText = (blocks: Array<string | { bullets: string[] }>) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: blocks.map((b) => (typeof b === 'string' ? paragraph(b) : bulletList(b.bullets))),
  },
})

/** The four systems HHHI operates through. */
const SYSTEMS = [
  {
    title: 'The Healing System',
    summary:
      'Medical, emotional, and spiritual restoration through healthcare missions, community wellness, and counseling programs.',
    goals: [
      'Establish community medical and mental health outreach programs across 10 states in Nigeria.',
      'Build partnerships with hospitals, physiotherapists, and mental health professionals.',
    ],
  },
  {
    title: 'The Shelter System',
    summary:
      'Providing refuge, rehabilitation, and safe housing for widows, women, and children in crisis.',
    goals: [
      'Develop at least 2 safe haven shelters for women and children by 2028.',
      'Take at least 3 homeless families or individuals off the street by 2030.',
      'Build, support or rent out homes for underserved and less financially privileged families.',
      'Provide psychosocial support and rehabilitation programs for victims of abuse and homelessness.',
    ],
  },
  {
    title: 'The Empowerment System',
    summary:
      'Mentorship, skill development, and educational empowerment for sustainable transformation.',
    goals: [
      'Train and mentor 1,000 women and youth in entrepreneurship, digital skills, and personal growth.',
      'Establish scholarship and mentorship programs for disadvantaged children.',
    ],
  },
  {
    // "MENtal" is a deliberate wordplay on MEN. Do not normalise the capitalisation.
    title: 'The MENtal Rehab',
    summary:
      'A special arm dedicated to men struggling with trauma, addiction, and emotional challenges, helping them find healing, strength, and purpose.',
    goals: [
      'Create men’s support circles and recovery programs to address addiction, trauma, and emotional health.',
      'Hold safe spaces for rehabilitation support for emotionally downtrodden people.',
      'Partner with churches and mental health organizations to promote safe conversations for men.',
    ],
  },
]

const MILESTONES = [
  'Successfully hosted the Christmas Charity Outreach 2024, reaching two orphanages with psychological support, financial support, gifts, and love.',
  'Partnered with other youth-led NGOs for the Back-to-School Project 2025, supporting children with educational materials and motivation.',
  'Partnership with SMAP — Held and Healed Momcation (2025). Collaborated with a wellness support NGO, SMAP, for a transformative two-day retreat program designed for mothers dealing with postpartum depression, stress disorders, and emotional fatigue. The retreat provided clinical psychological therapy, human resource development sessions for career mothers, exercise therapy, relaxation activities, and holistic care including food, shelter, and wellness support.',
  'Officially approved and registered as Haven Healing Hands Initiative (2025).',
  'Launched the Mental Health Arm on World Mental Health Day 2025.',
  'Built an active volunteer network and social media presence for awareness and impact storytelling.',
]

/**
 * The outreaches that have actually happened, from the Traction & Milestones
 * section of docs/content/hhhi-source-content.md.
 *
 * Only the three that are outreaches. The other three entries in that list —
 * the registration, the Mental Health Arm launch and the volunteer network —
 * are organisational milestones, not programmes. Given a /programs/ page each
 * would get a "Support this work" button under it, which makes no sense under
 * a registration certificate. They stay on the homepage timeline.
 *
 * Nothing here is padded out. Where the source gives one sentence, the page is
 * one sentence long.
 */
const OUTREACHES = [
  {
    title: 'Christmas Charity Outreach 2024',
    slug: 'christmas-charity-outreach-2024',
    completedAt: '2024-12-25',
    summary:
      'Reached two orphanages with psychological support, financial support, gifts, and love.',
    body: [
      'Successfully hosted the Christmas Charity Outreach 2024, reaching two orphanages with psychological support, financial support, gifts, and love.',
    ],
    // "two orphanages" is in the source. It is a thing that happened, not a target.
    impactStats: [{ value: '2', label: 'orphanages reached' }],
  },
  {
    title: 'Back-to-School Project 2025',
    slug: 'back-to-school-project-2025',
    completedAt: '2025-09-01',
    summary:
      'Partnered with other youth-led NGOs to support children with educational materials and motivation.',
    body: [
      'Partnered with other youth-led NGOs for the Back-to-School Project 2025, supporting children with educational materials and motivation.',
    ],
    // The source does not say how many children. Do not guess at one.
    impactStats: [],
  },
  {
    title: 'Held and Healed Momcation, with SMAP',
    slug: 'held-and-healed-momcation',
    completedAt: '2025-06-01',
    summary:
      'A two-day retreat with the wellness support NGO SMAP, for mothers dealing with postpartum depression, stress disorders and emotional fatigue.',
    body: [
      'Collaborated with a wellness support NGO, SMAP, for a transformative two-day retreat program designed for mothers dealing with postpartum depression, stress disorders, and emotional fatigue.',
      'The retreat provided clinical psychological therapy, human resource development sessions for career mothers, exercise therapy, relaxation activities, and holistic care including food, shelter, and wellness support.',
    ],
    impactStats: [{ value: '2', label: 'day residential retreat' }],
  },
] as const

/**
 * Generated stand-in artwork, one per document that needs a picture.
 *
 * See src/lib/placeholderArt.ts for why these are graphics and not
 * photographs. The seed keys for programmes are their slugs, so attaching one
 * is a lookup rather than a table.
 */
const PLACEHOLDERS: Array<{ seed: string; subject: string; width: number; height: number }> = [
  ...SYSTEMS.map((s) => ({
    seed: slugify(s.title),
    subject: s.title,
    width: 1920,
    height: 1080,
  })),
  ...OUTREACHES.map((o) => ({
    seed: o.slug,
    subject: `the ${o.title}`,
    width: 1920,
    height: 1080,
  })),
  // 4:3, not 16:9. The homepage hero panel is a tall half-screen box, so a
  // wide source would be centre-cropped to a sliver.
  { seed: 'homepage-hero', subject: 'the people HHHI serves', width: 1920, height: 1440 },
  { seed: 'about-us', subject: 'the organisation at work', width: 1920, height: 1080 },
]

const GET_INVOLVED = [
  ['Fund a programme', 'Grants, sponsorships and one-off gifts supporting outreaches, community development and the safe haven shelters.'],
  ['Volunteer your profession', 'Medical, mental health, education and logistics.'],
  ['Partner with us', 'Local and international NGOs, corporate sponsors, churches and ministries.'],
  ['Tell the story', 'Photographers, writers and filmmakers for impact documentation.'],
  ['Train our team', 'Capacity-building for staff and community leaders.'],
]

const ABOUT_PARAGRAPHS = [
  'Haven Healing Hands Initiative (HHHI) is a faith-based international non-profit dedicated to the healing, restoration, and empowerment of vulnerable women, children, and communities.',
  'Our mission is to build safe havens where broken hearts are mended, minds are renewed, and lives are transformed through compassion, healthcare, education, and faith-driven programs.',
  'We are deeply committed to establishing God’s kingdom on earth by spreading love, hope, and wholeness to those in need — physically, emotionally, mentally, and spiritually.',
]

const payload = await getPayload({ config })

try {
  // Remove anything seeded previously. An earlier seed asserted invented
  // programmes and an invented founder for this real organisation, so clearing
  // is the point rather than a convenience.
  for (const collection of ['posts', 'events', 'pages', 'programs', 'team', 'partners', 'categories'] as const) {
    const { docs } = await payload.find({ collection, limit: 200, depth: 0, draft: true })
    for (const doc of docs) {
      await payload.delete({ collection, id: doc.id })
    }
    if (docs.length) payload.logger.info(`cleared ${docs.length} from ${collection}`)
  }

  // Clear only the media this script generated, matched on the filename
  // prefix. Never "delete all media": storage/media is shared with the
  // integration tests (Media.staticDir is an absolute path with no env
  // branch), and in any real deployment it holds the owner's own uploads.
  //
  // This runs after the documents that referenced these images are gone, so
  // nothing points at a row being deleted. Without it, a second `npm run seed`
  // would leave the old docs behind and Payload would write
  // hhhi-placeholder-about-us-1.png beside the original.
  const { docs: stalePlaceholders } = await payload.find({
    collection: 'media',
    limit: 200,
    depth: 0,
    where: { filename: { like: PLACEHOLDER_PREFIX } },
  })
  for (const doc of stalePlaceholders) {
    await payload.delete({ collection: 'media', id: doc.id })
  }
  if (stalePlaceholders.length) {
    payload.logger.info(`cleared ${stalePlaceholders.length} stale placeholder images`)
  }

  // Sequential on purpose. sharp is CPU-bound and this is one SQLite file;
  // nine parallel writes is how you get SQLITE_BUSY for no gain on a job that
  // takes a couple of seconds.
  const media: Record<string, number> = {}
  for (const placeholder of PLACEHOLDERS) {
    const data = await renderPlaceholderPng(placeholder.seed, placeholder.width, placeholder.height)
    const doc = await payload.create({
      collection: 'media',
      overwriteExistingFiles: true,
      data: { alt: placeholderAlt(placeholder.subject) },
      file: {
        data,
        mimetype: 'image/png',
        name: `${PLACEHOLDER_PREFIX}${placeholder.seed}.png`,
        size: data.byteLength,
      },
    })
    media[placeholder.seed] = doc.id
  }
  payload.logger.info(`generated ${PLACEHOLDERS.length} placeholder images`)

  const founder = await payload.create({
    collection: 'team',
    data: {
      name: 'Dr. Favour Charles',
      role: 'Founder & Executive Director',
      group: 'staff',
      bio: 'Doctor of Physiotherapy, faith-driven leader, and visionary passionate about healing and restoration.',
      order: 0,
    },
  })

  // Named systemIds, not programIds: the homepage's featuredPrograms takes the
  // first three of these, and the outreach loop below also creates programs.
  // One shared array would silently change what the homepage features the day
  // someone reorders the two loops.
  const systemIds: number[] = []
  for (const system of SYSTEMS) {
    const doc = await payload.create({
      collection: 'programs',
      draft: false,
      data: {
        title: system.title,
        slug: slugify(system.title),
        summary: system.summary,
        status: 'ongoing',
        heroImage: media[slugify(system.title)],
        body: richText([system.summary, 'Our goals for 2025–2030:', { bullets: system.goals }]),
        _status: 'published',
      },
    })
    systemIds.push(doc.id)
  }

  // The outreaches, seeded oldest-first. They carry completedAt, so the
  // ordering of this loop is not what the site sorts on.
  for (const outreach of OUTREACHES) {
    await payload.create({
      collection: 'programs',
      draft: false,
      data: {
        title: outreach.title,
        slug: outreach.slug,
        summary: outreach.summary,
        status: 'completed',
        completedAt: outreach.completedAt,
        heroImage: media[outreach.slug],
        body: richText([...outreach.body]),
        impactStats: outreach.impactStats.map((stat) => ({ ...stat })),
        _status: 'published',
      },
    })
  }

  const page = async (
    title: string,
    standfirst: string,
    blocks: Array<string | { bullets: string[] }>,
    extra: Record<string, unknown>[] = [],
  ) =>
    payload.create({
      collection: 'pages',
      draft: false,
      data: {
        title,
        slug: slugify(title),
        layout: [
          { blockType: 'hero', headline: title, subtext: standfirst },
          { blockType: 'richText', content: richText(blocks) },
          ...extra,
        ] as never,
        _status: 'published',
      },
    })

  await page('About Us', 'Restoring Hope. Rebuilding Lives. Reaching Nations.', ABOUT_PARAGRAPHS, [
    { blockType: 'image', image: media['about-us'], width: 'wide', aspect: '21/9' },
    {
      blockType: 'team',
      heading: 'Who we are',
      group: 'all',
      showBio: true,
      // One real person. The source document's "(You can add 2-3 more names)"
      // is an unfilled placeholder in the owner's own template, not people.
      intro: undefined,
    },
  ])

  await page('Strategy', 'Our goals and objectives, 2025 to 2030.', [
    'HHHI operates through four integrated systems, each addressing a unique dimension of human healing and growth. These are the objectives we have set against them for 2025 to 2030.',
    ...SYSTEMS.flatMap((s) => [s.title, { bullets: s.goals }]),
    'Global partnerships and advocacy',
    {
      bullets: [
        'Collaborate with UN Women, WHO, and faith-based global bodies to advance gender equality, mental wellness, and community healing.',
        'Launch an annual international conference on Healing, Hope & Restoration.',
      ],
    },
  ])

  await page('Impact', 'What we have done so far.', [
    'Haven Healing Hands Initiative was registered in 2025. These are the outreaches and milestones behind that.',
    { bullets: MILESTONES },
  ])

  await page('Get Involved', 'Five ways to join the work.', [
    ...GET_INVOLVED.flatMap(([heading, body]) => [heading, body]),
    'We work alongside local NGOs and faith-based organizations, churches and ministries, community health centres, and private sponsors and business supporters.',
  ])

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      organisationName: 'Haven Healing Hands Initiative',
      tagline: 'Restoring Hope. Rebuilding Lives. Reaching Nations',
      description:
        'A faith-based non-profit in Abuja, Nigeria, dedicated to the healing, restoration and empowerment of vulnerable women, children and communities.',
      email: 'hhhinitiative@gmail.com',
      // Explicitly blanked, not omitted. updateGlobal merges, so any field left
      // out keeps whatever was there before — which is how an invented CAC
      // number and street address survived the content re-alignment and went on
      // rendering as trust signals. The owner has not supplied these.
      registrationNumber: '',
      phone: '',
      // The owner has not supplied a Paystack link. An earlier seed invented
      // one, and because updateGlobal merges, it survived the content
      // re-alignment and the Donate button went on pointing at it.
      paystackUrl: '',
      address: { street: '', city: 'Abuja', state: '', country: 'Nigeria' },
      socials: [{ platform: 'instagram', url: 'https://instagram.com/the_healinghands_initiative' }],
    },
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      headline: 'Restoring Hope. Rebuilding Lives. Reaching Nations.',
      subtext: ABOUT_PARAGRAPHS[0],
      primaryCtaLabel: 'Get involved',
      primaryCtaUrl: '/get-involved',
      secondaryCtaLabel: 'Our work',
      secondaryCtaUrl: '/programs',
      missionHeading: 'Our mission',
      missionBody: richText(ABOUT_PARAGRAPHS.slice(1)),
      // No impact statistics: the owner has supplied goals for 2025–2030, not
      // achieved numbers. Presenting aspirations as results would be false.
      impactStats: [],
      heroImage: media['homepage-hero'],
      featuredPrograms: systemIds.slice(0, 3),
    },
  })

  // Prefilled with the wording the pages already use, so an editor opening
  // this sees the real text to edit rather than three empty boxes. Clearing a
  // field falls back to the same string, which lives in the page component.
  await payload.updateGlobal({
    slug: 'page-headers',
    data: {
      programs: {
        headline: 'Our work',
        standfirst:
          'Four systems, each addressing a different dimension of human healing and growth — and the outreaches we have already carried out.',
      },
      blog: {
        headline: 'Blog & news',
        standfirst: 'Stories from the work, and news as it happens.',
      },
      events: {
        headline: 'Events',
        standfirst:
          'Retreats, outreaches and gatherings — the ones coming up, and the ones already held.',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      items: [
        { label: 'About', url: '/about-us' },
        { label: 'Our work', url: '/programs' },
        { label: 'Strategy', url: '/strategy' },
        { label: 'Impact', url: '/impact' },
        { label: 'Events', url: '/events' },
        { label: 'Blog', url: '/blog' },
        { label: 'Get involved', url: '/get-involved' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      blurb:
        'A faith-based non-profit building safe havens where broken hearts are mended, minds are renewed, and lives are transformed.',
      columns: [
        {
          heading: 'Our work',
          links: SYSTEMS.map((s) => ({ label: s.title, url: `/programs/${slugify(s.title)}` })),
        },
        {
          heading: 'Organisation',
          links: [
            { label: 'About us', url: '/about-us' },
            { label: 'Strategy', url: '/strategy' },
            { label: 'Impact', url: '/impact' },
            { label: 'Get involved', url: '/get-involved' },
          ],
        },
        {
          heading: 'Latest',
          links: [
            { label: 'Blog & news', url: '/blog' },
            { label: 'Events', url: '/events' },
            { label: 'What we have done', url: '/programs#completed' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Haven Healing Hands Initiative. All rights reserved.`,
    },
  })

  payload.logger.info(
    `seeded ${SYSTEMS.length} systems + ${OUTREACHES.length} completed outreaches, 4 pages, 1 team member`,
  )
  payload.logger.info(`generated ${PLACEHOLDERS.length} placeholder images (${PLACEHOLDER_PREFIX}*)`)
  payload.logger.info(`founder id ${founder.id}; partners, posts and events intentionally empty`)
  payload.logger.info('seed complete')
  process.exit(0)
} catch (error) {
  payload.logger.error(error)
  process.exit(1)
}
