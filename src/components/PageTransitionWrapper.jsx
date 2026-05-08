import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CrackTransitionOverlay from './CrackTransitionOverlay'

/**
 * Wrapper component for page transitions with crack effect
 * Usage:
 * <PageTransitionWrapper>
 *   <Routes>
 *     <Route path="/" element={<HomePage />} />
 *     <Route path="/game" element={<GamePage />} />
 *   </Routes>
 * </PageTransitionWrapper>
 *
 * Then use useCrackNavigate hook to navigate:
 * const { navigateWithCrack } = useCrackNavigate()
 * navigateWithCrack('/game')
 */
export default function PageTransitionWrapper({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextPath, setNextPath] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleCrackNavigate = (event) => {
      const { path } = event.detail
      setNextPath(path)
      setIsTransitioning(true)
    }

    window.addEventListener('crack-navigate', handleCrackNavigate)
    return () => window.removeEventListener('crack-navigate', handleCrackNavigate)
  }, [])

  // Navigate to next page when transition is mid-way through
  useEffect(() => {
    if (isTransitioning && nextPath) {
      const timer = setTimeout(() => {
        navigate(nextPath)
        setIsTransitioning(false)
        setNextPath(null)
      }, 350)

      return () => clearTimeout(timer)
    }
  }, [isTransitioning, nextPath, navigate])

  const handleTransitionComplete = () => {
    setIsTransitioning(false)
    setNextPath(null)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {children}
      <CrackTransitionOverlay isActive={isTransitioning} onComplete={handleTransitionComplete} />
    </div>
  )
}
