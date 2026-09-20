import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { PhotoGrid } from '@/components/media/PhotoGrid'
import { TeamGridBlock } from './TeamGridBlock'
import { resolveMedia } from '@/lib/media'
import type { Page } from '@/payload-types'

type Block = NonNullable<Page['layout']>[number]

export function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'hero':
            return (
              <section
                key={block.id ?? i}
                className="relative overflow-hidden bg-teal-600 py-20 text-paper-50 sm:py-24"
              >
                {/* Hero.image has existed since the block was written and was
                    never rendered — an editor could pick a picture and watch it
                    silently do nothing. */}
                {resolveMedia(block.image) ? (
                  <>
                    <MediaImage
                      media={block.image}
                      alt=""
                      variant="hero"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-700 via-teal-700/85 to-teal-700/70" />
                  </>
                ) : null}
                <Container size="prose" className="relative">
                  <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)]">
                    {block.headline}
                  </h1>
                  {block.subtext ? (
                    <p className="mt-6 text-lg leading-relaxed text-teal-100">{block.subtext}</p>
                  ) : null}
                  {block.ctaLabel && block.ctaUrl ? (
                    <Link
                      href={block.ctaUrl}
                      className="mt-9 inline-block rounded-full bg-brass-400 px-7 py-3.5 font-semibold text-teal-950 transition-colors hover:bg-brass-300"
                    >
                      {block.ctaLabel}
                    </Link>
                  ) : null}
                </Container>
              </section>
            )

          case 'richText':
            return (
              <section key={block.id ?? i} className="py-16 sm:py-20">
                <Container size="text" className="">
                  <div className="prose-hhhi text-lg leading-[1.75] text-ink-700">
                    <RichText data={block.content} />
                  </div>
                </Container>
              </section>
            )

          case 'stats':
            return (
              <section key={block.id ?? i} className="bg-teal-600 py-16 text-paper-50">
                <Container>
                  {block.heading ? (
                    <h2 className="font-display text-3xl">{block.heading}</h2>
                  ) : null}
                  <dl className="mt-10 grid gap-10 sm:grid-cols-3">
                    {(block.items ?? []).map((item) => (
                      <div key={item.id ?? item.label} className="border-t border-teal-300 pt-5">
                        <dt className="font-display text-5xl text-brass-300">{item.value}</dt>
                        <dd className="mt-3 text-sm text-teal-200">{item.label}</dd>
                      </div>
                    ))}
                  </dl>
                </Container>
              </section>
            )

          case 'callToAction':
            return (
              <section key={block.id ?? i} className="bg-paper-100 py-16">
                <Container size="text" className=" text-center">
                  <h2 className="font-display text-3xl text-ink-900">{block.heading}</h2>
                  {block.body ? <p className="mt-4 text-ink-500">{block.body}</p> : null}
                  <Link
                    href={block.buttonUrl}
                    className="mt-8 inline-block rounded-full bg-teal-500 px-8 py-4 font-semibold text-paper-50 transition-colors hover:bg-teal-600"
                  >
                    {block.buttonLabel}
                  </Link>
                </Container>
              </section>
            )

          case 'image': {
            const media = resolveMedia(block.image)
            if (!media) return null
            const aspect =
              block.aspect === '16/9'
                ? 'aspect-[16/9]'
                : block.aspect === '4/3'
                  ? 'aspect-[4/3]'
                  : block.aspect === '21/9'
                    ? 'aspect-[21/9]'
                    : null
            const figure = (
              <figure>
                {aspect ? (
                  <div className={`relative ${aspect} overflow-hidden rounded-xl bg-teal-100`}>
                    <MediaImage
                      media={media}
                      variant="hero"
                      fill
                      sizes={block.width === 'text' ? '(min-width: 768px) 42rem, 100vw' : '100vw'}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <MediaImage
                    media={media}
                    variant="hero"
                    sizes={block.width === 'text' ? '(min-width: 768px) 42rem, 100vw' : '100vw'}
                    className="h-auto w-full rounded-xl"
                  />
                )}
                {media.caption ? (
                  <figcaption className="mt-3 text-sm text-ink-500">{media.caption}</figcaption>
                ) : null}
              </figure>
            )
            return (
              <section key={block.id ?? i} className="py-12 sm:py-16">
                {block.width === 'full' ? (
                  figure
                ) : (
                  <Container size={block.width === 'text' ? 'text' : 'wide'}>{figure}</Container>
                )}
              </section>
            )
          }

          case 'gallery':
            return (
              <section key={block.id ?? i} className="bg-paper-100 py-16 sm:py-20">
                <Container>
                  {block.heading ? (
                    <h2 className="font-display text-3xl text-ink-900">{block.heading}</h2>
                  ) : null}
                  <div className={block.heading ? 'mt-8' : ''}>
                    <PhotoGrid
                      items={block.images ?? []}
                      columns={Number(block.columns ?? '3') as 2 | 3 | 4}
                    />
                  </div>
                </Container>
              </section>
            )

          case 'team':
            return <TeamGridBlock key={block.id ?? i} block={block} />

          default:
            return null
        }
      })}
    </>
  )
}
