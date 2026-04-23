import { UserButton } from '@clerk/clerk-react'
import { appCopy } from '../config/experience'

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'registration', label: 'Registration' },
  { id: 'leaderboard', label: 'Leaderboard' },
]

export default function Layout({ children, page, onNav, userRole }) {
  const isActive = (id) => page === id

  return (
    <div className="min-h-screen text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_left,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_40%,#020617_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button className="flex items-center gap-3 text-left" onClick={() => onNav('home')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-black text-slate-950">
              {appCopy.brand.mark}
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-white">{appCopy.brand.name}</div>
              <div className="text-xs text-slate-400">{appCopy.brand.tagline}</div>
            </div>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive(item.id)
                    ? 'bg-white text-slate-950'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onNav('round')}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Start
            </button>
            {userRole === 'ORGANIZER' && (
              <button
                onClick={() => onNav('admin')}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive('admin')
                    ? 'bg-cyan-300 text-slate-950'
                    : 'bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {userRole && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
                {userRole}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
          {[...navItems, { id: 'round', label: 'Start' }].map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                isActive(item.id)
                  ? 'bg-white text-slate-950'
                  : item.id === 'round'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/5 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
