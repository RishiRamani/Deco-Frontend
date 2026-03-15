import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '../hooks/useApi'

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,400;12..96,500;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&display=swap');

  .hp-wrap { font-family: 'Bricolage Grotesque', sans-serif; }
  .hp-serif { font-family: 'Instrument Serif', serif; }

  @keyframes gridFade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes orbDrift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(30px,-20px) scale(1.05); }
    66%     { transform: translate(-20px,15px) scale(0.97); }
  }
  @keyframes orbDrift2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%     { transform: translate(-25px,20px) scale(1.04); }
    70%     { transform: translate(20px,-15px) scale(0.98); }
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes scanLine {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }

  .hp-grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: gridFade 1.5s ease both;
  }

  .hp-orb-1 { animation: orbDrift  18s ease-in-out infinite; }
  .hp-orb-2 { animation: orbDrift2 22s ease-in-out infinite; }

  .hp-ticker-track { animation: ticker 28s linear infinite; }
  .hp-ticker-track:hover { animation-play-state: paused; }

  .hp-card-hover {
    transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
  }
  .hp-card-hover:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,0.14) !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
  }

  .hp-btn-primary {
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
  }
  .hp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(249,115,22,0.45);
  }
  .hp-btn-primary:active { transform: scale(0.97); }

  .hp-btn-ghost {
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
  }
  .hp-btn-ghost:hover {
    background: rgba(255,255,255,0.07) !important;
    transform: translateY(-1px);
  }

  .hp-stat-num {
    background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.55));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hp-avatar-ring {
    box-shadow: 0 0 0 2px rgba(249,115,22,0.5), 0 0 16px rgba(249,115,22,0.2);
  }
