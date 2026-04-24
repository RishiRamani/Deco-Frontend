import { useAuth } from '@clerk/clerk-react'
import { Btn } from '../components/UI'

export default function HomePage({ onNav, userRole }) {
  const { isSignedIn, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-display font-700 text-white tracking-tight mb-8">
          Deco<span className="text-orange-500">Disaster</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-4">
          <Btn onClick={() => onNav('round')}>Start</Btn>
          <Btn variant="secondary" onClick={() => onNav('about')}>About</Btn>
          <Btn variant="secondary" onClick={() => onNav('registration')}>Registration</Btn>
          <Btn variant="secondary" onClick={() => onNav('leaderboard')}>Leaderboard</Btn>
          {userRole === 'ORGANIZER' && (
            <Btn variant="secondary" onClick={() => onNav('admin')}>Admin</Btn>
          )}
          {isSignedIn ? (
            <Btn variant="secondary" onClick={() => signOut()}>Sign Out</Btn>
          ) : (
            <Btn variant="secondary" onClick={() => onNav('signin')}>Login</Btn>
          )}
        </div>
      </div>
    </div>
  )
}
