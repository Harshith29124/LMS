import { useState, useEffect } from 'react'

/**
 * Custom hook for dark/light mode
 * Applies .dark class to <html> element for Tailwind's dark: variant to work
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('lms_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    localStorage.setItem('lms_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return { isDark, toggleTheme }
}
