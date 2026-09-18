import { describe, expect, it } from 'vitest'
import { formatSlugHook } from '@/fields/formatSlugHook'

const hook = formatSlugHook('title')
const run = (args: { value?: unknown; data?: Record<string, unknown> }) =>
  // The hook only reads `value` and `data`; the rest of Payload's hook
  // argument object is irrelevant here.
  (hook as (a: unknown) => unknown)(args)

describe('formatSlugHook', () => {
  it('derives a slug from the fallback field when no value is given', () => {
    expect(run({ data: { title: 'Clean Water Project' } })).toBe('clean-water-project')
  })

  it('normalises a value the editor typed by hand', () => {
    expect(run({ value: 'Clean Water!', data: { title: 'Ignored' } })).toBe('clean-water')
  })

  it('falls back to the title when the editor clears the field', () => {
    expect(run({ value: '', data: { title: 'Clean Water Project' } })).toBe('clean-water-project')
  })

  it('returns undefined when there is nothing to derive a slug from', () => {
    expect(run({ data: {} })).toBeUndefined()
  })
})
