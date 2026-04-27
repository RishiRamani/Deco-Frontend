import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApi } from '../hooks/useApi'
import Timer from '../components/Timer'
import { ACTIVE_ROUND_POLL_MS, ROUND_JOIN_BUFFER_MS, appCopy } from '../config/experience'
import { Alert, Btn, Panel, Spinner } from '../components/UI'

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
      const roundInfoResult = await apiRef.current.get('/api/round/info').then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      )

      let currentRound = null
      let nextRound = null
      let errorMsg = null

      if (roundInfoResult.status === 'fulfilled') {
        const info = roundInfoResult.value
        currentRound = info?.current || null
        nextRound = info?.next || null
      } else {
        const activeResult = await apiRef.current.get('/api/round/active').then(
          (value) => ({ status: 'fulfilled', value }),
          (reason) => ({ status: 'rejected', reason }),
        )
        if (activeResult.status === 'fulfilled') {
          currentRound = activeResult.value
        } else {
          const err = activeResult.reason
          if (err?.status === 404) {
            const upcomingResult = await apiRef.current.get('/api/round/upcoming').then(
              (value) => ({ status: 'fulfilled', value }),
              (reason) => ({ status: 'rejected', reason }),
            )
            if (upcomingResult.status === 'fulfilled') nextRound = upcomingResult.value
            else if (upcomingResult.reason?.status !== 404) errorMsg = upcomingResult.reason.message
          } else {
            errorMsg = err.message
          }
        }
      }

      if (mountedRef.current) {
        setActiveRound(currentRound)
        setUpcomingRound(nextRound)
        setError(errorMsg)
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
    if (forcedMessageRef.current) { setLoading(false); return }
    pollActiveRound()
    return () => { mountedRef.current = false; window.clearTimeout(timeoutRef.current) }
  }, [])

  const waitingReason = useMemo(() => {
    if (forcedMessage) return forcedMessage
    if (!activeRound && !upcomingRound) return 'No active or upcoming rounds available. This screen will keep checking for one.'
    if (activeRound) return 'A round is active, but the join window is already inside the final five minutes, so new runs are paused.'
    return 'No active round available. Waiting for the next round to start.'
  }, [activeRound, upcomingRound, forcedMessage])

  const timerTarget = upcomingRound ? upcomingRound.startedAt : null
  const timerLabel = upcomingRound ? 'Next round starts in' : 'Waiting'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-16">
      <Panel className="max-w-3xl w-full fade-up">
        <div className="mb-3 text-xs uppercase tracking-[0.35em] text-[#2DFF9A]/80">Waiting</div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">{appCopy.waiting.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{waitingReason}</p>

        <div className="mt-6 overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] border border-[#2DFF9A]/10 bg-[linear-gradient(135deg,rgba(45,255,154,0.08),rgba(11,31,24,0.85))] p-5 sm:p-8">
          <div className="mb-4 text-sm text-slate-100">{appCopy.waiting.description}</div>
          {timerTarget ? (
            <Timer targetTime={timerTarget} label={timerLabel} accentClass="text-[#2DFF9A]" />
          ) : loading ? (
            <div className="flex items-center gap-3 text-slate-200">
              <Spinner />
              <span>Checking round availability...</span>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-[#2DFF9A]/15 bg-[#0B1F18]/30 p-4 sm:p-5 text-sm leading-7 text-slate-300">
              {appCopy.waiting.note}
            </div>
          )}
        </div>

        {error && <Alert type="error" className="mt-6">{error}</Alert>}

        <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Btn onClick={pollActiveRound}>Refresh now</Btn>
          <Btn variant="secondary" onClick={() => onNav('home')}>Back home</Btn>
        </div>
      </Panel>
    </div>
  )
}
