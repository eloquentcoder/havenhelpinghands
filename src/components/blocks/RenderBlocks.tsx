import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Container } from '@/components/layout/Container'
import type { Page } from '@/payload-types'

type Block = NonNullable<Page['layout']>[number]

export function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'hero':
            return (
              <section key={block.id ?? i} className="bg-teal-950 py-20 text-paper-50 sm:py-24">
                <Container size="prose" className="">
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
                  <div className="text-lg leading-[1.75] text-ink-700 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink-900 [&_li]:mt-2.5 [&_p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5">
                    <RichText data={block.content} />
                  </div>
                </Container>
              </section>
            )

          case 'stats':
            return (
              <section key={block.id ?? i} className="bg-teal-950 py-16 text-paper-50">
                <Container>
                  {block.heading ? (
                    <h2 className="font-display text-3xl">{block.heading}</h2>
                  ) : null}
                  <dl className="mt-10 grid gap-10 sm:grid-cols-3">
                    {(block.items ?? []).map((item) => (
                      <div key={item.id ?? item.label} className="border-t border-teal-800 pt-5">
                        <dt className="font-display text-5xl text-brass-400">{item.value}</dt>
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

          default:
            return null
        }
      })}
    </>
  )
}
