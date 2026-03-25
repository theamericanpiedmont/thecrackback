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
    return (
      <button className="text-xs uppercase tracking-[0.2em] opacity-70">
        Theme
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="text-xs uppercase tracking-[0.2em] opacity-70 hover:opacity-100"
      aria-label="Toggle theme"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  )
}