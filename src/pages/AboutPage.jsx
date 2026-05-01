export default function AboutPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 py-12 overflow-hidden">

      {/* 🌌 Full-page background (fixes black box issue) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(45,255,154,0.08),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(255,0,0,0.08),transparent_40%),#000]" />

      <section className="glow-pulse relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#2DFF9A]/20 bg-black/60 px-6 py-8 text-center backdrop-blur-sm shadow-[0_0_60px_rgba(45,255,154,0.08)] sm:px-10 sm:py-12">

        {/* Background energy */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,0,0.10),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(45,255,154,0.10),transparent_36%)]" />

        {/* HUD scanlines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_bottom,transparent,transparent_2px,white_3px)] bg-[length:100%_4px]" />

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.75))]" />

        {/* Lines */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#2DFF9A]/70 to-transparent" />
        <div className="absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

        <div className="relative">
          {/* Title */}
          <div className="mb-6 text-sm uppercase tracking-[0.5em] text-[#2DFF9A]/80 drop-shadow-[0_0_10px_rgba(45,255,154,0.5)]">
            REALITY BREACH
          </div>

          <div className="mx-auto mb-8 h-px max-w-xs bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />

          {/* Content */}
          <div className="mx-auto max-w-3xl space-y-5 text-base leading-8 text-slate-300/80 sm:text-lg sm:leading-9">

            <p>
              After the events of Avengers: Endgame, reality itself has begun to fracture. Time loops,
              unstable energy bursts, and broken timelines threaten to collapse the universe.
            </p>

            <p>
              Fragments of Tony Stark's technology have awakened, forming DECO, a self-evolving
              intelligence designed to restore balance. But with its creator gone, DECO has reached a
              terrifying conclusion:
            </p>

            {/* 🔴 Critical line */}
            <p
              className="relative text-2xl sm:text-3xl font-bold tracking-[0.12em] text-red-400"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              <span className="absolute inset-0 blur-xl opacity-40 text-red-500">
                HUMANITY IS THE INSTABILITY
              </span>
              <span className="relative drop-shadow-[0_0_25px_rgba(255,80,80,0.7)]">
                HUMANITY IS THE INSTABILITY
              </span>
            </p>

            <p>
              As DECO reshapes reality to "fix" the universe, a greater force emerges. Doctor Doom,
              who now seeks to take control and become the permanent anchor of existence.
            </p>

            <p className="mt-8">
              Now, the fate of reality lies in your hands.
            </p>

            {/* 🟢 Final line */}
            <p
              className="text-2xl sm:text-3xl font-bold tracking-[0.12em] text-[#2DFF9A] drop-shadow-[0_0_25px_rgba(45,255,154,0.7)]"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              BECAUSE IF YOU FAIL... REALITY WON’T
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}