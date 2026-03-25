import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { crackbackHomeQuery } from "@/sanity/lib/queries"
import ThemeToggle from "@/components/ThemeToggle"

export default async function HomePage() {
  const data = await client.fetch(crackbackHomeQuery)
  const latestPost = data?.latestPost
  const recentPosts = data?.recentPosts || []

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="border-b border-black/10 pb-10 dark:border-white/10">
  <div className="flex items-center justify-between">
    <Link
      href="/"
      className="text-[11px] font-semibold uppercase tracking-[0.28em]"
    >
      The Crackback
    </Link>

    <div className="flex items-center gap-5">
      <nav className="flex items-center gap-5 text-[11px] uppercase tracking-[0.22em] opacity-70">
        <Link href="/" className="transition hover:opacity-100">
          Home
        </Link>
        <Link href="/about" className="transition hover:opacity-100">
          About
        </Link>
        <Link href="/archive" className="transition hover:opacity-100">
          Archive
        </Link>
      </nav>

      <ThemeToggle />
    </div>
  </div>

  <div className="mt-14 max-w-3xl">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-55">
      Business strategy
    </p>

    <h1 className="mt-4 text-5xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
      The Crackback
    </h1>

    <p className="mt-5 max-w-2xl text-xl leading-relaxed opacity-80 sm:text-2xl">
      The business moves no one saw coming.
    </p>

    <p className="mt-5 max-w-2xl text-base leading-7 opacity-65">
      We break down the hidden strategies behind the world’s biggest
      companies using filings, earnings calls, and a sharp eye for what
      everyone else misses.
    </p>
  </div>
</header>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
            Latest
          </p>

          {latestPost ? (
            <div className="mt-5 border-t border-black/10 pt-6 dark:border-white/10">
              {latestPost.company ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-55">
                  {latestPost.company}
                </p>
              ) : null}

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                <Link
                  href={`/posts/${latestPost.slug}`}
                  className="hover:opacity-70"
                >
                  {latestPost.title}
                </Link>
              </h2>

              {latestPost.dek ? (
                <p className="mt-3 max-w-2xl text-lg leading-8 opacity-75">
                  {latestPost.dek}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 border-t border-black/10 pt-6 dark:border-white/10">
              <h2 className="text-3xl font-semibold tracking-tight">
                Crackback #001 coming soon
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 opacity-75">
                The first story is on the way.
              </p>
            </div>
          )}
        </section>

        {recentPosts.length > 0 ? (
          <section className="pb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
              Recent Posts
            </p>

            <div className="mt-5 border-t border-black/10 dark:border-white/10">
              {recentPosts.map((post: any) => (
                <article
                  key={post._id}
                  className="border-b border-black/10 py-5 dark:border-white/10"
                >
                  {post.company ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-55">
                      {post.company}
                    </p>
                  ) : null}

                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:opacity-70"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {post.dek ? (
                    <p className="mt-2 max-w-2xl text-base leading-7 opacity-70">
                      {post.dek}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}