import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Image decode timed out')), timeoutMs)
    }),
  ])
}

export default function FlashbackTransition({ images, duration, soundEffect, onComplete }) {
  const imageKey = Array.isArray(images) ? images.join('|') : ''
  const imageSources = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [imageKey],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReadyToPlay, setIsReadyToPlay] = useState(false)
  const [failedImages, setFailedImages] = useState([])
  const audioRef = useRef(null)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (soundEffect) {
      const audio = new Audio(soundEffect)
      audioRef.current?.pause()
      audioRef.current = audio

      return () => {
        audio.pause()
        audio.currentTime = 0
      }
    }

    audioRef.current = null
    return undefined
  }, [soundEffect])

  useEffect(() => {
    let cancelled = false

    if (imageSources.length === 0) {
      completeRef.current()
      return
    }

    setCurrentIndex(0)
    setLoadedImages([])
    setFailedImages([])
    setIsReadyToPlay(false)
    setIsLoading(true)

    const preloadPromises = imageSources.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = async () => {
          try {
            if (img.decode) {
              await withTimeout(img.decode(), 8000)
            }
            resolve({ src, index, success: true })
          } catch {
            resolve({ src, index, success: false })
          }
        }
        img.onerror = () => resolve({ src, index, success: false })
        img.src = src
      })
    })

    Promise.all(preloadPromises).then((results) => {
      if (cancelled) return

      const failed = results.filter((result) => !result.success)
      if (failed.length > 0) {
        setFailedImages(failed.map((result) => result.src))
        return
      }

      const orderedImages = [...results]
        .sort((a, b) => a.index - b.index)
        .map((result) => result.src)

      setLoadedImages(orderedImages)
      setIsLoading(false)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) {
            setIsReadyToPlay(true)
          }
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [imageSources])

  useEffect(() => {
    if (!isReadyToPlay || loadedImages.length === 0) return

    const timePerImage = Math.max(160, (duration * 1000) / loadedImages.length)

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    return () => {
      audioRef.current?.pause()
    }
  }, [loadedImages, duration, isReadyToPlay])

  useEffect(() => {
    if (!isReadyToPlay || loadedImages.length === 0) return

    const timePerImage = Math.max(160, (duration * 1000) / loadedImages.length)

    if (currentIndex >= loadedImages.length - 1) {
      const finishTimer = setTimeout(() => completeRef.current(), Math.min(500, timePerImage * 0.7))
      return () => clearTimeout(finishTimer)
    }

    const frameTimer = setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, loadedImages.length - 1))
    }, timePerImage)

    return () => clearTimeout(frameTimer)
  }, [currentIndex, duration, isReadyToPlay, loadedImages.length])

  if (imageSources.length === 0) return null

  if (isLoading || !isReadyToPlay) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
        {loadedImages.length > 0 && (
          <div className="absolute inset-0 opacity-0 pointer-events-none">
            {loadedImages.map((src) => (
              <img key={src} src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ))}
          </div>
        )}
        <div className="text-center">
          <div className="text-white/50 text-sm">Restoring timeline...</div>
          {failedImages.length > 0 && (
            <div className="mt-3 max-w-md px-6 text-xs leading-5 text-red-200/70">
              Flashback paused. {failedImages.length} image{failedImages.length === 1 ? '' : 's'} failed to render.
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loadedImages.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {loadedImages.map((src, index) => (
        <motion.img
          key={src}
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'grayscale(100%) brightness(0.8) contrast(1.2)',
            willChange: 'opacity, transform',
          }}
          initial={false}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.035,
          }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
