import Masthead from "@/components/Masthead"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Masthead />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-55">
            About
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
            What The Crackback is for
          </h1>

          <p className="mt-6 text-xl leading-relaxed opacity-80">
            The Crackback is a publication about the business moves no one saw
            coming.
          </p>

          <div className="mt-8 space-y-6 text-base leading-8 opacity-70">
            <p>
              It looks for the real strategy underneath the official story: the
              product driving the economics, the structure nobody noticed, the
              move that changed everything.
            </p>

            <p>
              We use filings, earnings calls, investor presentations, and a
              little narrative instinct to explain what companies are actually
              doing — not just what they say they are doing.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}