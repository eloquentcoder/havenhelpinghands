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
    <header
      className="sticky top-0 z-50 bg-teal-500 text-paper-50 shadow-[inset_0_-1px_0_rgb(255_255_255_/_0.16)]"
    >
      <Container className="flex items-center justify-between gap-8 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {/* The mark is a solid #006d77 disc with the hands knocked out in white, so
              on the teal-500 header it would sit at 1.00:1 and vanish. The paper
              ring is what keeps the disc readable as a disc. */}
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-50 p-[3px]">
            <Image src="/logo-mark.png" alt="" width={167} height={167} className="h-full w-full" preload />
          </span>
          <span className="font-display text-lg leading-none">
            Haven Healing Hands
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {items.map((item) => (
            <Link
              key={item.id ?? item.url}
              href={item.url}
              className="relative py-1 text-sm text-paper-200 transition-colors hover:text-paper-50 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-brass-100 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={donateUrl}
            className="rounded-full bg-brass-300 px-5 py-2.5 text-sm font-semibold text-teal-950 transition-colors hover:bg-brass-100"
          >
            Donate
          </Link>
          <MobileNav items={items} />
        </div>
      </Container>
    </header>
  )
}
