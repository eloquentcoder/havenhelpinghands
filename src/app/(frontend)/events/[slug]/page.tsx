import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { PhotoGrid } from '@/components/media/PhotoGrid'
import { ogImage, resolveMedia } from '@/lib/media'

const getEvent = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    where: { and: [publishedOnly, { slug: { equals: slug } }] },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    limit: 200,
    depth: 0,
    where: publishedOnly,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return {}

  return {
    title: event.seo?.metaTitle || event.title,
    description: event.seo?.metaDescription || event.summary,
    robots: event.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: { images: ogImage(event.seo?.ogImage, event.coverImage) },
  }
}

const longDate = (value: string) =>
  new Date(value).toLocaleString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  // Search engines show dates, venues and ticket links for an Event; this is a
  // cheap way to be eligible for that.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.summary,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    ...(event.venue
      ? { location: { '@type': 'Place', name: event.venue, address: event.address ?? event.venue } }
      : {}),
    ...(event.registrationUrl ? { url: event.registrationUrl } : {}),
    organizer: { '@type': 'Organization', name: 'Haven Healing Hands Initiative' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-teal-600 py-20 text-paper-50 sm:py-24">
        <Container size="prose" className="">
          <Link
            href="/events"
            className="text-sm text-teal-100 underline-offset-4 transition-colors hover:text-brass-300 hover:underline"
          >
            All events
          </Link>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)]">{event.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-teal-100">{event.summary}</p>

          <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-teal-200">Starts</dt>
              <dd className="mt-1">{longDate(event.startsAt)}</dd>
            </div>
            {event.endsAt ? (
              <div>
                <dt className="text-teal-200">Ends</dt>
                <dd className="mt-1">{longDate(event.endsAt)}</dd>
              </div>
            ) : null}
            {event.venue ? (
              <div>
                <dt className="text-teal-200">Where</dt>
                <dd className="mt-1">{event.venue}</dd>
              </div>
            ) : null}
            {event.address ? (
              <div>
                <dt className="text-teal-200">Address</dt>
                <dd className="mt-1 whitespace-pre-line">{event.address}</dd>
              </div>
            ) : null}
          </dl>

          {event.registrationUrl ? (
            <Link
              href={event.registrationUrl}
              className="mt-9 inline-block rounded-full bg-brass-300 px-7 py-3.5 font-semibold text-teal-950 transition-colors hover:bg-brass-100"
            >
              Register
            </Link>
          ) : null}
        </Container>
      </section>

      {resolveMedia(event.coverImage) ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-teal-700">
          <MediaImage
            media={event.coverImage}
            variant="hero"
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      {event.body ? (
        <section className="py-16 sm:py-20">
          <Container size="text" className="">
            <div className="prose-hhhi text-lg leading-[1.75] text-ink-700">
              <RichText data={event.body} />
            </div>
          </Container>
        </section>
      ) : null}

      {(event.gallery ?? []).length > 0 ? (
        <section className="bg-paper-100 py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-3xl text-ink-900">Photographs</h2>
            <div className="mt-8">
              <PhotoGrid items={event.gallery ?? []} />
            </div>
          </Container>
        </section>
      ) : null}
    </>
  )
}
