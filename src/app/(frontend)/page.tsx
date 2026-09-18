import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { CountUp } from '@/components/home/CountUp'
import { Reveal } from '@/components/Reveal'
import { DonatePanel } from '@/components/home/DonatePanel'
import type { Media, Program } from '@/payload-types'

const isMedia = (v: unknown): v is Media => typeof v === 'object' && v !== null && 'url' in v
const isProgram = (v: unknown): v is Program => typeof v === 'object' && v !== null && 'slug' in v

/**
 * Targets the organisation has set for 2025–2030. These are goals, not results,
 * and the section says so plainly — HHHI has no achieved figures to report yet,
 * and presenting aspirations as achievements would be a lie told in numerals.
 */
const TARGETS = [
  { value: 10, label: 'states reached with medical and mental health outreach' },
  { value: 2, label: 'safe haven shelters for women and children, by 2028' },
  { value: 1000, label: 'women and youth trained and mentored' },
]

/** Six things that have actually happened, in order. */
const MILESTONES = [
  {
    year: '2024',
    title: 'Christmas Charity Outreach',
    body: 'Reached two orphanages with psychological support, financial support, gifts and love.',
  },
  {
    year: '2025',
    title: 'Back-to-School Project',
    body: 'Partnered with other youth-led NGOs to support children with educational materials and motivation.',
  },
  {
    year: '2025',
    title: 'Held and Healed Momcation, with SMAP',
    body: 'A two-day retreat for mothers facing postpartum depression, stress disorders and emotional fatigue — clinical psychological therapy, career sessions, exercise therapy and holistic care.',
  },
  {
    year: '2025',
    title: 'Registered as Haven Healing Hands Initiative',
    body: 'Officially approved and registered.',
  },
  {
    year: '2025',
    title: 'The Mental Health Arm launched',
    body: 'Opened on World Mental Health Day.',
  },
]

