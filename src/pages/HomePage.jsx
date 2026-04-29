import { useAuth } from '@clerk/clerk-react'

export default function HomePage({ onNav, userRole }) {
  const { isSignedIn, signOut } = useAuth()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Hero background */}
      <img
        src="/backgrounds/home-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent h-32" />

      {/* ACM logo — top left */}
      <img
        src="/images/acm-logo.png"
        alt="ACM"
        className="absolute top-5 left-5 z-20 h-20 w-20 object-contain sm:h-28 sm:w-28 drop-shadow-lg"
      />

      {/* College logo — top right */}
      <img
        src="/images/college-logo.png"
        alt="College"
        className="absolute top-5 right-5 z-20 h-20 w-20 object-contain sm:h-28 sm:w-28 drop-shadow-lg"
      />

      {/* Auth controls — top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {userRole === 'ORGANIZER' && (
          <button
            onClick={() => onNav('admin')}
            className="rounded-full border border-[#2DFF9A]/40 bg-black/60 px-4 py-2 text-xs font-medium text-[#2DFF9A] backdrop-blur-sm transition hover:bg-[#2DFF9A]/10"
          >
            Admin
          </button>
        )}
        {isSignedIn ? (
          <button
            onClick={() => signOut()}
            className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/10"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => onNav('signin')}
            className="rounded-full border border-[#2DFF9A]/40 bg-black/60 px-4 py-2 text-xs font-medium text-[#2DFF9A] backdrop-blur-sm transition hover:bg-[#2DFF9A]/10"
          >
            Login
          </button>
        )}
      </div>

      {/* Deco Disaster logo — center, slightly above middle */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pb-32 sm:pb-40">
        <img
          src="/images/deco-logo.png"
          alt="Deco Disaster"
          className="w-[260px] sm:w-[380px] md:w-[480px] lg:w-[580px] object-contain animate-pulse-slow"
          style={{
            filter: 'drop-shadow(0 0 60px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 120px rgba(178, 133, 133, 0.2))',
          }}
        />
      </div>

      {/* Navigation buttons — bottom area, matching Figma layout */}
      <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 z-20">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 px-6 sm:px-4 sm:gap-5">
          <button
            onClick={() => onNav('round')}
            className="group relative w-full sm:w-auto overflow-hidden rounded-[116px] border-2 border-[#2DFF9A] bg-[#0B1F18] px-6 py-3 text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.05em] text-[#2DFF9A] transition-all duration-300 hover:bg-[#0f2e23] hover:-translate-y-0.5 sm:px-8 md:px-12 sm:py-4 md:py-5"
            style={{}}
          >
            Register Now
          </button>
          <button
            onClick={() => onNav('about')}
            className="group relative w-full sm:w-auto overflow-hidden rounded-[116px] border-2 border-[#2DFF9A] bg-[#0B1F18] px-6 py-3 text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.05em] text-[#2DFF9A] transition-all duration-300 hover:bg-[#0f2e23] hover:-translate-y-0.5 sm:px-8 md:px-12 sm:py-4 md:py-5"
            style={{}}
          >
            About
          </button>
          <button
            onClick={() => onNav('leaderboard')}
            className="group relative w-full sm:w-auto overflow-hidden rounded-[116px] border-2 border-[#2DFF9A] bg-[#0B1F18] px-6 py-3 text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.05em] text-[#2DFF9A] transition-all duration-300 hover:bg-[#0f2e23] hover:-translate-y-0.5 sm:px-8 md:px-12 sm:py-4 md:py-5"
            style={{}}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Powered by — bottom right */}
      <img
        src="/images/powered-by.png"
        alt="Powered by"
        className="absolute bottom-4 right-5 z-20 h-7 object-contain opacity-70"
      />
    </div>
  )
}
