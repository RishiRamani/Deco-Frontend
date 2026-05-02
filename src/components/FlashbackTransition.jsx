import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FlashbackTransition({ images, duration, soundEffect, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [audio] = useState(() => soundEffect ? new Audio(soundEffect) : null)

  useEffect(() => {
    if (images.length === 0) {
      onComplete()
      return
    }

    // Dynamically calculate time per image based on total duration
    const timePerImage = (duration * 1000) / images.length

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 >= images.length) {
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
  }, [images, duration, soundEffect, audio, onComplete])

  if (images.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt="Flashback"
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