import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useApi } from '../hooks/useApi'
import { Spinner, Alert, Btn } from '../components/UI'

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER  — smoothly counts up to a number
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1.2, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!value || started.current) return
    started.current = true
    const start = Date.now() + delay * 1000
    const end   = start + duration * 1000

    const tick = () => {
      const now = Date.now()
      if (now < start) { requestAnimationFrame(tick); return }
      const t = Math.min((now - start) / (end - start), 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(Math.round(eased * value))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <>{display}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// RANK BADGE
// ─────────────────────────────────────────────────────────────────────────────
const RANK_STYLES = {
  1: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black shadow-[0_0_16px_rgba(234,179,8,0.5)]',
  2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-black shadow-[0_0_12px_rgba(148,163,184,0.4)]',
  3: 'bg-gradient-to-br from-orange-600 to-amber-700 text-white shadow-[0_0_12px_rgba(180,83,9,0.4)]',
}

function RankBadge({ rank, size = 'md' }) {
  const sz = size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'
  if (rank <= 3) {
    return (
      <motion.span
        className={`${sz} rounded-full ${RANK_STYLES[rank]} flex items-center justify-center font-black flex-shrink-0`}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
      >
        {rank}
      </motion.span>
    )
  }
  return (
    <span className={`${sz} rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-mono text-slate-500 flex-shrink-0`}>
      {rank}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PODIUM CARD  — the top-3 visual podium
// ─────────────────────────────────────────────────────────────────────────────
const PODIUM = {
  1: { order: 2, height: 'h-24', avatarSize: 'w-16 h-16', ring: 'ring-4 ring-yellow-400/60', nameColor: 'text-yellow-400', crown: true, delay: 0.1 },
  2: { order: 1, height: 'h-16', avatarSize: 'w-12 h-12', ring: 'ring-2 ring-slate-400/50',  nameColor: 'text-slate-300',  crown: false, delay: 0.2 },
  3: { order: 3, height: 'h-10', avatarSize: 'w-12 h-12', ring: 'ring-2 ring-amber-600/50',  nameColor: 'text-amber-600',  crown: false, delay: 0.3 },
}

function PodiumCard({ entry, rank }) {
  const cfg = PODIUM[rank]
  const PODIUM_BG = {
    1: 'from-yellow-500/25 to-yellow-600/10',
    2: 'from-slate-400/15 to-slate-500/5',
    3: 'from-amber-700/15 to-amber-800/5',
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      style={{ order: cfg.order, width: rank === 1 ? 128 : 112 }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: cfg.delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {cfg.crown && (
        <motion.div
          className="text-2xl"
          initial={{ opacity: 0, y: -10, rotate: -15 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        >
          👑
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: 1.08, y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <img
          src={entry.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}&backgroundColor=1e1e24`}
          className={`${cfg.avatarSize} rounded-full ${cfg.ring} object-cover`}
          alt={entry.name}
        />
      </motion.div>

      <div className="text-center">
        <div className={`text-xs font-semibold truncate max-w-[100px] ${cfg.nameColor}`} style={{ fontFamily: 'Syne, sans-serif' }}>
          {entry.name.split(' ')[0]}
        </div>
        <div className={`font-black text-lg ${cfg.nameColor}`} style={{ fontFamily: 'Syne, sans-serif' }}>
          <AnimatedNumber value={entry.totalPoints} delay={cfg.delay + 0.3} />
        </div>
      </div>

      {/* Podium block */}
      <motion.div
        className={`w-full ${cfg.height} rounded-t-xl flex items-center justify-center font-black text-2xl bg-gradient-to-b ${PODIUM_BG[rank]}`}
        style={{ border: `1px solid ${rank === 1 ? 'rgba(234,179,8,0.3)' : rank === 2 ? 'rgba(148,163,184,0.2)' : 'rgba(180,83,9,0.2)'}`, borderBottom: 'none' }}
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: cfg.delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-400' : 'text-amber-600'}>
          {rank}
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADERBOARD ROW
// ─────────────────────────────────────────────────────────────────────────────
function LeaderboardRow({ entry, index, isMe }) {
  const barWidth = entry._maxPoints > 0 ? (entry.totalPoints / entry._maxPoints) * 100 : 0

  return (
    <motion.div
      className={`relative grid grid-cols-[auto_1fr_auto_auto] gap-0 items-center px-4 py-3 border-b last:border-0 transition-colors group
        ${isMe
          ? 'bg-orange-500/5'
          : 'hover:bg-white/[0.02]'
        }`}
      style={{
        borderColor: 'rgba(34,34,40,1)',
        borderLeft: isMe ? '2px solid rgba(249,115,22,0.7)' : '2px solid transparent',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, delay: 0.05 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 2 }}
    >
      {/* Background score bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 pointer-events-none rounded-r-sm"
        style={{ background: isMe ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.02)' }}
        initial={{ width: 0 }}
        animate={{ width: `${barWidth}%` }}
        transition={{ duration: 1, delay: 0.1 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Rank */}
      <div className="w-10 relative z-10">
        <RankBadge rank={entry.rank} />
      </div>

      {/* User info */}
      <div className="flex items-center gap-2.5 min-w-0 relative z-10">
        <motion.img
          src={entry.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}&backgroundColor=1e1e24`}
          className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
          alt=""
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        />
        <div className="min-w-0">
          <div className={`text-sm font-medium truncate flex items-center gap-1.5 ${isMe ? 'text-orange-400' : 'text-white'}`}
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {entry.name}
            {isMe && (
              <motion.span
                className="text-[10px] text-orange-400/80 bg-orange-500/15 border border-orange-500/20 px-1.5 py-0.5 rounded-full"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.04, type: 'spring' }}
              >
                you
              </motion.span>
            )}
          </div>
          <div className="text-xs text-slate-500 truncate">{entry.email}</div>
        </div>
      </div>

      {/* Time */}
      <div className="font-mono text-sm text-slate-500 text-right pr-4 relative z-10 tabular-nums">
        {formatTime(entry.totalTime)}
      </div>

      {/* Points */}
      <div
        className={`font-black text-lg text-right relative z-10 tabular-nums min-w-[52px]`}
        style={{
          fontFamily: 'Syne, sans-serif',
          color: entry.rank === 1 ? '#facc15' : entry.rank === 2 ? '#cbd5e1' : entry.rank === 3 ? '#d97706' : '#e8edf5',
        }}
      >
        <AnimatedNumber value={entry.totalPoints} delay={0.1 + index * 0.04} duration={0.9} />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LeaderboardPage({ userRole }) {
  const { user } = useUser()
  const api = useApi()
  const [data, setData]                   = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [refreshing, setRefreshing]       = useState(false)
  const [activeRound, setActiveRound]     = useState(null)
  const [rounds, setRounds]               = useState([])
  const [selectedRoundId, setSelectedRoundId] = useState(null)
  const [prevData, setPrevData]           = useState([]) // for rank-change animation
  const isAdmin = userRole === 'ORGANIZER'

  const fetchActiveRound = async () => {
    try { const r = await api.get('/api/round/active'); setActiveRound(r) }
    catch { setActiveRound(null) }
  }

  const loadMyRounds = async () => {
    try {
      const myRounds  = await api.get('/api/round/me')
      const roundList = Array.isArray(myRounds) ? myRounds : []
      setRounds(roundList)
      const finished  = roundList.filter(r => r.finished).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const backup    = [...roundList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const def       = isAdmin ? backup[0] : finished[0] || null
      const defId     = def ? String(def.id) : null
      setSelectedRoundId(defId)
      return defId
    } catch { setRounds([]); setSelectedRoundId(null); return null }
  }

  const fetchLeaderboard = async (roundId = selectedRoundId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      setError(null)
      await fetchActiveRound()
      if (!roundId) { setData([]); return }

      const round = rounds.find(r => String(r.id) === String(roundId))
      if (!isAdmin && round && !round.finished) {
        setData([]); setError('Round not finished yet.'); return
      }

      const res     = await api.get(`/api/leaderboard/round/${roundId}`)
      const entries = res?.data || res || []

      // Attach max for bar scaling
      const maxPts = Math.max(...entries.map(e => e.totalPoints), 1)
      const tagged  = entries.map(e => ({ ...e, _maxPoints: maxPts }))

      setPrevData(data)
      setData(tagged)
    } catch (e) {
      setError(e?.message || 'Could not load leaderboard')
      setData([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const firstId = await loadMyRounds()
      await fetchActiveRound()
      if (firstId) await fetchLeaderboard(firstId)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedRoundId) fetchLeaderboard(selectedRoundId)
  }, [selectedRoundId])

  const selectedRound    = selectedRoundId ? rounds.find(r => String(r.id) === String(selectedRoundId)) : null
  const isRoundUnfinished = selectedRound && !selectedRound.finished
  const myEntry          = data.find(d => d.email === user?.primaryEmailAddress?.emailAddress)
  const top3             = data.slice(0, 3)
  const hasTop3          = top3.length >= 2

  // ── Rank delta helper ──
  const getRankDelta = (entry) => {
    const prev = prevData.find(p => p.userId === entry.userId)
    if (!prev) return null
    return prev.rank - entry.rank // positive = moved up
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  )

  return (
    <motion.div
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ══ HEADER ══ */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Leaderboard
          </h1>
          <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Higher score &amp; lower time wins
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Btn
            onClick={() => fetchLeaderboard(selectedRoundId, true)}
            loading={refreshing}
            size="sm"
            variant="secondary"
          >
            {refreshing
              ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}>↺</motion.span>
              : '↺'
            } Refresh
          </Btn>
        </motion.div>
      </motion.div>

      <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Alert type="error">{error}</Alert></motion.div>}</AnimatePresence>

      {/* ══ ROUND SELECTOR ══ */}
      <motion.div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-medium" style={{ fontFamily: 'Syne, sans-serif' }}>
            Round
          </span>
          <select
            value={selectedRoundId || ''}
            onChange={e => setSelectedRoundId(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
            style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans, sans-serif' }}
          >
            {rounds.length === 0 ? (
              <option disabled value="">No rounds yet</option>
            ) : (
              <>
                {isAdmin && <option hidden value="">Select a round</option>}
                {(isAdmin ? rounds : rounds.filter(r => r.finished)).map(r => (
                  <option key={r.id} value={r.id}>
                    Round #{r.id} — {r.finished ? 'COMPLETED' : 'ACTIVE'}
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Active round indicator */}
          {activeRound && (
            <div className="flex items-center gap-1.5 ml-auto">
              <motion.span
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs text-green-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Round #{activeRound.id} live
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ══ MY RANK CARD ══ */}
      <AnimatePresence>
        {myEntry && (
          <motion.div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="text-[11px] text-slate-500 mb-2.5 font-medium uppercase tracking-widest" style={{ fontFamily: 'Syne, sans-serif' }}>
              Your Rank
            </div>
            <div className="flex items-center gap-4">
              <RankBadge rank={myEntry.rank} size="lg" />
              <motion.img
                src={myEntry.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${myEntry.name}`}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30"
                alt=""
                whileHover={{ scale: 1.1 }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{myEntry.name}</div>
                <div className="text-slate-500 text-xs truncate">{myEntry.email}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-orange-400 text-2xl font-black leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <AnimatedNumber value={myEntry.totalPoints} delay={0.2} />
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">{formatTime(myEntry.totalTime)}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ EMPTY STATES ══ */}
      {!selectedRound ? (
        <motion.div
          className="rounded-2xl p-16 text-center"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <div className="text-5xl mb-4">📌</div>
          <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Select a round</h2>
          <p className="text-sm text-slate-500">Choose a round from the dropdown above.</p>
        </motion.div>
      ) : isRoundUnfinished ? (
        <motion.div
          className="rounded-2xl p-16 text-center"
          style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.04)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          >⏳</motion.div>
          <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Round still in progress</h2>
          <p className="text-sm text-slate-500">Leaderboard reveals when the round ends.</p>
        </motion.div>
      ) : data.length === 0 ? (
        <motion.div
          className="rounded-2xl p-16 text-center"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No results yet</h2>
          <p className="text-sm text-slate-500">No finished results found for this round.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRoundId}
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ══ PODIUM ══ */}
            {hasTop3 && (
              <div
                className="flex items-end justify-center gap-3 py-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {[2, 1, 3].map(rank => {
                  const entry = top3[rank - 1]
                  return entry ? <PodiumCard key={rank} entry={entry} rank={rank} /> : null
                })}
              </div>
            )}

            {/* ══ TABLE ══ */}
            <motion.div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(34,34,40,1)', background: '#0d0f18' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {/* Table header */}
              <div
                className="grid grid-cols-[auto_1fr_auto_auto] gap-0 text-[11px] text-slate-600 font-medium uppercase tracking-widest px-4 py-3"
                style={{ borderBottom: '1px solid rgba(34,34,40,1)', fontFamily: 'Syne, sans-serif', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="w-10">#</span>
                <span>Participant</span>
                <span className="text-right pr-4">Time</span>
                <span className="text-right min-w-[52px]">Points</span>
              </div>

              {/* Rows */}
              <AnimatePresence>
                {data.map((entry, index) => {
                  const isMe    = entry.email === user?.primaryEmailAddress?.emailAddress
                  const delta   = getRankDelta(entry)
                  return (
                    <LeaderboardRow
                      key={entry.userId}
                      entry={entry}
                      index={index}
                      isMe={isMe}
                      delta={delta}
                    />
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {/* ══ FOOTER NOTE ══ */}
            <motion.p
              className="text-center text-xs text-slate-600"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Ranked by: higher points → lower time
            </motion.p>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}