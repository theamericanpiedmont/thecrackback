// file: src/app/page.tsx
import Link from "next/link"
import imageUrlBuilder from "@sanity/image-url"
import Masthead from "@/components/Masthead"
import { client } from "@/sanity/lib/client"
import { crackbackHomeQuery, crackbackSignalsQuery } from "@/sanity/lib/queries"

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

function formatCrackbackNumber(num?: number) {
  if (!num) return "Crackback"
  return `Crackback #${String(num).padStart(3, "0")}`
}

function getSignalTicker(signal: any) {
  const raw =
    signal?.companyTicker ||
    signal?.company ||
    signal?.sourceName ||
    signal?.title ||
    "SIG"

  const cleaned = String(raw)
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()

  if (!cleaned) return "SIG"

  const words = cleaned.split(/\s+/).filter(Boolean)

  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase()
  }

  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()
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
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
          Subscribers
        </span>
        <span className="text-xs opacity-40">Locked</span>
      </div>

      <h3 className="max-w-md text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.025em] text-balance opacity-65">
        {title}
      </h3>

      <p className="mt-3 max-w-md text-[15px] leading-7 opacity-55">
        {dek}
      </p>

      <div className="mt-6 h-10 w-32 rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/10" />
    </div>
  )
}

function ThoughtDrip({ squib }: { squib: any }) {
  if (!squib) return null

  const byline =
    squib.squibType === "social"
      ? squib.socialPlatform
        ? `${squib.socialPlatform.charAt(0).toUpperCase()}${squib.socialPlatform.slice(1)}${
            squib.socialHandle ? ` · ${squib.socialHandle}` : ""
          }`
        : squib.socialHandle || ""
      : squib.attribution || squib.sourceName || ""

  return (
    <article className="pt-2">
      <Link
        href={`/squibs/${squib.slug}`}
        className="block transition-opacity duration-200 hover:opacity-90"
      >
        <div className="mx-auto max-w-[32rem] text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-36">
            Thought
          </div>

          {squib.squibType === "quote" && squib.quoteText ? (
            <blockquote className="mt-3 text-[1.35rem] font-semibold leading-[1.14] tracking-[-0.02em] text-balance sm:text-[1.55rem]">
              “{squib.quoteText}”
            </blockquote>
          ) : (
            <>
              <h3 className="mt-3 text-[1.2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-balance">
                {squib.title}
              </h3>

              {squib.summary ? (
                <p className="mx-auto mt-3 max-w-[30rem] text-[0.96rem] leading-[1.65] opacity-70">
                  {squib.summary}
                </p>
              ) : null}
            </>
          )}

          {byline ? (
            <p className="mt-3 text-xs opacity-46">— {byline}</p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

function SquibCard({ squib }: { squib: any }) {
  return (
    <article className="mx-auto max-w-2xl py-1 text-center">
      <Link href={`/squibs/${squib.slug}`} className="block">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-38">
          Thought
        </div>

        {squib.squibType === "quote" && squib.quoteText ? (
          <>
            <blockquote className="mt-2 text-[1.55rem] font-semibold leading-[1.14] tracking-[-0.022em] text-balance sm:text-[1.7rem]">
              “{squib.quoteText}”
            </blockquote>

            {squib.attribution ? (
              <p className="mt-2 text-xs opacity-55">— {squib.attribution}</p>
            ) : null}
          </>
        ) : squib.squibType === "image" && squib.image ? (
          <>
            <figure className="mt-4 overflow-hidden rounded-sm">
              <img
                src={urlFor(squib.image).width(800).height(500).url()}
                alt={squib.image?.alt || squib.title || ""}
                className="mx-auto h-auto max-h-[220px] w-full object-cover"
              />
            </figure>

            <h3 className="mt-3 text-[1.35rem] font-semibold leading-[1.12] tracking-[-0.02em] text-balance">
              {squib.title}
            </h3>

            {squib.summary ? (
              <p className="mx-auto mt-2 max-w-[34rem] text-[0.96rem] leading-7 opacity-70">
                {squib.summary}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h3 className="mt-3 text-[1.35rem] font-semibold leading-[1.12] tracking-[-0.02em] text-balance">
              {squib.title}
            </h3>

            {squib.summary ? (
              <p className="mx-auto mt-2 max-w-[34rem] text-[0.96rem] leading-7 opacity-70">
                {squib.summary}
              </p>
            ) : null}

            {squib.squibType === "social" ? (
              <p className="mt-2 text-xs opacity-50">
                {squib.socialPlatform
                  ? squib.socialPlatform.charAt(0).toUpperCase() +
                    squib.socialPlatform.slice(1)
                  : "Social"}
                {squib.socialHandle ? ` · ${squib.socialHandle}` : ""}
              </p>
            ) : squib.sourceName ? (
              <p className="mt-2 text-xs opacity-50">{squib.sourceName}</p>
            ) : null}
          </>
        )}
      </Link>
    </article>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block">
        {post.coverImage ? (
          <figure className="mb-5 overflow-hidden rounded-sm">
            <img
              src={urlFor(post.coverImage).width(1400).height(620).url()}
              alt={post.coverImage?.alt || post.title || ""}
              className="h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.01] sm:h-[220px]"
            />
          </figure>
        ) : null}

        <div className="max-w-[52rem]">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-38">
              Post
            </span>

            {post.company ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
                {post.company}
              </span>
            ) : null}
          </div>

          <h3 className="text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.028em] text-balance">
            {post.title}
          </h3>

          {post.dek ? (
            <p className="mt-4 max-w-[44rem] text-[1.05rem] leading-[1.7] opacity-72">
              {post.dek}
            </p>
          ) : null}

          {post.publishedAt ? (
            <p className="mt-4 text-sm opacity-45">{formatDate(post.publishedAt)}</p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

function interleavePostsAndSquibs(posts: any[], squibs: any[]) {
  const items: Array<
    | { type: "post"; data: any }
    | { type: "squib"; data: any }
  > = []

  const max = Math.max(posts.length, squibs.length)

  for (let i = 0; i < max; i++) {
    if (posts[i]) items.push({ type: "post", data: posts[i] })
    if (squibs[i]) items.push({ type: "squib", data: squibs[i] })
  }

  return items
}

function RadarRail({ signals }: { signals: any[] }) {
  if (!signals?.length) return null

  return (
    <aside className="pt-1">
      <div className="mb-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-34">
          Notice. Think. Explore. Prove.
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <h2 className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] opacity-58">
            Radar
          </h2>

          <Link
            href="/signals"
            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-45 transition-opacity hover:opacity-100"
          >
            All →
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {signals.slice(0, 6).map((signal: any) => {
          const ticker = getSignalTicker(signal)

          return (
            <article
              key={signal._id}
              className="border-t border-black/10 pt-4 dark:border-white/10"
            >
              <Link
                href={`/signals/${signal.slug?.current || signal.slug}`}
                className="block transition-opacity hover:opacity-85"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 text-[10px] font-semibold uppercase tracking-[0.12em] dark:border-white/15">
                    {ticker}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-38">
                      {signal.company || signal.sourceName || "Signal"}
                    </p>

                    <h3 className="mt-1 text-[15px] font-semibold leading-[1.28] tracking-[-0.012em] text-balance">
                      {signal.title}
                    </h3>

                    {signal.summary ? (
                      <p className="mt-1 text-[12px] leading-[1.5] opacity-66 line-clamp-2">
                        <span className="font-semibold">Translation:</span>{" "}
                        {signal.summary}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </aside>
  )
}

export default async function HomePage() {
  const data = await client.fetch(crackbackHomeQuery)
  const signals = await client.fetch(crackbackSignalsQuery)

  const lead = data?.latestCrackback
  const recent = data?.recentPosts || []
  const squibs = data?.squibs || []

  const latestThought = squibs[0] || null
  const remainingSquibs = squibs.slice(1)

  const featuredPost = recent[0] || null
  const remainingPosts = recent.slice(1)

  const feedItems = interleavePostsAndSquibs(remainingPosts, remainingSquibs)

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        {(lead || signals?.length) ? (
          <section className="mb-14">
            <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-14">
              <RadarRail signals={signals} />

              <div className="space-y-8">
                {lead ? (
                  <div>
                    <Link
                      href={`/crackbacks/${lead.slug}`}
                      className="block transition-opacity duration-200 hover:opacity-92"
                    >
                      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.88fr)] lg:items-center lg:gap-10">
                        <div className="max-w-[40rem]">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-38">
                              {formatCrackbackNumber(lead.number)}
                            </span>

                            {lead.company ? (
                              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
                                {lead.company}
                              </span>
                            ) : null}
                          </div>

                          <h1 className="max-w-[13ch] text-[clamp(2.2rem,3.6vw,3.3rem)] font-semibold leading-[1] tracking-[-0.025em] text-balance">
                            {lead.title}
                          </h1>

                          {lead.dek ? (
                            <p className="mt-4 max-w-[30rem] text-[0.98rem] leading-[1.6] opacity-72">
                              {lead.dek}
                            </p>
                          ) : null}

                          {lead.publishedAt ? (
                            <p className="mt-4 text-sm opacity-42">
                              {formatDate(lead.publishedAt)}
                            </p>
                          ) : null}
                        </div>

                        {lead.heroImage ? (
                          <figure className="overflow-hidden rounded-sm border border-black/5 dark:border-white/10">
                            <img
                              src={urlFor(lead.heroImage).width(1400).height(980).url()}
                              alt={lead.heroImage?.alt || lead.title || ""}
                              className="h-[260px] w-full object-cover sm:h-[300px] lg:h-[320px]"
                            />
                          </figure>
                        ) : null}
                      </div>
                    </Link>
                  </div>
                ) : null}

                {latestThought ? <ThoughtDrip squib={latestThought} /> : null}

{featuredPost ? (
  <div className="pt-6">
    <PostCard post={featuredPost} />
  </div>
) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t border-black/10 pt-8 dark:border-white/10">
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] opacity-55">
              Latest
            </h2>
          </div>

          {feedItems.length ? (
            <div className="space-y-12">
              {feedItems.map((item, index) =>
                item.type === "post" ? (
                  <PostCard
                    key={`post-${item.data._id || index}`}
                    post={item.data}
                  />
                ) : (
                  <SquibCard
                    key={`squib-${item.data._id || index}`}
                    squib={item.data}
                  />
                )
              )}
            </div>
          ) : (
            <div className="max-w-xl">
              <p className="text-lg leading-8 opacity-65">
                Crackback publishes deliberately. More stories will appear here
                soon.
              </p>
            </div>
          )}
        </section>

        <section className="mt-24 border-t border-black/10 pt-8 dark:border-white/10">
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] opacity-55">
              Subscriber Edition
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 opacity-70">
              Deep dives, document work, and extra reporting for readers who
              want the full file.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
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

        <div className="mt-24 border-t border-black/10 pt-10 text-sm dark:border-white/10">
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