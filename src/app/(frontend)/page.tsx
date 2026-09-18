import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import type { Media, Program } from '@/payload-types'

const isMedia = (value: unknown): value is Media =>
  typeof value === 'object' && value !== null && 'url' in value

const isProgram = (value: unknown): value is Program =>
  typeof value === 'object' && value !== null && 'slug' in value

export default async function HomePage() {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({ slug: 'homepage', depth: 1 })

  const heroImage = isMedia(home.heroImage) ? home.heroImage : null
  const featured = (home.featuredPrograms ?? []).filter(isProgram)
  const stats = home.impactStats ?? []

  return (
    <>
      {/* Hero. Falls back to a warm tinted panel when no photograph has been
          uploaded, so the page never renders a broken or empty image slot. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {heroImage?.url ? (
            <>
              <Image
                src={heroImage.url}
                alt={heroImage.alt ?? ''}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-900/85 via-brand-900/60 to-brand-900/20" />
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500" />
          )}
        </div>

        <Container className="py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl text-white sm:text-5xl lg:text-6xl">
              {home.headline}
            </h1>
            {home.subtext ? (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-50/90">
                {home.subtext}
              </p>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3">
              {home.primaryCtaLabel && home.primaryCtaUrl ? (
                <Button href={home.primaryCtaUrl} variant="secondary">
                  {home.primaryCtaLabel}
                </Button>
              ) : null}
              {home.secondaryCtaLabel && home.secondaryCtaUrl ? (
                <Link
                  href={home.secondaryCtaUrl}
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-wide text-white ring-1 ring-white/40 transition-colors hover:bg-white/10"
                >
                  {home.secondaryCtaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {stats.length > 0 ? (
        <section className="border-b border-sand-200 bg-white">
          <Container className="grid grid-cols-2 gap-8 py-12 sm:py-14 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id ?? stat.label}>
                <p className="font-display text-3xl text-brand-600 sm:text-4xl">{stat.value}</p>
                <p className="mt-1.5 text-sm text-ink-500">{stat.label}</p>
              </div>
            ))}
          </Container>
        </section>
      ) : null}

      {home.missionHeading ? (
        <section>
          <Container className="max-w-3xl py-20 sm:py-24">
            <h2 className="font-display text-3xl text-ink-900 sm:text-4xl">{home.missionHeading}</h2>
            <div className="mt-6 h-px w-16 bg-accent-500" />
          </Container>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="pb-24">
          <Container>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-3xl text-ink-900 sm:text-4xl">Our programmes</h2>
              <Link
                href="/programs"
                className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                See all →
              </Link>
            </div>

            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((program) => {
                const cover = isMedia(program.heroImage) ? program.heroImage : null
                return (
                  <li key={program.id}>
                    <Link
                      href={`/programs/${program.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-200"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden bg-brand-50">
                        {cover?.url ? (
                          <Image
                            src={cover.url}
                            alt={cover.alt ?? ''}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                            <Image
                              src="/logo-mark.png"
                              alt=""
                              width={167}
                              height={167}
                              className="h-12 w-12 opacity-40"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        {program.location ? (
                          <p className="text-xs font-semibold tracking-[0.1em] text-brand-500 uppercase">
                            {program.location}
                          </p>
                        ) : null}
                        <h3 className="mt-2 font-display text-xl text-ink-900">{program.title}</h3>
                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">
                          {program.summary}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  )
}
