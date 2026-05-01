import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '../hooks/useApi'
import { Alert, Spinner } from '../components/UI'

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

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="relative px-4 sm:px-8">

      {/* 🌌 Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_10%,rgba(45,255,154,0.08),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(255,0,0,0.08),transparent_40%),#000]" />

      {/* HEADER */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <div
            className="text-xl sm:text-2xl font-bold tracking-[0.45em] text-[#2DFF9A]"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            LEADERBOARD
          </div>

          <div className="mt-1 text-sm text-slate-400 tracking-wide">
            cumulative standings
          </div>
        </div>

        {/* ✅ FIXED BUTTON (matches your theme now) */}
        <button
          onClick={() => load(true)}
          className="rounded-full border border-[#2DFF9A]/40 bg-black/60 px-5 py-2 text-sm text-[#2DFF9A] backdrop-blur-sm transition hover:bg-[#2DFF9A]/10"
          style={{
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: "0.15em",
            textShadow: "0 0 8px rgba(45,255,154,0.7)"
          }}
        >
          {refreshing ? "..." : "REFRESH"}
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* 🔥 MAIN PANEL */}
      <div className="rounded-[2rem] border border-[#2DFF9A]/20 bg-black/50 backdrop-blur-md shadow-[0_0_80px_rgba(45,255,154,0.08)] overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-[80px_1fr_120px_120px] px-6 py-5 text-xs uppercase tracking-[0.35em] text-[#2DFF9A]/70 border-b border-[#2DFF9A]/10">
          <div>Rank</div>
          <div>Participant</div>
          <div className="text-right">Time</div>
          <div className="text-right">Points</div>
        </div>

        {entries.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-lg">
            No cumulative results available.
          </div>
        ) : (
          entries.map((entry) => {
            const isTop1 = entry.rank === 1
            const isTop2 = entry.rank === 2
            const isTop3 = entry.rank === 3

            return (
              <div
                key={entry.userId}
                className={`grid grid-cols-[80px_1fr_120px_120px] px-6 py-5 items-center border-b border-white/5 transition-all duration-200 hover:bg-[#2DFF9A]/5 ${
                  entry.email === myEmail ? 'bg-[#2DFF9A]/10' : ''
                }`}
              >
                {/* 🔥 RANK (special styling for top 3) */}
                <div
                  className={`text-xl font-bold ${
                    isTop1
                      ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                      : isTop2
                      ? 'text-slate-300'
                      : isTop3
                      ? 'text-orange-400'
                      : 'text-white'
                  }`}
                >
                  #{entry.rank}
                </div>

                {/* ✅ NAME ONLY (email removed) */}
                <div className="text-white font-medium text-lg">
                  {entry.name}
                </div>

                {/* TIME */}
                <div className="text-right text-slate-300">
                  {formatTime(entry.totalTime)}
                </div>

                {/* POINTS */}
                <div
                  className={`text-right text-2xl font-bold ${
                    isTop1
                      ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                      : 'text-[#2DFF9A] drop-shadow-[0_0_10px_rgba(45,255,154,0.6)]'
                  }`}
                >
                  {entry.totalPoints}
                </div>
              </div>
            )
          })
        )}
      </div>


      <div className="mt-40 text-center">

        {/* Label — now dominant */}
        <div
          className="text-sm sm:text-base uppercase tracking-[0.6em] text-[#2DFF9A] mb-4 drop-shadow-[0_0_10px_rgba(45,255,154,0.6)]"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          CREDITS
        </div>

        {/* Title — toned down */}
        <h2 className="text-xl sm:text-2xl font-medium text-slate-300 mb-12 tracking-wide">
          Built by ACM Web Team
        </h2>

        {/* Names */}
        <div className="max-w-md mx-auto space-y-5">

          {[
            "Placeholder Name",
            "Placeholder Name",
            "Placeholder Name",
          ].map((name) => (
            <div
              key={name}
              className="group relative text-slate-400 transition-all duration-300 hover:text-[#2DFF9A]"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {/* Glow line on hover */}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-px w-0 bg-[#2DFF9A] transition-all duration-300 group-hover:w-24" />

              {/* Name */}
              <span className="tracking-wide group-hover:tracking-[0.12em] transition-all">
                {name}
              </span>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="mt-14 text-xs text-slate-500 tracking-wide">
          Deco Disaster 6.0 — Doomsday Protocol
        </div>

      </div>

    </div>
  )
}