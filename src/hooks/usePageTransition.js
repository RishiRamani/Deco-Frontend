import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook to manage page transition state
 * Tracks when pages are transitioning and provides control over the crack animation
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextPath, setNextPath] = useState(null)
  const location = useLocation()

  const triggerTransition = useCallback((path) => {
    setNextPath(path)
    setIsTransitioning(true)
  }, [])

  const completeTransition = useCallback(() => {
    setIsTransitioning(false)
    setNextPath(null)
  }, [])

  // Auto-reset on location change
  useEffect(() => {
    setIsTransitioning(false)
    setNextPath(null)
  }, [location.pathname])

  return {
    isTransitioning,
    nextPath,
    currentPath: location.pathname,
    triggerTransition,
    completeTransition,
  }
}
