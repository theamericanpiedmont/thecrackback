import { notFound } from "next/navigation"
import imageUrlBuilder from "@sanity/image-url"
import { crackbackPostBySlugQuery } from "@/sanity/lib/queries"
import { client } from "@/sanity/lib/client"
import Masthead from "@/components/Masthead"

export const dynamic = "force-dynamic"

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  return builder.image(source)
}

function SimplePortableText({ value }: { value?: any[] }) {
  if (!value || !Array.isArray(value)) return null

  return (
    <div className="space-y-7">
      {value.map((block, index) => {
        if (!block?._type) return null

        // Pull Quote
        if (block._type === "pullQuote" || block._type === "tapPullQuote") {
          return (
            <div
              key={block._key || index}
              className="my-14 border-l-2 border-black/10 pl-6 dark:border-white/20"
            >
              <blockquote className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {block.text}
              </blockquote>

              {block.attribution ? (
                <div className="mt-3 text-sm opacity-60">— {block.attribution}</div>
              ) : null}
            </div>
          )
        }

        // Story Image
        if (block._type === "storyImage" && block.image) {
          return (
            <figure key={block._key || index} className="my-12">
              <img
                src={urlFor(block.image).width(1400).url()}
                alt={block.alt || block.caption || ""}
                className="h-auto w-full rounded-sm"
              />
              {block.caption ? (
                <figcaption className="mt-3 text-sm opacity-60">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          )
        }

        // Section Break
        if (block._type === "sectionBreak") {
          return (
            <div
              key={block._key || index}
              className="my-16 text-center text-2xl tracking-[0.35em] opacity-30"
            >
              ~
            </div>
          )
        }

        if (block._type !== "block") return null

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
              className="pt-10 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
            >
              {text}
            </h2>
          )
        }

        if (style === "h3") {
          return (
            <h3
              key={block._key || index}
              className="pt-6 text-xl font-semibold tracking-tight sm:text-2xl"
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

        if (style === "quoteIndent") {
          return (
            <p
              key={block._key || index}
              className="ml-6 border-l border-black/10 pl-5 text-[18px] leading-relaxed opacity-85 dark:border-white/15"
            >
              {text}
            </p>
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

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-14">
        
        {/* HERO IMAGE (smaller + tighter) */}
        {post.coverImage ? (
          <figure className="mb-10 overflow-hidden rounded-sm">
            <img
              src={urlFor(post.coverImage).width(1400).height(700).url()}
              alt={post.coverImage?.alt || post.title || ""}
              className="h-[220px] w-full object-cover sm:h-[260px] md:h-[300px]"
            />
            {post.coverImage?.caption ? (
              <figcaption className="mt-3 text-sm opacity-60">
                {post.coverImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        {/* HEADER */}
        <div className="mb-12">
          {post.company ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-55">
              {post.company}
            </p>
          ) : null}

          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl">
            {post.title}
          </h1>

          {post.dek ? (
            <p className="mt-5 max-w-xl text-xl leading-relaxed opacity-80">
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

        {/* BODY */}
        <article className="tap-article">
          <SimplePortableText value={post.body} />
        </article>

        {/* END CAP (new) */}
        <div className="mt-20 border-t border-black/10 pt-10 text-sm opacity-40 dark:border-white/10">
          The Crackback
        </div>

      </div>
    </main>
  )
}