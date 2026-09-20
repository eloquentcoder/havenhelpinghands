import Link from 'next/link'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { CountUp } from '@/components/home/CountUp'
import { Reveal } from '@/components/Reveal'
import { DonatePanel } from '@/components/home/DonatePanel'
import { MediaImage } from '@/components/media/MediaImage'
import type { Program } from '@/payload-types'

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

const WAYS_TO_HELP = [
  ['Fund a programme', 'Grants, sponsorships and one-off gifts supporting outreaches and the safe haven shelters.'],
  ['Volunteer your profession', 'Medical, mental health, education and logistics.'],
  ['Partner with us', 'Local and international NGOs, corporate sponsors, churches and ministries.'],
]

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [home, settings, programsResult, completedResult] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', depth: 1 }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.find({
      collection: 'programs',
      limit: 8,
      sort: 'createdAt',
      // Ongoing only. This result feeds both the "Four systems" colonnade and
      // the "Systems of care" figure in the brass panel, so an unfiltered
      // query would publish a false count the moment a completed programme
      // exists.
      where: { and: [publishedOnly, { status: { equals: 'ongoing' } }] },
    }),
    payload.find({
      collection: 'programs',
      limit: 6,
      depth: 1,
      sort: '-completedAt',
      where: { and: [publishedOnly, { status: { equals: 'completed' } }] },
    }),
  ])

  const systems = programsResult.docs.filter(isProgram)
  const completed = completedResult.docs.filter(isProgram)
  const donateUrl = settings.paystackUrl || '/donate'
  const headlineLines = home.headline.split('.').filter(Boolean)

  return (
    <>
      {/* Hero: a hard split. The left half belongs to a photograph of the
          people served — until one is uploaded it holds the arch from the logo
          rather than an empty frame. The right half is the giving block, so the
          decision to give is made on the first screen. */}
      <section className="grid lg:min-h-[calc(100svh-68px)] lg:grid-cols-2">
        <div className="relative flex min-h-[26rem] flex-col justify-end overflow-hidden bg-teal-600 p-8 text-paper-50 sm:p-12 lg:p-14">
          {/* No grayscale. It was chosen for a photograph; the stand-in here is
              brand artwork, and desaturating it removes the only thing it is
              made of. Worth revisiting if a real photograph ever lands. */}
          <MediaImage
            media={home.heroImage}
            alt=""
            fill
            preload
            variant="hero"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            fallbackClassName="arch arch-open absolute top-1/2 left-1/2 h-[80%] w-[70%] -translate-x-1/2 -translate-y-[55%]"
          />
          {/* Weighted to the bottom, where the headline and standfirst sit. The
              top is left nearly clear so the picture is actually visible —
              an even scrim just turns the panel into a dark rectangle. */}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-800/95 via-teal-800/55 to-teal-800/5" />

          <div className="relative">
            <h1 className="font-display text-[clamp(2.5rem,4.6vw,4rem)]">
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
              className="rise mt-6 max-w-md leading-relaxed text-teal-100"
              style={{ animationDelay: '0.5s' }}
            >
              {home.subtext}
            </p>

            <Link
              href="/programs"
              className="rise group mt-8 inline-flex items-center gap-3 font-semibold text-paper-50"
              style={{ animationDelay: '0.65s' }}
            >
              See our work
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              >
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-brass-400 p-8 text-teal-950 sm:p-12 lg:p-14">
          <p className="text-sm font-semibold">Give today</p>

          <h2 className="mt-8 max-w-md font-display text-[clamp(1.9rem,2.9vw,2.6rem)] leading-[1.1]">
            Support healing, shelter and empowerment
          </h2>

          <p className="mt-5 max-w-md leading-relaxed text-teal-950/80">
            Your gift funds outreaches, community programmes and the safe haven shelters we are
            working to open.
          </p>

          <div className="mt-9">
            <DonatePanel paystackUrl={settings.paystackUrl} />
          </div>

          {/* Facts, not fundraising totals. HHHI has no campaign figures to
              report, and inventing a goal or a raised amount would be a lie. */}
          <dl className="mt-10 grid gap-px overflow-hidden rounded-xl bg-teal-950/15 sm:grid-cols-3">
            {[
              ['Registered', '2025'],
              ['Based in', settings.address?.city ?? 'Nigeria'],
              ['Systems of care', String(systems.length || 4)],
            ].map(([label, value]) => (
              <div key={label} className="bg-brass-400 px-5 py-4">
                <dt className="text-xs text-teal-950/80">{label}</dt>
                <dd className="mt-0.5 font-display text-xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
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
                    <div className="arch relative aspect-[3/4] overflow-hidden bg-teal-700 transition-transform duration-500 group-hover:-translate-y-1.5">
                      <MediaImage
                        media={system.heroImage}
                        alt=""
                        variant="card"
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                        fallbackClassName="absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-teal-950/85 via-teal-950/35 to-transparent" />
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
      <section className="bg-teal-600 py-20 text-paper-50 sm:py-24">
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
              <Reveal key={target.label} delay={i * 120} className="border-t border-teal-300 pt-6">
                <dt className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-none text-brass-300">
                  <CountUp to={target.value} />
                </dt>
                <dd className="mt-4 text-sm leading-relaxed text-teal-200">{target.label}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* What we have done. These are CMS records now, not a hardcoded list,
          so each one is a page a visitor can open — and the owner can add the
          next outreach without a deploy.

          The three organisational milestones from the source document — the
          registration, the Mental Health Arm launch and the volunteer network
          — stay as the closing paragraph rather than becoming programmes. A
          registration certificate with its own "Support this work" button
          would be absurd. */}
      {completed.length > 0 ? (
        <section className="py-20 sm:py-28">
          <Container>
            <Reveal className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-ink-900">
                What we have done so far
              </h2>
              <p className="mt-5 text-ink-500">
                Outreaches that have already happened. Open any one to read more.
              </p>
            </Reveal>

            <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((programme, i) => (
                <Reveal as="li" key={programme.id} delay={i * 90}>
                  <Link href={`/programs/${programme.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-teal-700">
                      <MediaImage
                        media={programme.heroImage}
                        alt=""
                        variant="card"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        fallbackClassName="absolute inset-0"
                      />
                    </div>
                    {programme.completedAt ? (
                      <p className="mt-5 font-display text-sm text-brass-600">
                        {new Date(programme.completedAt).getFullYear()}
                      </p>
                    ) : null}
                    <h3 className="mt-1 font-display text-xl text-ink-900 group-hover:underline">
                      {programme.title}
                    </h3>
                    <p className="mt-2.5 leading-relaxed text-ink-500">{programme.summary}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>

            <p className="mt-12 max-w-3xl border-t border-paper-200 pt-8 text-ink-500">
              Alongside these: officially approved and registered as Haven Healing Hands Initiative
              in 2025, the Mental Health Arm launched on World Mental Health Day 2025, and an active
              volunteer network and growing social media presence for awareness and impact
              storytelling.
            </p>
          </Container>
        </section>
      ) : null}

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
              <p className="mt-4 text-sm text-ink-500">
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
