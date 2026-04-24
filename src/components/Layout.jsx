import { UserButton } from '@clerk/clerk-react'
import { Btn } from './UI'

export default function Layout({ children, page, onNav, userRole }) {
  return (
    <div className="min-h-screen text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_left,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_40%,#020617_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />

      {page !== 'round' && (
        <div className="fixed top-4 left-4 z-50">
          <Btn variant="secondary" onClick={() => onNav('home')}>
            Home
          </Btn>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
