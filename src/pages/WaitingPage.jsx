import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import Timer from '../components/Timer'
import { ACTIVE_ROUND_POLL_MS, ROUND_JOIN_BUFFER_MS } from '../config/experience'
import { Alert, Spinner } from '../components/UI'

function isPlayable(round) {
  if (!round) return false
  return Date.now() < new Date(round.endsAt).getTime() - ROUND_JOIN_BUFFER_MS
}

function TimelineCrackTransition({ show }) {
  const [portalRoot, setPortalRoot] = useState(null)
  const crackPaths = [
    'M50 0 L48 15 L52 28 L49 42 L54 55 L50 70 L53 86 L50 100',
    'M49 42 L35 32 L25 22 L15 20',
    'M51 31 L63 22 L73 12 L86 8',
    'M52 55 L67 61 L80 72 L96 78',
    'M49 65 L36 75 L25 88 L9 94',
    'M50 18 L42 10 L37 2',
    'M53 84 L61 93 L69 99',
  ]

  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  if (!portalRoot) return null

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,255,154,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(255,0,0,0.16),transparent_62%)]"
            animate={{ scale: [1, 1.08, 1.16], opacity: [0.4, 0.95, 0.15] }}
            transition={{ duration: 1.35, ease: 'easeOut' }}
          />

          <motion.svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            initial={{ filter: 'drop-shadow(0 0 0 rgba(45,255,154,0))' }}
            animate={{ filter: ['drop-shadow(0 0 0 rgba(45,255,154,0))', 'drop-shadow(0 0 12px rgba(45,255,154,0.95))', 'drop-shadow(0 0 30px rgba(255,0,0,0.7))'] }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.35, ease: 'easeOut' }}
            >
              {crackPaths.map((path, index) => (
                <motion.path
                  key={path}
                  d={path}
                  fill="none"
                  stroke={index % 2 === 0 ? '#2DFF9A' : '#ff3b3b'}
                  strokeWidth={index === 0 ? 0.55 : 0.32}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 0.85] }}
                  transition={{ duration: 0.62, delay: 0.08 + index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

              {[
                '47,18 42,35 49,42',
                '53,28 60,45 52,56',
                '48,63 37,80 51,72',
                '55,58 76,72 61,64',
              ].map((points, index) => (
                <motion.polygon
                  key={points}
                  points={points}
                  fill={index % 2 === 0 ? 'rgba(45,255,154,0.12)' : 'rgba(255,0,0,0.1)'}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="0.12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.96, 1.04, 1.18] }}
                  transition={{ duration: 1.05, delay: 0.34 + index * 0.06, ease: 'easeOut' }}
                />
              ))}
            </motion.g>
          </motion.svg>

          <motion.div
            className="absolute left-1/2 top-1/2 h-[1px] w-0 -translate-x-1/2 -translate-y-1/2 bg-white/80 shadow-[0_0_40px_rgba(45,255,154,1)]"
            animate={{ width: ['0%', '92%', '0%'], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: 0.42, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot,
  )
}

export default function WaitingPage({ onNav, forcedMessage }) {
  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [upcomingRound, setUpcomingRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCrackTransition, setShowCrackTransition] = useState(true)

  const apiRef = useRef(api)
  const onNavRef = useRef(onNav)
  const forcedMessageRef = useRef(forcedMessage)
  const pollingRef = useRef(false)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => { apiRef.current = api }, [api])
  useEffect(() => { onNavRef.current = onNav }, [onNav])
  useEffect(() => { forcedMessageRef.current = forcedMessage }, [forcedMessage])

  useEffect(() => {
    setShowCrackTransition(true)
    const timer = window.setTimeout(() => setShowCrackTransition(false), 1450)
    return () => window.clearTimeout(timer)
  }, [])

  const pollActiveRound = useCallback(async () => {
    if (forcedMessageRef.current || pollingRef.current) return
    pollingRef.current = true

    try {
      const result = await apiRef.current.get('/api/round/info').catch(() => null)

      let currentRound = result?.current || null
      let nextRound = result?.next || null

      if (!result) {
        try {
          currentRound = await apiRef.current.get('/api/round/active')
        } catch {
          try {
            nextRound = await apiRef.current.get('/api/round/upcoming')
          } catch {}
        }
      }

      if (mountedRef.current) {
        setActiveRound(currentRound)
        setUpcomingRound(nextRound)
        if (isPlayable(currentRound)) onNavRef.current('round')
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
      pollingRef.current = false
      if (!forcedMessageRef.current && mountedRef.current) {
        timeoutRef.current = window.setTimeout(pollActiveRound, ACTIVE_ROUND_POLL_MS)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (forcedMessageRef.current) {
      setLoading(false)
      return
    }
    pollActiveRound()
    return () => {
      mountedRef.current = false
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const waitingReason = useMemo(() => {
    if (forcedMessage) return forcedMessage

    if (!activeRound && !upcomingRound)
      return 'All timelines are currently collapsed. DECO is searching for a stable branch.'

    if (activeRound)
      return 'An active timeline is nearing collapse. Entry protocols are temporarily locked.'

    return 'A temporal rift has destabilized the simulation. DECO is reconstructing the next viable timeline.'
  }, [activeRound, upcomingRound, forcedMessage])

  const timerTarget = upcomingRound ? upcomingRound.startedAt : null

  if (loading) {
    return (
      <>
        <TimelineCrackTransition show={showCrackTransition} />
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <TimelineCrackTransition show={showCrackTransition} />

      <div className="relative w-full max-w-3xl rounded-[2rem] border border-[#2DFF9A]/20 bg-black/50 backdrop-blur-md shadow-[0_0_80px_rgba(45,255,154,0.08)] p-8 sm:p-12">

        {/* Header */}
        <div
          className="text-xs uppercase tracking-[0.5em] text-[#2DFF9A]/70 mb-4"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          TEMPORAL INSTABILITY
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          Timeline Desynchronised
        </h1>

        <p className="mt-5 text-slate-300 leading-7">
          {waitingReason}
        </p>

        {/* Timer Panel */}
        <div className="mt-8 rounded-[1.5rem] border border-[#2DFF9A]/20 bg-black/40 backdrop-blur-md p-6 sm:p-8">

          <div
            className="text-xs uppercase tracking-[0.4em] text-[#2DFF9A]/70 mb-3"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            NEXT STABLE TIMELINE
          </div>

          {timerTarget ? (
            <Timer
              targetTime={timerTarget}
              label="Wait for re-entry"
              accentClass="text-[#2DFF9A]"
            />
          ) : loading ? (
            <div className="flex items-center gap-3 text-slate-200">
              <Spinner />
              <span>Scanning timelines...</span>
            </div>
          ) : (
            <div className="text-slate-400">
              Awaiting timeline reconstruction...
            </div>
          )}
        </div>

        {error && <Alert type="error" className="mt-6">{error}</Alert>}

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={pollActiveRound}
            className="rounded-full border border-[#2DFF9A]/40 bg-black/60 px-6 py-3 text-sm text-[#2DFF9A] backdrop-blur-sm transition hover:bg-[#2DFF9A]/10"
            style={{
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: "0.15em",
              textShadow: "0 0 8px rgba(45,255,154,0.7)"
            }}
          >
            RESYNC
          </button>

          <button
            onClick={() => onNav('home')}
            className="rounded-full border border-white/20 bg-black/60 px-6 py-3 text-sm text-white/80 backdrop-blur-sm transition hover:bg-white/10"
            style={{
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: "0.15em"
            }}
          >
            RETURN
          </button>

        </div>
      </div>
    </div>
  )
}
