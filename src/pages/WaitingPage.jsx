import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import Timer from '../components/Timer'
import { ACTIVE_ROUND_POLL_MS, ROUND_JOIN_BUFFER_MS } from '../config/experience'
import { Alert, Spinner } from '../components/UI'

function isPlayable(round) {
  if (!round) return false
  return Date.now() < new Date(round.endsAt).getTime() - ROUND_JOIN_BUFFER_MS
}

export default function WaitingPage({ onNav, forcedMessage }) {
  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [upcomingRound, setUpcomingRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const apiRef = useRef(api)
  const onNavRef = useRef(onNav)
  const forcedMessageRef = useRef(forcedMessage)
  const pollingRef = useRef(false)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => { apiRef.current = api }, [api])
  useEffect(() => { onNavRef.current = onNav }, [onNav])
  useEffect(() => { forcedMessageRef.current = forcedMessage }, [forcedMessage])

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
        if (currentRound?._id) {
          onNavRef.current('round')
        }
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

  return (
    <>
      {loading ? (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
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
      )}
    </>
  )
}
