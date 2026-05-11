import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { Btn, Input, Textarea, Alert, Spinner, StatusBadge, Badge } from '../components/UI'
import FlashbackTransition from '../components/FlashbackTransition'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// ── Shared glitch text component ─────────────────────────────────────────────
function GlitchText({ children, className = '' }) {
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ fontFamily: 'Orbitron, sans-serif' }}
      data-text={children}
    >
      {children}
    </span>
  )
}

// ── Section card wrapper ─────────────────────────────────────────────────────
function DoomCard({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#2DFF9A]/15 bg-black/60 backdrop-blur-md ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2DFF9A]/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,255,154,0.05),transparent_60%)] pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
}

// ── Maintenance Tab ──────────────────────────────────────────────────────────
function MaintenanceTab() {
  const api = useApi()
  const [truncating, setTruncating] = useState(false)
  const [msg, setMsg] = useState(null)

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const truncateTables = async () => {
    if (!confirm('Are you sure you want to truncate all question, response, round, and roundresult tables? This action cannot be undone.')) return
    setTruncating(true)
    try {
      await api.post('/api/admin/truncate')
      flash('success', 'Tables truncated successfully')
    } catch (e) {
      flash('error', e.message)
    } finally {
      setTruncating(false)
    }
  }

  return (
    <div className="space-y-5">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <DoomCard className="p-6">
        <h3
          className="text-[#2DFF9A] text-sm tracking-[0.3em] mb-3 uppercase"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Database Maintenance
        </h3>
        <p className="text-slate-400 text-sm mb-5 leading-relaxed">
          Truncate all data from question, response, round, and roundresult tables. This action is irreversible — proceed with caution.
        </p>
        <button
          onClick={truncateTables}
          disabled={truncating}
          className="relative overflow-hidden px-6 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-xs tracking-[0.3em] uppercase transition-all duration-300 hover:bg-red-500/20 hover:border-red-400/60 hover:shadow-[0_0_20px_rgba(255,0,0,0.2)] disabled:opacity-50"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {truncating ? '[ TRUNCATING... ]' : '[ TRUNCATE ALL TABLES ]'}
        </button>
      </DoomCard>
    </div>
  )
}

// ── Transitions Tab ──────────────────────────────────────────────────────────
function TransitionsTab() {
  const [showFlashback, setShowFlashback] = useState(false)
  const [showCrack, setShowCrack] = useState(false)
  const [portalRoot, setPortalRoot] = useState(null)

  useEffect(() => { setPortalRoot(document.body) }, [])

  const testFlashback = () => setShowFlashback(true)
  const testTimelineCrack = () => {
    setShowCrack(true)
    setTimeout(() => setShowCrack(false), 3000)
  }

  const flashbackImages = [
    '/backgrounds/final-round-bg.png',
    '/backgrounds/home-hero.png',
    '/backgrounds/r1-stage1-bg.png',
    '/backgrounds/r1-stage2-bg.png',
    '/backgrounds/r2-stage1-bg.png',
    '/backgrounds/r2-stage2-bg.png',
    '/backgrounds/easteregg.png',
    '/backgrounds/r3-bg.png',
    '/backgrounds/r3-space-bg.png',
    '/backgrounds/test.png',
    '/backgrounds/final-round-bg.png',
    '/backgrounds/home-hero.png',
    '/backgrounds/r1-stage1-bg.png',
    '/backgrounds/r1-stage2-bg.png',
    '/backgrounds/r2-stage1-bg.png',
    '/backgrounds/r2-stage2-bg.png',
    '/backgrounds/easteregg.png',
    '/backgrounds/r3-bg.png',
    '/backgrounds/r3-space-bg.png',
    '/backgrounds/test.png',
  ]

  return (
    <div className="space-y-5">
      <DoomCard className="p-6">
        <h3
          className="text-[#2DFF9A] text-sm tracking-[0.3em] mb-5 uppercase"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Transition Preview
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testFlashback}
            className="px-6 py-2.5 rounded-xl border border-[#2DFF9A]/30 bg-[#2DFF9A]/10 text-[#2DFF9A] text-xs tracking-[0.3em] uppercase transition-all duration-300 hover:bg-[#2DFF9A]/20 hover:shadow-[0_0_20px_rgba(45,255,154,0.25)]"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            [ TEST FLASHBACK ]
          </button>
          <button
            onClick={testTimelineCrack}
            className="px-6 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs tracking-[0.3em] uppercase transition-all duration-300 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            [ TEST TIMELINE CRACK ]
          </button>
        </div>
      </DoomCard>

      {showFlashback && portalRoot && createPortal(
        <FlashbackTransition images={flashbackImages} onComplete={() => setShowFlashback(false)} />,
        portalRoot
      )}
      {showCrack && portalRoot && createPortal(
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
        </div>,
        portalRoot
      )}
    </div>
  )
}

