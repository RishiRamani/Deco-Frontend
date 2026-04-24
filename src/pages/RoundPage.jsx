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
  // Extract customization or use defaults
  const customStyles = character.customStyles || {}
  const borderRadiusClass = customStyles.borderRadiusClass || 'rounded-[3rem]'
  const borderColor = customStyles.borderColor || `${character.accent}66`
  const shadowClass = customStyles.shadowClass || 'shadow-[0_35px_100px_rgba(2,6,23,0.55)]'
  const nameClass = customStyles.nameClass || 'text-lg font-medium text-white'
  const nameBackgroundClass = customStyles.nameBackgroundClass || 'bg-transparent'
  const containerTransition = customStyles.containerTransition || 'transition duration-500'
  const imageClass = customStyles.imageClass || 'w-full h-full object-cover'

  return (
    <div
      className={`pointer-events-none fixed border ${borderRadiusClass} ${shadowClass} ${containerTransition} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-35 translate-y-4'
      }`}
      style={{
        borderColor: borderColor,
        width: character.size,
        height: `calc(${character.size} * 1.1)`,
        ...character.style,
      }}
    >
      {character.image ? (
        <img
          src={character.image}
          alt={character.name}
          className={`${imageClass} ${borderRadiusClass}`}
        />
      ) : (
        <div
          className={`w-full h-full ${borderRadiusClass}`}
          style={{
            background: customStyles.fallbackBackground || `radial-gradient(circle at 50% 20%, ${character.accent}55, rgba(15,23,42,0.92) 55%)`,
          }}
        />
      )}
      <div className={`absolute inset-x-0 bottom-6 text-center ${nameClass} ${nameBackgroundClass}`}>{character.name}</div>
    </div>
  )
}

