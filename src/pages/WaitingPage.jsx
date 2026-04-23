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

  useEffect(() => {
    apiRef.current = api
  }, [api])

  useEffect(() => {
    onNavRef.current = onNav
  }, [onNav])

  useEffect(() => {
    forcedMessageRef.current = forcedMessage
  }, [forcedMessage])

  const pollActiveRound = useCallback(async () => {
    if (forcedMessageRef.current || pollingRef.current) {
      return
    }

    pollingRef.current = true

    try {
      const activeResult = await apiRef.current.get('/api/round/active').then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      )

      let activeRoundData = null
      let upcomingRoundData = null
      let errorMsg = null

      if (activeResult.status === 'fulfilled') {
        activeRoundData = activeResult.value
      } else {
        const err = activeResult.reason
        if (err?.status === 404) {
          const upcomingResult = await apiRef.current.get('/api/round/upcoming').then(
            (value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason }),
          )

          if (upcomingResult.status === 'fulfilled') {
            upcomingRoundData = upcomingResult.value
          } else if (upcomingResult.reason?.status !== 404) {
            errorMsg = upcomingResult.reason.message
          }
        } else {
          errorMsg = err.message
        }
      }

      if (mountedRef.current) {
        setActiveRound(activeRoundData)
        setUpcomingRound(activeRoundData ? null : upcomingRoundData)
        setError(errorMsg)

        if (isPlayable(activeRoundData)) {
          onNavRef.current('round')
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
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
    if (!activeRound) return 'No active round is currently available. This screen will keep checking for one.'
    return 'A round is active, but the join window is already inside the final five minutes, so new runs are paused.'
  }, [activeRound, forcedMessage])

  const timerTarget = !activeRound && upcomingRound ? upcomingRound.startedAt : activeRound ? activeRound.endsAt : null
  const timerLabel = !activeRound && upcomingRound ? 'Next round starts in' : activeRound ? 'Current round ends in' : 'Waiting'

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel>
        <div className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">Waiting</div>
        <h1 className="text-4xl font-semibold text-white">{appCopy.waiting.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{waitingReason}</p>
        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(15,23,42,0.85))] p-8">
          <div className="mb-4 text-sm text-slate-100">{appCopy.waiting.description}</div>
          {timerTarget ? (
            <Timer targetTime={timerTarget} label={timerLabel} accentClass="text-cyan-200" />
          ) : loading ? (
            <div className="flex items-center gap-3 text-slate-200">
              <Spinner />
              <span>Checking round availability…</span>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-sm leading-7 text-slate-300">
              {appCopy.waiting.note}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Btn onClick={pollActiveRound}>Refresh now</Btn>
          <Btn variant="secondary" onClick={() => onNav('home')}>
            Back home
          </Btn>
        </div>
      </Panel>

      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        <Panel>
          <div className="text-lg font-medium text-white">Polling strategy</div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            The waiting screen polls `GET /api/round/active` every {ACTIVE_ROUND_POLL_MS / 1000} seconds and automatically redirects to the round once a playable window is available.
          </p>
        </Panel>
        {activeRound && (
          <Panel>
            <div className="text-lg font-medium text-white">Current active round</div>
            <div className="mt-4 text-sm leading-7 text-slate-300">
              <div>Round #{activeRound.id}</div>
              <div>Started: {new Date(activeRound.startedAt).toLocaleString()}</div>
              <div>Ends: {new Date(activeRound.endsAt).toLocaleString()}</div>
            </div>
          </Panel>
        )}
        {!activeRound && upcomingRound && (
          <Panel>
            <div className="text-lg font-medium text-white">Next round</div>
            <div className="mt-4 text-sm leading-7 text-slate-300">
              <div>Round #{upcomingRound.id}</div>
              <div>Starts: {new Date(upcomingRound.startedAt).toLocaleString()}</div>
              <div>Ends: {new Date(upcomingRound.endsAt).toLocaleString()}</div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}
