import type { ReactNode } from 'react'

const widths = {
  wide: 'max-w-6xl',
  text: 'max-w-2xl',
  prose: 'max-w-3xl',
} as const

/**
 * Width is a prop rather than a passed-in class. Passing `max-w-2xl` through
 * `className` collides with the container's own max-width — both set the same
 * property, so which one wins depends on Tailwind's output order rather than
 * on intent, and the text silently runs full width.
 */
export function Container({
  children,
  size = 'wide',
  className = '',
}: {
  children: ReactNode
  size?: keyof typeof widths
  className?: string
}) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 ${widths[size]} ${className}`}>{children}</div>
  )
}
