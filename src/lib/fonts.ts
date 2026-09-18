import { Inter, Playfair_Display } from 'next/font/google'

/**
 * Playfair Display echoes the wordmark in the logo, so headings read as an
 * extension of the mark rather than a different voice.
 *
 * The `vietnamese` subset is not a mistake. Google Fonts files the
 * dot-below characters Yoruba and Igbo need — Ẹ ẹ Ọ ọ Ị ị Ụ ụ Ṣ ṣ — under
 * that subset rather than latin-ext. Without it those letters fall back to
 * another font mid-word.
 */
export const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
})

export const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-body',
  display: 'swap',
})
