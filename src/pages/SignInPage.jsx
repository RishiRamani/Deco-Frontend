import { SignIn } from '@clerk/clerk-react'

export default function SignInPage({ authError, authSynced }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-[#2DFF9A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-[#2DFF9A]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center mb-6 sm:mb-8 fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2DFF9A]/30 bg-[#2DFF9A]/10 text-[#2DFF9A] text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 bg-[#2DFF9A] rounded-full animate-pulse" />
          Real-time quiz competition
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
          Deco<span className="text-[#2DFF9A]">Disaster</span>
        </h1>
        <p className="text-[#6b6b7a] mt-2 text-sm sm:text-base">Sign in to DecoDisaster</p>
      </div>

      <div className="relative z-10 fade-up-1 w-full max-w-md">
        <SignIn routing="path" path="/signin" fallbackRedirectUrl="/" />
        {authError && (
          <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {authError}
          </div>
        )}
        {authSynced && (
          <div className="mt-4 rounded-2xl border border-[#2DFF9A]/25 bg-[#2DFF9A]/10 px-4 py-3 text-sm text-[#2DFF9A]">
            Account synced. Redirecting...
          </div>
        )}
      </div>
    </div>
  )
}
