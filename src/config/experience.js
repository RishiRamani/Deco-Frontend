export const ROUND_JOIN_BUFFER_MS = 5 * 60 * 1000
export const ACTIVE_ROUND_POLL_MS = 30000

export const appCopy = {
  brand: {
    name: 'Deco Disaster',
    mark: 'D',
    tagline: 'Doomsday Protocol',
  },
  home: {
    eyebrow: 'Deco Disaster 6.0',
    title: 'Enter the next available round.',
    description: 'The multiverse is fracturing. Solve encoded anomalies and reclaim narrative anchors before Doom seals reality permanently.',
    stats: [
      { label: 'Rounds', value: '5' },
      { label: 'Theme', value: 'Avengers' },
      { label: 'Leaderboard', value: 'Cumulative' },
    ],
    buttons: [
      { id: 'about', label: 'About' },
      { id: 'registration', label: 'Registration' },
      { id: 'leaderboard', label: 'Leaderboard' },
    ],
  },
  about: {
    title: 'About Deco Disaster',
    sections: [
      {
        heading: 'Rounds',
        body: 'Navigate corrupted timelines, solve puzzles, riddles, and encoded anomalies across 5 rounds — text, voice, image, and rapid fire.',
      },
      {
        heading: 'Timing',
        body: 'Start is available only while more than five minutes remain in the current round. Move fast — failure results in total narrative erasure.',
      },
      {
        heading: 'Leaderboard',
        body: 'Scores are cumulative across finished rounds. Every correct answer fractures DECO\'s processing core.',
      },
    ],
  },
  registration: {
    title: 'Registration',
    body: 'Access is controlled by the backend allowed-users list. You are recruited by Loki — operating from a destabilized Time Authority hub.',
    checklist: [
      'Sign in with the same email used for event registration.',
      'If access is denied, ask the organizers to add that email to AllowedUsers.',
      'Once approved, reload and the frontend will continue into the experience automatically.',
    ],
  },
  waiting: {
    title: 'Waiting Room',
    description: 'No playable round is available right now. The multiverse awaits.',
    note: 'The page checks for the next round automatically.',
  },
}

export const sceneTheme = {
  bodyElement: {
    background:
      'linear-gradient(180deg, #000000 0%, #0B1F18 40%, #000000 100%)',
    gridPattern: 'none',
    gridPatternSize: '36px 36px',
    gridPatternOpacity: 0,
  },
  frame: {
    minHeight: 'calc(100vh - 9rem)',
    background:
      'linear-gradient(180deg, #000000 0%, #0B1F18 45%, #000000 100%)',
  },
  stage: {
    backgroundImage:
      'linear-gradient(180deg, rgba(45,255,154,0.02), rgba(0,0,0,0)), radial-gradient(circle at 50% 100%, rgba(45,255,154,0.08), transparent 35%)',
  },
  dialogueBox: {
    width: 'min(44rem, 100%)',
    minHeight: '11rem',
    background: '#ffffff',
    border: '1px solid rgba(45,255,154,0.24)',
    color: '#111827',
    bubbleImage: null,
    bubbleImageOpacity: 1,
    bubbleContainerClass: 'rounded-2xl',
    boxShadow: 'shadow-[0_22px_70px_rgba(0,0,0,0.28)]',
    customStyles: {
      speakerClass: 'text-xs uppercase tracking-[0.22em] text-slate-500',
      textClass: 'mt-3 text-base leading-7 text-slate-900',
      transcriptClass: 'mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-inner',
      continueClass: 'mt-4 text-right text-[11px] uppercase tracking-[0.22em] text-slate-400',
      voicePlayerBgClass: 'mt-4 flex items-center gap-3 rounded-xl border border-[#2DFF9A]/20 bg-[#2DFF9A]/8 p-3',
      playButtonClass: 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B1F18] text-[#2DFF9A] shadow-[0_0_18px_rgba(45,255,154,0.24)] hover:bg-[#123628] transition',
      voiceTextClass: 'text-xs font-medium uppercase tracking-[0.18em] text-slate-600',
    },
  },
  questionBox: {
    width: 'min(40rem, 100%)',
    minHeight: '23rem',
    background:
      'linear-gradient(180deg, rgba(11, 31, 24, 0.94), rgba(0, 0, 0, 0.90))',
    border: '1px solid rgba(45,255,154,0.15)',
    borderRadiusClass: 'rounded-[2rem]',
    boxShadow: 'shadow-[0_35px_100px_rgba(0,0,0,0.45)]',
    numberClass: 'text-xs uppercase tracking-[0.3em] text-[#2DFF9A]/80',
    titleClass: 'mt-3 max-w-2xl text-xl sm:text-2xl font-bold leading-relaxed text-white',
    optionClass: 'rounded-[1.5rem] border px-4 py-4 text-left text-sm transition',
  },
  answerRevealBox: {
    width: 'min(36rem, 100%)',
    minHeight: '14rem',
    background:
      'linear-gradient(135deg, rgba(11, 31, 24, 0.96), rgba(45, 255, 154, 0.12))',
    border: '1px solid rgba(45, 255, 154, 0.24)',
    borderRadiusClass: 'rounded-[2rem]',
    boxShadow: 'shadow-[0_35px_100px_rgba(45,255,154,0.15)]',
    labelClass: 'text-xs uppercase tracking-[0.35em] text-[#2DFF9A]/70',
    answerClass: 'mt-6 text-xl leading-8 text-white',
    questionClass: 'mt-3 text-sm text-slate-300',
  },
}

