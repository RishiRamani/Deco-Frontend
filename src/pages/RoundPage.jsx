import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApi } from '../hooks/useApi'
import Timer from '../components/Timer'
import { Alert, Btn, Input, Panel, Spinner } from '../components/UI'
import {
  ROUND_JOIN_BUFFER_MS,
  loadRoundExperience,
  roundNarrative,
  sceneTheme,
  stageCharacters,
} from '../config/experience'

function normalizeOptions(options) {
  if (!options) return []
  if (Array.isArray(options)) {
    return options.map((value, index) => ({ key: String(index), label: String.fromCharCode(65 + index), value }))
  }

  return Object.entries(options).map(([key, value], index) => ({
    key,
    label: String.fromCharCode(65 + index),
    value,
  }))
}

function formatText(text, vars) {
  if (typeof text !== 'string') return text
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(vars[key] ?? ''))
}

function formatNarrativeItems(items, vars) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    ...item,
    id: formatText(item.id, vars),
    speaker: formatText(item.speaker, vars),
    characterId: formatText(item.characterId, vars),
    label: formatText(item.label, vars),
    text: formatText(item.text, vars),
    transcript: formatText(item.transcript, vars),
  }))
}

function matchesQuestionNumber(item, questionNumber) {
  if (item?.questionNumber == null) return true
  if (Array.isArray(item.questionNumber)) {
    return item.questionNumber.includes(questionNumber)
  }
  return item.questionNumber === questionNumber
}

function resolveNarrativeSequence(sequence, vars, questionNumber) {
  if (Array.isArray(sequence)) {
    return formatNarrativeItems(sequence.filter((item) => matchesQuestionNumber(item, questionNumber)), vars)
  }

  if (typeof sequence === 'function') {
    return formatNarrativeItems(sequence(vars), vars)
  }

  return []
}

function getPlayableUntil(round) {
  return new Date(new Date(round.endsAt).getTime() - ROUND_JOIN_BUFFER_MS).toISOString()
}

function StageCharacter({ character, visible }) {
  return (
    <div
      className={`pointer-events-none absolute z-10 hidden rounded-[3rem] border shadow-[0_35px_100px_rgba(2,6,23,0.55)] transition duration-500 lg:block ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-35 translate-y-4'
      }`}
      style={{
        borderColor: `${character.accent}66`,
        background: `radial-gradient(circle at 50% 20%, ${character.accent}55, rgba(15,23,42,0.92) 55%)`,
        width: character.size,
        height: `calc(${character.size} * 1.1)`,
        ...character.style,
      }}
    >
      <div className="absolute inset-x-0 bottom-6 text-center text-lg font-medium text-white">{character.name}</div>
    </div>
  )
}

function SceneDialogue({ item, onAdvance, sceneTheme }) {
  if (!item) return null

  const body = (
    <>
      <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.speaker}</div>
      <p className="mt-4 text-base leading-8">{item.text}</p>
      {item.type === 'voiceMemo' && (
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/10 px-4 py-3 text-sm leading-7 text-slate-700">
          {item.transcript}
        </div>
      )}
      <div className="mt-5 text-right text-xs uppercase tracking-[0.25em] text-slate-500">Click to continue</div>
    </>
  )

  if (item.type === 'voiceMemo') {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="relative z-30 w-full max-w-2xl rounded-[2rem] border border-cyan-300/25 bg-cyan-100/95 p-6 text-left text-slate-900 shadow-[0_25px_80px_rgba(34,211,238,0.2)]"
      >
        {body}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="relative z-30 w-full max-w-2xl rounded-[2rem] p-6 text-left shadow-[0_25px_80px_rgba(255,255,255,0.18)]"
      style={{
        background: sceneTheme.dialogueBox.background,
        border: sceneTheme.dialogueBox.border,
        color: sceneTheme.dialogueBox.color,
      }}
    >
      {body}
    </button>
  )
}

