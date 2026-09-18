import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

export const isAdminOrEditor: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'editor'

/**
 * Read access for drafted content. Signed-in staff see everything, including
 * drafts they are still working on. Anonymous visitors — and therefore the
 * public site — only ever see published documents.
 */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true
