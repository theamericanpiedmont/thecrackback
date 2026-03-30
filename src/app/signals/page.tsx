import Link from "next/link"
import Masthead from "@/components/Masthead"
import { client } from "@/sanity/lib/client"
import { crackbackSignalsIndexQuery } from "@/sanity/lib/queries"

export const dynamic = "force-dynamic"

function formatDate(date?: string) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getSignalTicker(signal: any) {
  const raw =
    signal?.companyTicker ||
    signal?.company ||
    signal?.title ||
    "SIG"

  const cleaned = String(raw)
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()

  if (!cleaned) return "SIG"

  const words = cleaned.split(/\s+/).filter(Boolean)

  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase()
  }

  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()
}

function SignalCard({ signal }: { signal: any }) {
  const ticker = getSignalTicker(signal)

  return (
    <article className="border-t border-black/10 pt-5 dark:border-white/10">
      <Link
        href={`/signals/${signal.slug}`}
        className="block transition-opacity hover:opacity-85"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 text-[10px] font-semibold uppercase tracking-[0.12em] dark:border-white/15">
            {ticker}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-45">
                {signal.company || "Signal"}
              </p>

              {signal.publishedAt ? (
                <p className="text-xs opacity-40">
                  {formatDate(signal.publishedAt)}
                </p>
              ) : null}
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-balance">
              {signal.title}
            </h2>

            {signal.summary ? (
              <p className="mt-3 max-w-2xl text-[15px] leading-7 opacity-72">
                <span className="font-semibold">Translation: </span>
                {signal.summary}
              </p>
            ) : null}

            {signal.statOrQuote ? (
              <p className="mt-3 max-w-2xl text-sm italic opacity-55">
                {signal.statOrQuote}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}

export default async function SignalsPage() {
  const signals = await client.fetch(crackbackSignalsIndexQuery)

  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        <header className="mb-12 border-t border-black/10 pt-6 dark:border-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
            Signals
          </p>

          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Published Signals
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 opacity-70">
            A running file of the business moves, margin clues, platform tells, and executive admissions worth tracking.
          </p>
        </header>

        {signals.length ? (
          <div className="space-y-8">
            {signals.map((signal: any) => (
              <SignalCard key={signal._id} signal={signal} />
            ))}
          </div>
        ) : (
          <div className="border-t border-black/10 pt-8 dark:border-white/10">
            <p className="max-w-xl text-lg leading-8 opacity-65">
              No published signals yet.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}