import Link from "next/link"
import imageUrlBuilder from "@sanity/image-url"
import Masthead from "@/components/Masthead"
import { client } from "@/sanity/lib/client"
import { crackbackHomeQuery } from "@/sanity/lib/queries"

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

function LockedCard({
  title,
  dek,
}: {
  title: string
  dek: string
}) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 dark:to-black/80" />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
          Subscribers
        </span>
        <span className="text-xs opacity-40">Locked</span>
      </div>

      <h3 className="max-w-md text-2xl font-semibold tracking-[-0.02em] opacity-75 blur-[1px]">
        {title}
      </h3>

      <p className="mt-3 max-w-md text-[16px] leading-7 opacity-60 blur-[1px]">
        {dek}
      </p>

      <div className="mt-6 h-10 w-32 rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/10" />
    </div>
  )
}

export default async function HomePage() {
  const data = await client.fetch(crackbackHomeQuery)
  const lead = data?.latestPost
  const recent = data?.recentPosts || []

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        {lead ? (
          <section className="mx-auto mb-20 max-w-4xl">
            <Link href={`/posts/${lead.slug}`} className="block">
              {lead.company ? (
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
                  {lead.company}
                </p>
              ) : null}

              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
                {lead.title}
              </h1>

              {lead.dek ? (
                <p className="mt-5 max-w-2xl text-lg leading-8 opacity-75 sm:text-xl">
                  {lead.dek}
                </p>
              ) : null}

              {lead.publishedAt ? (
                <p className="mt-4 text-sm opacity-45">
                  {formatDate(lead.publishedAt)}
                </p>
              ) : null}

              {lead.coverImage ? (
                <figure className="mt-8 overflow-hidden rounded-sm border border-black/5 dark:border-white/10">
                  <img
                    src={urlFor(lead.coverImage).width(1400).height(700).url()}
                    alt={lead.coverImage?.alt || lead.title || ""}
                    className="h-[180px] w-full object-cover sm:h-[220px] md:h-[260px]"
                  />
                </figure>
              ) : null}
            </Link>
          </section>
        ) : null}

        <section className="border-t border-black/10 pt-8 dark:border-white/10">
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] opacity-55">
              Recent
            </h2>
          </div>

          {recent.length ? (
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
              {recent.map((post: any) => (
                <article key={post._id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    {post.coverImage ? (
                      <figure className="mb-4 overflow-hidden rounded-sm">
                        <img
                          src={urlFor(post.coverImage).width(1000).height(620).url()}
                          alt={post.coverImage?.alt || post.title || ""}
                          className="h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                      </figure>
                    ) : null}

                    {post.company ? (
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
                        {post.company}
                      </p>
                    ) : null}

                    <h3 className="max-w-xl text-2xl font-semibold tracking-[-0.02em] text-balance">
                      {post.title}
                    </h3>

                    {post.dek ? (
                      <p className="mt-3 max-w-xl text-[17px] leading-7 opacity-72">
                        {post.dek}
                      </p>
                    ) : null}

                    {post.publishedAt ? (
                      <p className="mt-3 text-sm opacity-45">
                        {formatDate(post.publishedAt)}
                      </p>
                    ) : null}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl">
              <p className="text-lg leading-8 opacity-65">
                More reporting is on the way.
              </p>
            </div>
          )}
        </section>

        <section className="mt-24 border-t border-black/10 pt-8 dark:border-white/10">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] opacity-55">
                Subscriber Edition
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 opacity-70">
                Deep dives, document work, and extra reporting for readers who want the full file.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <LockedCard
              title="The hidden economics behind Universes Beyond"
              dek="What Magic actually became inside Hasbro, and why the rest of the toy business now revolves around it."
            />
            <LockedCard
              title="The reader’s file: documents, notes, and reporting extras"
              dek="Working notes, source trails, artifacts, and supporting material behind the published story."
            />
            <LockedCard
              title="The next crack in the system"
              dek="Advance access to the next story before it lands on the public homepage."
            />
          </div>

          <div className="mt-10">
            <div className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm opacity-70 dark:border-white/10">
              Subscriber access coming later
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}