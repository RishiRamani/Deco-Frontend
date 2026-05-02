import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { Btn, Input, Textarea, Alert, Spinner, StatusBadge, Badge } from '../components/UI'

// ── Maintenance Tab ──────────────────────────────────────────────────────────────
function MaintenanceTab() {
  const api = useApi()
  const [truncating, setTruncating] = useState(false)
  const [msg, setMsg] = useState(null)

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const truncateTables = async () => {
    if (!confirm('Are you sure you want to truncate all question, response, round, and roundresult tables? This action cannot be undone.')) {
      return
    }
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

      <div className="card p-5">
        <h3 className="font-display text-white text-lg mb-4">Database Maintenance</h3>
        <p className="text-slate-300 mb-4">
          Truncate all data from question, response, round, and roundresult tables. Use with caution.
        </p>
        <Btn onClick={truncateTables} loading={truncating} variant="danger">
          Truncate All Tables
        </Btn>
      </div>
    </div>
  )
}

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
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRounds() }, [])

  const createRound = async () => {
    if (!startedAt || !endsAt) {
      flash('error', 'Both start and end times are required')
      return
    }

    const startDate = new Date(startedAt)
    const endDate = new Date(endsAt)

    if (endDate <= startDate) {
      flash('error', 'End time must be after start time')
      return
    }

    setCreating(true)
    try {
      await api.post('/api/round', {
        startedAt: startDate.toISOString(),
        endsAt: endDate.toISOString()
      })

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString()
  }

  const isRoundActive = (round) => {
    const now = new Date()
    return now >= new Date(round.startedAt) && now <= new Date(round.endsAt)
  }

  const isRoundCompleted = (round) => {
    return new Date() > new Date(round.endsAt)
  }

  return (
    <div className="space-y-5">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Create */}
      <div className="card p-5">
        <h3 className="font-display text-white text-lg mb-4">Create Round</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <Input
            label="Start Time *"
            type="datetime-local"
            value={startedAt}
            onChange={e => setStartedAt(e.target.value)}
          />
          <Input
            label="End Time *"
            type="datetime-local"
            value={endsAt}
            onChange={e => setEndsAt(e.target.value)}
          />
        </div>
        <Btn onClick={createRound} loading={creating} className="mt-4">+ Create Round</Btn>
      </div>

      {/* All rounds */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2DFF9A]/10 flex items-center justify-between">
          <h3 className="font-display text-white">All Rounds</h3>
          <Btn variant="ghost" size="sm" onClick={fetchRounds}>↺ Refresh</Btn>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : rounds.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b6b7a]">No rounds yet. Create one above.</div>
        ) : (
          <div className="divide-y divide-[#222228]">
            {rounds.map(r => (
              // FIX: use r._id (MongoDB) instead of r.id
              <div key={r._id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-white font-semibold">
                      Round <span className="text-[#2DFF9A] text-xs">{r._id}</span>
                    </span>
                    {isRoundActive(r) && <Badge variant="green">Active</Badge>}
                    {isRoundCompleted(r) && <Badge variant="gray">Completed</Badge>}
                    {!isRoundActive(r) && !isRoundCompleted(r) && <Badge variant="blue">Upcoming</Badge>}
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-[#6b6b7a]">
                    <span>📅 Starts: {formatDateTime(r.startedAt)}</span>
                    <span>📅 Ends: {formatDateTime(r.endsAt)}</span>
                    <span>❓ Questions: {r.totalQuestions || 0}</span>
                    <span>📋 Participants: {r.totalParticipants || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="ghost">View Details</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
      const opts = form.options
        .split(',')
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0)

      if (opts.length === 1) {
        flash('error', 'MCQ must have at least 2 options. Leave blank for a textual question.')
        setSubmitting(false)
        return
      }

      // FIX: roundId must be the raw ObjectId string — no Number() cast
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
      // FIX: filter by _id string
      setQuestions(qs => qs.filter(q => q._id !== id))
    } catch (e) {
      flash('error', e.message)
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (q) => {
    // FIX: use q._id
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
        // Accept both comma-separated and JSON array
        try {
          opts = JSON.parse(editForm.options)
        } catch {
          opts = editForm.options.split(',').map(o => o.trim()).filter(Boolean)
        }
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

  return (
    <div className="space-y-5">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Create */}
      <div className="card p-5 space-y-4">
        <h3 className="font-display text-white text-lg">Add Question</h3>
        <div className="flex gap-3 items-end">
          {/* FIX: plain text input — paste the ObjectId string from the Rounds tab */}
          <Input
            label="Round ID (ObjectId)"
            value={roundId}
            onChange={e => setRoundId(e.target.value)}
            placeholder="e.g. 6650f3a2c1b2d3e4f5a6b7c8"
            className="flex-1"
          />
          <Btn variant="secondary" size="sm" onClick={fetchQuestions} disabled={!roundId.trim()}>Load Questions</Btn>
        </div>
        <Textarea label="Question text *" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What is the capital of France?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Answer *" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Paris" />
          <Input label="Reward (points) *" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} placeholder="10" />
        </div>
        <Textarea
          label="Options (optional — for MCQ, comma-separated. Leave blank for textual question)"
          value={form.options}
          onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
          placeholder="E.g., Paris, London, Berlin, India"
          rows={2}
        />
        <Input label="Reference link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
        <Btn onClick={createQuestion} loading={submitting} disabled={!roundId.trim()}>+ Add Question</Btn>
      </div>

      {/* Questions list */}
      {loadingQs ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : questions.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2DFF9A]/10">
            <h3 className="font-display text-white">Questions — Round {roundId}</h3>
          </div>
          <div className="divide-y divide-[#222228]">
            {questions.map((q, i) => (
              // FIX: key and all operations use q._id
              <div key={q._id} className="px-5 py-4">
                {editingId === q._id ? (
                  <div className="space-y-3">
                    <Textarea value={editForm.text} onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))} rows={2} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Answer" value={editForm.answer} onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))} />
                      <Input label="Reward" value={editForm.reward} onChange={e => setEditForm(f => ({ ...f, reward: e.target.value }))} />
                    </div>
                    <Textarea label="Options (comma-separated or JSON array)" value={editForm.options} onChange={e => setEditForm(f => ({ ...f, options: e.target.value }))} rows={2} />
                    <Input label="Link" value={editForm.link} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} />
                    <div className="flex gap-2">
                      <Btn size="sm" onClick={() => saveEdit(q._id)}>Save</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded bg-white/5 text-xs flex items-center justify-center text-[#6b6b7a] flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm mb-1">{q.text}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="yellow">+{q.reward} pts</Badge>
                        {q.options && <Badge variant="blue">MCQ</Badge>}
                        {q.link && <a href={q.link} target="_blank" rel="noreferrer" className="text-[#2DFF9A] hover:underline">🔗 link</a>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Btn size="sm" variant="ghost" onClick={() => startEdit(q)}>✏️</Btn>
                      <Btn size="sm" variant="danger" onClick={() => deleteQuestion(q._id)} loading={deletingId === q._id}>🗑</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState('rounds')

  const tabs = [
    { id: 'rounds', label: '🔄 Rounds' },
    { id: 'questions', label: '❓ Questions' },
    { id: 'maintenance', label: '🛠️ Maintenance' },
  ]

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display text-white">Admin Panel</h1>
        <p className="text-[#6b6b7a] text-sm mt-1">Organizer controls — manage rounds and questions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0B1F18] border border-[#2DFF9A]/20 rounded-xl w-full sm:w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-[#2DFF9A] text-[#0B1F18] font-bold' : 'text-[#6b6b7a] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rounds' && <RoundsTab />}
      {tab === 'questions' && <QuestionsTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
    </div>
  )
}