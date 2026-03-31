// file: src/components/Masthead.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ThemeToggle from "@/components/ThemeToggle"

export default function Masthead() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) return

      window.requestAnimationFrame(() => {
        const y = window.scrollY

        setScrolled((prev) => {
          if (!prev && y > 40) return true
          if (prev && y < 16) return false
          return prev
        })

        ticking = false
      })

      ticking = true
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[var(--site-bg)]/80 backdrop-blur-md dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center">
          <div className="block dark:hidden opacity-95">
            <img
              src="/masthead-light_trans.png"
              alt="The Crackback"
              className={`block w-auto origin-left transition-all duration-300 ease-out ${
                scrolled ? "h-[62px]" : "h-[88px]"
              }`}
            />
          </div>

          <div className="hidden dark:block opacity-95">
            <img
              src="/masthead-light_trans.png"
              alt="The Crackback"
              className={`block w-auto origin-left transition-all duration-300 ease-out ${
                scrolled ? "h-[62px]" : "h-[88px]"
              }`}
            />
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <nav
            className={`flex items-center gap-5 text-[11px] uppercase tracking-[0.22em] transition-all duration-300 ${
              scrolled ? "opacity-75" : "opacity-70"
            }`}
          >
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