import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Our work',
  description:
    'The four systems Haven Healing Hands Initiative works through: healing, shelter, empowerment, and men’s mental health.',
}

export default async function ProgramsPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'programs', limit: 20, sort: 'createdAt' })

  return (
    <>
      <section className="bg-teal-950 py-20 text-paper-50 sm:py-24">
        <Container size="prose" className="">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)]">Four systems, one haven</h1>
          <p className="mt-6 text-lg leading-relaxed text-teal-100">
            Each system addresses a different dimension of human healing and growth. Together they
            are how the work is organised.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <ul className="grid gap-8 sm:grid-cols-2">
            {docs.map((program) => (
              <li key={program.id}>
                <Link
                  href={`/programs/${program.slug}`}
                  className="group flex gap-6 border-t border-paper-200 pt-7"
                >
                  <div className="arch h-24 w-16 shrink-0 bg-gradient-to-b from-teal-600 to-teal-900 transition-transform duration-500 group-hover:-translate-y-1" />
                  <div>
                    <h2 className="font-display text-2xl text-ink-900">{program.title}</h2>
                    <p className="mt-3 leading-relaxed text-ink-500">{program.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
