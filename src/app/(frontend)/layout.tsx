import React from 'react'
import type { Metadata } from 'next'
import { inter, playfair } from '@/lib/fonts'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './styles.css'

export const metadata: Metadata = {
  title: {
    default: 'Haven Healing Hands Initiative',
    template: '%s | Haven Healing Hands Initiative',
  },
  description:
    'Haven Healing Hands Initiative runs clean water, food security and community health programmes across underserved communities in Nigeria.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // Browser extensions (password managers, MetaMask and the like) inject
    // attributes onto <html> before React hydrates. Suppressing here covers
    // only this element's own attributes, so real mismatches still surface.
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
