import sharp from 'sharp'

/**
 * Generated stand-in artwork for photographs the owner has not supplied.
 *
 * docs/content/hhhi-source-content.md lists "Photographs of any kind" among
 * the things HHHI has not provided. Stock or generated *photographs* are not
 * an option here: a picture of a woman in a clinic, placed on this site, is
 * read as a picture of someone HHHI helped. That is a factual claim about a
 * real registered charity, and it would be false.
 *
 * So these are unmistakably graphics. The motif is the arch already used
 * throughout the site — `.arch` in styles.css is a rectangle with its top
 * corners fully rounded, which is a semicircle sitting on a rectangle — over
 * a circle echoing the logo mark. Every image is derived from the brand's own
 * geometry and nothing else.
 *
 * Output is deterministic per seed: the same slug always produces the same
 * composition, so re-running the seed does not churn the artwork. The exact
 * PNG bytes are not guaranteed stable across sharp or librsvg upgrades —
 * nothing is committed or checksummed, so that does not matter, but do not
 * write a snapshot test against them.
 */

/** Straight from the @theme block in src/app/(frontend)/styles.css. */
const TEAL = {
  950: '#041b1d',
  900: '#07292c',
  800: '#003a41',
  700: '#004a52',
  600: '#005b64',
  500: '#006d77',
  400: '#2f8d95',
  300: '#6fb2b7',
} as const

const BRASS_400 = '#cfa04a'
const PAPER_50 = '#f7faf8'

const fnv1a = (input: string): number => {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** mulberry32. Small, dependency-free, and good enough for arranging arches. */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const round = (n: number) => Math.round(n * 100) / 100

export function archMotifSvg(seed: string, width: number, height: number): string {
  const rng = mulberry32(fnv1a(seed))

  // Mid teals, not the 900s. The whole point of this work was that the site
  // read as near-black rather than as the logo's #006d77, and artwork on a
  // teal-950 ground would put that back on the largest surface of the page.
  const grounds = [TEAL[800], TEAL[700], TEAL[600]] as const
  const ground = grounds[Math.floor(rng() * grounds.length)]

  // The logo's circle, very faint, as the ground the colonnade stands on.
  const r = round(Math.min(width, height) * 0.28)
  const cx = round(width * (0.3 + rng() * 0.4))
  const cy = round(height * 0.45)

  const count = 4 + Math.floor(rng() * 3)
  const band = width / count
  const fills = [TEAL[600], TEAL[500], TEAL[400], TEAL[300]] as const
  const brassIndex = Math.floor(rng() * count)
  const paperIndex = Math.floor(rng() * count)

  const arches: string[] = []
  for (let i = 0; i < count; i++) {
    const w = round(width * (0.1 + rng() * 0.16))
    const x = round(i * band + rng() * Math.max(band - w, 0))
    // Below w/2 the semicircle stops being a top and becomes the whole shape,
    // so the arch reads as a lozenge. Clamp rather than let it invert.
    const h = round(Math.max(height * (0.35 + rng() * 0.55), w / 2 + 1))
    const y = round(height - h + w / 2)

    let fill: string = fills[Math.floor(rng() * fills.length)]
    let opacity = '1'
    if (i === brassIndex) {
      fill = BRASS_400
    } else if (i === paperIndex) {
      fill = PAPER_50
      opacity = '0.08'
    }

    arches.push(
      `<path d="M ${x},${height} V ${y} a ${round(w / 2)},${round(w / 2)} 0 0 1 ${round(w)},0 V ${height} Z" fill="${fill}" fill-opacity="${opacity}"/>`,
    )
  }

  // Flat fills only, no gradients: it keeps the PNG palette-quantisable, which
  // is roughly a fifth of the file size for this kind of image.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${ground}"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PAPER_50}" fill-opacity="0.05"/>`,
    ...arches,
    `</svg>`,
  ].join('')
}

export function renderPlaceholderPng(
  seed: string,
  width: number,
  height: number,
): Promise<Buffer> {
  return sharp(Buffer.from(archMotifSvg(seed, width, height)))
    .png({ compressionLevel: 9, palette: true, effort: 10 })
    .toBuffer()
}

/**
 * Alt text that says what the picture is.
 *
 * Media.admin.useAsTitle is `alt`, so this string is also what the editor sees
 * as the document's title in the admin media list. That is the signal telling
 * them which images are still waiting for a real photograph — the artwork
 * itself carries no watermark, because a visible "PLACEHOLDER" stamp on a live
 * charity site looks like a broken deploy.
 */
export const placeholderAlt = (subject: string): string =>
  `Placeholder artwork: arches in teal and brass drawn from the Haven Healing Hands logo. ` +
  `No photograph of ${subject} has been supplied yet.`

/** Every generated file is named with this prefix, which is what makes the seed idempotent. */
export const PLACEHOLDER_PREFIX = 'hhhi-placeholder-'
