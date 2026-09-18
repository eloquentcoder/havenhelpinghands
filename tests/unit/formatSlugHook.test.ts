import { describe, expect, it } from 'vitest'
import type { FieldHook } from 'payload'
import { formatSlugHook } from '@/fields/formatSlugHook'

const hook = formatSlugHook('title')

// The hook reads only `value` and `data`. Payload's FieldHookArgs carries a
// dozen more required members (req, collection, siblingData...), none of which
// this hook touches, so the argument is cast rather than stubbed. The hook's
// own type is left intact so the return type is still checked.
const run = (args: { value?: unknown; data?: Record<string, unknown> }) =>
  hook(args as unknown as Parameters<FieldHook>[0])

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

  it('falls back to the title when the typed value normalises to nothing', () => {
    // Typing "???" used to fail validation saying the field was required,
    // which is baffling when the editor just typed something into it.
    expect(run({ value: '???', data: { title: 'Nutrition Drive' } })).toBe('nutrition-drive')
  })

  it('keeps an existing slug when the title is later reworded', () => {
    // The contract this whole design exists to protect: on update Payload
    // passes the stored slug as `value`, and a published URL must not follow
    // a reworded headline.
    expect(run({ value: 'clean-water-project', data: { title: 'Safe Water Project' } })).toBe(
      'clean-water-project',
    )
  })

  it('returns undefined when there is nothing to derive a slug from', () => {
    expect(run({ data: {} })).toBeUndefined()
  })

  it('returns undefined when neither value nor title yields usable characters', () => {
    expect(run({ value: '???', data: { title: '!!!' } })).toBeUndefined()
  })
})
