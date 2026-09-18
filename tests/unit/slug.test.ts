import { describe, expect, it } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Clean Water Project')).toBe('clean-water-project')
  })

  it('strips apostrophes rather than turning them into hyphens', () => {
    expect(slugify("Omolola's Fund")).toBe('omololas-fund')
  })

  it('collapses runs of whitespace and punctuation into one hyphen', () => {
    expect(slugify('Health  &  Nutrition')).toBe('health-nutrition')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Hello World!  ')).toBe('hello-world')
  })

  it('removes accents instead of dropping the letter', () => {
    expect(slugify('Café Outreach')).toBe('cafe-outreach')
  })

  it('returns an empty string for input with no usable characters', () => {
    expect(slugify('!!!')).toBe('')
  })

  it('returns an empty string for a title with no Latin characters', () => {
    expect(slugify('清洁水项目')).toBe('')
  })

  it('keeps Yoruba base letters, dropping only the tone and dot marks', () => {
    expect(slugify('Ọ̀yọ́ State Programme')).toBe('oyo-state-programme')
    expect(slugify('Ìbàdàn Outreach')).toBe('ibadan-outreach')
  })

  it('keeps Igbo base letters', () => {
    expect(slugify('Ụmụahịa Clinic')).toBe('umuahia-clinic')
  })

  it('maps Hausa hooked consonants instead of deleting them', () => {
    // These are atomic letters with no NFD decomposition, so stripping
    // combining marks does nothing for them. Without an explicit mapping
    // "Ƙarfafa Mata" would become "arfafa-mata".
    expect(slugify('Ƙarfafa Mata')).toBe('karfafa-mata')
    expect(slugify('Kaduna Ƙauye')).toBe('kaduna-kauye')
    expect(slugify('Ɓarawo Ɗaki Ƴaƴa')).toBe('barawo-daki-yaya')
  })

  it('is idempotent, so re-saving a document cannot corrode its URL', () => {
    const once = slugify('Ọ̀yọ́ State Programme')
    expect(slugify(once)).toBe(once)
  })

  it('leaves an already-valid slug unchanged', () => {
    expect(slugify('clean-water-project')).toBe('clean-water-project')
  })

  it('handles a purely numeric title', () => {
    expect(slugify('2024')).toBe('2024')
  })
})
