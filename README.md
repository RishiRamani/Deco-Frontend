# Deco Frontend Handbook

This README is the working map of the Deco Disaster frontend. It covers how the app runs, how it talks to the backend, how routing/auth/admin work, how rounds are played, how the JSON experience system is authored, and where every kind of asset belongs.

## Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Required Environment](#required-environment)
4. [Run Commands](#run-commands)
5. [File Map](#file-map)
6. [Routing And App Shell](#routing-and-app-shell)
7. [Authentication And Access](#authentication-and-access)
8. [Backend API Contract](#backend-api-contract)
9. [Round Player Flow](#round-player-flow)
10. [Admin Panel](#admin-panel)
11. [Static Assets](#static-assets)
12. [Round Experience JSON](#round-experience-json)
13. [Scene Theme Reference](#scene-theme-reference)
14. [Stage Characters](#stage-characters)
15. [Narrative And Dialogue](#narrative-and-dialogue)
16. [Questions](#questions)
17. [Stages](#stages)
18. [Timers, Polling, And Finish Behavior](#timers-polling-and-finish-behavior)
19. [Transitions And Effects](#transitions-and-effects)
20. [Responsive Behavior](#responsive-behavior)
21. [Adding A New Round](#adding-a-new-round)
22. [Common Issues](#common-issues)

## Project Overview

The Deco frontend is a Vite React app for a timed, round-based quiz event. Participants sign in through the backend, wait for an active round, play through questions with themed backgrounds, characters, dialogue, and audio, then finish or wait for the next round.

Most event-specific content lives outside React code:

- Questions and round timing come from the backend through the admin panel.
- Visual round theming comes from JSON files in `public/rounds/`.
- Images, character art, voices, and transition sounds live in `public/`.

The main interactive round experience is [src/pages/RoundPage.jsx](src/pages/RoundPage.jsx). The default experience/theme model is in [src/config/experience.js](src/config/experience.js).

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Framer Motion
- Browser `fetch` with cookie-based backend auth

The app does not use React Router. It has a small custom route layer built on `window.history.pushState`.

## Required Environment

Create a `.env` file in `Deco-Frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Important:

- `VITE_API_BASE_URL` is required by [api.js](api.js).
- It must be one backend URL only.
- Comma-separated backend URLs are rejected.
- The frontend sends requests with `credentials: "include"`, so the backend must support cookies and CORS credentials.

## Run Commands

From `Deco-Frontend/`:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Starts Vite dev server |
| `npm run build` | Builds production assets into `dist/` |
| `npm run preview` | Serves the built `dist/` output |

Do not manually edit generated files in `dist/`. Edit `src/` and `public/`, then rebuild.

## File Map

```text
Deco-Frontend/
  api.js                         Shared backend fetch helper
  index.html                     Vite entry HTML
  package.json                   Scripts and dependencies
  src/
    main.jsx                     React root and AuthProvider
    App.jsx                      Routing, auth gate, page selection, transitions
    index.css                    Global Tailwind/base styles
    config/
      experience.js              Default theme, narrative, stage resolver
    context/
      AuthContext.jsx            Backend session auth state
    hooks/
      useApi.js                  GET/POST/PATCH/DELETE helper
      useCrackNavigate.js        Navigation helper for crack-style transitions
      usePageTransition.js       Page transition helper
    components/
      Layout.jsx                 Global layout and round intro overlay
      UI.jsx                     Shared buttons, inputs, panels, badges, alerts
      Timer.jsx                  Countdown display
      RotateOverlay.jsx          Device orientation overlay
      CrackTransitionOverlay.jsx Waiting transition effect
      FlashbackTransition.jsx    End-of-round flashback effect
      PageTransitionWrapper.jsx  Animation wrapper
    pages/
      HomePage.jsx               Home/entry screen
      AboutPage.jsx              Event info
      RegistrationPage.jsx       Registration/access info
      SignInPage.jsx             Sign-in UI
      RoundPage.jsx              Main themed round player
      WaitingPage.jsx            Polling waiting room
      LeaderboardPage.jsx        Leaderboard
      EndPage.jsx                Final ending screen
      AdminPage.jsx              Organizer controls
  public/
    rounds/                      Round experience JSON files
    backgrounds/                 Round/page backgrounds
    characters/                  Character portraits
    images/                      Logos, extra images, story art
    voices/                      Audio/voice files
  dist/                          Generated build output
```

## Routing And App Shell

Routes are defined in [src/App.jsx](src/App.jsx):

```js
home
about
registration
signin
round
waiting
leaderboard
end
admin
```

URL behavior:

- `/` maps to `home`.
- `/round` maps to the round page.
- Old hash URLs like `/#round` are normalized to path URLs.
- Unknown paths fall back to `home`.
- Browser back/forward is handled through `popstate`.

Navigation uses the `onNav(page)` callback passed into pages. `round`, `waiting`, and `admin` require sign-in. `admin` additionally requires `userRole === "ORGANIZER"`.

Global layout behavior:

- Non-round pages get the dark Deco background and a `RETURN` button.
- `round` and `end` pages take over the full viewport.
- Entering the round triggers a short intro overlay: `STEP FORWARD....IF YOU DARE`.
- Navigating to waiting can trigger a crack transition with `/voices/wait.mp3`.

## Authentication And Access

Auth is handled by [src/context/AuthContext.jsx](src/context/AuthContext.jsx).

On load:

1. The frontend calls `GET /api/auth/me`.
2. If a user is returned, the app treats the visitor as signed in.
3. `App.jsx` then calls `GET /api/auth/allowed`.
4. If the backend says the user is not allowed, the frontend signs them out and shows `User not authorized`.

Auth context exposes:

| Value | Meaning |
|---|---|
| `user` | Backend user object or `null` |
| `loaded` | Whether `/api/auth/me` has completed |
| `isSignedIn` | Boolean derived from `user` |
| `signOut()` | Calls `POST /api/auth/logout` and clears local user |
| `refetch()` | Re-runs `/api/auth/me` |

Compatibility helpers `useAuth()` and `useUser()` exist because this code replaced an older Clerk setup.

## Backend API Contract

The frontend expects these backend endpoints:

| Method | Path | Used by | Expected purpose |
|---|---|---|---|
| `GET` | `/api/auth/me` | AuthProvider | Current session user |
| `GET` | `/api/auth/allowed` | App | Whether signed-in user may use app |
| `POST` | `/api/auth/logout` | AuthProvider | Clear session |
| `GET` | `/api/round/info` | WaitingPage | Current and next round together |
| `GET` | `/api/round/active` | RoundPage, WaitingPage, QuizPage | Active round |
| `GET` | `/api/round/upcoming` | RoundPage, WaitingPage | Next upcoming round |
| `GET` | `/api/round/status/:roundId` | RoundPage, QuizPage | Started/finished status |
| `POST` | `/api/round/:roundId/start` | RoundPage | Mark round started |
| `POST` | `/api/round/:roundId/finish` | RoundPage, QuizPage | Mark round finished |
| `GET` | `/api/round/admin/all` | AdminPage | Organizer list of rounds |
| `POST` | `/api/round` | AdminPage | Create round |
| `GET` | `/api/question/round/:roundId` | RoundPage, AdminPage | Questions for round |
| `POST` | `/api/question` | AdminPage | Create question |
| `PATCH` | `/api/question/:id` | AdminPage | Update question |
| `DELETE` | `/api/question/:id` | AdminPage | Delete question |
| `GET` | `/api/response/:roundId/me` | RoundPage, QuizPage | Current user's responses |
| `POST` | `/api/response` | RoundPage, QuizPage | Submit answer |
| `GET` | `/api/leaderboard` | LeaderboardPage | Leaderboard data |
| `POST` | `/api/admin/truncate` | AdminPage | Reset event tables |

Round IDs:

- The UI often uses numeric `round.id`.
- Some backend calls use Mongo `_id`.
- Question creation accepts either numeric round ID or backend ObjectId where supported.

## Round Player Flow

[src/pages/RoundPage.jsx](src/pages/RoundPage.jsx) is the canonical participant flow.

Boot sequence:

1. Fetch active round from `/api/round/active`.
2. If there is no active round, navigate to `waiting`.
3. If the active round is within the final 5 minutes, navigate to `waiting`.
4. Check `/api/round/status/:roundIdentifier`.
5. If not started, call `POST /api/round/:roundIdentifier/start`.
6. If already finished, navigate to `waiting`.
7. Load `/rounds/round-{roundIdentifier}.json` from `public/rounds/`.
8. Fetch questions from `/api/question/round/:roundIdentifier`.
9. Fetch user's responses from `/api/response/:roundIdentifier/me`.
10. Load locally cached drafts from `localStorage`.
11. Choose the first unanswered question.

Answer behavior:

- On submit, the answer is saved to `localStorage` immediately.
- The UI moves optimistically to the answer phase.
- The backend submit happens in the background via `POST /api/response`.
- If the backend succeeds, the local draft is removed.
- If the backend fails, the draft remains and an error is shown.

Draft cache key:

```text
deco_draft_{roundId}
```

This protects participants from losing a typed/submitted answer on refresh before the backend confirms it.

Phases:

| Phase | Meaning |
|---|---|
| `question` | Pre-question/during-question narrative and question card |
| `answer` | After-answer narrative and submitted-answer reveal |

Displayed layers:

- Fixed character portraits
- Background frame/stage layers
- Top HUD with active round, progress, and timer
- Question or answer card
- Bottom dialogue/audio overlay
- Optional flashback transition at the end

## Admin Panel

Admin access is only available when `user.role === "ORGANIZER"`.

Admin tabs:

| Tab | Component behavior |
|---|---|
| Rounds | Create rounds and view all rounds |
| Questions | Add, load, edit, and delete questions |
| Maintenance | Truncate all round/question/response/result tables |
| Transitions | Test flashback and crack transitions |

### Creating A Round

In Admin > Rounds:

1. Pick Start Time.
2. Pick End Time.
3. Click `+ Create Round`.
4. Note the displayed round number, such as `1`.
5. Create `public/rounds/round-1.json` if that round needs custom visuals/narrative.

Validation:

- Start and end are required.
- End must be after start.
- Times are sent to the backend as ISO strings.

### Creating Questions

In Admin > Questions:

1. Enter Round Number.
2. Click Load Questions.
3. Fill question text, answer, reward.
4. Optionally add comma-separated options.
5. Optionally add a reference link.
6. Click `+ Add Question`.

Question form fields:

| Field | Required | Meaning |
|---|---|---|
| Round Number | Yes | Numeric round ID or backend-supported ID |
| Question text | Yes | Prompt shown to participant |
| Answer | Yes | Correct answer stored by backend |
| Reward | Yes | Points |
| Options | No | Comma-separated MCQ options; blank means text input |
| Reference link | No | Image/link shown on the question card |

Rules:

- One option is invalid.
- Two or more options create an MCQ.
- Blank options create a free-text question.
- Editing accepts comma-separated options or JSON arrays.

## Static Assets

Everything in `public/` is served from the site root.

Examples:

| File path | URL in JSON/JS |
|---|---|
| `public/backgrounds/r1.jpg` | `/backgrounds/r1.jpg` |
| `public/characters/loki.png` | `/characters/loki.png` |
| `public/images/deco-logo.png` | `/images/deco-logo.png` |
| `public/voices/wait.mp3` | `/voices/wait.mp3` |
| `public/rounds/round-1.json` | `/rounds/round-1.json` |

Asset folders currently used:

- `public/backgrounds/`
- `public/characters/`
- `public/images/`
- `public/voices/`
- `public/rounds/`

Path rules:

- Use leading slash paths in JSON.
- File names are case-sensitive in production.
- Put public event assets in `public/`, not `src/`.
- Audio can be `.mp3`, `.wav`, or any browser-supported format.

## Round Experience JSON

Each active round tries to load:

```text
/rounds/round-{roundId}.json
```

Example:

```text
public/rounds/round-1.json
```

Top-level shape:

```json
{
  "appCopy": {},
  "sceneTheme": {},
  "stageCharacters": {},
  "roundNarrative": {},
  "stages": []
}
```

All fields are optional. The loader deep-merges your JSON over the defaults in [src/config/experience.js](src/config/experience.js). You only need to include the keys you want to override.

Merge behavior:

- Objects merge deeply.
- Arrays replace the default array.
- Primitive values replace defaults.
- Stage-level config merges over round-level config when that stage is active.

## Scene Theme Reference

`sceneTheme` controls the round player's visual layers.

Full shape:

```json
{
  "sceneTheme": {
    "bodyElement": {},
    "frame": {},
    "stage": {},
    "dialogueBox": {},
    "backgroundDialogueBox": {},
    "questionBox": {},
    "answerRevealBox": {}
  }
}
```

### bodyElement

Applied to the global `body` while a themed round is active.

```json
{
  "bodyElement": {
    "background": "url('/backgrounds/r1-stage1-bg.jpg') center/cover no-repeat fixed",
    "gridPattern": "none",
    "gridPatternSize": "36px 36px",
    "gridPatternOpacity": 0
  }
}
```

Fields:

| Field | Type | Meaning |
|---|---|---|
| `background` | CSS background | Full-page background |
| `gridPattern` | CSS background-image | Optional overlay pattern |
| `gridPatternSize` | CSS size | Overlay tile size |
| `gridPatternOpacity` | number | Overlay opacity |

### frame

Fixed layer above body and below stage.

```json
{
  "frame": {
    "background": "rgba(0,0,0,0.4)"
  }
}
```

Use `transparent` or a soft overlay if your body image should remain visible.

### stage

Fixed visual layer above frame.

```json
{
  "stage": {
    "backgroundImage": "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.9)), url('/backgrounds/r1.jpg') center/cover no-repeat"
  }
}
```

Set `"backgroundImage": "none"` to rely only on the body background.

### dialogueBox

Used for character dialogue and voice/audio dialogue with a `characterId`.

```json
{
  "dialogueBox": {
    "background": "#ffffff",
    "border": "1px solid rgba(45,255,154,0.24)",
    "color": "#111827",
    "bubbleContainerClass": "rounded-2xl",
    "boxShadow": "shadow-[0_22px_70px_rgba(0,0,0,0.28)]",
    "customStyles": {
      "speakerClass": "text-xs uppercase tracking-[0.22em] text-slate-500",
      "textClass": "mt-3 text-base leading-7 text-slate-900",
      "transcriptClass": "mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-inner",
      "continueClass": "mt-4 text-right text-[11px] uppercase tracking-[0.22em] text-slate-400",
      "voicePlayerBgClass": "mt-4 flex items-center gap-3 rounded-xl border border-[#2DFF9A]/20 bg-[#2DFF9A]/8 p-3",
      "playButtonClass": "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B1F18] text-[#2DFF9A] shadow-[0_0_18px_rgba(45,255,154,0.24)] hover:bg-[#123628] transition",
      "voiceTextClass": "text-xs font-medium uppercase tracking-[0.18em] text-slate-600"
    }
  }
}
```

### backgroundDialogueBox

Used when a dialogue item has no `characterId`. This is for narration, room/background messages, environment text, or dialogue with no visible character.

```json
{
  "backgroundDialogueBox": {
    "background": "linear-gradient(180deg, rgba(2,6,23,0.88), rgba(2,6,23,0.78))",
    "border": "1px solid rgba(255,255,255,0.16)",
    "color": "#ffffff",
    "boxShadow": "shadow-[0_28px_90px_rgba(0,0,0,0.42)]",
    "customStyles": {
      "speakerClass": "text-xs uppercase tracking-[0.24em] text-white/60",
      "textClass": "mt-3 text-base leading-7 text-white",
      "continueClass": "mt-4 text-right text-[11px] uppercase tracking-[0.22em] text-white/45"
    }
  }
}
```

It inherits missing values from `dialogueBox`.

### questionBox

Used for the active question card.

```json
{
  "questionBox": {
    "background": "linear-gradient(180deg, rgba(11,31,24,0.94), rgba(0,0,0,0.90))",
    "border": "1px solid rgba(45,255,154,0.15)",
    "borderRadiusClass": "rounded-[2rem]",
    "boxShadow": "shadow-[0_35px_100px_rgba(0,0,0,0.45)]",
    "numberClass": "text-xs uppercase tracking-[0.3em] text-[#2DFF9A]/80",
    "titleClass": "mt-3 max-w-2xl text-xl sm:text-2xl font-bold leading-relaxed text-white",
    "optionClass": "rounded-[1.5rem] border px-4 py-4 text-left text-sm transition",
    "minHeight": "23rem"
  }
}
```

### answerRevealBox

Used after submission to show the participant's submitted answer.

```json
{
  "answerRevealBox": {
    "background": "linear-gradient(135deg, rgba(11,31,24,0.96), rgba(45,255,154,0.12))",
    "border": "1px solid rgba(45,255,154,0.24)",
    "borderRadiusClass": "rounded-[2rem]",
    "boxShadow": "shadow-[0_35px_100px_rgba(45,255,154,0.15)]",
    "labelClass": "text-xs uppercase tracking-[0.35em] text-[#2DFF9A]/70",
    "answerClass": "mt-6 text-xl leading-8 text-white",
    "questionClass": "mt-3 text-sm text-slate-300",
    "minHeight": "14rem"
  }
}
```

## Stage Characters

`stageCharacters` is an object. Each key is a character ID. There can be two characters, three characters, or more.

Default IDs are:

- `curator`
- `signal`

But any ID works if your narrative `characterId` matches it.

Example:

```json
{
  "stageCharacters": {
    "curator": {
      "name": "Captain America",
      "accent": "#2DFF9A",
      "image": "/characters/captain-america.png",
      "size": "20rem",
      "style": { "bottom": "1rem", "left": "2rem" },
      "customStyles": {
        "borderColor": "#2DFF9A44"
      }
    },
    "signal": {
      "name": "Loki",
      "accent": "#2DFF9A",
      "image": "/images/loki.png",
      "size": "16rem",
      "style": { "bottom": "1rem", "right": "2rem" }
    },
    "third": {
      "name": "Iron Man",
      "accent": "#FEBF3C",
      "image": "/characters/ironman.png",
      "size": "15rem",
      "style": { "bottom": "1rem", "left": "38%" }
    }
  }
}
```

Character fields:

| Field | Type | Meaning |
|---|---|---|
| `name` | string | Label shown near the portrait |
| `accent` | CSS color | Fallback glow/border color |
| `image` | URL | Character image |
| `size` | CSS length | Base portrait size |
| `side` | string | Metadata only; positioning comes from `style` |
| `style` | object | Inline CSS positioning, usually `bottom`, `left`, `right` |
| `customStyles.borderRadiusClass` | Tailwind class | Portrait rounding |
| `customStyles.borderColor` | CSS color | Border color |
| `customStyles.shadowClass` | Tailwind class | Shadow |
| `customStyles.nameClass` | Tailwind class | Name label styling |
| `customStyles.nameBackgroundClass` | Tailwind class | Name label background |
| `customStyles.containerTransition` | Tailwind class | Show/highlight transition |
| `customStyles.imageClass` | Tailwind class | Image sizing/object-fit |
| `customStyles.imageStyle` | object | Inline image CSS |
| `customStyles.fallbackBackground` | CSS background | Used if `image` is missing |

Visibility/highlight behavior:

- All configured characters are rendered.
- When a dialogue item has `characterId`, that character is fully visible and others are dimmed.
- If active dialogue has no `characterId`, all characters remain visible.

## Narrative And Dialogue

Narrative lives in `roundNarrative`:

```json
{
  "roundNarrative": {
    "preQuestion": [],
    "duringQuestion": [],
    "afterAnswer": [],
    "finished": []
  }
}
```

When each sequence runs:

| Sequence | When it appears |
|---|---|
| `preQuestion` | At the very beginning of a round or questionless stage |
| `duringQuestion` | Before the question card, unless overlaid |
| `afterAnswer` | After a participant submits an answer |
| `postAnswer` | After the last answer is submitted, before the round finishes |
| `finished` | Alias for `postAnswer` and used for final dialogue-only stages |

### Dialogue Item Fields

```json
{
  "id": "intro-1",
  "type": "dialogue",
  "speaker": "Loki",
  "characterId": "signal",
  "text": "The shield encodes the anomaly.",
  "questionNumber": [1, 2],
  "showWithQuestion": false,
  "overlayQuestion": false,
  "voiceFile": "/voices/example.mp3",
  "audioFile": "/voices/example.wav",
  "transcript": "Optional transcript text."
}
```

Fields:

| Field | Required | Meaning |
|---|---|---|
| `id` | Recommended | Stable item ID |
| `type` | Recommended | `dialogue`, `voiceMemo`, or `audio` |
| `speaker` | Optional | Speaker label |
| `characterId` | Optional | Character to highlight; omit for background/narration dialogue |
| `text` | Optional | Dialogue text |
| `questionNumber` | Optional | Number or array limiting when this item appears |
| `showWithQuestion` | Optional | If `true`, question card remains visible while this dialogue/audio appears |
| `overlayQuestion` | Optional | Alias for `showWithQuestion` |
| `voiceFile` | Optional | Audio URL |
| `audioFile` | Optional | Audio URL alias |
| `transcript` | Optional | Text displayed below audio player |
| `label` | Optional | Supported by formatter, not always displayed |

### Character Dialogue

```json
{
  "id": "cap-intro",
  "type": "dialogue",
  "speaker": "Captain America",
  "characterId": "curator",
  "text": "This fight keeps resetting. The pattern is wrong."
}
```

### Background/Narration Dialogue

Omit `characterId`:

```json
{
  "id": "room-shift",
  "type": "dialogue",
  "speaker": "Narrator",
  "text": "The room dims. A message appears across the broken timeline."
}
```

This uses `sceneTheme.backgroundDialogueBox`.

### Voice Memo Or Audio Dialogue

```json
{
  "id": "mission-audio",
  "type": "voiceMemo",
  "speaker": "DECO AI",
  "characterId": "signal",
  "text": "Incoming audio packet.",
  "voiceFile": "/voices/mission-briefing.mp3",
  "transcript": "Decode the audio before submitting your answer."
}
```

`type: "audio"` also works. Any item with `voiceFile` or `audioFile` is treated as an audio/voice item.

### Audio During A Question

Normally dialogue blocks the question card until the participant clicks through. To show audio/dialogue while the question card is visible, add `showWithQuestion: true` or `overlayQuestion: true`.

```json
{
  "id": "q2-audio",
  "type": "voiceMemo",
  "speaker": "Loki",
  "characterId": "signal",
  "questionNumber": 2,
  "text": "Play this while solving question 2.",
  "voiceFile": "/voices/round 3 q2.wav",
  "showWithQuestion": true
}
```

### Targeting Questions

One question:

```json
{
  "questionNumber": 3
}
```

Multiple questions:

```json
{
  "questionNumber": [1, 2, 4]
}
```

No `questionNumber` means the item can appear for any relevant question.

### Template Variables

Narrative text fields are formatted with simple `{{ variable }}` replacements.

Supported by the formatter:

- `id`
- `speaker`
- `characterId`
- `label`
- `text`
- `transcript`

Variables used in current code:

| Sequence | Variables |
|---|---|
| `duringQuestion` | `questionNumber`, `totalQuestions` |
| `afterAnswer` | `submittedAnswer`, `isLastQuestion`, `lastQuestionPhrase` |

Example:

```json
{
  "id": "during-{{ questionNumber }}",
  "type": "dialogue",
  "speaker": "Loki",
  "characterId": "curator",
  "text": "Question {{ questionNumber }} of {{ totalQuestions }}."
}
```

## Questions

Questions are primarily backend data created in AdminPage. RoundPage expects each question to look roughly like:

```json
{
  "_id": "backend-object-id",
  "id": "stable-question-id",
  "text": "Question prompt",
  "answer": "Correct answer",
  "reward": 10,
  "options": ["A", "B", "C"],
  "link": "/images/question-image.png",
  "audioFile": "/voices/q1.mp3",
  "voiceFile": "/voices/q1.mp3"
}
```

Displayed fields:

| Field | Meaning |
|---|---|
| `text` | Prompt text |
| `reward` | Points shown in card |
| `options` | If present, renders option buttons |
| `link` | If present, renders image above answers |
| `audioFile` | If present, renders native audio controls in the question card |
| `voiceFile` | Alias for `audioFile` in question card |

Option formats:

- Array: `["Paris", "London"]`
- Object: `{ "a": "Paris", "b": "London" }`

Answer input:

- If options exist, participant selects one option.
- If no options exist, participant gets a text input.
- Submit button is disabled until there is a non-empty answer.

## Stages

Stages let one round change background, characters, and narrative across different question ranges.

```json
{
  "stages": [
    {
      "id": "stage-1",
      "questionRange": { "from": 1, "to": 2 },
      "sceneTheme": {},
      "stageCharacters": {},
      "roundNarrative": {}
    },
    {
      "id": "stage-2",
      "questionNumbers": [3, 5],
      "sceneTheme": {},
      "stageCharacters": {},
      "roundNarrative": {}
    }
  ]
}
```

Stage matching:

- `questionNumbers` matches exact question numbers.
- `questionRange.from` / `questionRange.to` matches an inclusive range.
- If there is no current question, a stage with no `questionNumbers` and no `questionRange` can match. This supports plain dialogue-only stages/rounds.
- If no stage matches, top-level round config is used.

### Dialogue-Only Stage Or Round

A round can have no questions and still show narrative. Use top-level `roundNarrative.preQuestion`, or define a stage without `questionRange`/`questionNumbers`.

```json
{
  "stages": [
    {
      "id": "opening-dialogue",
      "sceneTheme": {
        "bodyElement": {
          "background": "url('/backgrounds/opening.jpg') center/cover no-repeat fixed"
        }
      },
      "roundNarrative": {
        "preQuestion": [
          {
            "id": "narration-1",
            "type": "dialogue",
            "speaker": "Narrator",
            "text": "No questions here. Just the timeline speaking."
          }
        ],
        "duringQuestion": [],
        "afterAnswer": [],
        "finished": []
      }
    }
  ]
}
```

When all dialogue is clicked through and there are no questions, the page shows a "No questions" panel with a Finish round button.

## Timers, Polling, And Finish Behavior

Timing constants live in [src/config/experience.js](src/config/experience.js):

```js
ROUND_JOIN_BUFFER_MS = 5 * 60 * 1000
ACTIVE_ROUND_POLL_MS = 30000
```

Round page:

- Participants can play only until 5 minutes before `round.endsAt`.
- The top HUD countdown targets `endsAt - ROUND_JOIN_BUFFER_MS`.
- When countdown expires, `finishRound({ silent: true })` runs.

Waiting page:

- Polls every 30 seconds.
- First tries `/api/round/info`.
- Falls back to `/api/round/active`, then `/api/round/upcoming`.
- If a current round exists, navigates to `round`.

Finish behavior:

1. `POST /api/round/:round._id/finish`.
2. Clear draft cache for `round.id`.
3. If upcoming round exists, navigate to waiting.
4. If no upcoming round exists, show flashback transition.
5. After flashback, navigate to end page.

## Transitions And Effects

Main effects:

| Component | Purpose |
|---|---|
| `RotateOverlay` | Prompts/handles orientation constraints |
| `CrackTransitionOverlay` | Transition into waiting |
| `FlashbackTransition` | End-of-event flashback montage |
| `Layout` round intro | Entry animation before round page |
| Framer Motion wrappers | Page/card/toast animations |

RoundPage flashback config:

- Images are listed in `FLASHBACK_IMAGES`.
- Duration is `FLASHBACK_DURATION`.
- Sound is `FLASHBACK_SOUND`.

Admin > Transitions can manually preview flashback/crack effects.

## Responsive Behavior

The round player has special landscape mobile handling:

- `useIsLandscapeMobile()` checks width below `1024px` and width greater than height.
- Question/answer cards reduce padding in landscape.
- Cards get max-height and internal scrolling to avoid overflowing the viewport.
- Character portraits are hidden below the `sm` breakpoint.
- Portrait width is calculated as `min(calc(size * 0.9), 26vw)`.
- Top HUD is fixed; main content accounts for it in landscape.

Keep dialogue text short enough for small screens. Long dialogue works, but it can crowd question/audio overlays.

## Adding A New Round

Checklist:

1. Add assets to `public/backgrounds`, `public/characters`, `public/images`, and `public/voices`.
2. In Admin > Rounds, create the round and note its number.
3. In Admin > Questions, add questions for that round.
4. Create `public/rounds/round-{id}.json`.
5. Add top-level `sceneTheme`, `stageCharacters`, and `roundNarrative`.
6. Add `stages` if the round changes visuals mid-way.
7. Use `questionNumber` to target dialogue/audio to specific questions.
8. Use `showWithQuestion: true` for audio that must remain visible during a question.
9. Run `npm run dev` and test participant flow.
10. Run `npm run build` before deployment.

Minimal round JSON:

```json
{
  "sceneTheme": {
    "bodyElement": {
      "background": "url('/backgrounds/round-1.jpg') center/cover no-repeat fixed",
      "gridPattern": "none",
      "gridPatternOpacity": 0
    },
    "frame": {
      "background": "rgba(0,0,0,0.35)"
    },
    "stage": {
      "backgroundImage": "none"
    }
  },
  "stageCharacters": {
    "curator": {
      "name": "Loki",
      "accent": "#2DFF9A",
      "image": "/images/loki.png",
      "size": "18rem",
      "style": { "bottom": "1rem", "left": "2rem" }
    }
  },
  "roundNarrative": {
    "preQuestion": [
      {
        "id": "intro",
        "type": "dialogue",
        "speaker": "Loki",
        "characterId": "curator",
        "text": "The round begins."
      }
    ],
    "duringQuestion": [],
    "afterAnswer": [],
    "finished": []
  }
}
```

## Common Issues

### `VITE_API_BASE_URL environment variable must be set`

Create `.env` with:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Restart the dev server after editing `.env`.

### CORS or auth keeps failing

The frontend sends cookies with `credentials: "include"`. The backend must allow credentials and the frontend origin.

### Round does not appear

Check:

- The user is signed in and allowed.
- The round is active by time.
- It is not inside the final 5 minute join buffer.
- `/api/round/active` returns a round.
- `/api/round/status/:id` is not finished.

### Background image does not show

Check:

- File is in `public/backgrounds/`.
- JSON path starts with `/`.
- File name case matches exactly.
- `frame` and `stage` are not covering it with opaque backgrounds.

### JSON does not load

Check:

- File name is exactly `public/rounds/round-{id}.json`.
- `{id}` matches the backend round number.
- JSON is valid.
- Vite dev server was restarted if needed.

### Character dialogue does not highlight the expected character

`characterId` must exactly match a key in `stageCharacters`.

```json
"stageCharacters": {
  "ironman": {}
}
```

Needs:

```json
"characterId": "ironman"
```

### More than two characters overlap

Every character needs its own `style` position. Example:

```json
"style": { "bottom": "1rem", "left": "38%" }
```

Avoid placing multiple characters with the same `left` or `right`.

### Dialogue blocks the question card

That is the default. Add:

```json
"showWithQuestion": true
```

or:

```json
"overlayQuestion": true
```

### Need dialogue with no character

Omit `characterId`. It will use `backgroundDialogueBox`.

### Need audio directly inside the question card

Add `audioFile` or `voiceFile` to the question object if the backend/data path supports it:

```json
{
  "audioFile": "/voices/q1.mp3"
}
```

For JSON-driven audio prompts, use a `roundNarrative.duringQuestion` item with `showWithQuestion: true`.

### Answer saved locally but failed to sync

RoundPage cached the answer in `localStorage` before the backend submit failed. Refreshing keeps the draft available. Fix the backend/network issue, then resubmit.

### Admin question options look wrong

When creating: use comma-separated values.

```text
Paris, London, Berlin, Tokyo
```

When editing: comma-separated values or a JSON array both work.

```json
["Paris", "London", "Berlin", "Tokyo"]
```

### Build changed `dist/`

`npm run build` regenerates `dist/`. Commit it only if your deployment expects built assets in the repository. Otherwise commit source changes in `src/` and assets/config in `public/`.

## Current Important Source Files

| File | Why it matters |
|---|---|
| [api.js](api.js) | Backend base URL and fetch wrapper |
| [src/App.jsx](src/App.jsx) | Routes, auth gate, high-level navigation |
| [src/context/AuthContext.jsx](src/context/AuthContext.jsx) | Session user and logout |
| [src/config/experience.js](src/config/experience.js) | Default theme, stage matching, JSON loader |
| [src/pages/RoundPage.jsx](src/pages/RoundPage.jsx) | Main participant round experience |
| [src/pages/WaitingPage.jsx](src/pages/WaitingPage.jsx) | Waiting room polling |
| [src/pages/AdminPage.jsx](src/pages/AdminPage.jsx) | Organizer round/question controls |
| [src/components/Layout.jsx](src/components/Layout.jsx) | Page layout and round intro |
| [src/components/UI.jsx](src/components/UI.jsx) | Shared UI primitives |

Last updated from the codebase on May 9, 2026.
