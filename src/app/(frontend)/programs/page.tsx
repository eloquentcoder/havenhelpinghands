import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from '@/components/Reveal'
import type { Program } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Our work',
  description:
    'The four systems Haven Healing Hands Initiative works through — healing, shelter, empowerment, and men’s mental health — and the outreaches we have completed.',
}

const year = (value?: string | null) =>
  value ? new Date(value).getFullYear().toString() : null

function ProgramCard({ program, index }: { program: Program; index: number }) {
  return (
    <Reveal as="li" delay={index * 90}>
      <Link href={`/programs/${program.slug}`} className="group block">
        {/* overflow-hidden must sit on the same element as .arch, or the
            image's square corners escape the curve. */}
        <div className="arch relative aspect-[3/4] overflow-hidden bg-teal-700 transition-transform duration-500 group-hover:-translate-y-1.5">
          <MediaImage
            media={program.heroImage}
            variant="card"
            fill
            alt=""
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            fallbackClassName="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/85 via-teal-950/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {program.status === 'completed' && year(program.completedAt) ? (
              <p className="font-display text-sm text-brass-300">{year(program.completedAt)}</p>
            ) : null}
            <h3 className="mt-1 font-display text-[1.35rem] leading-[1.15] text-paper-50">
              {program.title}
            </h3>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0 bg-brass-400/90 transition-all duration-500 group-hover:h-1.5" />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-ink-500">{program.summary}</p>
      </Link>
    </Reveal>
  )
}

export default async function ProgramsPage() {
  const payload = await getPayloadClient()
  const [{ docs }, headers] = await Promise.all([
    payload.find({
      collection: 'programs',
      limit: 50,
      depth: 1,
      sort: 'createdAt',
      where: publishedOnly,
    }),
    payload.findGlobal({ slug: 'page-headers', depth: 1 }),
  ])

  const systems = docs.filter((d) => d.status === 'ongoing')
  // Most recent first. completedAt exists precisely so this is not seed order.
  const completed = docs
    .filter((d) => d.status === 'completed')
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  return (
    <>
      <PageHeader
        header={headers.programs}
        headline="Our work"
        standfirst="Four systems, each addressing a different dimension of human healing and growth — and the outreaches we have already carried out."
      />

      {systems.length > 0 ? (
        <section id="systems" className="py-16 sm:py-20">
          <Container>
            <Reveal className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink-900">
                Four systems, one haven
              </h2>
              <p className="mt-4 text-ink-500">
                Together they are how the work is organised.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {systems.map((program, i) => (
                <ProgramCard key={program.id} program={program} index={i} />
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section id="completed" className="border-t border-paper-200 bg-paper-100 py-16 sm:py-20">
          <Container>
            <Reveal className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink-900">
                What we have done
              </h2>
              <p className="mt-4 text-ink-500">
                Outreaches that have already happened. Each one has its own page.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((program, i) => (
                <ProgramCard key={program.id} program={program} index={i} />
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  )
}
