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

/**
 * Lets an admin act on any user, and any signed-in user act on their own
 * record only. Needed so an editor can change their own name and password
 * without an admin doing it for them — a collection-wide admin-only rule locks
 * editors out of their own account.
 *
 * Self-promotion is blocked separately, by field-level access on `role`.
 */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

export const anyone: Access = () => true
