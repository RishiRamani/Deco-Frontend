import { useState, useEffect, useRef } from 'react'
import { useApi } from '../hooks/useApi'
import { Btn, Alert, Spinner, Badge } from '../components/UI'

function QuestionCard({ question, response, index, total, onSubmit, submitting }) {
  const [input, setInput] = useState('')
  const hasOptions = question.options && typeof question.options === 'object' && Object.keys(question.options).length > 0
  const optionEntries = hasOptions ? Object.entries(question.options) : []
  const isAnswered = !!response

  // reset input when the question changes (new round or navigating)
  useEffect(() => {
    setInput('')
  }, [question.id])

  const handleSubmit = async () => {
    if (!input.trim()) return
    // if this is an MCQ, convert the selected key to the actual text value
    let answerToSend = input
    if (hasOptions) {
      const match = optionEntries.find(([k]) => k === input)
      if (match) answerToSend = match[1]
    }
    await onSubmit(question.id, answerToSend)
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="font-mono text-xs text-[#6b6b7a] bg-white/5 rounded-lg w-10 h-7 flex items-center justify-center flex-shrink-0 mt-0.5">
            {index + 1}/{total}
          </span>
          <div className="flex-1">
            <p className="text-white text-sm leading-relaxed">{question.text}</p>
            {question.link && (
              <a href={question.link} target="_blank" rel="noreferrer" className="text-orange-400 text-xs mt-1 block hover:underline">
                🔗 Reference link →
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="yellow">+{question.reward} pts</Badge>
        </div>
      </div>

      {/* show input only when unanswered */}
      {!isAnswered && (
        <>
          {hasOptions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {optionEntries.map(([key, val]) => {
                const isSelected = input === key
                return (
                  <button
                    key={key}
                    onClick={() => setInput(key)}
                    className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                        : 'bg-white/3 border-white/10 text-[#a0a0b0] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-xs mr-2 opacity-60">{key}</span>{val}
                  </button>
                )
              })}
            </div>
          ) : (
            /* Free text */
            <div className="mb-4">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your answer..."
                className="w-full bg-[#111115] border rounded-xl px-3 py-2.5 text-sm placeholder-[#4b4b58] focus:outline-none transition-all border-[#222228] text-white focus:border-orange-500/50"
              />
            </div>
          )}

          <Btn onClick={handleSubmit} loading={submitting === question.id} size="sm">
            Submit Answer
          </Btn>
        </>
      )}

      {isAnswered && <div className="text-xs text-[#6b6b7a]">Answer recorded</div>}
    </div>
  )
}

export default function QuizPage({ onNav }) {
  const api = useApi()
  const [activeRound, setActiveRound] = useState(null)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([]) // array of response objects
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0) // show one question at a time

  useEffect(() => {
    const init = async () => {
      try {
        const round = await api.get('/api/round/active')
        setActiveRound(round)

        // make sure current user actually started this round
        try {
          const status = await api.get(`/api/round/status/${round.id}`)
          if (!status.started) {
            // redirect back to round page so they must hit start
            setError('Please start the round before answering questions')
            onNav('round')
            setLoading(false)
            return
          }
          if (status.finished) {
            // already finished? send to leaderboard
            onNav('leaderboard')
            setLoading(false)
            return
          }
        } catch {
          // ignore status failure and proceed, backend will still protect
        }

        const qData = await api.get(`/api/question/round/${round.id}`)
        const qs = qData?.data || qData || []
        setQuestions(qs)
        // Fetch existing responses
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

  // whenever questions or responses change, move index to first unanswered question
  useEffect(() => {
    if (questions.length > 0) {
      const answeredIds = new Set(responses.map(r => r.questionId))
      const nextIdx = questions.findIndex(q => !answeredIds.has(q.id))
      if (nextIdx >= 0) {
        setCurrentIndex(nextIdx)
      } else if (questions.length > 0) {
        setCurrentIndex(questions.length - 1)
      }
    }
  }, [questions, responses])

  const submitAnswer = async (questionId, submittedAnswer) => {
    setSubmitting(questionId)
    try {
      const res = await api.post('/api/response', { questionId, submittedAnswer })
      // Update local responses
      setResponses(prev => {
        const exists = prev.findIndex(r => r.questionId === questionId)
        const updated = { questionId, submittedAnswer, isCorrect: res.isCorrect, pointsEarned: res.pointsEarned }
        if (exists >= 0) {
          const arr = [...prev]
          arr[exists] = updated
          return arr
        }
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

  const [finishing, setFinishing] = useState(false)
  const finishRound = async () => {
    if (!activeRound) return
    setFinishing(true)
    try {
      await api.post(`/api/round/${activeRound.id}/finish`)
      // navigate straight to leaderboard once finished
      onNav('leaderboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setFinishing(false)
    }
  }

  const getResponse = (questionId) => responses.find(r => r.questionId === questionId)

  const answered = responses.length
  const correct = responses.filter(r => r.isCorrect).length
  const totalPoints = responses.reduce((acc, r) => acc + (r.pointsEarned || 0), 0)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  if (!activeRound || error) return (
    <div className="max-w-2xl mx-auto space-y-4 fade-up">
      <h1 className="text-3xl font-display text-white">Quiz</h1>
      <Alert type={error ? 'error' : 'info'}>
        {error || 'No active round. Wait for the organizer to start one.'}
      </Alert>
      <button onClick={() => onNav('round')} className="text-orange-400 text-sm hover:underline">
        ← Go to Round page
      </button>
    </div>
  )

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const currentResponse = currentQuestion && getResponse(currentQuestion.id)

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Quiz</h1>
          <p className="text-[#6b6b7a] text-sm mt-1">Round #{activeRound.id}</p>
          <p className="text-xs text-[#6b6b7a] mt-1">Question {answered + 1}/{questions.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      {questions.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-[#6b6b7a] mb-1.5">
            <span>Progress</span>
            <span>{Math.round((answered / questions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(answered / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* current question */}
      {currentQuestion ? (
        <div className="space-y-3">
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            response={currentResponse}
            onSubmit={submitAnswer}
            submitting={submitting}
          />
          {/* continue / finish button shown after response exists */}
          {currentResponse && (
            <div className="flex justify-end">
              {isLast ? (
                <Btn onClick={finishRound} loading={finishing}>
                  🏁 Finish Round
                </Btn>
              ) : (
                <Btn onClick={() => setCurrentIndex(i => i + 1)}>
                  Continue →
                </Btn>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h2 className="text-xl font-display text-white mb-2">No questions yet</h2>
          <p className="text-[#6b6b7a] text-sm">The organizer hasn't added questions to this round.</p>
        </div>
      )}

      {/* All done CTA - keep for safety if user navigated backward */}
      {questions.length > 0 && answered === questions.length && (
        <div className="card p-6 text-center border-green-500/20 glow">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-display text-white mb-1">All questions answered!</h2>
          <p className="text-[#6b6b7a] text-sm mb-4">Don't forget to finish the round to lock in your score.</p>
          <div className="flex justify-center gap-3">
            <Btn onClick={() => onNav('round')}>🏁 Finish Round</Btn>
            <Btn variant="secondary" onClick={() => onNav('leaderboard')}>🏆 Leaderboard</Btn>
          </div>
        </div>
      )}
    </div>
  )
}
