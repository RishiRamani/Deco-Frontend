import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApi } from '../hooks/useApi'
import Timer from '../components/Timer'
import { Alert, Btn, Input, Panel, Spinner } from '../components/UI'
import {
  ROUND_JOIN_BUFFER_MS,
  loadRoundExperience,
  resolveRoundStage,
  roundNarrative,
  sceneTheme,
  stageCharacters,
} from '../config/experience'
import FlashbackTransition from '../components/FlashbackTransition'

// Flashback transition config
const FLASHBACK_IMAGES = [
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
].reverse() // Reverse for time restoring back effect
const FLASHBACK_DURATION = 8 // seconds
const FLASHBACK_SOUND = '/voices/welldone.mp3' // assuming a sound file

// ─── localStorage helpers ─────────────────────────────────────────────────────
function cacheKey(roundId) {
  return `deco_draft_${roundId}`
}

function loadCache(roundId) {
  try {
    const raw = localStorage.getItem(cacheKey(roundId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCache(roundId, drafts) {
  try {
    localStorage.setItem(cacheKey(roundId), JSON.stringify(drafts))
  } catch {}
}

function clearCache(roundId) {
  try {
    localStorage.removeItem(cacheKey(roundId))
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

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

function useIsLandscapeMobile() {
  const [val, setVal] = useState(false)
  useEffect(() => {
    const check = () =>
      setVal(window.innerWidth < 1024 && window.innerWidth > window.innerHeight)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])
  return val
}

function getPlayableUntil(round) {
  return new Date(new Date(round.endsAt).getTime() - ROUND_JOIN_BUFFER_MS).toISOString()
}

function StageCharacter({ character, visible }) {
  const customStyles = character.customStyles || {}
  const borderRadiusClass = customStyles.borderRadiusClass || 'rounded-[3rem]'
  const borderColor = customStyles.borderColor || `${character.accent}66`
  const shadowClass = customStyles.shadowClass || 'shadow-[0_35px_100px_rgba(2,6,23,0.55)]'
  const nameClass = customStyles.nameClass || 'text-lg font-medium text-white'
  const nameBackgroundClass = customStyles.nameBackgroundClass || 'bg-transparent'
  const containerTransition = customStyles.containerTransition || 'transition duration-500'
  const imageClass = customStyles.imageClass || 'w-full h-full object-cover'
  const imageStyle = customStyles.imageStyle || {}

  const characterWidth = `min(calc(${character.size} * 0.9), 26vw)`

  return (
    <div
      className={`pointer-events-none fixed border hidden sm:block ${borderRadiusClass} ${shadowClass} ${containerTransition} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-35 translate-y-4'
      }`}
      style={{
        borderColor: borderColor,
        width: characterWidth,
        aspectRatio: '1 / 1.1',
        ...character.style,
      }}
    >
      {character.image ? (
        <img
          src={character.image}
          alt={character.name}
          className={`${imageClass} ${borderRadiusClass}`}
          style={imageStyle}
        />
      ) : (
        <div
          className={`w-full h-full ${borderRadiusClass}`}
          style={{
            background: customStyles.fallbackBackground || `radial-gradient(circle at 50% 20%, ${character.accent}55, rgba(15,23,42,0.92) 55%)`,
          }}
        />
      )}
      <div className={`absolute inset-x-0 bottom-4 sm:bottom-6 text-center text-sm sm:text-lg font-medium text-white ${nameBackgroundClass}`}>{character.name}</div>
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

  const handleAudioEnded = () => setIsPlaying(false)

  const dialogueCustom = sceneTheme.dialogueBox?.customStyles || {}
  const speakerClass = dialogueCustom.speakerClass || 'text-xs uppercase tracking-[0.22em] text-slate-500'
  const textClass = dialogueCustom.textClass || 'mt-3 text-base leading-7 text-slate-900'
  const transcriptClass = dialogueCustom.transcriptClass || 'mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-inner'
  const continueClass = dialogueCustom.continueClass || 'mt-4 text-right text-[11px] uppercase tracking-[0.22em] text-slate-400'
  const voicePlayerBgClass = dialogueCustom.voicePlayerBgClass || 'mt-4 flex items-center gap-3 rounded-xl border border-[#2DFF9A]/20 bg-[#2DFF9A]/8 p-3'
  const playButtonClass = dialogueCustom.playButtonClass || 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B1F18] text-[#2DFF9A] shadow-[0_0_18px_rgba(45,255,154,0.24)] hover:bg-[#123628] transition'
  const voiceTextClass = dialogueCustom.voiceTextClass || 'text-xs font-medium uppercase tracking-[0.18em] text-slate-600'
  const voiceMemoBoxClass = dialogueCustom.voiceMemoBoxClass || 'relative w-full max-w-xl rounded-2xl p-4 sm:p-5 text-left scale-in'
  const normalBoxClass = dialogueCustom.normalBoxClass || 'relative w-full max-w-xl p-4 sm:p-5 text-left scale-in'
  const bubbleContainerClass = sceneTheme.dialogueBox?.bubbleContainerClass || 'rounded-2xl'
  const boxShadowClass = sceneTheme.dialogueBox?.boxShadow || 'shadow-[0_22px_70px_rgba(0,0,0,0.28)]'
  const dialogueBackground = sceneTheme.dialogueBox?.background || '#ffffff'

  const body = (
    <>
      <div className={speakerClass}>{item.speaker}</div>
      <p className={textClass}>{item.text}</p>
      {item.type === 'voiceMemo' && (
        <>
          {item.voiceFile && (
            <div className={voicePlayerBgClass}>
              <button type="button" onClick={handlePlayAudio} className={playButtonClass}>
                <span className="text-white font-bold">{isPlaying ? '⏸' : '▶'}</span>
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className={voiceTextClass}>{isPlaying ? 'Playing voice memo' : 'Voice memo'}</span>
                <div className="flex h-5 flex-1 items-center gap-1 overflow-hidden">
                  {Array.from({ length: 18 }, (_, index) => (
                    <span
                      key={index}
                      className="w-1 rounded-full bg-[#2DFF9A]/60"
                      style={{ height: `${6 + (index % 5) * 3}px` }}
                    />
                  ))}
                </div>
              </div>
              <audio
                ref={audioRef}
                src={item.voiceFile}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}
          <div className={transcriptClass}>{item.transcript}</div>
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
        className={`${voiceMemoBoxClass} ${boxShadowClass}`}
        style={{
          background: dialogueBackground,
          border: sceneTheme.dialogueBox.border,
          color: sceneTheme.dialogueBox.color,
          ...(dialogueCustom.voiceMemoBoxStyle || {}),
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
      className={`${normalBoxClass} ${bubbleContainerClass} ${boxShadowClass} landscape:!py-3 landscape:!px-4`}
      style={{
        background: dialogueBackground,
        border: sceneTheme.dialogueBox.border,
        color: sceneTheme.dialogueBox.color,
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
  const isLandscapeMobile = useIsLandscapeMobile()

  useEffect(() => {
    setAnswer(previousAnswer || '')
  }, [previousAnswer, question?.id])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!answer.trim()) return
    onSubmit(answer)
  }

  const questionNumberClass = sceneTheme.questionBox.numberClass || 'text-xs uppercase tracking-[0.3em] text-[#2DFF9A]/80'
  const questionTitleClass = sceneTheme.questionBox.titleClass || 'mt-3 max-w-2xl text-2xl font-medium text-white'
  const optionClass = sceneTheme.questionBox.optionClass || 'rounded-[1.5rem] border px-4 py-4 text-left text-sm transition'
  const borderRadiusClass = sceneTheme.questionBox.borderRadiusClass || 'rounded-[2rem]'
  const boxShadow = sceneTheme.questionBox.boxShadow || 'shadow-[0_35px_100px_rgba(2,6,23,0.45)]'

  return (
    <form
      onSubmit={handleSubmit}
      className={`${borderRadiusClass} p-4 sm:p-6 landscape:p-3 ${boxShadow} max-w-xl w-full backdrop-blur-md
                  landscape:max-h-[calc(100dvh-72px)] landscape:overflow-y-auto landscape:overscroll-contain`}
      style={{
        background: sceneTheme.questionBox.background,
        border: sceneTheme.questionBox.border,
        minHeight: isLandscapeMobile ? 'unset' : sceneTheme.questionBox.minHeight,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className={questionNumberClass}>Question {questionNumber}</div>
          <h2
  className={`${questionTitleClass} landscape:text-lg`}
  style={{ whiteSpace: 'pre-line' }}
>{question.text}</h2>
        </div>
        <div className="flex-shrink-0 rounded-full border border-[#2DFF9A]/20 bg-[#2DFF9A]/10 px-4 py-2 text-sm text-[#2DFF9A]">
          {question.reward} pts
        </div>
      </div>

      {question.link && (
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
          <img src={question.link} alt="" className="max-h-72 landscape:max-h-40 w-full object-cover" />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {options.length > 0 ? (
          <div className="grid gap-2 landscape:gap-1">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setAnswer(option.value)}
                className={`${optionClass} landscape:!py-2 landscape:!px-3 ${
                  answer === option.value
                    ? 'border-[#2DFF9A]/40 bg-[#2DFF9A]/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1F18]/70 text-xs text-[#2DFF9A]">
                    {option.label}
                  </span>
                  <span className="leading-5 landscape:text-xs landscape:leading-5">{option.value}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer here..."
            className="w-full rounded-[116px] border-2 border-[#2DFF9A]/30 bg-[#0B1F18] px-6 py-4 text-lg text-[#2DFF9A] outline-none transition placeholder:text-[#2DFF9A]/30 focus:border-[#2DFF9A]/60 focus:shadow-[0_0_30px_rgba(45,255,154,0.15)]"
            style={{ textShadow: '0 0 10px rgba(45, 255, 154, 0.3)' }}
          />
        )}
      </div>

      <div className="mt-4 landscape:mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-slate-400">{totalQuestions - questionNumber} questions remain after this one.</div>
        <Btn type="submit" loading={loading} disabled={!answer.trim()} className="w-full sm:w-auto">
          Submit
        </Btn>
      </div>
    </form>
  )
}

function AnswerReveal({ question, submittedAnswer, isLastQuestion, onContinue, onFinish, sceneTheme }) {
  const isLandscapeMobile = useIsLandscapeMobile()
  const answerLabelClass = sceneTheme.answerRevealBox.labelClass || 'text-xs uppercase tracking-[0.35em] text-[#2DFF9A]/70'
  const answerTextClass = sceneTheme.answerRevealBox.answerClass || 'mt-6 text-xl leading-8 text-white'
  const questionTextClass = sceneTheme.answerRevealBox.questionClass || 'mt-3 text-sm text-slate-300'
  const borderRadiusClass = sceneTheme.answerRevealBox.borderRadiusClass || 'rounded-[2rem]'
  const boxShadow = sceneTheme.answerRevealBox.boxShadow || 'shadow-[0_35px_100px_rgba(8,145,178,0.24)]'

  return (
    <div
      className={`flex flex-col items-center justify-center px-5 py-6 landscape:py-3 text-center ${borderRadiusClass} ${boxShadow} max-w-xl w-full backdrop-blur-md
                  landscape:max-h-[calc(100dvh-72px)] landscape:overflow-y-auto landscape:overscroll-contain`}
      style={{
        background: sceneTheme.answerRevealBox.background,
        border: sceneTheme.answerRevealBox.border,
        minHeight: isLandscapeMobile ? 'unset' : sceneTheme.answerRevealBox.minHeight,
      }}
    >
      <div className={answerLabelClass}>Submitted Answer</div>
      <div className={`${answerTextClass} landscape:text-lg`}>{submittedAnswer}</div>
      <div className={questionTextClass}>{question.text}</div>
      <div className="mt-5 landscape:mt-4">
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
  // responses = answers confirmed in the DB
  const [responses, setResponses] = useState([])
  // draftResponses = answers cached locally but not yet in DB (survives refresh, allows reattempt)
  const [draftResponses, setDraftResponses] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('question')
  const [sequenceIndex, setSequenceIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const finishTriggeredRef = useRef(false)
  const [showFlashback, setShowFlashback] = useState(false)

  // ─── BODY STYLING ──────────────────────────────────────────────────────────
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
          z-index: 0;
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

  // ─── BOOT ──────────────────────────────────────────────────────────────────
  const boot = useCallback(async () => {
    try {
      setLoading(true)
      const activeRound = await api.get('/api/round/active')
      if (!activeRound || !activeRound?._id) {
        return
      }

      const playableUntil = new Date(activeRound.endsAt).getTime() - ROUND_JOIN_BUFFER_MS
      if (Date.now() >= playableUntil) {
        onNav('waiting')
        return
      }

      setRound(activeRound)
      const roundIdentifier = activeRound.id || activeRound.roundNumber || activeRound._id

      const status = await api.get(`/api/round/status/${roundIdentifier}`)
      if (!status.started) {
        await api.post(`/api/round/${roundIdentifier}/start`)
      } else if (status.finished) {
        onNav('waiting')
        return
      }

      const roundExperienceConfig = await loadRoundExperience(roundIdentifier)
      if (roundExperienceConfig) {
        setRoundExperience(roundExperienceConfig)
      }

      const questionResult = await api.get(`/api/question/round/${roundIdentifier}`)
      const responseResult = await api.get(`/api/response/${roundIdentifier}/me`)
      const loadedQuestions = questionResult?.data || []
      const loadedResponses = Array.isArray(responseResult) ? responseResult : []

      // Load cached drafts from localStorage, but remove any that are already in DB
      const dbAnsweredIds = new Set(loadedResponses.map((r) => r.questionId))
      const cached = loadCache(roundIdentifier)
      const cleanedCache = Object.fromEntries(
        Object.entries(cached).filter(([qId]) => !dbAnsweredIds.has(qId))
      )
      // Persist cleaned cache back
      saveCache(roundIdentifier, cleanedCache)
      setDraftResponses(cleanedCache)

      // Combine DB responses + draft responses to find first unanswered question
      const allAnsweredIds = new Set([
        ...loadedResponses.map((r) => r.questionId),
        ...Object.keys(cleanedCache),
      ])
      const firstPendingIndex = loadedQuestions.findIndex((item) => !allAnsweredIds.has(item.id))

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

  // ─── FINISH ────────────────────────────────────────────────────────────────
  const finishRound = useCallback(
    async ({ silent = false } = {}) => {
      if (!round || finishTriggeredRef.current) return
      finishTriggeredRef.current = true
      setFinishing(true)

      try {
        await api.post(`/api/round/${round._id}/finish`)
      } catch (err) {
        if (!silent && err?.message !== 'Round already ended') {
          setError(err.message)
          finishTriggeredRef.current = false
          setFinishing(false)
          return
        }
      }

      clearCache(round.id)

      try {
        const upcomingRound = await api.get('/api/round/upcoming')
        if (upcomingRound) {
          onNav('waiting')
        } else {
          setShowFlashback(true)
        }
      } catch {
        setShowFlashback(true)
      }
    },
    [api, onNav, round],
  )

  // ─── DERIVED STATE ─────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]

  // currentResponse: prefer DB response, fall back to draft
  const currentResponse = currentQuestion
    ? responses.find((r) => r.questionId === currentQuestion.id) ||
      (draftResponses[currentQuestion.id]
        ? { questionId: currentQuestion.id, submittedAnswer: draftResponses[currentQuestion.id] }
        : null)
    : null

  const baseExperience = roundExperience || { sceneTheme, stageCharacters, roundNarrative, stages: [] }
  const currentQuestionNumber = currentQuestion ? currentIndex + 1 : 1
  const experience = resolveRoundStage(baseExperience, currentQuestionNumber)
  const effectiveSceneTheme = experience.sceneTheme
  const effectiveStageCharacters = experience.stageCharacters
  const effectiveRoundNarrative = experience.roundNarrative

  // Count answers for progress: DB responses + drafts (no double-count)
  const dbAnsweredIds = new Set(responses.map((r) => r.questionId))
  const allAnsweredIds = new Set([...dbAnsweredIds, ...Object.keys(draftResponses)])
  const answeredCount = allAnsweredIds.size
  const totalQuestions = questions.length
  const playableUntil = round ? getPlayableUntil(round) : null
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const preQuestionSequence = useMemo(() => {
    if (!currentQuestion) return []
    const introItems = currentIndex === 0 && answeredCount === 0
      ? resolveNarrativeSequence(effectiveRoundNarrative.preQuestion, {}, currentIndex + 1)
      : []
    const duringItems = resolveNarrativeSequence(
      effectiveRoundNarrative.duringQuestion,
      { questionNumber: currentIndex + 1, totalQuestions: questions.length },
      currentIndex + 1,
    )
    return [...introItems, ...duringItems]
  }, [currentIndex, currentQuestion, questions.length, answeredCount, effectiveRoundNarrative])

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
  const hasActiveDialogue = Boolean(activeDialogue)
  const highlightedCharacter = activeDialogue?.characterId
  const isLastQuestion = currentIndex === questions.length - 1
  const showQuestionCard = phase === 'question' && currentQuestion && !hasActiveDialogue
  const showAnswerReveal = phase === 'answer' && currentQuestion && currentResponse && !hasActiveDialogue

  // ─── SUBMIT ────────────────────────────────────────────────────────────────
  // Saves to localStorage immediately so refresh restores the answer without
  // re-submitting. The DB POST is fire-and-forget after caching.
  const submitAnswer = async (submittedAnswer) => {
    if (!currentQuestion || !round) return
    setSubmitting(true)

    // 1. Cache locally first — this survives a refresh
    const updatedDrafts = { ...draftResponses, [currentQuestion.id]: submittedAnswer }
    setDraftResponses(updatedDrafts)
    saveCache(round.id, updatedDrafts)

    // 2. Optimistically move to answer-reveal phase
    setPhase('answer')
    setSequenceIndex(0)
    setError(null)

    // 3. Submit to DB in background
    try {
      await api.post('/api/response', {
        questionId: currentQuestion._id,
        submittedAnswer,
      })
      // On success: add to DB responses and remove from drafts
      const confirmedResponse = { questionId: currentQuestion.id, submittedAnswer }
      setResponses((prev) => {
        const withoutCurrent = prev.filter((item) => item.questionId !== currentQuestion.id)
        return [...withoutCurrent, confirmedResponse]
      })
      setDraftResponses((prev) => {
        const next = { ...prev }
        delete next[currentQuestion.id]
        saveCache(round.id, next)
        return next
      })
    } catch (err) {
      // DB failed but draft is still cached — user can refresh and reattempt
      setError(`Answer saved locally but failed to sync: ${err.message}. You can refresh to retry.`)
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

  // ─── RENDER ────────────────────────────────────────────────────────────────
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
      {/* Experience Layer */}
      <StageCharacter character={effectiveStageCharacters.curator} visible={highlightedCharacter === 'curator'} />
      <StageCharacter character={effectiveStageCharacters.signal} visible={highlightedCharacter === 'signal'} />

      {/* Background */}
      <div
        className="fixed inset-0 -z-50 pointer-events-none"
        style={{ background: effectiveSceneTheme.frame.background }}
      />
      <div
        className="fixed inset-0 -z-40 pointer-events-none rounded-[2rem]"
        style={{ background: effectiveSceneTheme.stage.backgroundImage }}
      />

      {/* Top HUD — floating overlay */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
  <div className="flex items-start justify-between p-3 sm:p-6 landscape:p-2 landscape:px-4 pointer-events-auto">
    <div className="rounded-2xl border border-[#2DFF9A]/10 bg-black/60 px-3 py-2 landscape:py-1.5 backdrop-blur-md">
      <div className="text-[10px] uppercase tracking-[0.35em] text-[#2DFF9A]/70">Active round</div>
      <div className="mt-0.5 text-base sm:text-xl landscape:text-sm font-bold text-white">
        Round #{round?.id}
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="h-1.5 w-20 sm:w-24 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#2DFF9A] transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-[#2DFF9A]/80">{answeredCount}/{totalQuestions}</span>
      </div>
    </div>
    {playableUntil && (
      <div className="pointer-events-auto scale-90 sm:scale-100 origin-top-right">
        <Timer targetTime={playableUntil} label="Time left"
          onExpire={() => finishRound({ silent: true })} />
      </div>
    )}
  </div>
  {error && (
    <div className="px-4 sm:px-6 pointer-events-auto">
      <Alert type="error">{error}</Alert>
    </div>
  )}
</div>

{/* Main round content area — clears HUD via pt, scrollable on landscape */}
<div className="relative z-40 pointer-events-none
                flex min-h-screen items-center justify-center
                landscape:block landscape:pt-[64px]">
  <div className="pointer-events-auto
                  flex w-full max-w-full items-center justify-center
                  px-3 sm:px-6 py-6 landscape:py-2
                  min-h-screen
                  landscape:min-h-0 landscape:h-[calc(100dvh-64px)]
                  landscape:overflow-y-auto landscape:overscroll-contain">
    {currentQuestion ? (
      <>
        {showAnswerReveal ? (
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
        ) : null}
      </>
    ) : (
      <Panel className="bg-emerald-300/10 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">No questions</div>
        <div className="mt-4 text-2xl font-medium text-white">
          This round does not have any questions yet.
        </div>
        <div className="mt-6 flex justify-center">
          <Btn onClick={() => finishRound({ silent: true })} loading={finishing}>
            Finish round
          </Btn>
        </div>
      </Panel>
    )}
  </div>
</div>

{activeDialogue && (
  <div
    className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    style={{ bottom: 'max(env(safe-area-inset-bottom), 12px)' }}
  >
    <div className="pointer-events-auto w-full max-w-xl">
      <SceneDialogue
        item={activeDialogue}
        onAdvance={advanceSequence}
        sceneTheme={effectiveSceneTheme}
      />
    </div>
  </div>
)}

        {showFlashback && (
          <FlashbackTransition
            images={FLASHBACK_IMAGES}
            duration={FLASHBACK_DURATION}
            soundEffect={FLASHBACK_SOUND}
            onComplete={() => onNav('end')}
          />
        )}

    </>
  )
}
