import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FlashbackTransition({ images, duration, soundEffect, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [audio] = useState(() => soundEffect ? new Audio(soundEffect) : null)

  useEffect(() => {
    if (images.length === 0) {
      onComplete()
      return
    }

    setIsLoading(true)

    // Preload all images and filter out failed ones
    const preloadPromises = images.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ src, index, success: true })
        img.onerror = () => resolve({ src, index, success: false })
        img.src = src
      })
    })

    Promise.all(preloadPromises).then((results) => {
      const successfulImages = results
        .filter(result => result.success)
        .map(result => result.src)

      setLoadedImages(successfulImages)
      setIsLoading(false)

      // If no images loaded successfully, complete immediately
      if (successfulImages.length === 0) {
        onComplete()
      }
    })
  }, [images, onComplete])

  useEffect(() => {
    if (isLoading || loadedImages.length === 0) return

    // Dynamically calculate time per image based on total duration
    const timePerImage = (duration * 1000) / loadedImages.length

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 >= loadedImages.length) {
          clearInterval(interval)
          setTimeout(onComplete, 500) // Small delay after last image
          return prev
        }
        return prev + 1
      })
    }, timePerImage)

    // Play sound
    if (soundEffect) {
      audio.play().catch(() => {}) // Ignore play errors
    }

    return () => {
      clearInterval(interval)
      audio.pause()
    }
  }, [loadedImages, duration, soundEffect, audio, onComplete, isLoading])

  if (images.length === 0) return null

  // Show loading state while preloading images
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
        <div className="text-white/50 text-sm">Timeline Restored</div>
      </div>
    )
  }

  // If no images loaded successfully, don't render anything
  if (loadedImages.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={loadedImages[currentIndex]}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(100%) brightness(0.8) contrast(1.2)' }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>
    </div>
  )
}