import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { PhotoGrid } from '@/components/media/PhotoGrid'
import { ogImage } from '@/lib/media'

const getProgram = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'programs',
    where: { and: [publishedOnly, { slug: { equals: slug } }] },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'programs', limit: 50, depth: 0, where: publishedOnly })
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgram(slug)
  if (!program) return {}

  return {
    title: program.seo?.metaTitle || program.title,
    description: program.seo?.metaDescription || program.summary,
    robots: program.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: { images: ogImage(program.seo?.ogImage, program.heroImage) },
  }
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await getProgram(slug)
  if (!program) notFound()

  return (
    <>
      <section className="bg-teal-600 py-20 text-paper-50 sm:py-24">
        <Container size="prose" className="">
          <Link
            href="/programs"
            className="text-sm text-teal-100 underline-offset-4 transition-colors hover:text-brass-300 hover:underline"
          >
            All our work
          </Link>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)]">{program.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-teal-100">{program.summary}</p>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-teal-200">
            {program.status === 'completed' && program.completedAt ? (
              <span>
                Completed{' '}
                {new Date(program.completedAt).toLocaleDateString('en-NG', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            ) : null}
            {program.location ? <span>{program.location}</span> : null}
          </p>
        </Container>
      </section>

      {/* The picture sits below the headline band rather than behind it. The
          image is whatever an editor uploads, so no scrim over it could
          guarantee the headline stays legible. */}
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-teal-700">
        <MediaImage
          media={program.heroImage}
          variant="hero"
          fill
          preload
          sizes="100vw"
          className="object-cover"
          fallbackClassName="absolute inset-0"
        />
      </div>

      {program.body ? (
        <section className="py-16 sm:py-20">
          <Container size="text" className="">
            <div className="prose-hhhi text-lg leading-[1.75] text-ink-700">
              <RichText data={program.body} />
            </div>
          </Container>
        </section>
      ) : null}

      {(program.impactStats ?? []).length > 0 ? (
        <section className="bg-teal-600 py-16 text-paper-50">
          <Container>
            <dl className="grid gap-10 sm:grid-cols-3">
              {(program.impactStats ?? []).map((stat) => (
                <div key={stat.id ?? stat.label} className="border-t border-teal-300 pt-5">
                  <dt className="font-display text-5xl text-brass-300">{stat.value}</dt>
                  <dd className="mt-3 text-sm text-teal-200">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      ) : null}

      {(program.gallery ?? []).length > 0 ? (
        <section className="py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-3xl text-ink-900">Photographs</h2>
            <div className="mt-8">
              <PhotoGrid items={program.gallery ?? []} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-paper-100 py-16">
        <Container size="text" className=" text-center">
          <h2 className="font-display text-3xl text-ink-900">Support this work</h2>
          <Link
            href="/get-involved"
            className="mt-7 inline-block rounded-full bg-teal-500 px-8 py-4 font-semibold text-paper-50 transition-colors hover:bg-teal-600"
          >
            Get involved
          </Link>
        </Container>
      </section>
    </>
  )
}
