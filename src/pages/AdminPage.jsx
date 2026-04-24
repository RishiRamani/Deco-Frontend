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
    } catch (e) { flash('error', e.message) }
    finally { setLoading(false) }
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
    } catch (e) { flash('error', e.message) }
    finally { setCreating(false) }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  const isRoundActive = (round) => {
    const now = new Date()
    const start = new Date(round.startedAt)
    const end = new Date(round.endsAt)
    return now >= start && now <= end
  }

  const isRoundCompleted = (round) => {
    const now = new Date()
    const end = new Date(round.endsAt)
    return now > end
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
        <div className="px-5 py-4 border-b border-[#222228] flex items-center justify-between">
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
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-white font-semibold">Round #{r.id}</span>
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
    if (!roundId) return
    setLoadingQs(true)
    try {
      const res = await api.get(`/api/question/round/${roundId}`);
      flash('success', `${res?.data.length} Questions found in this round!`);
      setQuestions(res?.data || res || [])
      console.log(res.data);
    } catch (e) {
      flash('error', e.message);

    }
    finally { setLoadingQs(false) }
  }

  const createQuestion = async () => {
    if (!roundId || !form.text || !form.answer || !form.reward) return
    setSubmitting(true)
    try {
      const opts = form.options
        .split(",")
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0)

      // Allow both MCQ (with options) and textual questions (without options)
      const payload = {
        roundId: Number(roundId),
        text: form.text,
        answer: form.answer,
        ...(form.link && { link: form.link }),
        reward: Number(form.reward),
      }

      // Only add options if provided
      if (opts.length > 0) {
        if (opts.length < 2) {
          flash("error", "MCQ must have at least 2 options. Leave blank for textual question.");
          setSubmitting(false);
          return;
        }
        payload.options = opts
      }

      await api.post('/api/question', payload)
      setForm({ text: '', options: '', answer: '', link: '', reward: '' })
      flash('success', 'Question created!')
      fetchQuestions()
    } catch (e) { flash('error', e.message) }
    finally { setSubmitting(false) }
  }

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    setDeletingId(id)
    try {
      await api.del(`/api/question/${id}`)
      flash('success', 'Question deleted')
      setQuestions(qs => qs.filter(q => q.id !== id))
    } catch (e) { flash('error', e.message) }
    finally { setDeletingId(null) }
  }

  const startEdit = (q) => {
    setEditingId(q.id)
    setEditForm({
      text: q.text,
      options: q.options ? JSON.stringify(q.options) : '',
      answer: q.answer,
      link: q.link || '',
      reward: String(q.reward),
    })
  }

  const saveEdit = async (id) => {
    try {
      let opts = undefined
      if (editForm.options.trim()) {
        try { opts = JSON.parse(editForm.options) } catch { flash('error', 'Invalid JSON in options'); return }
      }
      const body = {}
      if (editForm.text) body.text = editForm.text
      if (editForm.answer) body.answer = editForm.answer
      if (editForm.reward) body.reward = Number(editForm.reward)
      if (editForm.link !== undefined && editForm.link.length > 1) body.link = editForm.link
      if (opts !== undefined) body.options = opts
      await api.patch(`/api/question/${id}`, body)
      flash('success', 'Question updated!')
      setEditingId(null)
      fetchQuestions()
    } catch (e) { flash('error', e.message) }
  }

  return (
    <div className="space-y-5">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Create */}
      <div className="card p-5 space-y-4">
        <h3 className="font-display text-white text-lg">Add Question</h3>
        <div className="flex gap-3 items-end">
          <Input label="Round ID" value={roundId} onChange={e => setRoundId(e.target.value)} placeholder="1" className="w-32" />
          <Btn variant="secondary" size="sm" onClick={fetchQuestions} disabled={!roundId}>Load Questions</Btn>
        </div>
        <Textarea label="Question text *" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What is the capital of France?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Answer *" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Paris" />
          <Input label="Reward (points) *" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} placeholder="10" />
        </div>
        <Textarea
          label='Options (optional — for MCQ, comma-separated. Leave blank for textual question)'
          value={form.options}
          onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
          placeholder='E.g., Paris, London, Berlin, India'
          rows={2}
        />
        <Input label="Reference link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
        <Btn onClick={createQuestion} loading={submitting} disabled={!roundId}>+ Add Question</Btn>
      </div>

      {/* Questions list */}
      {loadingQs ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : questions.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222228]">
            <h3 className="font-display text-white">Questions — Round #{roundId}</h3>
          </div>
          <div className="divide-y divide-[#222228]">
            {questions.map((q, i) => (
              <div key={q.id} className="px-5 py-4">
                {editingId === q.id ? (
                  <div className="space-y-3">
                    <Textarea value={editForm.text} onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))} rows={2} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Answer" value={editForm.answer} onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))} />
                      <Input label="Reward" value={editForm.reward} onChange={e => setEditForm(f => ({ ...f, reward: e.target.value }))} />
                    </div>
                    <Textarea label="Options JSON" value={editForm.options} onChange={e => setEditForm(f => ({ ...f, options: e.target.value }))} rows={2} />
                    <Input label="Link" value={editForm.link} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} />
                    <div className="flex gap-2">
                      <Btn size="sm" onClick={() => saveEdit(q.id)}>Save</Btn>
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
                        {q.link && <a href={q.link} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">🔗 link</a>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Btn size="sm" variant="ghost" onClick={() => startEdit(q)}>✏️</Btn>
                      <Btn size="sm" variant="danger" onClick={() => deleteQuestion(q.id)} loading={deletingId === q.id}>🗑</Btn>
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
        <h1 className="text-3xl font-display text-white">Admin Panel</h1>
        <p className="text-[#6b6b7a] text-sm mt-1">Organizer controls — manage rounds and questions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111115] border border-[#222228] rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-orange-500 text-black font-bold' : 'text-[#6b6b7a] hover:text-white'
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
