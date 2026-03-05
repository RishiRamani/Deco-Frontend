import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '../hooks/useApi'
import { Spinner, Alert, Btn } from '../components/UI'

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="w-8 h-8 rounded-full rank-1 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
  if (rank === 2) return <span className="w-8 h-8 rounded-full rank-2 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
  if (rank === 3) return <span className="w-8 h-8 rounded-full rank-3 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
  return <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-mono text-[#6b6b7a] flex-shrink-0">{rank}</span>
}

export default function LeaderboardPage() {
  const { user } = useUser()
  const api = useApi()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await api.get('/api/leaderboard')
      setData(res?.data || res || [])
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchLeaderboard() }, [])

  const myEntry = data.find(d => d.email === user?.primaryEmailAddress?.emailAddress)
  const top3 = data.slice(0, 3)
  const rest = data.slice(3)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 fade-up max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display text-white">Leaderboard</h1>
          <p className="text-[#6b6b7a] text-sm mt-1">Final rankings — higher score & lower time wins</p>
        </div>
        <Btn variant="secondary" onClick={() => fetchLeaderboard(true)} loading={refreshing} size="sm">
          ↺ Refresh
        </Btn>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* My rank card */}
      {myEntry && (
        <div className="card p-4 border-orange-500/20">
          <div className="text-xs text-[#6b6b7a] mb-2 font-medium uppercase tracking-widest">Your rank</div>
          <div className="flex items-center gap-4">
            <RankBadge rank={myEntry.rank} />
            <div className="flex-1">
              <div className="text-white font-medium">{myEntry.name}</div>
              <div className="text-[#6b6b7a] text-sm">{myEntry.email}</div>
            </div>
            <div className="text-right">
              <div className="text-orange-400 text-xl font-display font-bold">{myEntry.totalPoints}</div>
              <div className="text-xs text-[#6b6b7a]">{formatTime(myEntry.totalTime)}</div>
            </div>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-xl font-display text-white mb-2">No results yet</h2>
          <p className="text-[#6b6b7a] text-sm">Leaderboard shows after rounds are completed</p>
        </div>
      ) : (
        <>
          {/* Podium top 3 */}
          {top3.length >= 2 && (
            <div className="flex items-end justify-center gap-3 py-4">
              {/* 2nd */}
              {top3[1] && (
                <div className="flex flex-col items-center gap-2 w-28">
                  <img src={top3[1].avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${top3[1].name}`}
                    className="w-12 h-12 rounded-full ring-2 ring-[#c0c0c0]/40" alt="" />
                  <div className="text-center">
                    <div className="text-xs text-white font-medium truncate w-full">{top3[1].name.split(' ')[0]}</div>
                    <div className="font-mono text-[#c0c0c0] font-bold">{top3[1].totalPoints}</div>
                  </div>
                  <div className="w-full h-16 rank-2 rounded-t-lg flex items-center justify-center text-2xl font-bold text-black">2</div>
                </div>
              )}
              {/* 1st */}
              {top3[0] && (
                <div className="flex flex-col items-center gap-2 w-32">
                  <div className="text-2xl">👑</div>
                  <img src={top3[0].avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${top3[0].name}`}
                    className="w-16 h-16 rounded-full ring-4 ring-yellow-400/60" alt="" />
                  <div className="text-center">
                    <div className="text-sm text-white font-medium truncate w-full">{top3[0].name.split(' ')[0]}</div>
                    <div className="font-mono text-yellow-400 font-bold text-lg">{top3[0].totalPoints}</div>
                  </div>
                  <div className="w-full h-24 rank-1 rounded-t-lg flex items-center justify-center text-3xl font-bold text-black">1</div>
                </div>
              )}
              {/* 3rd */}
              {top3[2] && (
                <div className="flex flex-col items-center gap-2 w-28">
                  <img src={top3[2].avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${top3[2].name}`}
                    className="w-12 h-12 rounded-full ring-2 ring-[#cd7f32]/40" alt="" />
                  <div className="text-center">
                    <div className="text-xs text-white font-medium truncate w-full">{top3[2].name.split(' ')[0]}</div>
                    <div className="font-mono text-[#cd7f32] font-bold">{top3[2].totalPoints}</div>
                  </div>
                  <div className="w-full h-10 rank-3 rounded-t-lg flex items-center justify-center text-2xl font-bold">3</div>
                </div>
              )}
            </div>
          )}

          {/* Full table */}
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 text-xs text-[#6b6b7a] font-medium uppercase tracking-widest px-4 py-3 border-b border-[#222228]">
              <span className="w-10">#</span>
              <span>Participant</span>
              <span className="text-right pr-4">Time</span>
              <span className="text-right">Points</span>
            </div>
            {data.map((entry, i) => {
              const isMe = entry.email === user?.primaryEmailAddress?.emailAddress
              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-[auto_1fr_auto_auto] gap-0 items-center px-4 py-3 border-b border-[#222228] last:border-0 transition-colors ${
                    isMe ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : 'hover:bg-white/2'
                  }`}
                >
                  <div className="w-10"><RankBadge rank={entry.rank} /></div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={entry.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}&backgroundColor=1e1e24`}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      alt=""
                    />
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${isMe ? 'text-orange-400' : 'text-white'}`}>
                        {entry.name} {isMe && <span className="text-xs">(you)</span>}
                      </div>
                      <div className="text-xs text-[#6b6b7a] truncate">{entry.email}</div>
                    </div>
                  </div>
                  <div className="font-mono text-sm text-[#6b6b7a] text-right pr-4">{formatTime(entry.totalTime)}</div>
                  <div className={`font-display text-lg font-bold text-right ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-[#c0c0c0]' : entry.rank === 3 ? 'text-[#cd7f32]' : 'text-white'}`}>
                    {entry.totalPoints}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-xs text-[#6b6b7a]">
            Ranking: higher points → lower time → tie = same rank
          </p>
        </>
      )}
    </div>
  )
}
