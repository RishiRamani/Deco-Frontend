import { Btn } from './UI'

export default function Layout({ children, page, onNav, userRole }) {
  const isRound = page === 'round'
  const isHome = page === 'home'

  return (
    <div className="min-h-screen text-slate-100">
      {!isRound && !isHome && (
        <>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(45,255,154,0.08),transparent_24%),radial-gradient(circle_at_left,rgba(45,255,154,0.05),transparent_28%),linear-gradient(180deg,#000000_0%,#0B1F18_40%,#000000_100%)]" />
          <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(45,255,154,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,255,154,0.02)_1px,transparent_1px)] bg-[size:24px_24px] sm:bg-[size:36px_36px] opacity-20" />
        </>
      )}

      {!isRound && !isHome && (
        <div className="fixed top-4 left-4 z-50">
          <Btn variant="secondary" onClick={() => onNav('home')}>
            Home
          </Btn>
        </div>
      )}

      <main className={isHome ? '' : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6'}>
        {children}
      </main>
    </div>
  )
}
