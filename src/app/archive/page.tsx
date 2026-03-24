import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { crackbackPostsIndexQuery } from "@/sanity/lib/queries"

export default async function ArchivePage() {
  const posts = await client.fetch(crackbackPostsIndexQuery)

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Archive</h1>
        <p className="mt-4 text-lg leading-8 text-black/70">
          Every Crackback published so far.
        </p>
      </div>

      <div className="mt-10 border-t border-black/10">
        {posts?.length ? (
          posts.map((post: any) => (
            <article key={post._id} className="border-b border-black/10 py-6">
              {post.company ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55">
                  {post.company}
                </p>
              ) : null}

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                <Link href={`/posts/${post.slug}`} className="hover:opacity-70">
                  {post.title}
                </Link>
              </h2>

              {post.dek ? (
                <p className="mt-2 max-w-2xl text-base leading-7 text-black/70">
                  {post.dek}
                </p>
              ) : null}

              {post.publishedAt ? (
                <p className="mt-3 text-sm text-black/50">
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
          <div className="py-8 text-black/60">No posts yet.</div>
        )}
      </div>
    </main>
  )
}