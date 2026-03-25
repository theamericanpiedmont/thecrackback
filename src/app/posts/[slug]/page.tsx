import { notFound } from "next/navigation"
import { crackbackPostBySlugQuery } from "@/sanity/lib/queries"
import { client } from "@/sanity/lib/client"
import Masthead from "@/components/Masthead"

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
            <h2
              key={block._key || index}
              className="pt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
            >
              {text}
            </h2>
          )
        }

        if (style === "h3") {
          return (
            <h3
              key={block._key || index}
              className="pt-2 text-xl font-semibold tracking-tight sm:text-2xl"
            >
              {text}
            </h3>
          )
        }

        if (style === "blockquote") {
          return (
            <blockquote
              key={block._key || index}
              className="border-l-2 border-black/15 pl-5 italic opacity-75 dark:border-white/15"
            >
              {text}
            </blockquote>
          )
        }

        return (
          <p
            key={block._key || index}
            className="text-lg leading-8 opacity-80"
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
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          {post.company ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-55">
              {post.company}
            </p>
          ) : null}

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            {post.title}
          </h1>

          {post.dek ? (
            <p className="mt-5 text-xl leading-relaxed opacity-80">
              {post.dek}
            </p>
          ) : null}

          {post.publishedAt ? (
            <p className="mt-5 text-sm opacity-50">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
        </div>

        <article className="tap-article">
          <SimplePortableText value={post.body} />
        </article>
      </div>
    </main>
  )
}