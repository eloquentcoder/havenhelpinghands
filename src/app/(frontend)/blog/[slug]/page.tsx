import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient, publishedOnly } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { ogImage, resolveMedia } from '@/lib/media'

const getPost = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [publishedOnly, { slug: { equals: slug } }] },
    limit: 1,
  })
  return docs[0] ?? null
}

/**
 * An empty array is correct when nothing is published — `dynamicParams`
 * defaults to true, so a post published after the build still renders on
 * demand. Setting `dynamicParams = false` here would 404 every future post.
 */
export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
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
  const post = await getPost(slug)
  if (!post) return {}

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    robots: post.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: { images: ogImage(post.seo?.ogImage, post.coverImage) },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const author = typeof post.author === 'object' && post.author !== null ? post.author : null
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      <section className="bg-teal-600 py-20 text-paper-50 sm:py-24">
        <Container size="prose" className="">
          <Link
            href="/blog"
            className="text-sm text-teal-100 underline-offset-4 transition-colors hover:text-brass-300 hover:underline"
          >
            All blog &amp; news
          </Link>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)]">{post.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-teal-100">{post.excerpt}</p>
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-teal-200">
            {published ? <span>{published}</span> : null}
            {author ? <span>{author.name}</span> : null}
          </p>
        </Container>
      </section>

      {resolveMedia(post.coverImage) ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-teal-700">
          <MediaImage
            media={post.coverImage}
            variant="hero"
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <section className="py-16 sm:py-20">
        <Container size="text" className="">
          <div className="prose-hhhi text-lg leading-[1.75] text-ink-700">
            <RichText data={post.body} />
          </div>
        </Container>
      </section>

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
