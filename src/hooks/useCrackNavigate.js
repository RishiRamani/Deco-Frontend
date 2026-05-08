import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Hook for navigating with crack transition effect
 * Usage: const { navigateWithCrack } = useCrackNavigate()
 *        navigateWithCrack('/game')
 */
export function useCrackNavigate() {
  const navigate = useNavigate()

  const navigateWithCrack = useCallback(
    (path, options = {}) => {
      // Dispatch custom event to trigger transition
      const event = new CustomEvent('crack-navigate', {
        detail: { path, ...options },
      })
      window.dispatchEvent(event)

      // Navigate after a short delay for visual effect
      setTimeout(() => {
        navigate(path, options)
      }, 350)
    },
    [navigate]
  )

  return { navigateWithCrack }
}
