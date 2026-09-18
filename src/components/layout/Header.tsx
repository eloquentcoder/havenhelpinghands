import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Container } from './Container'
import { Button } from '@/components/ui/Button'

export async function Header() {
  const payload = await getPayloadClient()
  const [nav, settings] = await Promise.all([
    payload.findGlobal({ slug: 'navigation' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const items = nav.items ?? []
  const donateUrl = settings.paystackUrl || '/donate'

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md">
      <Container className="flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo-mark.png"
            alt=""
            width={167}
            height={167}
            className="h-10 w-10"
            priority
          />
          <span className="font-display text-base leading-tight font-semibold text-ink-900 sm:text-lg">
            {settings.organisationName}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {items
            .filter((item) => item.url !== '/donate')
            .map((item) => (
              <Link
                key={item.id ?? item.url}
                href={item.url}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button href={donateUrl} className="px-5 py-2.5">
            Donate
          </Button>
        </div>
      </Container>
    </header>
  )
}
