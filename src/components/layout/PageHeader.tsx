import { Container } from './Container'
import { MediaImage } from '@/components/media/MediaImage'
import { resolveMedia, type MediaField } from '@/lib/media'

type Header = {
  headline?: string | null
  standfirst?: string | null
  image?: MediaField
}

/**
 * The teal band at the top of a listing page, editable from the Page headers
 * global.
 *
 * The defaults are passed in by the page rather than stored in the CMS, so
 * clearing a field in the admin restores the page's own wording instead of
 * leaving a blank band. An editor cannot accidentally ship a headless page.
 */
export function PageHeader({
  header,
  headline,
  standfirst,
}: {
  header?: Header | null
  headline: string
  standfirst: string
}) {
  const text = header?.headline?.trim() || headline
  const sub = header?.standfirst?.trim() || standfirst
  const image = resolveMedia(header?.image)

  return (
    <section className="relative overflow-hidden bg-teal-600 py-20 text-paper-50 sm:py-24">
      {image ? (
        <>
          <MediaImage
            media={image}
            alt=""
            variant="hero"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Flat 85% wash rather than a gradient. The picture is whatever an
              editor uploads, so the only way to guarantee the heading stays
              readable is a floor: even over a pure-white photo this composites
              to #26585E, which is 7.57:1 against paper-50 and 6.25:1 against
              the teal-100 standfirst. */}
          <div aria-hidden="true" className="absolute inset-0 bg-teal-800/85" />
        </>
      ) : null}

      <Container size="prose" className="relative">
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)]">{text}</h1>
        {sub ? <p className="mt-6 text-lg leading-relaxed text-teal-100">{sub}</p> : null}
      </Container>
    </section>
  )
}
