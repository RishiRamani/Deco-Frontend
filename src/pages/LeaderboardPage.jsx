import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '../hooks/useApi'
import { Alert, Btn, Panel, Spinner } from '../components/UI'

function formatTime(totalSeconds) {
  const safe = Number(totalSeconds || 0)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export default function LeaderboardPage() {
  const api = useApi()
  const { user } = useUser()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const result = await api.get('/api/leaderboard')
      setEntries(result?.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setEntries([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const myEmail = user?.primaryEmailAddress?.emailAddress
  const me = useMemo(() => entries.find((entry) => entry.email === myEmail), [entries, myEmail])
  const topThree = entries.slice(0, 3)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-[#2DFF9A]/80">Leaderboard</div>

          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-white">Cumulative standings</h1>

        </div>
        <Btn variant="secondary" loading={refreshing} onClick={() => load(true)}>
          Refresh
        </Btn>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {me && (
        <Panel className="bg-[#2DFF9A]/10">
          <div className="text-xs uppercase tracking-[0.3em] text-[#2DFF9A]/80">You</div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-white">#{me.rank}</div>
              <div className="mt-1 text-sm text-slate-300">{me.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 text-sm text-slate-200">
              <div>
                <div className="text-slate-400">Points</div>
                <div className="mt-1 text-lg sm:text-xl font-semibold text-white">{me.totalPoints}</div>
              </div>
              <div>
                <div className="text-slate-400">Time</div>
                <div className="mt-1 text-lg sm:text-xl font-semibold text-white">{formatTime(me.totalTime)}</div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {topThree.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {topThree.map((entry) => (
            <Panel key={entry.userId} className="bg-white/6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#2DFF9A]/80">Rank {entry.rank}</div>
              <div className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold text-white">{entry.name}</div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400 truncate">{entry.email}</div>
              <div className="mt-4 sm:mt-6 flex items-end justify-between">
                <div>
                  <div className="text-xs text-slate-400">Points</div>
                  <div className="mt-1 text-2xl sm:text-3xl font-semibold text-[#2DFF9A]">{entry.totalPoints}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Time</div>
                  <div className="mt-1 text-base sm:text-lg font-medium text-white">{formatTime(entry.totalTime)}</div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Mobile: simple list. Desktop: full grid table */}
      <Panel className="overflow-hidden p-0">
        {/* Desktop table header */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_100px_100px] md:grid-cols-[90px_1fr_120px_120px] gap-4 border-b border-[#2DFF9A]/10 px-4 sm:px-6 py-3 sm:py-4 text-xs uppercase tracking-[0.3em] text-slate-400">
          <div>Rank</div>
          <div>Participant</div>
          <div className="text-right">Time</div>
          <div className="text-right">Points</div>
        </div>
        {entries.length === 0 ? (
          <div className="px-4 sm:px-6 py-10 text-sm text-slate-300">No cumulative results are available yet.</div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.userId}
              className={`border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 text-sm last:border-b-0 ${
                entry.email === myEmail ? 'bg-[#2DFF9A]/8' : ''
              }`}
            >
              {/* Mobile layout */}
              <div className="flex sm:hidden items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white text-base">#{entry.rank}</span>
                  <div>
                    <div className="font-medium text-white">{entry.name}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[180px]">{entry.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#2DFF9A]">{entry.totalPoints} pts</div>
                  <div className="text-xs text-slate-400">{formatTime(entry.totalTime)}</div>
                </div>
              </div>
              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[60px_1fr_100px_100px] md:grid-cols-[90px_1fr_120px_120px] gap-4">
                <div className="font-semibold text-white">#{entry.rank}</div>
                <div>
                  <div className="font-medium text-white">{entry.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{entry.email}</div>
                </div>
                <div className="text-right text-slate-200">{formatTime(entry.totalTime)}</div>
                <div className="text-right font-semibold text-[#2DFF9A]">{entry.totalPoints}</div>
              </div>
            </div>
          ))
        )}
      </Panel>
    </div>

    <div className="mt-8 sm:mt-12 text-center">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Credits</h2>
      <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
        Deco Disaster 6.0 — Doomsday Protocol. Built by ACM.
      </p>
    </div>
    </>
  )
}
