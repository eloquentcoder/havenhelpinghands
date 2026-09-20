import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { MediaImage } from '@/components/media/MediaImage'
import { resolveMedia } from '@/lib/media'
import type { Page } from '@/payload-types'

type Block = Extract<NonNullable<Page['layout']>[number], { blockType: 'team' }>

/** Initials, for the common case: a real person with no photograph of them. */
const initials = (name: string) =>
  name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

/**
 * Its own async server component rather than a case in the RenderBlocks
 * switch, which is synchronous. Keeping the switch sync is simpler than
 * making every block arm a promise.
 */
export async function TeamGridBlock({ block }: { block: Block }) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'team',
    limit: 100,
    depth: 1,
    sort: 'order',
    where: block.group && block.group !== 'all' ? { group: { equals: block.group } } : undefined,
  })

  if (docs.length === 0) return null

  return (
    <section className="py-16 sm:py-20">
      <Container>
        {block.heading ? (
          <h2 className="font-display text-3xl text-ink-900">{block.heading}</h2>
        ) : null}
        {block.intro ? <p className="mt-4 max-w-2xl text-ink-500">{block.intro}</p> : null}

        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((person) => (
            <li key={person.id}>
              <div className="arch relative aspect-square w-32 overflow-hidden bg-teal-600">
                {resolveMedia(person.photo) ? (
                  <MediaImage
                    media={person.photo}
                    variant="thumbnail"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid h-full w-full place-items-center font-display text-3xl text-paper-50"
                  >
                    {initials(person.name)}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-xl text-ink-900">{person.name}</h3>
              {/* brass-600, not ink-400: ink-400 is 2.96:1 on paper and fails AA. */}
              <p className="mt-1 text-sm text-brass-600">{person.role}</p>
              {block.showBio && person.bio ? (
                <p className="mt-3 leading-relaxed text-ink-500">{person.bio}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
