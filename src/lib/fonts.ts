import { Bodoni_Moda, Karla } from 'next/font/google'

/**
 * Bodoni Moda matches the Didone wordmark in the logo far more closely than a
 * general-purpose display serif, so headings read as an extension of the mark.
 *
 * The `vietnamese` subset is deliberate: Google files the dot-below characters
 * Yoruba and Igbo need — Ẹ ẹ Ọ ọ Ị ị Ụ ụ Ṣ ṣ — under that subset rather than
 * latin-ext. Without it those letters fall back mid-word.
 */
export const display = Bodoni_Moda({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const body = Karla({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})
