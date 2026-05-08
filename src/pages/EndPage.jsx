export default function EndPage({ onNav }) {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden landscape:overflow-y-auto bg-black text-center flex flex-col items-center justify-center px-4 sm:px-6 landscape:py-8">

      {/* 🌌 FULL BACKGROUND (stronger + fills screen) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(45,255,154,0.12),transparent_45%),#000]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.08] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Edge glow (fixes “boxed” feel) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,255,154,0.08),transparent_60%),radial-gradient(circle_at_50%_100%,rgba(255,0,0,0.06),transparent_60%)]" />

      {/* ✨ floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-1 h-1 bg-[#2DFF9A] rounded-full top-1/4 left-1/3 animate-pulse" />
        <div className="absolute w-1 h-1 bg-red-400 rounded-full top-2/3 left-2/3 animate-pulse" />
        <div className="absolute w-1 h-1 bg-[#2DFF9A] rounded-full top-1/2 left-1/5 animate-pulse" />
      </div>

      {/* 🔥 CONTENT — widened */}
      <div className="w-full max-w-5xl landscape:max-w-3xl">

        {/* TITLE */}
        <h1
          className="text-5xl sm:text-7xl landscape:text-5xl md:text-8xl font-bold text-[#2DFF9A] drop-shadow-[0_0_40px_rgba(45,255,154,0.7)]"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          TIMELINE
          <br />
          COLLAPSED
        </h1>

        {/* Secondary */}
        <div
          className="mt-5 landscape:mt-3 text-2xl sm:text-3xl landscape:text-xl text-white/90 tracking-wide"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          DECO REMAINS
        </div>

        {/* Divider */}
        <div className="mx-auto mt-8 landscape:mt-5 h-px w-48 bg-gradient-to-r from-transparent via-[#2DFF9A] to-transparent" />

        {/* System text */}
        <div className="mt-10 landscape:mt-6 space-y-3 text-sm sm:text-base text-slate-400 tracking-[0.3em]">
          <p>SYSTEM COMPLETE • REALITY EXECUTED</p>
          <p>SIMULATION TERMINATED</p>
        </div>

        {/* Footer system bar */}
        <div className="mt-20 landscape:mt-8 text-xs text-slate-500 tracking-[0.25em]">
          [ SYSTEM STATUS: STABLE ] • [ TIMELINE ANCHOR: SECURED ]
        </div>

        {/* BUTTON */}
        <div className="mt-12 landscape:mt-6 flex justify-center">
          <button
            onClick={() => onNav('leaderboard')}
            className="group relative overflow-hidden rounded-full border border-[#2DFF9A]/40 bg-black/60 px-10 py-4 text-sm text-[#2DFF9A] backdrop-blur-sm transition-all duration-300 hover:bg-[#2DFF9A]/10 hover:scale-[1.05]"
            style={{
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: "0.15em",
              textShadow: "0 0 12px rgba(45,255,154,0.9)"
            }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[linear-gradient(120deg,transparent,rgba(45,255,154,0.25),transparent)]" />
            <span className="relative">
              VIEW TIMELINE RECORDS
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}