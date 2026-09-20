import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from '@/components/Reveal'
import type { Event } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Retreats, outreaches and gatherings from Haven Healing Hands Initiative in Abuja, Nigeria.',
}

/**
 * `new Date()` below is evaluated when the page renders. Without this the page
 * would be built once and the upcoming/past split would freeze at build time,
 * silently listing a finished event as upcoming forever.
 */
export const revalidate = 3600

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

/**
 * Outside the component on purpose: reading the clock during render trips the
 * React Compiler's purity rule. The page sets `revalidate`, so "now" is the
 * time of the last regeneration rather than of the build.
 */
function splitByDate(docs: Event[]) {
  const now = Date.now()
  return {
    upcoming: docs
      .filter((e) => new Date(e.startsAt).getTime() >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    past: docs.filter((e) => new Date(e.startsAt).getTime() < now),
  }
}

function EventCard({ event, index }: { event: Event; index: number }) {
  return (
    <Reveal as="li" key={event.id} delay={index * 80}>
      <Link href={`/events/${event.slug}`} className="group block">
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-teal-700">
          <MediaImage
            media={event.coverImage}
            alt=""
            variant="card"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            fallbackClassName="absolute inset-0"
          />
        </div>
        <p className="mt-5 text-sm text-brass-600">{formatDate(event.startsAt)}</p>
        <h3 className="mt-1 font-display text-xl text-ink-900 group-hover:underline">
          {event.title}
        </h3>
        {event.venue ? <p className="mt-1 text-sm text-ink-500">{event.venue}</p> : null}
        <p className="mt-2.5 leading-relaxed text-ink-500">{event.summary}</p>
      </Link>
    </Reveal>
  )
}

export default async function EventsPage() {
  const payload = await getPayloadClient()
  const [{ docs }, headers] = await Promise.all([
    payload.find({
      collection: 'events',
      limit: 50,
      depth: 1,
      sort: '-startsAt',
      where: publishedOnly,
    }),
    payload.findGlobal({ slug: 'page-headers', depth: 1 }),
  ])

  const { upcoming, past } = splitByDate(docs)

  return (
    <>
      <PageHeader
        header={headers.events}
        headline="Events"
        standfirst="Retreats, outreaches and gatherings — the ones coming up, and the ones already held."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {docs.length === 0 ? (
            <EmptyState
              title="No events are scheduled right now"
              body="When the next retreat or outreach is confirmed, it will be listed here. Our completed outreaches are on the programmes page."
              links={[
                { label: 'What we have done', href: '/programs#completed' },
                { label: 'Get involved', href: '/get-involved' },
              ]}
            />
          ) : (
            <>
              {upcoming.length > 0 ? (
                <>
                  <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink-900">
                    Coming up
                  </h2>
                  <ul className="mt-10 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </ul>
                </>
              ) : null}

              {past.length > 0 ? (
                <div className={upcoming.length > 0 ? 'mt-20' : ''}>
                  <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink-900">
                    Already held
                  </h2>
                  <ul className="mt-10 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
                    {past.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </>
  )
}
