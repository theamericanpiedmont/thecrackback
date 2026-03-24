import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="border-b border-black/10 pb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.2em]"
            >
              The Crackback
            </Link>

            <nav className="flex gap-6 text-xs uppercase tracking-[0.2em] opacity-70">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/archive">Archive</Link>
            </nav>
          </div>

          <div className="mt-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
              Business strategy
            </p>

            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance">
              The Crackback
            </h1>

            <p className="mt-4 text-xl leading-relaxed text-black/75">
              The business moves no one saw coming.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-black/65">
              We break down the hidden strategies behind the world’s biggest
              companies using filings, earnings calls, and a sharp eye for what
              everyone else misses.
            </p>
          </div>
        </header>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
            Coming soon
          </p>

          <div className="mt-5 border-t border-black/10 pt-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Crackback #001
            </h2>

            <p className="mt-2 text-lg text-black/75">
              How Magic: The Gathering became Hasbro’s real growth engine.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-black/65">
              A look at how Hasbro quietly inverted its licensing model and
              turned Magic into a platform for other people’s intellectual
              property.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}