export const ROUND_JOIN_BUFFER_MS = 5 * 60 * 1000
export const ACTIVE_ROUND_POLL_MS = 30000

export const appCopy = {
  brand: {
    name: 'Deco',
    mark: 'D',
    tagline: 'Quiz rounds',
  },
  home: {
    eyebrow: 'Deco',
    title: 'Enter the next available round.',
    description: 'About, registration, leaderboard, and start live here.',
    stats: [
      { label: 'Stage layers', value: '5+' },
      { label: 'Custom scenes', value: 'Config-first' },
      { label: 'Leaderboard', value: 'Cumulative' },
    ],
    buttons: [
      { id: 'about', label: 'About' },
      { id: 'registration', label: 'Registration' },
      { id: 'leaderboard', label: 'Leaderboard' },
    ],
  },
  about: {
    title: 'About Deco',
    sections: [
      {
        heading: 'Rounds',
        body: 'Answer quickly, finish before time runs out, and keep climbing.',
      },
      {
        heading: 'Timing',
        body: 'Start is available only while more than five minutes remain in the current round.',
      },
      {
        heading: 'Leaderboard',
        body: 'Scores shown here are cumulative across finished rounds.',
      },
    ],
  },
  registration: {
    title: 'Registration',
    body: 'Access is controlled by the backend allowed-users list.',
    checklist: [
      'Sign in with the same email used for event registration.',
      'If access is denied, ask the organizers to add that email to AllowedUsers.',
      'Once approved, reload and the frontend will continue into the experience automatically.',
    ],
  },
  waiting: {
    title: 'Waiting Room',
    description: 'No playable round is available right now.',
    note: 'The page checks for the next round automatically.',
  },
}

export const sceneTheme = {
  frame: {
    minHeight: 'calc(100vh - 9rem)',
    background:
      'radial-gradient(circle at top right, rgba(245, 158, 11, 0.20), transparent 30%), radial-gradient(circle at left center, rgba(6, 182, 212, 0.16), transparent 32%), linear-gradient(180deg, #0a1220 0%, #101827 45%, #060913 100%)',
  },
  stage: {
    backgroundImage:
      'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0)), radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.15), transparent 35%)',
  },
  dialogueBox: {
    width: 'min(44rem, 100%)',
    minHeight: '11rem',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,244,255,0.90))',
    border: '1px solid rgba(255,255,255,0.55)',
    color: '#10203b',
  },
  questionBox: {
    width: 'min(40rem, 100%)',
    minHeight: '23rem',
    background:
      'linear-gradient(180deg, rgba(10, 18, 33, 0.94), rgba(15, 23, 42, 0.90))',
    border: '1px solid rgba(255,255,255,0.10)',
  },
  answerRevealBox: {
    width: 'min(36rem, 100%)',
    minHeight: '14rem',
    background:
      'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(14, 116, 144, 0.92))',
    border: '1px solid rgba(34, 211, 238, 0.24)',
  },
}

export const stageCharacters = {
  curator: {
    name: 'Curator',
    accent: '#f59e0b',
    side: 'left',
    size: '18rem',
    style: { bottom: '1rem', left: '2rem' },
  },
  signal: {
    name: 'Signal',
    accent: '#22d3ee',
    side: 'right',
    size: '16rem',
    style: { bottom: '1rem', right: '2rem' },
  },
}

export const roundNarrative = {
  preQuestion: [
    {
      id: 'intro-curator',
      type: 'dialogue',
      speaker: 'Curator',
      characterId: 'curator',
      text:
        'The stage is live. Move fast.',
    },
    {
      id: 'intro-signal',
      type: 'voiceMemo',
      speaker: 'Signal',
      characterId: 'signal',
      label: 'Incoming voice memo',
      icon: 'Waveform',
      text:
        'Answer cards stay above the background layer.',
      transcript:
        'Question and answer cards float above the stage.',
    },
  ],
  duringQuestion: ({ questionNumber, totalQuestions }) => [
    {
      id: `during-${questionNumber}`,
      type: 'dialogue',
      speaker: 'Curator',
      characterId: 'curator',
      text: `Question ${questionNumber} of ${totalQuestions}. Read the prompt, answer in the stage card, then continue when you are ready.`,
    },
  ],
  afterAnswer: ({ submittedAnswer, isLastQuestion }) => [
    {
      id: `after-${submittedAnswer}`,
      type: 'dialogue',
      speaker: 'Signal',
      characterId: 'signal',
      text: isLastQuestion
        ? `Saved: "${submittedAnswer}". Finish the round.`
        : `Saved: "${submittedAnswer}". Continue.`,
    },
  ],
  finished: [
    {
      id: 'finished',
      type: 'voiceMemo',
      speaker: 'Curator',
      characterId: 'curator',
      label: 'Round wrap-up',
      icon: 'Hourglass',
      text:
        'Your round is complete.',
      transcript:
        'Check the board or wait for the next round.',
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

export function buildRoundExperience(roundConfig) {
  if (!roundConfig) {
    return {
      appCopy,
      sceneTheme,
      stageCharacters,
      roundNarrative,
    }
  }

  return {
    appCopy: mergeDeep(appCopy, roundConfig.appCopy || {}),
    sceneTheme: mergeDeep(sceneTheme, roundConfig.sceneTheme || {}),
    stageCharacters: mergeDeep(stageCharacters, roundConfig.stageCharacters || {}),
    roundNarrative: mergeDeep(roundNarrative, roundConfig.roundNarrative || {}),
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