// ── Rounds Tab ───────────────────────────────────────────────────────────────
function RoundsTab() {
  const api = useApi()
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [startedAt, setStartedAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState(null)

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const fetchRounds = async () => {
    try {
      const data = await api.get('/api/round/admin/all')
      setRounds(Array.isArray(data) ? data : [])
    } catch (e) {
      flash('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRounds() }, [])

  const createRound = async () => {
    if (!startedAt || !endsAt) { flash('error', 'Both start and end times are required'); return }
    const startDate = new Date(startedAt)
    const endDate = new Date(endsAt)
    if (endDate <= startDate) { flash('error', 'End time must be after start time'); return }
    setCreating(true)
    try {
      await api.post('/api/round', { startedAt: startDate.toISOString(), endsAt: endDate.toISOString() })
      flash('success', 'Round created!')
      setStartedAt('')
      setEndsAt('')
      fetchRounds()
    } catch (e) {
      flash('error', e.message)
    } finally {
      setCreating(false)
    }
  }

  const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : 'N/A'
  const isRoundActive = (r) => { const n = new Date(); return n >= new Date(r.startedAt) && n <= new Date(r.endsAt) }
  const isRoundCompleted = (r) => new Date() > new Date(r.endsAt)

  return (
    <div className="space-y-5">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <DoomCard className="p-6">
        <h3 className="text-[#2DFF9A] text-sm tracking-[0.3em] mb-5 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Initialize Round
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[10px] tracking-[0.3em] text-slate-500 uppercase mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>Start Time *</label>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={e => setStartedAt(e.target.value)}
              className="w-full bg-black/50 border border-[#2DFF9A]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#2DFF9A]/50 focus:shadow-[0_0_15px_rgba(45,255,154,0.1)] transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.3em] text-slate-500 uppercase mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>End Time *</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={e => setEndsAt(e.target.value)}
              className="w-full bg-black/50 border border-[#2DFF9A]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#2DFF9A]/50 focus:shadow-[0_0_15px_rgba(45,255,154,0.1)] transition-all"
            />
          </div>
        </div>
        <button
          onClick={createRound}
          disabled={creating}
          className="px-6 py-2.5 rounded-xl border border-[#2DFF9A]/30 bg-[#2DFF9A]/10 text-[#2DFF9A] text-xs tracking-[0.3em] uppercase transition-all duration-300 hover:bg-[#2DFF9A]/20 hover:shadow-[0_0_20px_rgba(45,255,154,0.25)] disabled:opacity-50"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {creating ? '[ INITIALIZING... ]' : '[ + CREATE ROUND ]'}
        </button>
      </DoomCard>

      <DoomCard>
        <div className="px-6 py-4 border-b border-[#2DFF9A]/10 flex items-center justify-between">
          <h3 className="text-[#2DFF9A] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>All Rounds</h3>
          <button
            onClick={fetchRounds}
            className="text-[10px] tracking-[0.25em] text-slate-500 hover:text-[#2DFF9A] transition-colors uppercase"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            ↺ Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : rounds.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-600 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            No rounds detected
          </div>
        ) : (
          <div className="divide-y divide-[#2DFF9A]/05">
            {rounds.map(r => (
              <div key={r._id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#2DFF9A]/02 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-white">
                      Round{' '}
                      <span className="text-[#2DFF9A]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        #{r.id}
                      </span>
                    </span>
                    {isRoundActive(r) && (
                      <span className="text-[9px] tracking-[0.3em] px-2 py-0.5 rounded-full border border-[#2DFF9A]/40 text-[#2DFF9A] bg-[#2DFF9A]/10 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        ● Active
                      </span>
                    )}
                    {isRoundCompleted(r) && (
                      <span className="text-[9px] tracking-[0.3em] px-2 py-0.5 rounded-full border border-white/15 text-slate-500 bg-white/5 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Completed
                      </span>
                    )}
                    {!isRoundActive(r) && !isRoundCompleted(r) && (
                      <span className="text-[9px] tracking-[0.3em] px-2 py-0.5 rounded-full border border-blue-400/30 text-blue-400 bg-blue-400/10 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-slate-500 font-mono">
                    <span>▸ Starts: {formatDateTime(r.startedAt)}</span>
                    <span>▸ Ends: {formatDateTime(r.endsAt)}</span>
                    <span>▸ Questions: {r.totalQuestions || 0} &nbsp;|&nbsp; Participants: {r.totalParticipants || 0}</span>
                  </div>
                </div>
                <button
                  className="text-[9px] tracking-[0.25em] px-3 py-1.5 rounded-lg border border-[#2DFF9A]/15 text-slate-500 hover:text-[#2DFF9A] hover:border-[#2DFF9A]/30 transition-all uppercase"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </DoomCard>
    </div>
  )
}

// ── Questions Tab ────────────────────────────────────────────────────────────
function QuestionsTab() {
  const api = useApi()
  const [roundId, setRoundId] = useState('')
  const [questions, setQuestions] = useState([])
  const [loadingQs, setLoadingQs] = useState(false)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ text: '', options: '', answer: '', link: '', reward: '' })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deletingId, setDeletingId] = useState(null)

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const fetchQuestions = async () => {
    if (!roundId.trim()) return
    setLoadingQs(true)
    try {
      const res = await api.get(`/api/question/round/${roundId.trim()}`)
      const qs = res?.data || res || []
      flash('success', `${qs.length} question(s) found in this round!`)
      setQuestions(qs)
    } catch (e) {
      flash('error', e.message)
    } finally {
      setLoadingQs(false)
    }
  }

  const createQuestion = async () => {
    if (!roundId.trim() || !form.text || !form.answer || !form.reward) return
    setSubmitting(true)
    try {
      const opts = form.options.split(',').map(o => o.trim()).filter(o => o.length > 0)
      if (opts.length === 1) { flash('error', 'MCQ must have at least 2 options. Leave blank for textual.'); setSubmitting(false); return }
      const payload = {
        roundId: roundId.trim(),
        text: form.text,
        answer: form.answer,
        reward: Number(form.reward),
        ...(form.link && { link: form.link }),
        ...(opts.length >= 2 && { options: opts }),
      }
      await api.post('/api/question', payload)
      setForm({ text: '', options: '', answer: '', link: '', reward: '' })
      flash('success', 'Question created!')
      fetchQuestions()
    } catch (e) {
      flash('error', e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    setDeletingId(id)
    try {
      await api.del(`/api/question/${id}`)
      flash('success', 'Question deleted')
      setQuestions(qs => qs.filter(q => q._id !== id))
    } catch (e) {
      flash('error', e.message)
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (q) => {
    setEditingId(q._id)
    setEditForm({
      text: q.text,
      options: q.options ? (Array.isArray(q.options) ? q.options.join(', ') : JSON.stringify(q.options)) : '',
      answer: q.answer || '',
      link: q.link || '',
      reward: String(q.reward),
    })
  }

  const saveEdit = async (id) => {
    try {
      let opts = undefined
      if (editForm.options.trim()) {
        try { opts = JSON.parse(editForm.options) } catch { opts = editForm.options.split(',').map(o => o.trim()).filter(Boolean) }
      }
      const body = {}
      if (editForm.text) body.text = editForm.text
      if (editForm.answer) body.answer = editForm.answer
      if (editForm.reward) body.reward = Number(editForm.reward)
      if (editForm.link && editForm.link.length > 1) body.link = editForm.link
      if (opts !== undefined) body.options = opts
      await api.patch(`/api/question/${id}`, body)
      flash('success', 'Question updated!')
      setEditingId(null)
      fetchQuestions()
    } catch (e) {
      flash('error', e.message)
    }
  }

  const inputClass = "w-full bg-black/50 border border-[#2DFF9A]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#2DFF9A]/50 focus:shadow-[0_0_15px_rgba(45,255,154,0.1)] transition-all placeholder-slate-600"
  const labelClass = "block text-[10px] tracking-[0.3em] text-slate-500 uppercase mb-2"

  return (
    <div className="space-y-5">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <DoomCard className="p-6 space-y-4">
        <h3 className="text-[#2DFF9A] text-sm tracking-[0.3em] uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Inject Question
        </h3>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className={labelClass} style={{ fontFamily: 'Orbitron, sans-serif' }}>Round Number</label>
            <input
              className={inputClass}
              value={roundId}
              onChange={e => setRoundId(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <button
            onClick={fetchQuestions}
            disabled={!roundId.trim()}
            className="px-5 py-2.5 rounded-xl border border-[#2DFF9A]/20 text-[#2DFF9A] text-[10px] tracking-[0.25em] uppercase hover:bg-[#2DFF9A]/10 transition-all disabled:opacity-30"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Load
          </button>
        </div>

        <div>
          <label className={labelClass} style={{ fontFamily: 'Orbitron, sans-serif' }}>Question Text *</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder="What is the capital of France?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ fontFamily: 'Orbitron, sans-serif' }}>Answer *</label>
            <input className={inputClass} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Paris" />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: 'Orbitron, sans-serif' }}>Reward (pts) *</label>
            <input className={inputClass} value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} placeholder="10" />
          </div>
        </div>

        <div>
          <label className={labelClass} style={{ fontFamily: 'Orbitron, sans-serif' }}>Options — MCQ (comma-separated, optional)</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={form.options}
            onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
            placeholder="Paris, London, Berlin, India"
          />
        </div>

        <div>
          <label className={labelClass} style={{ fontFamily: 'Orbitron, sans-serif' }}>Reference Link (optional)</label>
          <input className={inputClass} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
        </div>

        <button
          onClick={createQuestion}
          disabled={submitting || !roundId.trim()}
          className="px-6 py-2.5 rounded-xl border border-[#2DFF9A]/30 bg-[#2DFF9A]/10 text-[#2DFF9A] text-xs tracking-[0.3em] uppercase transition-all duration-300 hover:bg-[#2DFF9A]/20 hover:shadow-[0_0_20px_rgba(45,255,154,0.25)] disabled:opacity-40"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {submitting ? '[ TRANSMITTING... ]' : '[ + ADD QUESTION ]'}
        </button>
      </DoomCard>

      {loadingQs ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : questions.length > 0 ? (
        <DoomCard>
          <div className="px-6 py-4 border-b border-[#2DFF9A]/10">
            <h3 className="text-[#2DFF9A] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Questions — Round {roundId}
            </h3>
          </div>
          <div className="divide-y divide-[#2DFF9A]/05">
            {questions.map((q, i) => (
              <div key={q._id} className="px-6 py-4">
                {editingId === q._id ? (
                  <div className="space-y-3">
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      value={editForm.text}
                      onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={inputClass} placeholder="Answer" value={editForm.answer} onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))} />
                      <input className={inputClass} placeholder="Reward" value={editForm.reward} onChange={e => setEditForm(f => ({ ...f, reward: e.target.value }))} />
                    </div>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      placeholder="Options (comma-separated)"
                      value={editForm.options}
                      onChange={e => setEditForm(f => ({ ...f, options: e.target.value }))}
                    />
                    <input className={inputClass} placeholder="Link" value={editForm.link} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(q._id)}
                        className="px-4 py-1.5 rounded-lg border border-[#2DFF9A]/30 bg-[#2DFF9A]/10 text-[#2DFF9A] text-[10px] tracking-[0.25em] uppercase hover:bg-[#2DFF9A]/20 transition-all"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >Save</button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 rounded-lg border border-white/10 text-slate-500 text-[10px] tracking-[0.25em] uppercase hover:text-white transition-all"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded border border-[#2DFF9A]/20 text-[10px] flex items-center justify-center text-[#2DFF9A] flex-shrink-0 mt-0.5"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm mb-2">{q.text}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] tracking-[0.25em] px-2 py-0.5 rounded-full border border-yellow-400/30 text-yellow-400 bg-yellow-400/10 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          +{q.reward} pts
                        </span>
                        {q.options && (
                          <span className="text-[9px] tracking-[0.25em] px-2 py-0.5 rounded-full border border-blue-400/30 text-blue-400 bg-blue-400/10 uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            MCQ
                          </span>
                        )}
                        {q.link && (
                          <a href={q.link} target="_blank" rel="noreferrer" className="text-[9px] tracking-[0.25em] px-2 py-0.5 rounded-full border border-[#2DFF9A]/30 text-[#2DFF9A] bg-[#2DFF9A]/10 uppercase hover:bg-[#2DFF9A]/20 transition-all" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            ↗ Link
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => startEdit(q)}
                        className="w-8 h-8 rounded-lg border border-[#2DFF9A]/15 text-slate-500 hover:text-[#2DFF9A] hover:border-[#2DFF9A]/30 transition-all text-sm flex items-center justify-center"
                      >✏️</button>
                      <button
                        onClick={() => deleteQuestion(q._id)}
                        disabled={deletingId === q._id}
                        className="w-8 h-8 rounded-lg border border-red-500/15 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all text-sm flex items-center justify-center disabled:opacity-40"
                      >🗑</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DoomCard>
      ) : null}
    </div>
  )
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage({ onNav }) {
  const [tab, setTab] = useState('rounds')
  

  const tabs = [
    { id: 'rounds',      label: 'ROUNDS',      sub: '🔄' },
    { id: 'questions',   label: 'QUESTIONS',   sub: '❓' },
    { id: 'maintenance', label: 'MAINTENANCE', sub: '🛠' },
    { id: 'transitions', label: 'TRANSITIONS', sub: '🎬' },
  ]

  return (
    <div className="relative min-h-screen">

      {/* ── Atmospheric BG layers ── */}
      <div className="fixed inset-0 -z-20 bg-[#030a06]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_10%,rgba(45,255,154,0.10),transparent_35%),radial-gradient(ellipse_at_80%_90%,rgba(45,255,154,0.07),transparent_35%),radial-gradient(ellipse_at_50%_50%,rgba(0,255,100,0.03),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,0,0,0.05),transparent_30%)]" />
      <div className="fixed inset-0 -z-10 opacity-[0.022] bg-[linear-gradient(to_bottom,transparent,transparent_2px,rgba(255,255,255,0.8)_3px)] bg-[length:100%_4px]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse,transparent_30%,rgba(0,0,0,0.88))]" />

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">

        {/* ── RETURN BUTTON ── */}
        <button
          onClick={() => onNav && onNav('home')}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2DFF9A]/20 text-[#2DFF9A] text-xs tracking-[0.25em] uppercase hover:border-[#2DFF9A]/40 hover:bg-[#2DFF9A]/5 transition-all"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          ← Back to Home
        </button>

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#2DFF9A]/12 bg-black/50 px-8 py-10 backdrop-blur-xl">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#2DFF9A]/50 to-transparent" />
          <div className="absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,255,154,0.08),transparent_50%)] pointer-events-none" />

          <div className="relative text-center">
            <div
              className="text-[10px] tracking-[0.65em] text-[#2DFF9A]/60 mb-4 uppercase"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Doomsday Protocol
            </div>

            <h1
              className="text-4xl sm:text-5xl text-white tracking-[0.14em] mb-4"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 40px rgba(45,255,154,0.15), 0 0 80px rgba(45,255,154,0.06)'
              }}
            >
              ADMIN COMMAND
            </h1>

            <div className="mx-auto w-40 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent mb-6" />

            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-7">
              Organizer controls — manage rounds, questions, and reality stabilization protocols.
            </p>

            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2.5 rounded-full border border-[#2DFF9A]/15 bg-[#2DFF9A]/5 px-5 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2DFF9A] shadow-[0_0_10px_rgba(45,255,154,1)] animate-pulse" />
                <span className="text-[9px] tracking-[0.45em] text-[#2DFF9A] uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  System Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB MODULES ── */}
        <div className="flex flex-wrap justify-center gap-3">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative overflow-hidden rounded-2xl border px-6 py-3.5 transition-all duration-300 group ${
                tab === t.id
                  ? 'border-[#2DFF9A]/35 bg-[#2DFF9A]/10 shadow-[0_0_30px_rgba(45,255,154,0.12)]'
                  : 'border-white/08 bg-black/30 hover:border-[#2DFF9A]/18'
              }`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(45,255,154,0.05),transparent_70%)]" />
              <div className="relative flex flex-col items-center gap-1">
                <div
                  className={`text-[9px] tracking-[0.4em] uppercase transition-colors ${tab === t.id ? 'text-[#2DFF9A]/70' : 'text-slate-600'}`}
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  Module
                </div>
                <div
                  className={`text-xs tracking-[0.25em] uppercase transition-colors ${tab === t.id ? 'text-white' : 'text-slate-500'}`}
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {t.label}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div>
          {tab === 'rounds'      && <RoundsTab />}
          {tab === 'questions'   && <QuestionsTab />}
          {tab === 'maintenance' && <MaintenanceTab />}
          {tab === 'transitions' && <TransitionsTab />}
        </div>

      </div>
    </div>
  )
}