import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center mb-8 fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Real-time quiz competition
        </div>
        <h1 className="text-5xl font-display font-700 text-white tracking-tight">
          Quiz<span className="text-orange-500">Arena</span>
        </h1>
        <p className="text-[#6b6b7a] mt-2 text-base">Sign in to compete and climb the leaderboard</p>
      </div>

      <div className="relative z-10 fade-up-1">
        <SignIn />
      </div>
    </div>
  )
}
