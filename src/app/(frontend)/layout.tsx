import React from 'react'
import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'Helping Hands Initiative',
  description:
    'Helping Hands Initiative runs community programmes across Nigeria, from clean water to health outreach.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // Browser extensions (password managers, MetaMask, Storylane and the like)
    // inject attributes onto <html> before React hydrates, which React reports
    // as a hydration mismatch. Suppressing it here covers only this element's
    // own attributes, not the tree below, so real mismatches still surface.
    <html lang="en" suppressHydrationWarning>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
