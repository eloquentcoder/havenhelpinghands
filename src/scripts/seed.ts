import { getPayload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/lib/slug'

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

  const programIds: number[] = []
  for (const system of SYSTEMS) {
    const doc = await payload.create({
      collection: 'programs',
      draft: false,
      data: {
        title: system.title,
        slug: slugify(system.title),
        summary: system.summary,
        status: 'ongoing',
        body: richText([system.summary, 'Our goals for 2025–2030:', { bullets: system.goals }]),
        _status: 'published',
      },
    })
    programIds.push(doc.id)
  }

  const page = async (title: string, standfirst: string, blocks: Array<string | { bullets: string[] }>) =>
    payload.create({
      collection: 'pages',
      draft: false,
      data: {
        title,
        slug: slugify(title),
        layout: [
          { blockType: 'hero', headline: title, subtext: standfirst },
          { blockType: 'richText', content: richText(blocks) },
        ],
        _status: 'published',
      },
    })

  await page('About Us', 'Restoring Hope. Rebuilding Lives. Reaching Nations.', ABOUT_PARAGRAPHS)

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
      featuredPrograms: programIds.slice(0, 3),
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
        { label: 'Get involved', url: '/get-involved' },
        { label: 'Contact', url: '/contact' },
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
      ],
      copyright: `© ${new Date().getFullYear()} Haven Healing Hands Initiative. All rights reserved.`,
    },
  })

  payload.logger.info(`seeded ${SYSTEMS.length} programmes, 4 pages, 1 team member`)
  payload.logger.info(`founder id ${founder.id}; partners, posts and events intentionally empty`)
  payload.logger.info('seed complete')
  process.exit(0)
} catch (error) {
  payload.logger.error(error)
  process.exit(1)
}
