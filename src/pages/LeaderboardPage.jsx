import { useEffect, useState } from 'react'
import { useUser } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { Alert, Spinner } from '../components/UI'
import Timer from '../components/Timer'

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
  const [infoMessage, setInfoMessage] = useState(null)
  const [availableAt, setAvailableAt] = useState(null)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const result = await api.get('/api/leaderboard')
      setEntries(result?.data || [])
      setInfoMessage(result?.message || null)
      setAvailableAt(result?.availableAt ? new Date(result.availableAt) : null)
      setError(null)
    } catch (err) {
      setError(err.message)
      setEntries([])
      setInfoMessage(null)
      setAvailableAt(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const myEmail = user?.primaryEmailAddress?.emailAddress

  // ✅ UPDATED: credits with optional URLs
  const credits = [
    { name: "Placeholder Name", url: "" },
    { name: "Placeholder Name", url: "https://example.com" },
    { name: "Placeholder Name" }
  ]

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
            {availableAt ? (
              <div className="py-10 flex justify-center">

                <div className="relative w-full max-w-lg rounded-xl border border-[#2DFF9A]/20 bg-black/60 backdrop-blur-md px-6 py-6 shadow-[0_0_40px_rgba(45,255,154,0.08)]">

                  {/* subtle glow */}
                  <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle,rgba(45,255,154,0.12),transparent_70%)] opacity-40" />

                  {/* HEADER */}
                  <div
                    className="text-xs tracking-[0.5em] text-[#2DFF9A]/70 mb-4 text-center"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    ACCESS RESTRICTED
                  </div>

                  {/* LORE TEXT (bigger + readable) */}
                  <div className="text-sm sm:text-base text-slate-300 leading-relaxed text-center max-w-md mx-auto">
                    Temporal records remain sealed. Synchronization with the central timeline is incomplete —
                    premature access may destabilize recorded outcomes.
                  </div>

                  {/* 🔥 TIMER ROW (FIXED ALIGNMENT) */}
                  <div className="mt-6 flex items-center justify-center gap-6">

                    {/* label */}
                    <div className="text-xs tracking-[0.3em] text-slate-400">
                      UNLOCK IN
                    </div>

                    {/* timer box */}
                    <div className="px-5 py-2 rounded-lg bg-[#2DFF9A]/10 border border-[#2DFF9A]/30 shadow-[0_0_20px_rgba(45,255,154,0.25)]">
                      <div
                        className="text-xl sm:text-2xl font-semibold text-[#2DFF9A]"
                        style={{ fontFamily: "monospace" }}   // 👈 different font
                      >
                        <Timer targetTime={availableAt} label="" />
                      </div>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="mt-5 text-[10px] text-slate-500 tracking-[0.25em] text-center">
                    [ TIMELINE STABILIZATION IN PROGRESS ]
                  </div>

                </div>
              </div>
            ) : (
              <div>
                {infoMessage || 'No cumulative results available.'}
              </div>
            )}
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

                <div className="text-white font-medium text-lg">
                  {entry.name}
                </div>

                <div className="text-right text-slate-300">
                  {formatTime(entry.totalTime)}
                </div>

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

      {/* ✅ CREDITS */}
      <div className="mt-40 text-center">

        <div
          className="text-sm sm:text-base uppercase tracking-[0.6em] text-[#2DFF9A] mb-4 drop-shadow-[0_0_10px_rgba(45,255,154,0.6)]"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          CREDITS
        </div>

        <h2 className="text-xl sm:text-2xl font-medium text-slate-300 mb-12 tracking-wide">
          Built by ACM Web Team
        </h2>

        <div className="max-w-md mx-auto space-y-5">

          {credits.map((person, index) => {
            const hasLink = person.url && person.url.trim() !== ""

            return (
              <div
                key={`${person.name}-${index}`}
                onClick={() => {
                  if (hasLink) {
                    window.open(person.url, "_blank")
                  }
                }}
                className={`group relative text-slate-400 transition-all duration-300 hover:text-[#2DFF9A] ${
                  hasLink ? "cursor-pointer" : "cursor-default"
                }`}
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-px w-0 bg-[#2DFF9A] transition-all duration-300 group-hover:w-24" />

                <span className="tracking-wide group-hover:tracking-[0.12em] transition-all">
                  {person.name}
                </span>
              </div>
            )
          })}

        </div>

        <div className="mt-14 text-xs text-slate-500 tracking-wide">
          Deco Disaster 6.0 — Doomsday Protocol
        </div>

      </div>

    </div>
  )
}