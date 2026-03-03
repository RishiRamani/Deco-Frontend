import { UserButton, useUser } from '@clerk/clerk-react'

export default function Layout({ children, page, onNav, userRole }) {
  const { user } = useUser()

  const navItems = [
    { id: 'home', label: 'Home', icon: '⚡' },
    { id: 'round', label: 'Round', icon: '🔄' },
    { id: 'quiz', label: 'Quiz', icon: '❓' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    ...(userRole === 'ORGANIZER' ? [{ id: 'admin', label: 'Admin', icon: '🛠' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[#222228] bg-[#0a0a0d]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-sm font-bold text-black">Q</div>
            <span className="font-display font-600 text-white tracking-tight">QuizArena</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  page === item.id
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-[#6b6b7a] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {userRole && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${
                userRole === 'ORGANIZER'
                  ? 'text-purple-400 border-purple-500/30 bg-purple-500/10'
                  : 'text-sky-400 border-sky-500/30 bg-sky-500/10'
              }`}>
                {userRole}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex border-t border-[#222228] overflow-x-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`flex-1 min-w-0 py-2.5 text-xs font-medium transition-all whitespace-nowrap px-1 ${
                page === item.id ? 'text-orange-400 border-b-2 border-orange-500' : 'text-[#6b6b7a]'
              }`}
            >
              <div>{item.icon}</div>
              <div>{item.label}</div>
            </button>
          ))}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
