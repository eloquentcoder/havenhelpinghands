/**
 * What stands in for a picture that has not been uploaded.
 *
 * The arch is the site's recurring form — `.arch` in styles.css is a
 * rectangle with its top corners fully rounded, taken from the circle in the
 * logo that shelters the cupped hands. This was written inline in three
 * places before; it is one thing now.
 */
export function ArchFallback({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-gradient-to-b from-teal-400 to-teal-700 ${className}`}
    />
  )
}
