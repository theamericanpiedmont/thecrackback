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

    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="border-b border-black/10 pb-10 dark:border-white/10">
        <div className="mt-4 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-55">
            Business strategy
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
            The Crackback
          </h1>

          <p className="mt-5 max-w-2xl text-xl leading-relaxed opacity-80 sm:text-2xl">
            The business moves no one saw coming.
          </p>

          <p className="mt-5 max-w-2xl text-base leading-7 opacity-70">
            We break down the hidden strategies behind the world’s biggest
            companies using filings, earnings calls, and a sharp eye for what
            everyone else misses.
          </p>
        </div>
      </header>

      {/* rest of homepage sections */}
    </div>
  </main>
)
}