function SceneDialogue({ item, onAdvance, sceneTheme }) {
  if (!item) return null

  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const handlePlayAudio = (e) => {
    e.stopPropagation()
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  // Extract dialogue customization from sceneTheme or use defaults
  const dialogueCustom = sceneTheme.dialogueBox?.customStyles || {}
  const speakerClass = dialogueCustom.speakerClass || 'text-xs uppercase tracking-[0.3em] text-slate-500'
  const textClass = dialogueCustom.textClass || 'mt-4 text-base leading-8'
  const transcriptClass = dialogueCustom.transcriptClass || 'mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/10 px-4 py-3 text-sm leading-7 text-slate-700'
  const continueClass = dialogueCustom.continueClass || 'mt-5 text-right text-xs uppercase tracking-[0.25em] text-slate-500'
  const voicePlayerBgClass = dialogueCustom.voicePlayerBgClass || 'mt-5 flex items-center gap-3 rounded-lg bg-slate-900/50 p-3'
  const playButtonClass = dialogueCustom.playButtonClass || 'flex-shrink-0 rounded-full bg-cyan-500 hover:bg-cyan-600 p-2 transition'
  const voiceTextClass = dialogueCustom.voiceTextClass || 'text-xs text-slate-400'

  // NEW: Dialogue bubble customization
  const voiceMemoBoxClass = dialogueCustom.voiceMemoBoxClass || 'fixed bottom-12 left-1/2 -translate-x-1/2 z-30 max-w-2xl rounded-[2rem] border border-cyan-300/25 bg-cyan-100/95 p-6 text-left text-slate-900 shadow-[0_25px_80px_rgba(34,211,238,0.2)]'
  const normalBoxClass = dialogueCustom.normalBoxClass || 'fixed bottom-12 left-1/2 -translate-x-1/2 z-30 max-w-2xl rounded-[2rem] p-6 text-left shadow-[0_25px_80px_rgba(255,255,255,0.18)]'
  const bubbleContainerClass = sceneTheme.dialogueBox?.bubbleContainerClass || 'rounded-[2rem]'
  const bubbleImage = sceneTheme.dialogueBox?.bubbleImage
  const bubbleImageOpacity = sceneTheme.dialogueBox?.bubbleImageOpacity ?? 1

  const body = (
    <>
      <div className={speakerClass}>{item.speaker}</div>
      <p className={textClass}>{item.text}</p>
      {item.type === 'voiceMemo' && (
        <>
          {item.voiceFile && (
            <div className={voicePlayerBgClass}>
              <button
                type="button"
                onClick={handlePlayAudio}
                className={playButtonClass}
              >
                <span className="text-white font-bold">{isPlaying ? '⏸' : '▶'}</span>
              </button>
              <span className={voiceTextClass}>{isPlaying ? 'Playing...' : 'Play voice memo'}</span>
              <audio
                ref={audioRef}
                src={item.voiceFile}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}
          <div className={transcriptClass}>
            {item.transcript}
          </div>
        </>
      )}
      <div className={continueClass}>Click to continue</div>
    </>
  )

  if (item.type === 'voiceMemo') {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className={voiceMemoBoxClass}
        style={{
          ...(dialogueCustom.voiceMemoBoxStyle || {}),
          backgroundImage: bubbleImage ? `url(${bubbleImage})` : undefined,
          backgroundSize: bubbleImage ? 'cover' : undefined,
          backgroundPosition: bubbleImage ? 'center' : undefined,
          opacity: bubbleImage ? bubbleImageOpacity : undefined,
        }}
      >
        {body}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onAdvance}
      className={`${normalBoxClass} ${bubbleContainerClass}`}
      style={{
        background: bubbleImage 
          ? `url(${bubbleImage})` 
          : sceneTheme.dialogueBox.background,
        backgroundSize: bubbleImage ? 'cover' : undefined,
        backgroundPosition: bubbleImage ? 'center' : undefined,
        border: sceneTheme.dialogueBox.border,
        color: sceneTheme.dialogueBox.color,
        opacity: bubbleImage ? bubbleImageOpacity : 1,
        ...(dialogueCustom.normalBoxStyle || {}),
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

  // Get custom text styles or use defaults
  const questionNumberClass = sceneTheme.questionBox.numberClass || 'text-xs uppercase tracking-[0.3em] text-cyan-200/80'
  const questionTitleClass = sceneTheme.questionBox.titleClass || 'mt-3 max-w-2xl text-2xl font-medium text-white'
  const optionClass = sceneTheme.questionBox.optionClass || 'rounded-[1.5rem] border px-4 py-4 text-left text-sm transition'
  const borderRadiusClass = sceneTheme.questionBox.borderRadiusClass || 'rounded-[2rem]'
  const boxShadow = sceneTheme.questionBox.boxShadow || 'shadow-[0_35px_100px_rgba(2,6,23,0.45)]'

  return (
    <form
      onSubmit={handleSubmit}
      className={`${borderRadiusClass} p-6 ${boxShadow} max-w-2xl w-full`}
      style={{
        background: sceneTheme.questionBox.background,
        border: sceneTheme.questionBox.border,
        minHeight: sceneTheme.questionBox.minHeight,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className={questionNumberClass}>Question {questionNumber}</div>
          <h2 className={questionTitleClass}>{question.text}</h2>
        </div>
        <div className="flex-shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
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
                className={`${optionClass} ${
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

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-slate-400">{totalQuestions - questionNumber} questions remain after this one.</div>
        <Btn type="submit" loading={loading} disabled={!answer.trim()} className="w-full sm:w-auto">
          Submit
        </Btn>
      </div>
    </form>
  )
}

function AnswerReveal({ question, submittedAnswer, isLastQuestion, onContinue, onFinish, sceneTheme }) {
  // Get custom text styles or use defaults
  const answerLabelClass = sceneTheme.answerRevealBox.labelClass || 'text-xs uppercase tracking-[0.35em] text-cyan-100/70'
  const answerTextClass = sceneTheme.answerRevealBox.answerClass || 'mt-6 text-xl leading-8 text-white'
  const questionTextClass = sceneTheme.answerRevealBox.questionClass || 'mt-3 text-sm text-slate-300'
  const borderRadiusClass = sceneTheme.answerRevealBox.borderRadiusClass || 'rounded-[2rem]'
  const boxShadow = sceneTheme.answerRevealBox.boxShadow || 'shadow-[0_35px_100px_rgba(8,145,178,0.24)]'

  return (
    <div
      className={`flex flex-col items-center justify-center px-8 py-10 text-center ${borderRadiusClass} ${boxShadow} max-w-2xl w-full`}
      style={{
        background: sceneTheme.answerRevealBox.background,
        border: sceneTheme.answerRevealBox.border,
        minHeight: sceneTheme.answerRevealBox.minHeight,
      }}
    >
      <div className={answerLabelClass}>Submitted Answer</div>
      <div className={answerTextClass}>{submittedAnswer}</div>
      <div className={questionTextClass}>{question.text}</div>
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

  // ─────────────────────────────────────────────────────────────────────────────
  // APPLY CUSTOM BODY ELEMENT STYLING
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const styleTag = document.getElementById('round-custom-body-style')
    if (roundExperience?.sceneTheme?.bodyElement) {
      const customBody = roundExperience.sceneTheme.bodyElement
      const css = `
        body.round-custom-mode {
          background: ${customBody.background || 'transparent'} !important;
        }
        body.round-custom-mode::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: ${customBody.gridPattern || 'none'};
          background-size: ${customBody.gridPatternSize || '36px 36px'};
          opacity: ${customBody.gridPatternOpacity !== undefined ? customBody.gridPatternOpacity : 0.2};
          pointer-events: none;
          z-index: -999;
        }
      `
      
      if (styleTag) {
        styleTag.textContent = css
      } else {
        const newStyle = document.createElement('style')
        newStyle.id = 'round-custom-body-style'
        newStyle.textContent = css
        document.head.appendChild(newStyle)
      }
      
      document.body.classList.add('round-custom-mode')
      return () => {
        document.body.classList.remove('round-custom-mode')
      }
    } else {
      if (styleTag) styleTag.textContent = ''
      document.body.classList.remove('round-custom-mode')
    }
  }, [roundExperience?.sceneTheme?.bodyElement])

  const boot = useCallback(async () => {
    try {
      setLoading(true)
      const activeRound = await api.get('/api/round/active')
      if (!activeRound || !activeRound?.id) {
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

  useEffect(() => {
    if (!loading && !round && !error) {
      onNav('waiting')
    }
  }, [loading, round, error, onNav])

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
    <>
      {/* Experience Layer - Characters and Dialogue at page level */}
      <StageCharacter character={effectiveStageCharacters.curator} visible={highlightedCharacter === 'curator'} />
      <StageCharacter character={effectiveStageCharacters.signal} visible={highlightedCharacter === 'signal'} />
      {activeDialogue && <SceneDialogue item={activeDialogue} onAdvance={advanceSequence} sceneTheme={effectiveSceneTheme} />}

      {/* Background - Page level styling */}
      <div
        className="fixed inset-0 -z-50 pointer-events-none"
        style={{
          background: effectiveSceneTheme.frame.background,
        }}
      />
      <div
        className="fixed inset-0 -z-40 pointer-events-none rounded-[2rem]"
        style={{ background: effectiveSceneTheme.stage.backgroundImage }}
      />

      {/* Main Content - Progress and Q&A Overlay */}
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        {/* Header: Title on left, Timer on right */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Active round</div>
            <h1 className="mt-2 text-4xl font-semibold text-white">Round #{round?.id}</h1>
          </div>
          {playableUntil && <Timer targetTime={playableUntil} label="Playable until" onExpire={() => finishRound({ silent: true })} />}
        </div>

        {/* Progress Bar - Compact on left */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Progress</div>
            <div className="text-lg font-semibold text-white">{progress}%</div>
            <div className="text-xs text-slate-400 mt-1">
              {answeredCount}/{totalQuestions}
            </div>
            <div className="mt-2 w-32 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Q&A Overlay - Centered Modal */}
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            {currentQuestion ? (
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
              <Panel className="bg-emerald-300/10 text-center">
                <div className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">No questions</div>
                <div className="mt-4 text-2xl font-medium text-white">This round does not have any questions yet.</div>
                <div className="mt-6 flex justify-center">
                  <Btn onClick={() => finishRound({ silent: true })} loading={finishing}>
                    Finish round
                  </Btn>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
