import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function Masthead() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.2em]"
        >
          The Crackback
        </Link>

        <nav className="flex gap-6 text-xs uppercase tracking-[0.2em] text-black/70">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/archive">Archive</Link>
        </nav>
      </div>

    <div className="flex items-center gap-4">
       <ThemeToggle />
    </div>

    </header>
  )
}