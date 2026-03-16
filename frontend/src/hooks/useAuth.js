import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for authentication state management
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('lms_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('lms_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((userData) => {
    localStorage.setItem('lms_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lms_user')
    setUser(null)
  }, [])

  return { user, loading, login, logout }
}
