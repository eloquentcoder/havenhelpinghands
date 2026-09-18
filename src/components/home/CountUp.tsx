'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts up once, when the figure first scrolls into view.
 *
 * The real number renders on the server and stays put until the animation
 * actually starts, so a visitor without JavaScript — or one who never scrolls
 * this far — sees the true target rather than a page claiming the organisation
 * is aiming for nothing. The count begins inside the observer callback rather
 * than in the effect body, which would be a synchronous setState on mount.
 */
export function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(to)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        const duration = 1200
        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to])

  return <span ref={ref}>{value.toLocaleString('en-NG')}</span>
}
