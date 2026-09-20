import { DM_Sans, Outfit } from 'next/font/google'

/**
 * One geometric voice, two roles. Hierarchy is carried by weight and tracking
 * rather than by a swing between a display serif and a text sans.
 *
 * Outfit sets the headlines: wide, near-circular bowls and even stroke weight,
 * which survive white-on-teal at hero sizes. A high-contrast serif does not —
 * its hairlines optically thin out against a dark ground until the word starts
 * to break up.
 */
export const display = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
})

/** DM Sans carries running text: shorter, tighter and plainer than Outfit at
 *  paragraph sizes, so the two read as distinct roles rather than as a clash. */
export const body = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
})

/*
 * Yoruba and Igbo caveat. Neither family draws the dot-below characters those
 * languages need — Ẹ ẹ Ọ ọ Ị ị Ụ ụ Ṣ ṣ Ṅ ṅ are absent from both cmaps, and
 * Google publishes no `vietnamese` subset for either, so there is no subset to
 * opt into. Plain tone marks (à á è é ì í ò ó ù ú ā ī) are present in both.
 *
 * The dot-below characters therefore fall back per glyph to the stack in
 * styles.css, whose chain names Noto Sans — it covers every one of them. Noto
 * Sans is a system font on Android and most Linux builds but not on macOS or
 * Windows, so on those platforms such text renders in a generic sans and looks
 * visibly different mid-word. If Yoruba or Igbo copy is ever going into the
 * CMS, load a covering face as a real webfont instead of relying on this.
 *
 * The naira sign ₦ (U+20A6) is missing from both too, which is why it sits at a
 * slightly different weight to the digits beside it on the donation amounts.
 * Bodoni Moda and Karla did not have it either, so this is not new — but Noto
 * Sans does, so the chain above improves it wherever Noto is installed.
 */
