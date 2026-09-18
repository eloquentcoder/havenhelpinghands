import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Container } from './Container'

export async function Footer() {
  const payload = await getPayloadClient()
  const [footer, settings] = await Promise.all([
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const columns = footer.columns ?? []
  const address = [settings.address?.city, settings.address?.country].filter(Boolean).join(', ')
  const instagram = (settings.socials ?? []).find((s) => s.platform === 'instagram')

  return (
    <footer className="bg-teal-950 text-paper-200">
      <Container className="grid gap-14 py-20 md:grid-cols-[1.5fr_repeat(2,1fr)]">
        <div className="max-w-sm">
          <Image src="/logo-mark.png" alt="" width={167} height={167} className="h-12 w-12" />
          <p className="mt-6 font-display text-2xl leading-tight text-paper-50">
            {settings.tagline}
          </p>
          {footer.blurb ? <p className="mt-5 text-sm leading-relaxed">{footer.blurb}</p> : null}
        </div>

        {columns.map((column) => (
          <nav key={column.id ?? column.heading} aria-label={column.heading}>
            <h2 className="font-display text-lg text-paper-50">{column.heading}</h2>
            <ul className="mt-4 space-y-3">
              {(column.links ?? []).map((link) => (
                <li key={link.id ?? link.url}>
                  <Link href={link.url} className="text-sm transition-colors hover:text-brass-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-teal-800">
        <Container className="flex flex-col gap-3 py-7 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-400">{footer.copyright}</p>
          <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-brass-300">
                {settings.email}
              </a>
            ) : null}
            {instagram ? (
              <a
                href={instagram.url}
                className="transition-colors hover:text-brass-300"
                rel="noreferrer"
              >
                Instagram
              </a>
            ) : null}
            {address ? <span className="text-ink-400">{address}</span> : null}
          </p>
        </Container>
      </div>
    </footer>
  )
}
