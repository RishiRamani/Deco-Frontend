import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { Btn, Alert, Spinner } from '../components/UI'
import Timer from '../components/Timer'

export default function RoundPage({ onNav }) {
  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startedAt, setStartedAt] = useState(null)
  const [roundState, setRoundState] = useState('idle') // idle | started | finished
  const [userStatus, setUserStatus] = useState({ started: false, finished: false })
  const [msg, setMsg] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchActive = async () => {
    try {
      const r = await api.get('/api/round/active')
      setActiveRound(r)
      if (r) {
        // fetch user-specific status for this round
        try {
          const status = await api.get(`/api/round/status/${r.id}`)
          setUserStatus(status)
          if (status.started && !status.finished) {
            setRoundState('started')
          }
          if (status.finished) {
            setRoundState('finished')
          }
        } catch {
          // ignore status errors
        }
      }
    } catch {
      setActiveRound(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActive()
  }, [])

  const startRound = async () => {
    if (!activeRound) return
    setActionLoading(true)
    try {
      await api.post(`/api/round/${activeRound.id}/start`)
      setStartedAt(new Date().toISOString())
      setRoundState('started')
      setUserStatus({ started: true, finished: false })
      setMsg({ type: 'success', text: 'Round started! Go answer the questions.' })
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
      console.log(e);
    } finally {
      setActionLoading(false)
    }
  }

  const finishRound = async () => {
    if (!activeRound) return
    setActionLoading(true)
    try {
      await api.post(`/api/round/${activeRound.id}/finish`)
      setRoundState('finished')
      setMsg({ type: 'success', text: 'Round finished! Check the leaderboard.' })
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-up max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-display text-white mb-1">Round</h1>
        <p className="text-[#6b6b7a]">
          Join the active quiz round and compete for points.
        </p>
      </div>

      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {!activeRound ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">🕰️</div>
          <h2 className="text-xl font-display text-white mb-2">
            No active round right now
          </h2>
          <p className="text-[#6b6b7a] text-sm">
            The organizer hasn't started a round yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Round card */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-display text-white">
                  Round #{activeRound.id}
                </h2>
                <p className="text-[#6b6b7a] text-sm mt-1">
                  {activeRound.timeLimit
                    ? `Time limit: ${Math.floor(activeRound.timeLimit / 60)}m ${
                        activeRound.timeLimit % 60
                          ? `${activeRound.timeLimit % 60}s`
                          : ''
                      }`
                    : 'No time limit'}
                </p>
              </div>

              {roundState === 'started' &&
                startedAt &&
                activeRound.timeLimit && (
                  <Timer
                    startedAt={startedAt}
                    timeLimit={activeRound.timeLimit}
                    onExpire={finishRound}
                  />
                )}
            </div>

            {/* Status flow */}
            {roundState === 'idle' ? (
              <div className="space-y-4">
                <p className="text-[#6b6b7a] text-sm">
                  The round is live! Click below to start your timer and begin answering questions.
                </p>
                <Btn onClick={startRound} loading={actionLoading} size="lg">
                  🚀 Start Round
                </Btn>
              </div>
            ) : roundState === 'started' ? (
              <div className="space-y-4">
                <Alert type="success">
                  You're in! Answer the questions and come back to finish.
                </Alert>
                <div className="flex gap-3 flex-wrap">
                  <Btn onClick={() => onNav('quiz')}>
                    📝 Go to Questions →
                  </Btn>
                  <Btn
                    variant="secondary"
                    onClick={finishRound}
                    loading={actionLoading}
                  >
                    🏁 Finish Round
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert type="success">
                  You've finished this round! Your score has been calculated.
                </Alert>
                <Btn onClick={() => onNav('leaderboard')}>
                  🏆 View Leaderboard →
                </Btn>
              </div>
            )}
          </div>

          {/* Round steps visual */}
          <div className="card p-5">
            <h3 className="font-display text-white mb-4 text-sm font-600 uppercase tracking-widest text-[#6b6b7a]">
              How it works
            </h3>
            <div className="space-y-3">
              {[
                { step: '01', label: 'Start the round', done: roundState !== 'idle' },
                { step: '02', label: 'Answer all questions', done: roundState === 'finished' },
                { step: '03', label: 'Finish round to lock your score', done: roundState === 'finished' },
                { step: '04', label: 'Check leaderboard for your rank', done: false },
              ].map(item => (
                <div
                  key={item.step}
                  className={`flex items-center gap-3 ${
                    item.done ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? 'bg-green-500 text-black'
                        : 'bg-white/5 text-[#6b6b7a] border border-white/10'
                    }`}
                  >
                    {item.done ? '✓' : item.step}
                  </div>
                  <span
                    className={`text-sm ${
                      item.done
                        ? 'text-white line-through opacity-60'
                        : 'text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}