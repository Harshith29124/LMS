import { useState, useEffect } from 'react'

/**
 * Custom hook for dark/light mode
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('lms_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem('lms_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return { isDark, toggleTheme }
}
