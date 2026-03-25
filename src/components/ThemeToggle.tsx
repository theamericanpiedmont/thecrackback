"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const shouldUseDark = stored === "dark"

    if (shouldUseDark) {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    }

    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  if (!mounted) {
    return <div className="w-8 h-8" />
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 dark:border-white/10 transition hover:bg-black/5 dark:hover:bg-white/10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 12.79A9 9 0 1111.21 3c0 .05 0 .1 0 .15A7 7 0 0021 12.79z" />
    </svg>
  )
}