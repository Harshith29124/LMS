import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lms_watch_progress'

/**
 * Hook to persist and resume video watch progress via localStorage.
 * Stores { courseId: { lessonId, videoId, timestamp, title, thumbnail, updatedAt } }
 */
export function useWatchProgress() {
  const [progressMap, setProgressMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  })

  // Sync to localStorage whenever progressMap changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap))
  }, [progressMap])

  /**
   * Save watch progress for a specific course/lesson
   */
  const saveProgress = useCallback((courseId, data) => {
    setProgressMap(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        ...data,
        updatedAt: Date.now(),
      }
    }))
  }, [])

  /**
   * Get last watched lesson for a specific course
   */
  const getProgress = useCallback((courseId) => {
    return progressMap[courseId] || null
  }, [progressMap])

  /**
   * Get the most recently watched course/lesson across all courses
   */
  const getLastWatched = useCallback(() => {
    const entries = Object.entries(progressMap)
    if (entries.length === 0) return null

    return entries.reduce((latest, [courseId, data]) => {
      if (!latest || data.updatedAt > latest.updatedAt) {
        return { courseId, ...data }
      }
      return latest
    }, null)
  }, [progressMap])

  /**
   * Clear progress for a specific course
   */
  const clearProgress = useCallback((courseId) => {
    setProgressMap(prev => {
      const next = { ...prev }
      delete next[courseId]
      return next
    })
  }, [])

  return { saveProgress, getProgress, getLastWatched, clearProgress }
}
