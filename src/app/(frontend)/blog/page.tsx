import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'Blog & news',
  description:
    'Stories, news and updates from Haven Healing Hands Initiative — healing, shelter and empowerment work in Abuja, Nigeria.',
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

export default async function BlogPage() {
  const payload = await getPayloadClient()
  const [{ docs }, headers] = await Promise.all([
    payload.find({
      collection: 'posts',
      limit: 24,
      depth: 1,
      sort: '-publishedAt',
      where: publishedOnly,
    }),
    payload.findGlobal({ slug: 'page-headers', depth: 1 }),
  ])

  return (
    <>
      <PageHeader
        header={headers.blog}
        headline="Blog & news"
        standfirst="Stories from the work, and news as it happens."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {docs.length === 0 ? (
            <EmptyState
              title="We have not published anything here yet"
              body="When there is a story to tell from an outreach, it will appear here. In the meantime, the programme pages describe the work in full."
              links={[
                { label: 'See our work', href: '/programs' },
                { label: 'Get involved', href: '/get-involved' },
              ]}
            />
          ) : (
            <ul className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((post, i) => (
                <Reveal as="li" key={post.id} delay={i * 80}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-teal-700">
                      <MediaImage
                        media={post.coverImage}
                        alt=""
                        variant="card"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        fallbackClassName="absolute inset-0"
                      />
                    </div>
                    {formatDate(post.publishedAt) ? (
                      <p className="mt-5 text-sm text-brass-600">{formatDate(post.publishedAt)}</p>
                    ) : null}
                    <h2 className="mt-1 font-display text-xl text-ink-900 group-hover:underline">
                      {post.title}
                    </h2>
                    <p className="mt-2.5 leading-relaxed text-ink-500">{post.excerpt}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  )
}
