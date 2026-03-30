import Link from "next/link"
import { notFound } from "next/navigation"
import Masthead from "@/components/Masthead"
import { client } from "@/sanity/lib/client"
import { crackbackSignalBySlugQuery } from "@/sanity/lib/queries"

export const dynamic = "force-dynamic"

function formatDate(date?: string) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function SignalSlugPage({ params }: Props) {
  const { slug } = await params
  const signal = await client.fetch(crackbackSignalBySlugQuery, { slug })

  if (!signal) notFound()

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        <div className="mb-8">
          <Link
            href="/signals"
            className="text-sm opacity-55 transition-opacity hover:opacity-100"
          >
            ← Back to Signals
          </Link>
        </div>

        <article className="border-t border-black/10 pt-6 dark:border-white/10">
          {signal.company ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
              {signal.company}
            </p>
          ) : null}

          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl">
            {signal.suggestedHeadline || signal.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-50">
            {signal.publishedAt ? <p>{formatDate(signal.publishedAt)}</p> : null}
            {signal.companyTicker ? <p>{signal.companyTicker}</p> : null}
            {typeof signal.publishScore === "number" ? (
              <p>Score {signal.publishScore}</p>
            ) : null}
          </div>

          {signal.signal ? (
            <section className="mt-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
                Signal
              </h2>
              <p className="mt-3 text-lg leading-8 opacity-85">
                {signal.signal}
              </p>
            </section>
          ) : null}

          {signal.theCrackback || signal.whyItMatters ? (
            <section className="mt-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
                The Crackback
              </h2>
              <p className="mt-3 text-lg leading-8 opacity-85">
                {signal.theCrackback || signal.whyItMatters}
              </p>
            </section>
          ) : null}

          {signal.statOrQuote ? (
            <section className="mt-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
                Stat or Quote
              </h2>
              <blockquote className="mt-3 border-l border-black/10 pl-4 text-lg leading-8 opacity-75 dark:border-white/10">
                {signal.statOrQuote}
              </blockquote>
            </section>
          ) : null}

          {(signal.sourceTitle || signal.sourceUrl || signal.sourceType) ? (
            <section className="mt-10 border-t border-black/10 pt-6 dark:border-white/10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
                Source
              </h2>

              <div className="mt-3 space-y-2 text-sm opacity-70">
                {signal.sourceTitle ? <p>{signal.sourceTitle}</p> : null}
                {signal.sourceType ? <p>{signal.sourceType}</p> : null}
                {signal.sourceUrl ? (
                  <p>
                    <a
                      href={signal.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      Open source
                    </a>
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  )
}