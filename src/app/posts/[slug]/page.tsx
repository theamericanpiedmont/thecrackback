import { notFound } from "next/navigation"
import { crackbackPostBySlugQuery } from "@/sanity/lib/queries"
import { client } from "@/sanity/lib/client"

function SimplePortableText({ value }: { value?: any[] }) {
  if (!value || !Array.isArray(value)) return null

  return (
    <div className="space-y-6">
      {value.map((block, index) => {
        if (block?._type !== "block") return null

        const text =
          block.children
            ?.filter((child: any) => child?._type === "span")
            ?.map((child: any) => child.text)
            ?.join("") || ""

        if (!text.trim()) return null

        const style = block.style || "normal"

        if (style === "h2") {
          return (
            <h2 key={block._key || index} className="text-2xl font-semibold tracking-tight">
              {text}
            </h2>
          )
        }

        if (style === "h3") {
          return (
            <h3 key={block._key || index} className="text-xl font-semibold tracking-tight">
              {text}
            </h3>
          )
        }

        if (style === "blockquote") {
          return (
            <blockquote
              key={block._key || index}
              className="border-l-2 border-black/15 pl-4 italic text-black/75"
            >
              {text}
            </blockquote>
          )
        }

        return (
          <p
            key={block._key || index}
            className="text-lg leading-8 text-black/80"
          >
            {text}
          </p>
        )
      })}
    </div>
  )
}

export default async function CrackbackPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await client.fetch(crackbackPostBySlugQuery, { slug })

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        {post.company ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/55">
            {post.company}
          </p>
        ) : null}

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance">
          {post.title}
        </h1>

        {post.dek ? (
          <p className="mt-4 text-xl leading-relaxed text-black/75">
            {post.dek}
          </p>
        ) : null}

        {post.publishedAt ? (
          <p className="mt-4 text-sm text-black/50">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        ) : null}
      </div>

      <article>
        <SimplePortableText value={post.body} />
      </article>
    </main>
  )
}