/**
 * Convert arbitrary text into a URL-safe slug.
 *
 * Apostrophes are removed rather than replaced so "Omolola's" becomes
 * "omololas", not "omolola-s".
 *
 * Accents are handled by decomposing to NFD and dropping the combining marks,
 * so "Café" becomes "cafe" rather than "caf". That covers Yoruba and Igbo,
 * whose diacritics are all combining marks: "Ọ̀yọ́" becomes "oyo".
 *
 * Hausa needs explicit handling. Its hooked consonants ɓ ɗ ƙ ƴ are atomic
 * letters with no NFD decomposition, so stripping marks does nothing for them
 * and they would otherwise be deleted outright — "Ƙarfafa" would become
 * "arfafa". They are mapped to their closest Latin letter instead.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/ɓ/g, 'b')
    .replace(/ɗ/g, 'd')
    .replace(/ƙ/g, 'k')
    .replace(/ƴ/g, 'y')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
