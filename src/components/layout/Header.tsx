import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Container } from './Container'
import { MobileNav } from './MobileNav'

export async function Header() {
  const payload = await getPayloadClient()
  const [nav, settings] = await Promise.all([
    payload.findGlobal({ slug: 'navigation' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const items = nav.items ?? []
  const donateUrl = settings.paystackUrl || '/donate'

  // No backdrop-blur on the header: backdrop-filter makes an element a
  // containing block for fixed-position descendants, which anchored the mobile
  // menu panel to the header instead of the viewport. The header is opaque, so
  // the blur bought nothing.
  return (
    <header className="sticky top-0 z-50 bg-teal-950 text-paper-50">
      <Container className="flex items-center justify-between gap-8 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image src="/logo-mark.png" alt="" width={167} height={167} className="h-9 w-9" priority />
          <span className="font-display text-lg leading-none">
            Haven Healing Hands
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {items.map((item) => (
            <Link
              key={item.id ?? item.url}
              href={item.url}
              className="relative py-1 text-sm text-paper-200 transition-colors hover:text-paper-50 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-brass-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={donateUrl}
            className="rounded-full bg-brass-400 px-5 py-2.5 text-sm font-semibold text-teal-950 transition-colors hover:bg-brass-300"
          >
            Donate
          </Link>
          <MobileNav items={items} />
        </div>
      </Container>
    </header>
  )
}
