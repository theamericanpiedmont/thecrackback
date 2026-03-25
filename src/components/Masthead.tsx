import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function Masthead() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-[11px] font-semibold uppercase tracking-[0.28em]"
        >
          The Crackback
        </Link>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5 text-[11px] uppercase tracking-[0.22em] opacity-70">
            <Link href="/" className="transition hover:opacity-100">
              Home
            </Link>
            <Link href="/about" className="transition hover:opacity-100">
              About
            </Link>
            <Link href="/archive" className="transition hover:opacity-100">
              Archive
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}