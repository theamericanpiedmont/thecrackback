// file: src/app/signals/[slug]/page.tsx
import Masthead from "@/components/Masthead"
import { client } from "@/sanity/lib/client"
import { crackbackSignalBySlugQuery } from "@/sanity/lib/queries"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

function formatDate(date?: string) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function SignalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const signal = await client.fetch(crackbackSignalBySlugQuery, { slug })

  if (!signal) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
          Signal
        </p>

        {signal.sourceUrl ? (
          <a
            href={signal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance transition-opacity hover:opacity-70"
          >
            {signal.title}
          </a>
        ) : (
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance">
            {signal.title}
          </h1>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm opacity-50">
          {signal.company ? <span>{signal.company}</span> : null}
          {signal.publishedAt ? <span>{formatDate(signal.publishedAt)}</span> : null}
        </div>

        {signal.signal ? (
          <p className="mt-10 text-xl leading-8 opacity-85">
            {signal.signal}
          </p>
        ) : null}

        {signal.summary ? (
          <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
              Translation
            </p>

            <p className="mt-3 text-lg leading-8 opacity-80">
              {signal.summary}
            </p>
          </div>
        ) : null}

        {signal.theCrackback ? (
          <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
              The Crackback
            </p>

            <p className="mt-3 text-lg leading-8 opacity-80">
              {signal.theCrackback}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  )
}