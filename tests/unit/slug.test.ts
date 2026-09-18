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
})
