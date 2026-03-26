import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { crackbackPostsIndexQuery } from "@/sanity/lib/queries"
import Masthead from "@/components/Masthead"

export const dynamic = "force-dynamic"
export default async function ArchivePage() {
  const posts = await client.fetch(crackbackPostsIndexQuery)

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-55">
            Archive
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
            Every Crackback so far
          </h1>

          <p className="mt-6 text-xl leading-relaxed opacity-80">
            A running archive of the business moves no one saw coming.
          </p>
        </div>

        <div className="mt-12 border-t border-black/10 dark:border-white/10">
          {posts?.length ? (
            posts.map((post: any) => (
              <article
                key={post._id}
                className="border-b border-black/10 py-6 dark:border-white/10"
              >
                {post.company ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-55">
                    {post.company}
                  </p>
                ) : null}

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  <Link href={`/posts/${post.slug}`} className="hover:opacity-70">
                    {post.title}
                  </Link>
                </h2>

                {post.dek ? (
                  <p className="mt-2 max-w-2xl text-base leading-7 opacity-70">
                    {post.dek}
                  </p>
                ) : null}

                {post.publishedAt ? (
                  <p className="mt-3 text-sm opacity-50">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <div className="py-8 opacity-60">No posts yet.</div>
          )}
        </div>
      </div>
    </main>
  )
}