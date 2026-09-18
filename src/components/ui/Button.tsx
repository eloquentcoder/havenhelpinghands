import Link from 'next/link'
import type { ReactNode } from 'react'

const styles = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow-md',
  secondary: 'bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50 hover:ring-brand-300',
  ghost: 'text-brand-700 hover:bg-brand-50',
} as const

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: keyof typeof styles
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
