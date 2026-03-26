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

function SubscriberCutoff() {
  return (
    <div className="my-16 border-t border-black/10 pt-8 text-center dark:border-white/10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
        Subscriber Edition
      </p>

      <p className="mx-auto mt-4 max-w-xl text-lg leading-8 opacity-70">
        Crackback continues beyond this point with deeper analysis, reporting notes,
        and supporting material.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm opacity-70 dark:border-white/10">
        <span>🔒</span>
        <span>Full access coming later</span>
      </div>
    </div>
  )
}

function SimplePortableText({ value }: { value?: any[] }) {
  if (!value || !Array.isArray(value)) return null

  const renderableBlocks = value.filter((block) => !!block?._type)
  const cutoffIndex =
    renderableBlocks.length >= 6
      ? Math.min(
          renderableBlocks.length - 2,
          Math.max(3, Math.floor(renderableBlocks.length * 0.6))
        )
      : -1

  return (
    <div className="space-y-7">
      {renderableBlocks.map((block, index) => {
        const pieces: React.ReactNode[] = []

        if (index === cutoffIndex) {
          pieces.push(<SubscriberCutoff key={`cutoff-${block._key || index}`} />)
        }

        if (block._type === "pullQuote" || block._type === "tapPullQuote") {
          pieces.push(
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
          return <>{pieces}</>
        }

        if (block._type === "storyImage" && block.image) {
          pieces.push(
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
          return <>{pieces}</>
        }

        if (block._type === "sectionBreak") {
          pieces.push(
            <div
              key={block._key || index}
              className="my-16 text-center text-2xl tracking-[0.35em] opacity-30"
            >
              ~
            </div>
          )
          return <>{pieces}</>
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
          pieces.push(
            <h2
              key={block._key || index}
              className="pt-10 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
            >
              {text}
            </h2>
          )
          return <>{pieces}</>
        }

        if (style === "h3") {
          pieces.push(
            <h3
              key={block._key || index}
              className="pt-6 text-xl font-semibold tracking-tight sm:text-2xl"
            >
              {text}
            </h3>
          )
          return <>{pieces}</>
        }

        if (style === "blockquote") {
          pieces.push(
            <blockquote
              key={block._key || index}
              className="border-l-2 border-black/15 pl-5 italic opacity-75 dark:border-white/15"
            >
              {text}
            </blockquote>
          )
          return <>{pieces}</>
        }

        if (style === "quoteIndent") {
          pieces.push(
            <p
              key={block._key || index}
              className="ml-6 border-l border-black/10 pl-5 text-[18px] leading-relaxed opacity-85 dark:border-white/15"
            >
              {text}
            </p>
          )
          return <>{pieces}</>
        }

        pieces.push(
          <p
            key={block._key || index}
            className="text-lg leading-8 opacity-80"
          >
            {text}
          </p>
        )

        return <>{pieces}</>
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
        <div className="mt-20 border-t border-black/10 pt-10 text-sm dark:border-white/10">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    
    <a
      href="mailto:rick@thecrackback.com"
      className="flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
    >
      <span>✉️</span>
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