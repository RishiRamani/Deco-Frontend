import { useState, useEffect, useRef } from 'react'
import { useApi } from '../hooks/useApi'
import { Btn, Alert, Spinner, Badge } from '../components/UI'

// ── CSS injected once ─────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .quiz-wrap * { box-sizing: border-box; }

  /* Slide-in question card */
  @keyframes slideQuestion {
    from { opacity: 0; transform: translateX(32px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(-32px) scale(0.98); }
  }

  /* Option hover ripple */
  @keyframes optionPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.025); }
    100% { transform: scale(1); }
  }

  /* Correct answer burst */
  @keyframes correctBurst {
    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    60%  { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }

  /* Wrong shake */
  @keyframes wrongShake {
    0%, 100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }

  /* Points float */
  @keyframes floatUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
  }

  /* Image reveal */
  @keyframes imgReveal {
    from { opacity: 0; transform: scale(0.95); filter: blur(6px); }
    to   { opacity: 1; transform: scale(1); filter: blur(0); }
  }

  /* Shimmer loading */
  @keyframes shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }

  /* Progress fill */
  @keyframes progressFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* Pulse dot */
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }

  /* Confetti pop */
  @keyframes confettiFall {
    0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
  }

  .quiz-question-enter {
    animation: slideQuestion 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .quiz-question-exit {
    animation: slideOut 0.22s ease-in both;
  }
  .quiz-option-pop {
    animation: optionPop 0.2s ease;
  }
  .quiz-correct {
    animation: correctBurst 0.6s ease-out;
  }
  .quiz-wrong {
    animation: wrongShake 0.4s ease;
  }
  .quiz-float {
    animation: floatUp 0.9s ease-out forwards;
  }
  .quiz-img-reveal {
    animation: imgReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .quiz-shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  .quiz-option {
    transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .quiz-option::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.07) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .quiz-option:hover::after { opacity: 1; }

  .quiz-text-input {
    transition: all 0.2s;
    background: rgba(255,255,255,0.03);
    caret-color: #f97316;
  }
  .quiz-text-input:focus {
    outline: none;
    background: rgba(249,115,22,0.06);
    box-shadow: 0 0 0 2px rgba(249,115,22,0.3), 0 4px 20px rgba(249,115,22,0.08);
  }

  .quiz-submit-btn {
    transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .quiz-submit-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(249,115,22,0.35);
  }
  .quiz-submit-btn:not(:disabled):active {
    transform: translateY(0) scale(0.97);
  }

  .quiz-continue-btn {
    transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .quiz-continue-btn:not(:disabled):hover {
    transform: translateX(3px);
  }
`

function injectStyles() {
  if (document.getElementById('quiz-styles')) return
  const el = document.createElement('style')
  el.id = 'quiz-styles'
  el.textContent = STYLES
  document.head.appendChild(el)
}

// ── Confetti burst ────────────────────────────────────────────────────────────
function ConfettiBurst({ x, y }) {
  const pieces = Array.from({ length: 8 }, (_, i) => ({
    color: ['#f97316', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'][i % 6],
    delay: i * 0.06,
    angle: (i / 8) * 360,
  }))
  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 7,
            height: 7,
            borderRadius: 2,
            background: p.color,
            animation: `confettiFall 0.7s ${p.delay}s ease-out forwards`,
            transform: `rotate(${p.angle}deg) translateX(${14 + i * 2}px)`,
          }}
        />
      ))}
    </div>
  )
}

// ── Image with shimmer loader ─────────────────────────────────────────────────
function QuestionImage({ src }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored) return null

  return (
    <div style={{
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 20,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      position: 'relative',
      minHeight: loaded ? 'auto' : 180,
    }}>
      {!loaded && (
        <div
          className="quiz-shimmer"
          style={{ position: 'absolute', inset: 0, minHeight: 180, borderRadius: 14 }}
        />
      )}
      <img
        src={src}
        alt="Question reference"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={loaded ? 'quiz-img-reveal' : ''}
        style={{
          width: '100%',
          maxHeight: 320,
          objectFit: 'contain',
          display: loaded ? 'block' : 'none',
          borderRadius: 14,
        }}
      />
    </div>
  )
}

// ── Points float label ────────────────────────────────────────────────────────
function PointsFloat({ pts, x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900)
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      className="quiz-float"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: 22,
        color: '#f97316',
        pointerEvents: 'none',
        zIndex: 9999,
        textShadow: '0 0 20px rgba(249,115,22,0.8)',
        userSelect: 'none',
      }}
    >
      +{pts}
    </div>
  )
}

// ── QuestionCard ──────────────────────────────────────────────────────────────
function QuestionCard({ question, response, index, total, onSubmit, submitting }) {
  const [input, setInput] = useState('')
  const [animClass, setAnimClass] = useState('quiz-question-enter')
  const [selectedAnim, setSelectedAnim] = useState(null) // 'correct' | 'wrong' | null
  const [floats, setFloats] = useState([])
  const [confetti, setConfetti] = useState([])
  const cardRef = useRef(null)

  const hasOptions = question.options && typeof question.options === 'object' && Object.keys(question.options).length > 0
  const optionEntries = hasOptions ? Object.entries(question.options) : []
  const isAnswered = !!response
  const hasImage = !!question.link

  useEffect(() => {
    setInput('')
    setAnimClass('quiz-question-enter')
    setSelectedAnim(null)
    setFloats([])
  }, [question.id])

  const handleOptionMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%'
    const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%'
    e.currentTarget.style.setProperty('--mx', mx)
    e.currentTarget.style.setProperty('--my', my)
  }

  const handleSubmit = async (e) => {
    if (!input.trim()) return
    let answerToSend = input
    if (hasOptions) {
      const match = optionEntries.find(([k]) => k === input)
      if (match) answerToSend = match[1]
    }
    const res = await onSubmit(question.id, answerToSend)
    if (!res) return

    const correct = res.isCorrect
    setSelectedAnim(correct ? 'correct' : 'wrong')

    if (correct) {
      // spawn points float near card
      const rect = cardRef.current?.getBoundingClientRect()
      if (rect) {
        const id = Date.now()
        setFloats(f => [...f, { id, x: rect.right - 60, y: rect.top + 20 }])
        setConfetti(c => [...c, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }])
      }
    }
  }

  return (
    <div
      ref={cardRef}
      className={`card ${animClass}`}
      style={{
        padding: '28px',
        position: 'relative',
        overflow: 'visible',
        border: isAnswered
          ? `1px solid ${response?.isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`
          : '1px solid rgba(255,255,255,0.07)',
        transition: 'border-color 0.4s ease',
      }}
    >
      {/* Floating points */}
      {floats.map(f => (
        <PointsFloat key={f.id} pts={question.reward} x={f.x} y={f.y} onDone={() =>
          setFloats(prev => prev.filter(p => p.id !== f.id))} />
      ))}
      {confetti.map(c => (
        <ConfettiBurst key={c.id} x={c.x} y={c.y} />
      ))}

      {/* Question header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
          {/* Index pill */}
          <div style={{
            flexShrink: 0,
            fontFamily: 'Syne, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: '#6b6b7a',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            padding: '4px 10px',
            marginTop: 2,
            letterSpacing: '0.05em',
          }}>
            {index + 1}<span style={{ opacity: 0.4 }}>/{total}</span>
          </div>

          <p style={{
            color: '#e8edf5',
            fontSize: 16,
            lineHeight: 1.65,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            flex: 1,
          }}>
            {question.text}
          </p>
        </div>

        {/* Points badge */}
        <div style={{
          flexShrink: 0,
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 100,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: '#fb923c',
          fontFamily: 'Syne, sans-serif',
          whiteSpace: 'nowrap',
        }}>
          +{question.reward} pts
        </div>
      </div>

      {/* Image (link field used as image URL) */}
      {hasImage && <QuestionImage src={question.link} />}

      {/* Input area — only when unanswered */}
      {!isAnswered ? (
        <>
          {hasOptions ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: optionEntries.length > 2 ? 'repeat(2, 1fr)' : '1fr',
              gap: 10,
              marginBottom: 20,
            }}>
              {optionEntries.map(([key, val]) => {
                const isSelected = input === key
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setInput(key)
                    }}
                    onMouseMove={handleOptionMouseMove}
                    className={`quiz-option${isSelected ? ' quiz-option-pop' : ''}`}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: isSelected
                        ? '1px solid rgba(249,115,22,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected
                        ? 'rgba(249,115,22,0.12)'
                        : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#fed7aa' : '#94a3b8',
                      fontSize: 14,
                      fontFamily: 'DM Sans, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                      boxShadow: isSelected ? '0 4px 20px rgba(249,115,22,0.15)' : 'none',
                    }}
                  >
                    {/* Option key bubble */}
                    <span style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: isSelected ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.06)',
                      border: isSelected ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: isSelected ? '#f97316' : '#6b6b7a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Syne, sans-serif',
                      transition: 'all 0.18s',
                    }}>
                      {key}
                    </span>
                    <span style={{ lineHeight: 1.4 }}>{val}</span>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <span style={{ marginLeft: 'auto', color: '#f97316', fontSize: 16 }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your answer…"
                className="quiz-text-input"
                style={{
                  width: '100%',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 14,
                  color: '#e8edf5',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!input || submitting === question.id}
            className="quiz-submit-btn"
            style={{
              padding: '11px 24px',
              borderRadius: 10,
              border: 'none',
              background: input
                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                : 'rgba(255,255,255,0.06)',
              color: input ? '#fff' : '#4b4b58',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Syne, sans-serif',
              cursor: input ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: '0.02em',
            }}
          >
            {submitting === question.id ? (
              <>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Submitting…
              </>
            ) : (
              <>Submit Answer</>
            )}
          </button>
        </>
      ) : (
        /* Answered state */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderRadius: 10,
          background: response?.isCorrect
            ? 'rgba(34,197,94,0.08)'
            : 'rgba(239,68,68,0.08)',
          border: `1px solid ${response?.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          <span style={{ fontSize: 18 }}>{response?.isCorrect ? '✅' : '❌'}</span>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: response?.isCorrect ? '#4ade80' : '#f87171',
              fontFamily: 'Syne, sans-serif',
            }}>
              {response?.isCorrect ? `+${response.pointsEarned} points earned!` : 'Incorrect'}
            </div>
            <div style={{ fontSize: 12, color: '#6b6b7a', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>
              {response?.isCorrect ? 'Nice work!' : 'Better luck next time'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main QuizPage ─────────────────────────────────────────────────────────────
export default function QuizPage({ onNav }) {
  useEffect(() => { injectStyles() }, [])

  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const round = await api.get('/api/round/active')
        setActiveRound(round)
        try {
          const status = await api.get(`/api/round/status/${round.id}`)
          if (!status.started) { setError('Please start the round before answering questions'); onNav('round'); setLoading(false); return }
          if (status.finished) { onNav('leaderboard'); setLoading(false); return }
        } catch {}
        const qData = await api.get(`/api/question/round/${round.id}`)
        const qs = qData?.data || qData || []
        setQuestions(qs)
        const rData = await api.get(`/api/response/${round.id}/me`)
        setResponses(Array.isArray(rData) ? rData : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (questions.length > 0) {
      const answeredIds = new Set(responses.map(r => r.questionId))
      const nextIdx = questions.findIndex(q => !answeredIds.has(q.id))
      if (nextIdx >= 0) setCurrentIndex(nextIdx)
      else if (questions.length > 0) setCurrentIndex(questions.length - 1)
    }
  }, [questions, responses])

  const submitAnswer = async (questionId, submittedAnswer) => {
    setSubmitting(questionId)
    try {
      const res = await api.post('/api/response', { questionId, submittedAnswer })
      setResponses(prev => {
        const exists = prev.findIndex(r => r.questionId === questionId)
        const updated = { questionId, submittedAnswer, isCorrect: res.isCorrect, pointsEarned: res.pointsEarned }
        if (exists >= 0) { const arr = [...prev]; arr[exists] = updated; return arr }
        return [...prev, updated]
      })
      setSubmitting(null)
      return res
    } catch (e) {
      setError(e.message)
      setSubmitting(null)
      return null
    }
  }

  const goNext = () => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(i => i + 1)
      setTransitioning(false)
    }, 200)
  }

  const finishRound = async () => {
    if (!activeRound) return
    setFinishing(true)
    try {
      await api.post(`/api/round/${activeRound.id}/finish`)
      onNav('leaderboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setFinishing(false)
    }
  }

  const getResponse = (qId) => responses.find(r => r.questionId === qId)

  const answered = responses.length
  const correct  = responses.filter(r => r.isCorrect).length
  const totalPts = responses.reduce((a, r) => a + (r.pointsEarned || 0), 0)
  const progress = questions.length ? (answered / questions.length) * 100 : 0
  const allDone  = questions.length > 0 && answered === questions.length

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spinner size="lg" />
    </div>
  )

  if (!activeRound || error) return (
    <div className="quiz-wrap" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, color: '#e8edf5', marginBottom: 16 }}>Quiz</h1>
      <Alert type={error ? 'error' : 'info'}>{error || 'No active round.'}</Alert>
      <button onClick={() => onNav('round')} style={{ color: '#f97316', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginTop: 12 }}>
        ← Go to Round page
      </button>
    </div>
  )

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const currentResponse = currentQuestion && getResponse(currentQuestion.id)

  return (
    <div className="quiz-wrap fade-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#e8edf5', lineHeight: 1.1, marginBottom: 6 }}>
            Quiz
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#6b6b7a', fontFamily: 'DM Sans, sans-serif' }}>
              Round #{activeRound.id}
            </span>
            <span style={{ color: '#2a2a35' }}>·</span>
            <span style={{ fontSize: 12, color: '#6b6b7a', fontFamily: 'DM Sans, sans-serif' }}>
              {answered}/{questions.length} answered
            </span>
            {answered > 0 && (
              <>
                <span style={{ color: '#2a2a35' }}>·</span>
                <span style={{
                  fontSize: 12,
                  color: '#f97316',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                }}>
                  {totalPts} pts
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mini score pills */}
        {answered > 0 && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: 100,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              fontSize: 12,
              fontWeight: 700,
              color: '#4ade80',
              fontFamily: 'Syne, sans-serif',
            }}>
              {correct} ✓
            </div>
            <div style={{
              padding: '6px 14px',
              borderRadius: 100,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              fontSize: 12,
              fontWeight: 700,
              color: '#f87171',
              fontFamily: 'Syne, sans-serif',
            }}>
              {answered - correct} ✗
            </div>
          </div>
        )}
      </div>

      {/* ── Progress bar ── */}
      {questions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4b4b58', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {!allDone && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#f97316',
                  display: 'inline-block',
                  animation: 'pulseDot 1.4s ease-in-out infinite',
                }} />
              )}
              {allDone ? '🎉 All done!' : `Question ${Math.min(answered + 1, questions.length)} of ${questions.length}`}
            </span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: progress > 0 ? '#f97316' : '#4b4b58' }}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Track */}
          <div style={{
            height: 6,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 100,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: 100,
              background: allDone
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : 'linear-gradient(90deg, #f97316, #fb923c)',
              transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: progress > 0 ? '0 0 10px rgba(249,115,22,0.4)' : 'none',
            }} />
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {questions.map((q, i) => {
              const resp = getResponse(q.id)
              const isActive = i === currentIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  title={`Question ${i + 1}`}
                  style={{
                    width: isActive ? 20 : 8,
                    height: 8,
                    borderRadius: 100,
                    border: 'none',
                    cursor: 'pointer',
                    background: resp
                      ? (resp.isCorrect ? '#22c55e' : '#ef4444')
                      : isActive
                        ? '#f97316'
                        : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ── Question card ── */}
      {currentQuestion ? (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              opacity: transitioning ? 0 : 1,
              transition: 'opacity 0.18s ease',
            }}
          >
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              response={currentResponse}
              onSubmit={submitAnswer}
              submitting={submitting}
            />
          </div>

          {/* Continue / Finish — shown after answering */}
          {currentResponse && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 14,
                animation: 'slideQuestion 0.3s 0.1s cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              {isLast ? (
                <button
                  onClick={finishRound}
                  disabled={finishing}
                  className="quiz-submit-btn"
                  style={{
                    padding: '12px 28px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Syne, sans-serif',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {finishing ? '…' : '🏁 Finish Round'}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="quiz-continue-btn"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: '1px solid rgba(249,115,22,0.3)',
                    background: 'rgba(249,115,22,0.08)',
                    color: '#fb923c',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'Syne, sans-serif',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    letterSpacing: '0.02em',
                  }}
                >
                  Next Question →
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, color: '#e8edf5', marginBottom: 8 }}>No questions yet</h2>
          <p style={{ color: '#6b6b7a', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            The organizer hasn't added questions to this round.
          </p>
        </div>
      )}

      {/* ── All done banner ── */}
      {allDone && (
        <div
          className="card"
          style={{
            marginTop: 20,
            padding: '28px 28px',
            textAlign: 'center',
            border: '1px solid rgba(34,197,94,0.2)',
            background: 'rgba(34,197,94,0.04)',
            animation: 'slideQuestion 0.4s 0.1s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, color: '#e8edf5', marginBottom: 6 }}>
            All questions answered!
          </h2>
          <p style={{ color: '#6b6b7a', fontSize: 14, fontFamily: 'DM Sans, sans-serif', marginBottom: 20 }}>
            You scored <strong style={{ color: '#f97316' }}>{totalPts} pts</strong> with {correct}/{answered} correct. Finish the round to lock in your score.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Btn onClick={finishRound}>🏁 Finish Round</Btn>
            <Btn variant="secondary" onClick={() => onNav('leaderboard')}>🏆 Leaderboard</Btn>
          </div>
        </div>
      )}

      {/* Error snack */}
      {error && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a24', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '12px 20px', fontSize: 13,
          color: '#fca5a5', zIndex: 9999, fontFamily: 'DM Sans, sans-serif',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          animation: 'slideQuestion 0.3s ease both',
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}