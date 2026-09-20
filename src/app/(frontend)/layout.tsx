import React from 'react'
import type { Metadata } from 'next'
import { body, display } from '@/lib/fonts'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './styles.css'

export const metadata: Metadata = {
  // Payload returns relative media URLs, and Next resolves Open Graph images
  // against this. Without it every social scraper drops the share image.
  // Setting Payload's own serverURL instead would change every Media.url and
  // break the images.localPatterns match in next.config.ts.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Haven Healing Hands Initiative',
    template: '%s | Haven Healing Hands Initiative',
  },
  description:
    'A faith-based non-profit in Abuja, Nigeria, dedicated to the healing, restoration and empowerment of vulnerable women, children and communities.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // Browser extensions (password managers, MetaMask and the like) inject
    // attributes onto <html> before React hydrates. Suppressing here covers
    // only this element's own attributes, so real mismatches still surface.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JavaScript as available before first paint, so the reveal
            styles never hide content from a visitor whose JS fails. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
