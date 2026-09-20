import Link from 'next/link'
import { ArchFallback } from '@/components/media/ArchFallback'

/**
 * What a listing shows when there is genuinely nothing to list.
 *
 * Posts and events seed empty on purpose — the owner has supplied none, and
 * inventing some would be a claim about a real organisation. So an empty
 * listing is the normal first state of these pages, not an error, and it
 * should say so and offer somewhere else to go.
 */
export function EmptyState({
  title,
  body,
  links,
}: {
  title: string
  body: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-paper-200 bg-paper-100">
      <ArchFallback className="h-28 w-full" />
      <div className="p-8 sm:p-12">
        <h2 className="font-display text-2xl text-ink-900">{title}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-ink-500">{body}</p>
        <p className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-teal-600 underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </p>
      </div>
    </div>
  )
}
