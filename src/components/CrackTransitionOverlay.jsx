import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const generateRandomClipPath = (pointCount) => {
  return Array.from({ length: pointCount }, () => {
    const x = 10 + Math.random() * 80
    const y = 10 + Math.random() * 80
    return `${x}% ${y}%`
  }).join(', ')
}

const generateVoronoiFractures = () => {
  const shardCount = 12 + Math.floor(Math.random() * 8)
  return Array.from({ length: shardCount }, (_, index) => {
    const width = 8 + Math.random() * 16
    const height = 10 + Math.random() * 22
    const left = Math.random() * (100 - width)
    const top = Math.random() * (100 - height)
    const moveDistance = 8 + Math.random() * 24

    return {
      id: `shard-${index}-${Math.round(Math.random() * 10000)}`,
      baseX: left,
      baseY: top,
      width,
      height,
      rotation: Math.random() * 50 - 25,
      clipPath: `polygon(${generateRandomClipPath(5 + Math.floor(Math.random() * 3))})`,
      delay: 0.2 + Math.random() * 0.9,
      duration: 1.8 + Math.random() * 0.8,
      moveDistance,
      moveAngle: Math.random() * Math.PI * 2,
      opacity: 0.82 + Math.random() * 0.12,
    }
  })
}

// Chromatic aberration effect component
function ChromaticAberration() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.3, 0] }}
      transition={{ duration: 0.2, delay: 0.15 }}
      style={{
        background: `
          linear-gradient(45deg, 
            rgba(255, 0, 0, 0.15) 0%, 
            transparent 33%, 
            rgba(0, 255, 0, 0.15) 66%, 
            rgba(0, 0, 255, 0.15) 100%)
        `,
        filter: 'blur(1px)',
      }}
    />
  )
}

// Individual fracture shard component
function FractureShard({ shard, isAnimating }) {
  const moveX = Math.cos(shard.moveAngle) * shard.moveDistance
  const moveY = Math.sin(shard.moveAngle) * shard.moveDistance

  return (
    <motion.div
      key={shard.id}
      className="absolute overflow-hidden"
      style={{
        width: `${shard.width}%`,
        height: `${shard.height}%`,
        left: `${shard.baseX}%`,
        top: `${shard.baseY}%`,
        transformOrigin: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.18) inset',
        clipPath: shard.clipPath,
        willChange: 'transform, opacity',
      }}
      initial={{ x: 0, y: 0, rotateZ: 0, opacity: 0, scale: 0.88 }}
      animate={
        isAnimating
          ? {
              x: moveX,
              y: moveY,
              rotateZ: shard.rotation,
              opacity: [0, 0.35, 0.7, shard.opacity],
              scale: [0.88, 0.98, 1.02, 1],
            }
          : { x: 0, y: 0, rotateZ: 0, opacity: 0, scale: 0.88 }
      }
      transition={{
        delay: shard.delay,
        duration: shard.duration,
        ease: 'easeOut',
      }}
    >
      {/* Shard glass-like content */}
      <div
        className="w-full h-full"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
        }}
      />
    </motion.div>
  )
}

// Dust particle system
function DustParticles({ isAnimating }) {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: 0.15 + Math.random() * 0.1,
    duration: 0.6 + Math.random() * 0.4,
    offsetX: (Math.random() - 0.5) * 200,
    offsetY: (Math.random() - 0.5) * 200 - 100,
    size: 2 + Math.random() * 4,
  }))

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: 'rgba(200, 200, 200, 0.6)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={
            isAnimating
              ? { x: p.offsetX, y: p.offsetY, opacity: 0 }
              : { x: 0, y: 0, opacity: 0 }
          }
          transition={{
            delay: p.delay,
            duration: p.duration,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}

// Main crack transition overlay
export default function CrackTransitionOverlay({ isActive, onComplete, soundEffect }) {
  const [shards, setShards] = useState([])
  const audioRef = useRef(null)

  useEffect(() => {
    if (soundEffect) {
      const audio = new Audio(soundEffect)
      audio.volume = 0.92
      audioRef.current?.pause()
      audioRef.current = audio

      return () => {
        audio.pause()
        audio.currentTime = 0
      }
    }

    return undefined
  }, [soundEffect])

  useEffect(() => {
    if (isActive) {
      setShards(generateVoronoiFractures())
    }
  }, [isActive])

  useEffect(() => {
    if (isActive && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [isActive])

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          style={{ background: '#000' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #000000 0%, #0B1F18 40%, #000000 100%)',
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at top right, rgba(45,255,154,0.08), transparent 24%), radial-gradient(circle at left, rgba(45,255,154,0.05), transparent 28%)',
            }}
          />

          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(45,255,154,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(45,255,154,0.02) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Darkening/freeze frame */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0] }}
            transition={{ duration: 0.4 }}
          />

          {/* Bright flash + chromatic aberration */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
          />

          <ChromaticAberration />

          {/* Fracture shards */}
          <div className="absolute inset-0 overflow-hidden">
            {shards.map((shard) => (
              <FractureShard key={shard.id} shard={shard} isAnimating={isActive} />
            ))}
          </div>

          {/* Dust particles */}
          <div className="absolute inset-0 overflow-hidden">
            <DustParticles isAnimating={isActive} />
          </div>

          {/* Subtle blur overlay that fades */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(0.5px)',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
