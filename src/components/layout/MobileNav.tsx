'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Item = { id?: string | null; label: string; url: string }

export function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)

    // Stop the page scrolling behind the open panel.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('a')?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex h-10 w-10 items-center justify-center rounded-full text-paper-50 transition-colors hover:bg-teal-900"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
          <line
            x1="0"
            y1={open ? '7' : '1'}
            x2="20"
            y2={open ? '7' : '1'}
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              transformOrigin: 'center',
              transform: open ? 'rotate(45deg)' : 'none',
              transition: 'all 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <line
            x1="0"
            y1={open ? '7' : '13'}
            x2="20"
            y2={open ? '7' : '13'}
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              transformOrigin: 'center',
              transform: open ? 'rotate(-45deg)' : 'none',
              transition: 'all 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto bg-teal-950 px-5 pb-10"
        >
          <nav aria-label="Main">
            <ul>
              {items.map((item) => (
                <li key={item.id ?? item.url} className="border-b border-teal-800">
                  <Link
                    href={item.url}
                    onClick={() => setOpen(false)}
                    className="block py-5 font-display text-2xl text-paper-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