`

function injectStyles() {
  if (document.getElementById('hp-styles')) return
  const s = document.createElement('style')
  s.id = 'hp-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKER — scrolling live text bar
// ─────────────────────────────────────────────────────────────────────────────
function Ticker({ items }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden relative" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="hp-ticker-track flex items-center gap-0 py-2.5 whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-6">
            <span style={{ color: 'rgba(249,115,22,0.7)', fontSize: 8 }}>◆</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, letterSpacing: '0.12em', fontWeight: 500 }}>
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV CARD
// ─────────────────────────────────────────────────────────────────────────────
const CARD_META = {
  round:       { emoji: '🔁', accent: '#6366f1', label: 'Rounds',        sub: 'Browse all trials' },
  quiz:        { emoji: '⚡', accent: '#f97316', label: 'Play',           sub: 'Enter the quiz arena' },
  leaderboard: { emoji: '🏆', accent: '#eab308', label: 'Leaderboard',   sub: 'Top players ranked' },
  admin:       { emoji: '🛠', accent: '#8b5cf6', label: 'Admin',          sub: 'Manage & configure' },
}

function NavCard({ page, desc, onNav, index }) {
  const meta = CARD_META[page] || { emoji: '○', accent: '#6366f1', label: page, sub: desc }

  return (
    <motion.button
      onClick={() => onNav(page)}
      className="hp-card-hover text-left w-full rounded-2xl p-5 relative overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.08, duration: 0.5, ease: [0.22,1,0.36,1] }}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 0% 100%, ${meta.accent}14, transparent 60%)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}30` }}
        >
          {meta.emoji}
        </div>
        <motion.span
          className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: meta.accent }}
          animate={{ x: 0 }}
          whileHover={{ x: 4 }}
        >
          →
        </motion.span>
      </div>

      <div className="font-bold text-white text-base mb-1" style={{ letterSpacing: '-0.01em' }}>{meta.label}</div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{meta.sub}</div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${meta.accent}, transparent)` }}
        initial={{ width: 0 }}
        whileHover={{ width: '60%' }}
        transition={{ duration: 0.35 }}
      />
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ROUND CARD
// ─────────────────────────────────────────────────────────────────────────────
function LiveRoundCard({ round, isLive, onNav }) {
  return (
    <motion.div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(234,88,12,0.06) 100%)',
        border: '1px solid rgba(249,115,22,0.25)',
      }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22,1,0.36,1] }}
    >
      {/* Corner glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.12)', filter: 'blur(24px)' }}/>

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <motion.span
              className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span style={{ color: '#fb923c', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>
              {isLive ? 'LIVE NOW' : 'UPCOMING'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>· Round #{round.id}</span>
          </div>
          <h3 className="text-white font-bold text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>
            {isLive ? 'A round is live!' : 'Round is scheduled'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            {new Date(round.startedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            &nbsp;→&nbsp;
            {new Date(round.endsAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {isLive && (
          <motion.button
            onClick={() => onNav('quiz')}
            className="hp-btn-primary flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)', letterSpacing: '-0.01em' }}
            whileTap={{ scale: 0.97 }}
          >
            Join Now
            <span style={{ fontSize: 16 }}>→</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage({ onNav, userRole }) {
  useEffect(() => { injectStyles() }, [])

  const { user } = useUser()
  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    api.get('/api/round/active')
      .then(setActiveRound)
      .catch(() => setActiveRound(null))
      .finally(() => setLoading(false))
  }, [])

  const isLive = activeRound
    && new Date(activeRound.startedAt) <= new Date()
    && new Date(activeRound.endsAt)    >= new Date()

  const navItems = [
    { page: 'round',       desc: 'Browse all trials' },
    { page: 'quiz',        desc: 'Enter the quiz arena' },
    { page: 'leaderboard', desc: 'Top players ranked' },
    ...(userRole === 'ORGANIZER' ? [{ page: 'admin', desc: 'Manage & configure' }] : []),
  ]

  const tickerItems = [
    'COMPETE IN REAL-TIME', 'ANSWER FAST · SCORE BIG', 'CLIMB THE RANKINGS',
    'QUIZ ARENA IS LIVE', 'TEST YOUR KNOWLEDGE', 'BEAT THE CLOCK',
  ]

  return (
    <div className="hp-wrap relative min-h-screen" style={{ background: '#080b12', color: '#fff' }}>

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Grid */}
        <div className="hp-grid-bg absolute inset-0 opacity-100" />

        {/* Orbs */}
        <div className="hp-orb-1 absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ top: '-15%', left: '55%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 65%)' }}/>
        <div className="hp-orb-2 absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ bottom: '-10%', right: '60%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)' }}/>

        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(5,6,12,0.7) 100%)' }}/>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── HERO ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-10">

          {/* Top bar — greeting + role */}
          <motion.div
            className="flex items-center justify-between mb-10 flex-wrap gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              {user?.imageUrl && (
                <motion.img
                  src={user.imageUrl}
                  className="w-9 h-9 rounded-full object-cover hp-avatar-ring"
                  alt=""
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              )}
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  Hey, {user?.firstName || user?.username || 'there'} 👋
                </span>
              </div>
            </div>

            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: userRole === 'ORGANIZER' ? 'rgba(139,92,246,0.15)' : 'rgba(249,115,22,0.12)',
                border: `1px solid ${userRole === 'ORGANIZER' ? 'rgba(139,92,246,0.3)' : 'rgba(249,115,22,0.25)'}`,
                color: userRole === 'ORGANIZER' ? '#a78bfa' : '#fb923c',
                letterSpacing: '0.08em',
              }}
            >
              {userRole || 'PLAYER'}
            </span>
          </motion.div>

          {/* Main hero row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-10 lg:gap-16 mb-12">

            {/* Title */}
            <div className="flex-1">
              <motion.div
                className="mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span
                  className="hp-serif text-sm italic"
                  style={{ color: 'rgba(249,115,22,0.7)' }}
                >
                  Real-time quiz battles
                </span>
              </motion.div>

              <motion.h1
                className="font-extrabold leading-none mb-5"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 7rem)',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.92,
                }}
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                Quiz
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Arena.
                </span>
              </motion.h1>

              <motion.p
                className="text-lg max-w-md leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Compete in live quiz rounds. Answer fast, score big, and climb the leaderboard in real time.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                className="flex items-center gap-3 mt-7 flex-wrap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <motion.button
                  onClick={() => onNav('quiz')}
                  className="hp-btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', letterSpacing: '-0.01em' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Playing
                  <span>→</span>
                </motion.button>

                <motion.button
                  onClick={() => onNav('leaderboard')}
                  className="hp-btn-ghost flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}
                  whileTap={{ scale: 0.97 }}
                >
                  View Rankings
                </motion.button>
              </motion.div>
            </div>

            {/* Stats strip */}
            <motion.div
              className="flex lg:flex-col gap-8 lg:gap-6 flex-row flex-wrap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {[
                { num: 'LIVE',  label: 'Right now',       accent: '#f97316' },
                { num: '1v∞',  label: 'Compete globally', accent: '#6366f1' },
                { num: '#1',   label: 'Claim the top',    accent: '#eab308' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span
                    className="hp-stat-num font-black leading-none mb-1"
                    style={{ fontSize: 32, letterSpacing: '-0.04em', color: stat.accent, WebkitTextFillColor: 'unset' }}
                  >
                    {stat.num}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 500 }}>
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── TICKER ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Ticker items={tickerItems} />
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT — Active round + nav cards */}
            <div className="flex-1 space-y-4">

              {/* Active round */}
              {loading ? (
                <motion.div
                  className="h-24 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: 'rgba(249,115,22,0.4)', borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              ) : activeRound ? (
                <LiveRoundCard round={activeRound} isLive={isLive} onNav={onNav} />
              ) : (
                <motion.div
                  className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <div>
                      <div className="font-semibold text-sm text-white mb-0.5">No active round</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                        Sit tight — the next round starts soon
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Nav cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {navItems.map((item, i) => (
                  <NavCard key={item.page} {...item} onNav={onNav} index={i} />
                ))}
              </div>
            </div>

            {/* RIGHT — Info sidebar */}
            <div className="lg:w-72 space-y-4">

              {/* User card */}
              <motion.div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} className="w-10 h-10 rounded-xl object-cover hp-avatar-ring" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">
                      {user?.firstName || user?.username || 'Player'}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {user?.primaryEmailAddress?.emailAddress}
                    </div>
                  </div>
                </div>

                <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}/>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Role</span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: userRole === 'ORGANIZER' ? 'rgba(139,92,246,0.15)' : 'rgba(249,115,22,0.12)',
                      border: `1px solid ${userRole === 'ORGANIZER' ? 'rgba(139,92,246,0.3)' : 'rgba(249,115,22,0.25)'}`,
                      color: userRole === 'ORGANIZER' ? '#a78bfa' : '#fb923c',
                    }}
                  >
                    {userRole || 'PLAYER'}
                  </span>
                </div>
              </motion.div>

              {/* How it works */}
              <motion.div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="font-semibold text-sm text-white mb-4" style={{ letterSpacing: '-0.01em' }}>
                  How it works
                </div>
                <div className="space-y-3.5">
                  {[
                    { n: '01', t: 'Wait for a round',  d: 'Organizer kicks off a live quiz session' },
                    { n: '02', t: 'Answer questions',   d: 'Multiple choice or free text — be fast' },
                    { n: '03', t: 'Climb the board',    d: 'Highest score + fastest time wins' },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3">
                      <span
                        className="font-black text-xs mt-0.5 flex-shrink-0"
                        style={{ color: 'rgba(249,115,22,0.5)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {step.n}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-white mb-0.5">{step.t}</div>
                        <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{step.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick tip */}
              <motion.div
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.04))', border: '1px solid rgba(99,102,241,0.2)' }}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: 'rgba(99,102,241,0.15)', filter: 'blur(16px)' }}/>
                <div className="relative">
                  <div className="text-xs font-semibold mb-1.5" style={{ color: '#818cf8', letterSpacing: '0.1em' }}>
                    💡 PRO TIP
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Speed matters — two players with the same score are ranked by who finished fastest.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}