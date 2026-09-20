import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

/**
 * On-demand revalidation.
 *
 * Every content page is rendered at build time (generateStaticParams), so an
 * edit saved in the admin changes the database while the site keeps serving
 * the HTML it was built with. These hooks tell Next which routes that edit
 * invalidated, so the next visitor gets a freshly rendered page instead of
 * waiting for someone to run `npm run build` on the server.
 */

/** A path to clear, with the kind of route when the path has a dynamic segment. */
export type Route = [path: string, type?: 'page' | 'layout']

/** The only field of a document these hooks read. */
type Slugged = { slug?: string | null }

const clear = (routes: Route[], payload: Payload) => {
  const seen = new Set<string>()

  for (const [path, type] of routes) {
    if (seen.has(`${path}:${type}`)) continue
    seen.add(`${path}:${type}`)

    try {
      revalidatePath(path, type)
      payload.logger.info(`revalidated ${path}`)
    } catch {
      // revalidatePath only works inside a Next request. The admin panel and
      // the REST API are both requests; `payload run src/scripts/seed.ts` and
      // `payload migrate` are not, and there they throw. A CLI run has no
      // server holding stale HTML, so there is nothing to clear and nothing to
      // report — but the write itself must still succeed.
    }
  }
}

/**
 * Collection hooks that clear the routes a document appears on.
 *
 * `routes` is given the document and returns every path it affects — its own
 * URL, the listing it appears in, and anywhere else it surfaces.
 */
export const revalidates = (routes: (doc: Slugged) => Route[]) => ({
  afterChange: [
    (({ doc, previousDoc, req }) => {
      // A renamed document leaves stale HTML at its old URL, which nothing
      // else would ever clear, so the previous slug's routes go too.
      clear([...routes(doc), ...(previousDoc ? routes(previousDoc) : [])], req.payload)
      return doc
    }) as CollectionAfterChangeHook,
  ],
  afterDelete: [
    (({ doc, req }) => {
      clear(routes(doc), req.payload)
      return doc
    }) as CollectionAfterDeleteHook,
  ],
})

/**
 * The same for a global, whose routes are fixed — a global has no slug, so
 * what it feeds is known in advance.
 */
export const revalidatesGlobal = (routes: Route[]) => ({
  afterChange: [
    (({ doc, req }) => {
      clear(routes, req.payload)
      return doc
    }) as GlobalAfterChangeHook,
  ],
})