export const stageCharacters = {
  curator: {
    name: 'Loki',
    accent: '#2DFF9A',
    side: 'left',
    size: '18rem',
    image: '/images/loki.png',
    style: { bottom: '1rem', left: '2rem' },
    customStyles: {
      borderRadiusClass: 'rounded-[3rem]',
      borderColor: '#2DFF9A66',
      shadowClass: 'shadow-[0_35px_100px_rgba(0,0,0,0.55)]',
      containerTransition: 'transition duration-500',
      imageClass: 'w-full h-full object-cover',
      nameClass: 'text-lg font-medium text-white',
      nameBackgroundClass: 'bg-transparent',
      fallbackBackground: 'radial-gradient(circle at 50% 20%, #2DFF9A55, rgba(0,0,0,0.92) 55%)',
    },
  },
  signal: {
    name: 'DECO AI',
    accent: '#FF4444',
    side: 'right',
    size: '16rem',
    image: '/characters/deco-ai.png',
    style: { bottom: '1rem', right: '2rem' },
    customStyles: {
      borderRadiusClass: 'rounded-[3rem]',
      borderColor: '#FF444466',
      shadowClass: 'shadow-[0_35px_100px_rgba(0,0,0,0.55)]',
      containerTransition: 'transition duration-500',
      imageClass: 'w-full h-full object-cover',
      nameClass: 'text-lg font-medium text-white',
      nameBackgroundClass: 'bg-transparent',
      fallbackBackground: 'radial-gradient(circle at 50% 20%, #FF444455, rgba(0,0,0,0.92) 55%)',
    },
  },
}

export const roundNarrative = {
  preQuestion: [
    {
      id: 'intro-loki',
      type: 'dialogue',
      speaker: 'Loki',
      characterId: 'curator',
      text: 'The multiverse is fracturing. Enter corrupted branches, solve encoded anomalies, and reclaim narrative anchors before Doom seals reality permanently.',
    },
  ],
  duringQuestion: ({ questionNumber, totalQuestions }) => [
    {
      id: `during-${questionNumber}`,
      type: 'dialogue',
      speaker: 'Loki',
      characterId: 'curator',
      text: `Question ${questionNumber} of ${totalQuestions}. Read the prompt carefully. The anomaly is hidden in the details.`,
      questionNumber: 1,
    },
  ],
  afterAnswer: ({ submittedAnswer, isLastQuestion }) => [
    {
      id: `after-${submittedAnswer}`,
      type: 'dialogue',
      speaker: 'Loki',
      characterId: 'curator',
      text: isLastQuestion
        ? `Recorded: "${submittedAnswer}". The timeline stabilizes. Finish the round.`
        : `Recorded: "${submittedAnswer}". The branch recalibrates. Continue.`,
    },
  ],
  finished: [
    {
      id: 'finished',
      type: 'dialogue',
      speaker: 'Loki',
      characterId: 'curator',
      text: 'Interesting. You survived this round. Check the board or wait for the next timeline breach.',
    },
  ],
}

function mergeDeep(target, source) {
  if (!source) return target
  const output = { ...target }
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = target?.[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      output[key] = mergeDeep(targetValue, sourceValue)
    } else {
      output[key] = sourceValue
    }
  })
  return output
}

const matchesStageForQuestion = (stage, questionNumber) => {
  if (!stage || questionNumber == null) return false

  if (Array.isArray(stage.questionNumbers)) {
    return stage.questionNumbers.includes(questionNumber)
  }

  if (stage.questionRange) {
    const from = Number(stage.questionRange.from ?? 1)
    const to = Number(stage.questionRange.to ?? Infinity)
    return questionNumber >= from && questionNumber <= to
  }

  return false
}

export function resolveRoundStage(roundExperience, questionNumber) {
  if (!roundExperience || !Array.isArray(roundExperience.stages)) {
    return roundExperience
  }

  const stage = roundExperience.stages.find((item) => matchesStageForQuestion(item, questionNumber))
  if (!stage) {
    return roundExperience
  }

  return {
    ...roundExperience,
    sceneTheme: mergeDeep(roundExperience.sceneTheme, stage.sceneTheme || {}),
    stageCharacters: mergeDeep(roundExperience.stageCharacters, stage.stageCharacters || {}),
    roundNarrative: mergeDeep(roundExperience.roundNarrative, stage.roundNarrative || {}),
    currentStage: stage,
  }
}

export function buildRoundExperience(roundConfig) {
  if (!roundConfig) {
    return {
      appCopy,
      sceneTheme,
      stageCharacters,
      roundNarrative,
      stages: [],
    }
  }

  return {
    appCopy: mergeDeep(appCopy, roundConfig.appCopy || {}),
    sceneTheme: mergeDeep(sceneTheme, roundConfig.sceneTheme || {}),
    stageCharacters: mergeDeep(stageCharacters, roundConfig.stageCharacters || {}),
    roundNarrative: mergeDeep(roundNarrative, roundConfig.roundNarrative || {}),
    stages: Array.isArray(roundConfig.stages) ? roundConfig.stages : [],
  }
}

export async function loadRoundExperience(roundId) {
  try {
    const res = await fetch(`/rounds/round-${roundId}.json`)
    if (!res.ok) return null
    const config = await res.json()
    return buildRoundExperience(config)
  } catch {
    return null
  }
}
