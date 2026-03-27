// app/squibs/[slug]/page.tsx
import { notFound } from "next/navigation"
import imageUrlBuilder from "@sanity/image-url"
import Masthead from "@/components/Masthead"
import { client } from "@/sanity/lib/client"
import { squibBySlugQuery } from "@/sanity/lib/queries"

export const dynamic = "force-dynamic"

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

function formatDate(date?: string) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function platformLabel(platform?: string) {
  if (!platform) return null

  if (platform === "x") return "X"
  if (platform === "bluesky") return "Bluesky"
  if (platform === "threads") return "Threads"
  if (platform === "facebook") return "Facebook"

  return platform
}

export default async function SquibPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const squib = await client.fetch(squibBySlugQuery, { slug })

  if (!squib) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-xl px-6 pb-24 pt-16">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
            Squib
          </p>

          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl">
            {squib.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-50">
            {squib.publishedAt ? <span>{formatDate(squib.publishedAt)}</span> : null}

            {squib.squibType ? (
              <span className="capitalize">{squib.squibType}</span>
            ) : null}

            {squib.squibType === "social" && squib.socialPlatform ? (
              <span>{platformLabel(squib.socialPlatform)}</span>
            ) : squib.sourceName ? (
              <span>{squib.sourceName}</span>
            ) : null}
          </div>
        </div>

        <article className="space-y-8">
          {squib.squibType === "quote" && squib.quoteText ? (
            <section className="border-l-2 border-black/10 pl-6 dark:border-white/20">
              <blockquote className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                “{squib.quoteText}”
              </blockquote>

              {squib.attribution ? (
                <p className="mt-4 text-sm opacity-60">— {squib.attribution}</p>
              ) : null}
            </section>
          ) : null}

          {squib.squibType === "image" && squib.image ? (
            <section>
              <figure className="overflow-hidden rounded-sm">
                <img
                  src={urlFor(squib.image).width(1400).height(900).url()}
                  alt={squib.image?.alt || squib.title || ""}
                  className="h-auto w-full rounded-sm"
                />
              </figure>

              {squib.image?.caption ? (
                <figcaption className="mt-3 text-sm opacity-60">
                  {squib.image.caption}
                </figcaption>
              ) : null}
            </section>
          ) : null}

          {squib.summary ? (
            <section>
              <p className="text-lg leading-8 opacity-80">{squib.summary}</p>
            </section>
          ) : null}

          {squib.squibType === "social" ? (
            <section className="rounded-sm border border-black/10 p-5 dark:border-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-45">
                Social Post
              </div>

              <p className="mt-3 text-base leading-7 opacity-75">
                This squib points to an original post on{" "}
                {platformLabel(squib.socialPlatform) || "social media"}.
                {squib.socialHandle ? ` Source: ${squib.socialHandle}.` : ""}
              </p>
            </section>
          ) : null}

          <section className="rounded-sm border border-black/10 p-6 dark:border-white/10">
            <p className="text-sm leading-7 opacity-70">
              Squibs are short Crackback dispatches: quick cuts, revealing quotes,
              funny or telling images, and small stories that point to something bigger.
            </p>

            <div className="mt-6">
              <a
                href={squib.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 dark:border-white/10"
              >
                <span>Open original source</span>
                <span>↗</span>
              </a>
            </div>
          </section>
        </article>

        <div className="mt-20 border-t border-black/10 pt-10 text-sm dark:border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="mailto:rick@thecrackback.com"
              className="flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
            >
              <span className="text-base">✉︎</span>
              <span>Contact the author</span>
            </a>

            <div className="opacity-40">
              © {new Date().getFullYear()} The Crackback. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}