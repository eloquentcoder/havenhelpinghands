import { resolveMedia, type MediaField } from '@/lib/media'
import { MediaImage } from './MediaImage'

/**
 * A grid of photographs with their captions.
 *
 * `Programs.gallery`, `Events.gallery` and the `gallery` page block all store
 * the same shape — an array of `{ image }` — so all three render through here.
 *
 * No lightbox. The images are brand artwork until the owner supplies photos,
 * so there is nothing to magnify; and a modal would need a focus trap, Escape
 * handling and scroll locking, which is a system this site does not have. The
 * anchor gives full resolution with no JavaScript at all.
 */
export function PhotoGrid({
  items,
  columns = 3,
}: {
  items: { id?: string | null; image: MediaField }[]
  columns?: 2 | 3 | 4
}) {
  const docs = items.map((item) => ({ id: item.id, media: resolveMedia(item.image) }))
  if (!docs.some((d) => d.media)) return null

  const cols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'

  const sizes =
    columns === 2
      ? '(min-width: 640px) 50vw, 100vw'
      : columns === 4
        ? '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
        : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

  return (
    <ul className={`grid gap-5 ${cols}`}>
      {docs.map(({ id, media }, i) =>
        media ? (
          <li key={id ?? media.id ?? i}>
            <figure>
              <a
                href={media.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl bg-teal-100"
              >
                <div className="relative aspect-[4/3]">
                  <MediaImage
                    media={media}
                    variant="card"
                    fill
                    sizes={sizes}
                    className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </div>
              </a>
              {media.caption ? (
                <figcaption className="mt-2 text-sm text-ink-500">{media.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ) : null,
      )}
    </ul>
  )
}
