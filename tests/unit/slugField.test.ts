import { describe, expect, it } from 'vitest'
import type { TextField, TextFieldSingleValidation } from 'payload'
import { slugField } from '@/fields/slug'

// `slugField` returns a plain `text` field, so the `validate` property is
// always the `text`-shaped one when present.
const asTextField = (field: ReturnType<typeof slugField>) => field as TextField

// Payload calls `validate` with a second argument carrying request context,
// the field config and more. The reserved-slug check itself only reads the
// value, but it delegates to the built-in `text` validator first (to keep
// `required` working), which reads `req.t` and `req.payload.config` — so a
// minimal stub of those is required here, cast the way
// `tests/unit/formatSlugHook.test.ts` casts its hook's arguments.
const runValidate = (validate: TextFieldSingleValidation, value: string) =>
  validate(value, {
    required: true,
    req: { t: (key: string) => key, payload: { config: {} } },
  } as unknown as Parameters<TextFieldSingleValidation>[1])

describe('slugField', () => {
  it('has no validator unless the reserved guard is enabled', () => {
    expect(asTextField(slugField()).validate).toBeUndefined()
  })

  it('rejects a reserved slug when the guard is enabled', () => {
    const field = asTextField(slugField('title', { reserved: true }))
    expect(typeof field.validate).toBe('function')
  })

  it('rejects "admin" with the reserved-slug message', async () => {
    const field = asTextField(slugField('title', { reserved: true }))
    const result = await runValidate(field.validate as TextFieldSingleValidation, 'admin')
    expect(result).toBe('"admin" is reserved by the site. Choose a different web address.')
  })

  it('accepts a slug that is not reserved', async () => {
    const field = asTextField(slugField('title', { reserved: true }))
    const result = await runValidate(field.validate as TextFieldSingleValidation, 'about-us')
    expect(result).toBe(true)
  })

  it('still enforces required when the reserved guard is enabled', async () => {
    const field = asTextField(slugField('title', { reserved: true }))
    const result = await runValidate(field.validate as TextFieldSingleValidation, '')
    expect(result).toBe('validation:required')
  })
})
