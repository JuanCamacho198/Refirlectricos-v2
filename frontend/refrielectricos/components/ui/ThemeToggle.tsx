"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evitar hidratación incorrecta
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder para evitar layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
      title="Cambiar tema"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400 hover:rotate-90 transition-transform duration-500" />
      ) : (
        <Moon className="h-5 w-5 text-blue-600 hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  )
}
