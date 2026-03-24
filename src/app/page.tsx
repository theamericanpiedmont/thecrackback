import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { crackbackHomeQuery } from "@/sanity/lib/queries"

export default async function HomePage() {
  const data = await client.fetch(crackbackHomeQuery)
  const latestPost = data?.latestPost
  const recentPosts = data?.recentPosts || []

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="border-b border-black/10 pb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.2em]"
            >
              The Crackback
            </Link>

            <nav className="flex gap-6 text-xs uppercase tracking-[0.2em] opacity-70">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/archive">Archive</Link>
            </nav>
          </div>

          <div className="mt-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
              Business strategy
            </p>

            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance">
              The Crackback
            </h1>

            <p className="mt-4 text-xl leading-relaxed text-black/75">
              The business moves no one saw coming.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-black/65">
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
            <div className="mt-5 border-t border-black/10 pt-6">
              {latestPost.company ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55">
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
                <p className="mt-3 max-w-2xl text-lg leading-8 text-black/75">
                  {latestPost.dek}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 border-t border-black/10 pt-6">
              <h2 className="text-3xl font-semibold tracking-tight">
                Crackback #001 coming soon
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-black/75">
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

            <div className="mt-5 border-t border-black/10">
              {recentPosts.map((post: any) => (
                <article
                  key={post._id}
                  className="border-b border-black/10 py-5"
                >
                  {post.company ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55">
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
                    <p className="mt-2 max-w-2xl text-base leading-7 text-black/70">
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