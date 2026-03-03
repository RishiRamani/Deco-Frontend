import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '../hooks/useApi'
import { StatusBadge, Btn, Spinner } from '../components/UI'

export default function HomePage({ onNav, userRole }) {
  const { user } = useUser()
  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/round/active')
      .then(setActiveRound)
      .catch(() => setActiveRound(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-10 fade-up">
      {/* Hero */}
      <div className="relative pt-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            Live Quiz Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-700 text-white leading-none tracking-tight">
            Quiz<span className="text-orange-500 glow-text">Arena</span>
          </h1>
          <p className="text-[#6b6b7a] text-lg max-w-md mx-auto">
            Compete in real-time quiz rounds. Answer fast, score big, climb the leaderboard.
          </p>
        </div>
      </div>

      {/* Active Round Banner */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : activeRound ? (
        <div className="card p-6 glow border-orange-500/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={activeRound.status} />
                <span className="text-xs text-[#6b6b7a] font-mono">Round #{activeRound.id}</span>
              </div>
              <h2 className="text-2xl font-display text-white mb-1">
                {activeRound.status === 'ACTIVE' ? 'A round is live right now!' : 'Round coming up'}
              </h2>
              <p className="text-[#6b6b7a] text-sm">
                {activeRound.timeLimit
                  ? `Time limit: ${Math.floor(activeRound.timeLimit / 60)}m ${activeRound.timeLimit % 60}s`
                  : 'No time limit'}
              </p>
            </div>
            {activeRound.status === 'ACTIVE' && (
              <Btn onClick={() => onNav('quiz')} size="lg">
                Join Now →
              </Btn>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">🕹️</div>
          <h2 className="text-xl font-display text-white mb-1">No active round</h2>
          <p className="text-[#6b6b7a] text-sm">Check back soon or watch the leaderboard</p>
        </div>
      )}

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: '🔄', title: 'Rounds', desc: 'View current and past rounds', page: 'round', color: 'blue' },
          { icon: '❓', title: 'Quiz', desc: 'Answer questions and score points', page: 'quiz', color: 'orange' },
          { icon: '🏆', title: 'Leaderboard', desc: 'See who\'s topping the charts', page: 'leaderboard', color: 'yellow' },
          ...(userRole === 'ORGANIZER' ? [{ icon: '🛠', title: 'Admin Panel', desc: 'Manage rounds and questions', page: 'admin', color: 'purple' }] : []),
        ].map(item => (
          <button
            key={item.page}
            onClick={() => onNav(item.page)}
            className="card p-5 text-left hover:border-orange-500/30 transition-all group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-display text-white font-600 mb-1 group-hover:text-orange-400 transition-colors">{item.title}</h3>
            <p className="text-[#6b6b7a] text-sm">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Welcome card */}
      <div className="card p-5 flex items-center gap-4">
        {user?.imageUrl && <img src={user.imageUrl} className="w-10 h-10 rounded-full ring-2 ring-orange-500/30" alt="" />}
        <div>
          <div className="text-white font-medium">Welcome back, {user?.firstName || user?.username || 'Contestant'}</div>
          <div className="text-[#6b6b7a] text-sm">{user?.primaryEmailAddress?.emailAddress}</div>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2 py-1 rounded-full border ${
            userRole === 'ORGANIZER'
              ? 'text-purple-400 border-purple-500/30 bg-purple-500/10'
              : 'text-sky-400 border-sky-500/30 bg-sky-500/10'
          }`}>
            {userRole || '...'}
          </span>
        </div>
      </div>
    </div>
  )
}
