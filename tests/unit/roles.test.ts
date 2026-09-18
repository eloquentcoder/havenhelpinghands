import { describe, expect, it } from 'vitest'
import { isAdmin, isAdminOrEditor, publishedOrSignedIn } from '@/access/roles'

const as = (role?: string) =>
  ({ req: { user: role ? { role } : null } }) as never

describe('isAdmin', () => {
  it('allows an admin', () => {
    expect(isAdmin(as('admin'))).toBe(true)
  })

  it('denies an editor', () => {
    expect(isAdmin(as('editor'))).toBe(false)
  })

  it('denies an anonymous visitor', () => {
    expect(isAdmin(as())).toBe(false)
  })
})

describe('isAdminOrEditor', () => {
  it('allows an editor', () => {
    expect(isAdminOrEditor(as('editor'))).toBe(true)
  })

  it('allows an admin', () => {
    expect(isAdminOrEditor(as('admin'))).toBe(true)
  })

  it('denies an anonymous visitor', () => {
    expect(isAdminOrEditor(as())).toBe(false)
  })
})

describe('publishedOrSignedIn', () => {
  it('gives a signed-in user unrestricted read access', () => {
    expect(publishedOrSignedIn(as('editor'))).toBe(true)
  })

  it('restricts anonymous visitors to published documents', () => {
    expect(publishedOrSignedIn(as())).toEqual({ _status: { equals: 'published' } })
  })
})