const WAYS_TO_HELP = [
  ['Fund a programme', 'Grants, sponsorships and one-off gifts supporting outreaches and the safe haven shelters.'],
  ['Volunteer your profession', 'Medical, mental health, education and logistics.'],
  ['Partner with us', 'Local and international NGOs, corporate sponsors, churches and ministries.'],
]

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [home, settings, programsResult] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', depth: 1 }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.find({ collection: 'programs', limit: 8, sort: 'createdAt' }),
  ])

  const heroImage = isMedia(home.heroImage) ? home.heroImage : null
  const systems = programsResult.docs.filter(isProgram)
  const donateUrl = settings.paystackUrl || '/donate'
  const headlineLines = home.headline.split('.').filter(Boolean)

  return (
    <>
      {/* Hero. A photograph belongs in the left panel; until one is uploaded it
          falls back to the arch from the logo rather than an empty frame. The
          giving panel sits in the hero deliberately — the decision to give is
          made here, not two clicks away. */}
      <section className="relative bg-teal-950 text-paper-50">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.25rem)]">
              {headlineLines.map((line, i) => (
                <span
                  key={line}
                  className="rise block"
                  style={{ animationDelay: `${0.12 + i * 0.12}s` }}
                >
                  {line.trim()}.
                </span>
              ))}
            </h1>

            <p
              className="rise mt-7 max-w-lg text-lg leading-relaxed text-teal-100"
              style={{ animationDelay: '0.55s' }}
            >
              {home.subtext}
            </p>

            <div className="rise mt-9 flex flex-wrap items-center gap-6" style={{ animationDelay: '0.7s' }}>
              <Link
                href="/programs"
                className="rounded-full px-6 py-3 font-semibold ring-1 ring-teal-400/50 transition-colors hover:bg-teal-900"
              >
                See our work
              </Link>
              <Link href="/get-involved" className="font-semibold text-brass-300 underline-offset-4 hover:underline">
                Other ways to help
              </Link>
            </div>

            <dl className="rise mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-teal-800 pt-7" style={{ animationDelay: '0.85s' }}>
              {[
                ['4', 'systems of care'],
                ['2025', 'registered'],
                [settings.address?.city ?? 'Nigeria', 'where we work'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-brass-400">{value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-teal-300">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rise" style={{ animationDelay: '0.35s' }}>
            {heroImage?.url ? (
              <div className="arch relative aspect-[4/5] overflow-hidden">
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt ?? ''}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className={heroImage?.url ? '-mt-16 px-4' : ''}>
              <DonatePanel paystackUrl={settings.paystackUrl} />
            </div>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <section className="border-b border-paper-200 bg-paper-100">
        <Container size="prose" className="py-20 sm:py-24">
          <Reveal as="h2" className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink-900">
            {home.missionHeading ?? 'Our mission'}
          </Reveal>
          <Reveal as="p" delay={90} className="mt-7 text-lg leading-[1.75] text-ink-700">
            To build safe havens where broken hearts are mended, minds are renewed, and lives are
            transformed through compassion, healthcare, education, and faith-driven programs.
          </Reveal>
          <Reveal as="p" delay={180} className="mt-5 text-lg leading-[1.75] text-ink-700">
            We are deeply committed to establishing God&rsquo;s kingdom on earth by spreading love,
            hope, and wholeness to those in need — physically, emotionally, mentally, and
            spiritually.
          </Reveal>
        </Container>
      </section>

      {/* Four systems, as a colonnade */}
      {systems.length > 0 ? (
        <section className="py-20 sm:py-28">
          <Container>
            <Reveal className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-ink-900">
                Four systems, one haven
              </h2>
              <p className="mt-5 text-ink-500">
                Each addresses a different dimension of healing. Together they are how the work is
                organised.
              </p>
            </Reveal>

            <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {systems.map((system, i) => (
                <Reveal as="li" key={system.id} delay={i * 110}>
                  <Link href={`/programs/${system.slug}`} className="group block">
                    <div className="arch relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-teal-600 to-teal-900 transition-transform duration-500 group-hover:-translate-y-1.5">
                      <div className="absolute inset-0 flex items-end p-6">
                        <h3 className="font-display text-[1.35rem] leading-[1.15] text-paper-50">
                          {system.title}
                        </h3>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-0 bg-brass-400/90 transition-all duration-500 group-hover:h-1.5" />
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-ink-500">{system.summary}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Targets to 2030 */}
      <section className="bg-teal-950 py-20 text-paper-50 sm:py-24">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)]">
              What we are building toward
            </h2>
            <p className="mt-5 text-teal-200">
              Our targets for 2025 to 2030. These are goals we have set ourselves, not results we
              have reached.
            </p>
          </Reveal>

          <dl className="mt-14 grid gap-12 sm:grid-cols-3">
            {TARGETS.map((target, i) => (
              <Reveal key={target.label} delay={i * 120} className="border-t border-teal-800 pt-6">
                <dt className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-none text-brass-400">
                  <CountUp to={target.value} />
                </dt>
                <dd className="mt-4 text-sm leading-relaxed text-teal-200">{target.label}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Milestones — a real sequence, so it is set as one */}
      <section className="py-20 sm:py-28">
        <Container>
          <Reveal as="h2" className="max-w-2xl font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-ink-900">
            What we have done so far
          </Reveal>

          <ol className="mt-14 max-w-3xl">
            {MILESTONES.map((milestone, i) => (
              <Reveal
                as="li"
                key={milestone.title}
                delay={i * 80}
                className="grid gap-4 border-t border-paper-200 py-8 sm:grid-cols-[5rem_1fr] sm:gap-8"
              >
                <p className="font-display text-xl text-brass-600">{milestone.year}</p>
                <div>
                  <h3 className="font-display text-xl text-ink-900">{milestone.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-ink-500">{milestone.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <p className="mt-8 max-w-3xl border-t border-paper-200 pt-8 text-ink-500">
            Alongside these, an active volunteer network and a growing social media presence for
            awareness and impact storytelling.
          </p>
        </Container>
      </section>

      {/* Give */}
      <section className="bg-paper-100 py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-ink-900">
              Help build the haven
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-700">
              Every gift goes toward outreaches, community programmes and the shelters we are
              working to open by 2028.
            </p>
            <Link
              href={donateUrl}
              className="mt-9 inline-block rounded-full bg-teal-500 px-8 py-4 font-semibold text-paper-50 transition-all hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/25"
            >
              Donate
            </Link>
            {!settings.paystackUrl ? (
              <p className="mt-4 text-sm text-ink-400">
                Online giving opens once the payment link is added in the CMS.
              </p>
            ) : null}
          </div>

          <ul className="space-y-8">
            {WAYS_TO_HELP.map(([title, description]) => (
              <li key={title} className="border-t border-paper-200 pt-6">
                <h3 className="font-display text-xl text-ink-900">{title}</h3>
                <p className="mt-2 leading-relaxed text-ink-500">{description}</p>
              </li>
            ))}
            <li>
              <Link
                href="/get-involved"
                className="font-semibold text-teal-600 underline-offset-4 hover:underline"
              >
                All five ways to get involved
              </Link>
            </li>
          </ul>
        </Container>
      </section>
    </>
  )
}
