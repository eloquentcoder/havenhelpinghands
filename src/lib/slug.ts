/**
 * Convert arbitrary text into a URL-safe slug.
 *
 * Apostrophes are removed rather than replaced so "Omolola's" becomes
 * "omololas", not "omolola-s". Accented characters are decomposed and
 * stripped of their marks so "Café" becomes "cafe" rather than "caf".
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