function QuestionCard({ question, questionNumber, totalQuestions, onSubmit, loading, previousAnswer, sceneTheme }) {
  const [answer, setAnswer] = useState(previousAnswer || '')
  const options = useMemo(() => normalizeOptions(question?.options), [question?.options])

  useEffect(() => {
    setAnswer(previousAnswer || '')
  }, [previousAnswer, question?.id])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!answer.trim()) return
    onSubmit(answer)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-30 mt-6 rounded-[2rem] p-6 shadow-[0_35px_100px_rgba(2,6,23,0.45)]"
      style={{
        width: sceneTheme.questionBox.width,
        minHeight: sceneTheme.questionBox.minHeight,
        background: sceneTheme.questionBox.background,
        border: sceneTheme.questionBox.border,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Question {questionNumber}</div>
          <h2 className="mt-3 max-w-2xl text-2xl font-medium text-white">{question.text}</h2>
        </div>
        <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
          {question.reward} pts
        </div>
      </div>

      {question.link && (
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
          <img src={question.link} alt="" className="max-h-72 w-full object-cover" />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {options.length > 0 ? (
          <div className="grid gap-3">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setAnswer(option.value)}
                className={`rounded-[1.5rem] border px-4 py-4 text-left text-sm transition ${
                  answer === option.value
                    ? 'border-cyan-300/40 bg-cyan-300/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-xs text-cyan-100">
                    {option.label}
                  </span>
                  <span className="leading-7">{option.value}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer here" />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">{totalQuestions - questionNumber} questions remain after this one.</div>
        <Btn type="submit" loading={loading} disabled={!answer.trim()}>
          Submit
        </Btn>
      </div>
    </form>
  )
}

function AnswerReveal({ question, submittedAnswer, isLastQuestion, onContinue, onFinish, sceneTheme }) {
  return (
    <div
      className="relative z-30 mt-6 flex flex-col items-center justify-center rounded-[2rem] px-8 py-10 text-center shadow-[0_35px_100px_rgba(8,145,178,0.24)]"
      style={{
        width: sceneTheme.answerRevealBox.width,
        minHeight: sceneTheme.answerRevealBox.minHeight,
        background: sceneTheme.answerRevealBox.background,
        border: sceneTheme.answerRevealBox.border,
      }}
    >
      <div className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Submitted Answer</div>
      <div className="mt-6 text-xl leading-8 text-white">{submittedAnswer}</div>
      <div className="mt-3 text-sm text-slate-300">{question.text}</div>
      <div className="mt-8">
        {isLastQuestion ? <Btn onClick={onFinish}>Finish</Btn> : <Btn onClick={onContinue}>Next question</Btn>}
      </div>
    </div>
  )
}

export default function RoundPage({ onNav }) {
  const api = useApi()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [round, setRound] = useState(null)
  const [roundExperience, setRoundExperience] = useState(null)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('question')
  const [sequenceIndex, setSequenceIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const finishTriggeredRef = useRef(false)

  const boot = useCallback(async () => {
    try {
      setLoading(true)
      const activeRound = await api.get('/api/round/active')
      if (!activeRound) {
        onNav('waiting')
        return
      }

      const playableUntil = new Date(activeRound.endsAt).getTime() - ROUND_JOIN_BUFFER_MS

      if (Date.now() >= playableUntil) {
        onNav('waiting')
        return
      }

      setRound(activeRound)

      const status = await api.get(`/api/round/status/${activeRound.id}`)
      if (!status.started) {
        await api.post(`/api/round/${activeRound.id}/start`)
      } else if (status.finished) {
        onNav('waiting')
        return
      }

      const roundExperienceConfig = await loadRoundExperience(activeRound.id)
      if (roundExperienceConfig) {
        setRoundExperience(roundExperienceConfig)
      }

      const questionResult = await api.get(`/api/question/round/${activeRound.id}`)
      const responseResult = await api.get(`/api/response/${activeRound.id}/me`)
      const loadedQuestions = questionResult?.data || []
      const loadedResponses = Array.isArray(responseResult) ? responseResult : []
      const answeredIds = new Set(loadedResponses.map((item) => item.questionId))
      const firstPendingIndex = loadedQuestions.findIndex((item) => !answeredIds.has(item.id))

      setQuestions(loadedQuestions)
      setResponses(loadedResponses)
      setCurrentIndex(firstPendingIndex >= 0 ? firstPendingIndex : Math.max(loadedQuestions.length - 1, 0))
      setPhase(firstPendingIndex === -1 && loadedQuestions.length > 0 ? 'answer' : 'question')
      setSequenceIndex(0)
      setError(null)
    } catch (err) {
      if (err?.status === 404) {
        onNav('waiting')
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api, onNav])

  useEffect(() => {
    boot()
  }, [boot])

  const finishRound = useCallback(
    async ({ silent = false } = {}) => {
      if (!round || finishTriggeredRef.current) return
      finishTriggeredRef.current = true
      setFinishing(true)

      try {
        await api.post(`/api/round/${round.id}/finish`)
      } catch (err) {
        if (!silent && err?.message !== 'Round already ended') {
          setError(err.message)
          finishTriggeredRef.current = false
          setFinishing(false)
          return
        }
      }

      try {
        const upcomingRound = await api.get('/api/round/upcoming')
        if (upcomingRound) {
          onNav('waiting')
        } else {
          onNav('leaderboard')
        }
      } catch {
        onNav('leaderboard')
      }
    },
    [api, onNav, round],
  )

  const currentQuestion = questions[currentIndex]
  const currentResponse = currentQuestion
    ? responses.find((response) => response.questionId === currentQuestion.id)
    : null

  const experience = roundExperience || {
    sceneTheme,
    stageCharacters,
    roundNarrative,
  }

  const effectiveSceneTheme = experience.sceneTheme
  const effectiveStageCharacters = experience.stageCharacters
  const effectiveRoundNarrative = experience.roundNarrative

  const preQuestionSequence = useMemo(() => {
    if (!currentQuestion) return []

    const introItems = currentIndex === 0 && responses.length === 0
      ? resolveNarrativeSequence(effectiveRoundNarrative.preQuestion, {}, currentIndex + 1)
      : []

    const duringItems = resolveNarrativeSequence(
      effectiveRoundNarrative.duringQuestion,
      {
        questionNumber: currentIndex + 1,
        totalQuestions: questions.length,
      },
      currentIndex + 1,
    )

    return [
      ...introItems,
      ...duringItems,
    ]
  }, [currentIndex, currentQuestion, questions.length, responses.length, effectiveRoundNarrative])

  const postAnswerSequence = useMemo(() => {
    if (!currentResponse) return []

    const lastQuestionPhrase = currentIndex === questions.length - 1 ? 'This was the final answer.' : 'Onwards.'

    return resolveNarrativeSequence(
      effectiveRoundNarrative.afterAnswer,
      {
        submittedAnswer: currentResponse.submittedAnswer,
        isLastQuestion: currentIndex === questions.length - 1,
        lastQuestionPhrase,
      },
      currentIndex + 1,
    )
  }, [currentIndex, currentResponse, questions.length, effectiveRoundNarrative])

  const activeSequence = phase === 'answer' ? postAnswerSequence : preQuestionSequence
  const activeDialogue = sequenceIndex < activeSequence.length ? activeSequence[sequenceIndex] : null
  const highlightedCharacter = activeDialogue?.characterId
  const isLastQuestion = currentIndex === questions.length - 1
  const showQuestionCard = phase === 'question' && !activeDialogue && currentQuestion
  const showAnswerReveal = phase === 'answer' && !activeDialogue && currentQuestion && currentResponse

  const submitAnswer = async (submittedAnswer) => {
    if (!currentQuestion) return
    setSubmitting(true)

    try {
      await api.post('/api/response', {
        questionId: currentQuestion.id,
        submittedAnswer,
      })

      const nextResponse = { questionId: currentQuestion.id, submittedAnswer }
      setResponses((prev) => {
        const withoutCurrent = prev.filter((item) => item.questionId !== currentQuestion.id)
        return [...withoutCurrent, nextResponse]
      })
      setPhase('answer')
      setSequenceIndex(0)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const goNext = () => {
    setCurrentIndex((value) => Math.min(value + 1, questions.length - 1))
    setPhase('question')
    setSequenceIndex(0)
  }

  const advanceSequence = () => {
    setSequenceIndex((value) => value + 1)
  }

  const answeredCount = responses.length
  const totalQuestions = questions.length
  const playableUntil = round ? getPlayableUntil(round) : null
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && !round) {
    return (
      <div className="space-y-4">
        <Alert type="error">{error}</Alert>
        <Btn onClick={() => onNav('waiting')}>Go to waiting screen</Btn>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Active round</div>
          <h1 className="mt-2 text-4xl font-semibold text-white">Round #{round?.id}</h1>
        </div>
        {playableUntil && <Timer targetTime={playableUntil} label="Playable until" onExpire={() => finishRound({ silent: true })} />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.28fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Progress</div>
            <div className="mt-4 text-3xl font-semibold text-white">{progress}%</div>
            <div className="mt-2 text-sm text-slate-300">
              {answeredCount} of {totalQuestions} answers submitted
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </Panel>
        </div>

        <div
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 shadow-[0_35px_120px_rgba(2,6,23,0.42)]"
          style={{
            minHeight: sceneTheme.frame.minHeight,
background: effectiveSceneTheme.frame.background,
      }}
    >
      <div
        className="absolute inset-5 rounded-[2rem] border border-white/10"
        style={{ background: effectiveSceneTheme.stage.backgroundImage }}
      />

      <StageCharacter character={effectiveStageCharacters.curator} visible={highlightedCharacter === 'curator'} />
      <StageCharacter character={effectiveStageCharacters.signal} visible={highlightedCharacter === 'signal'} />

          <div className="relative z-20 flex min-h-[calc(100vh-14rem)] flex-col items-center justify-start px-2 pt-6">
            {activeDialogue ? (
              <div className="mt-10 w-full max-w-2xl">
                <SceneDialogue item={activeDialogue} onAdvance={advanceSequence} sceneTheme={effectiveSceneTheme} />
              </div>
            ) : currentQuestion ? (
              showAnswerReveal ? (
                <AnswerReveal
                  question={currentQuestion}
                  submittedAnswer={currentResponse.submittedAnswer}
                  isLastQuestion={isLastQuestion}
                  onContinue={goNext}
                  onFinish={() => finishRound()}
                  sceneTheme={effectiveSceneTheme}
                />
              ) : showQuestionCard ? (
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={totalQuestions}
                  onSubmit={submitAnswer}
                  loading={submitting}
                  previousAnswer={currentResponse?.submittedAnswer}
                  sceneTheme={effectiveSceneTheme}
                />
              ) : null
            ) : (
              <div className="relative z-30 w-full max-w-2xl">
                <Panel className="bg-emerald-300/10 text-center">
                  <div className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">No questions</div>
                  <div className="mt-4 text-2xl font-medium text-white">This round does not have any questions yet.</div>
                  <div className="mt-6 flex justify-center">
                    <Btn onClick={() => finishRound({ silent: true })} loading={finishing}>
                      Finish round
                    </Btn>
                  </div>
                </Panel>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
