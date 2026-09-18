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
  const address = settings.address

  return (
    <footer className="mt-24 border-t border-sand-200 bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(2,1fr)]">
        <div className="max-w-sm">
          <Image src="/logo.png" alt={settings.organisationName} width={381} height={410} className="h-16 w-auto" />
          {footer.blurb ? <p className="mt-5 text-sm text-ink-500">{footer.blurb}</p> : null}

          {settings.registrationNumber ? (
            <p className="mt-5 text-xs text-ink-300">
              Registered with the Corporate Affairs Commission — {settings.registrationNumber}
            </p>
          ) : null}
        </div>

        {columns.map((column) => (
          <div key={column.id ?? column.heading}>
            <h2 className="font-sans text-xs font-semibold tracking-[0.12em] text-ink-900 uppercase">
              {column.heading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {(column.links ?? []).map((link) => (
                <li key={link.id ?? link.url}>
                  <Link
                    href={link.url}
                    className="text-sm text-ink-500 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-sand-200">
        <Container className="flex flex-col gap-2 py-6 text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright}</p>
          {address?.city ? (
            <p>
              {[address.street, address.city, address.state, address.country].filter(Boolean).join(', ')}
            </p>
          ) : null}
        </Container>
      </div>
    </footer>
  )
}
