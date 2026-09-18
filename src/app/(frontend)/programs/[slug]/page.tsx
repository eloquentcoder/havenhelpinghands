import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/layout/Container'

const getProgram = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'programs',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'programs', limit: 50 })
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
  }
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await getProgram(slug)
  if (!program) notFound()

  return (
    <>
      <section className="bg-teal-950 py-20 text-paper-50 sm:py-24">
        <Container size="prose" className="">
          <Link
            href="/programs"
            className="text-sm text-teal-300 underline-offset-4 transition-colors hover:text-brass-300 hover:underline"
          >
            All four systems
          </Link>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)]">{program.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-teal-100">{program.summary}</p>
          {program.location ? (
            <p className="mt-6 text-sm text-teal-300">{program.location}</p>
          ) : null}
        </Container>
      </section>

      {program.body ? (
        <section className="py-16 sm:py-20">
          <Container size="text" className="">
            <div className="prose-hhhi text-lg leading-[1.75] text-ink-700 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink-900 [&_li]:mt-2 [&_p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5">
              <RichText data={program.body} />
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
