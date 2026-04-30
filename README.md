# Deco — UI Team Guide
### Everything you need to theme rounds, place assets, and manage content

---

## Table of Contents
1. [How the round theming system works](#1-how-the-round-theming-system-works)
2. [File structure — where to put your assets](#2-file-structure--where-to-put-your-assets)
3. [The round JSON file — full reference](#3-the-round-json-file--full-reference)
4. [Body background](#4-body-background)
5. [Character images](#5-character-images)
6. [Dialogue boxes](#6-dialogue-boxes)
7. [Question & answer cards](#7-question--answer-cards)
8. [Round narrative — dialogue script](#8-round-narrative--dialogue-script)
9. [Using the Admin panel](#9-using-the-admin-panel)
10. [End-to-end checklist for a new round](#10-end-to-end-checklist-for-a-new-round)
11. [Common mistakes](#11-common-mistakes)

---

## 1. How the round theming system works

Every round can have its own visual theme and dialogue script. This is controlled entirely through a single JSON file you drop into the `public/rounds/` folder. No code changes needed.

When a participant enters a round, the frontend automatically fetches `/rounds/round-{id}.json`. If the file exists, every visual element on the round page — background, characters, cards, dialogue — gets overridden with your values. If the file doesn't exist, the default dark theme is used.

The JSON uses a **merge** system, meaning you only need to specify the things you want to change. Anything you leave out falls back to the default.

---

## 2. File structure — where to put your assets

All assets live inside the `Deco-Frontend/public/` folder. This folder is served as the root of the site, so a file at `public/backgrounds/round1.jpg` is accessible at the URL `/backgrounds/round1.jpg`.

```
Deco-Frontend/
└── public/
    ├── rounds/
    │   ├── round-1.json       ← theme config for Round 1
    │   ├── round-2.json       ← theme config for Round 2
    │   └── round-3.json       ← etc.
    ├── backgrounds/
    │   ├── round1.jpg         ← background image for Round 1
    │   └── round2.jpg
    ├── characters/
    │   ├── curator.svg        ← default curator character (already exists)
    │   ├── signal.svg         ← default signal character (already exists)
    │   ├── round1-curator.png ← your custom character for Round 1
    │   └── round1-signal.png
    └── dialogue/
        └── round1-bubble.png  ← optional custom dialogue bubble image
```

You can name folders anything you like — the above is just a suggested structure.

---

## 3. The round JSON file — full reference

Create `public/rounds/round-{id}.json` where `{id}` matches the round's ID number from the Admin panel.

Here is the complete structure with every possible option. All fields are optional — only include what you want to override:

```json
{
  "sceneTheme": {
    "bodyElement": { ... },
    "frame": { ... },
    "stage": { ... },
    "dialogueBox": { ... },
    "questionBox": { ... },
    "answerRevealBox": { ... }
  },
  "stageCharacters": {
    "curator": { ... },
    "signal": { ... }
  },
  "roundNarrative": {
    "preQuestion": [ ... ],
    "duringQuestion": [],
    "afterAnswer": [],
    "finished": []
  }
}
```

---

## 4. Body background

The body background is the full-page canvas behind everything else.

### Using a solid color or gradient
```json
"bodyElement": {
  "background": "#1a0a2e",
  "gridPatternOpacity": 0
}
```

### Using an image
Drop your image in `public/backgrounds/` then reference it:
```json
"bodyElement": {
  "background": "url('/backgrounds/round1.jpg') center/cover no-repeat fixed",
  "gridPatternOpacity": 0
}
```
The `fixed` keyword makes it behave as a true viewport background that doesn't scroll with content.

### Image with a dark overlay on top
```json
"bodyElement": {
  "background": "url('/backgrounds/round1.jpg') center/cover no-repeat fixed",
  "gridPattern": "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
  "gridPatternSize": "40px 40px",
  "gridPatternOpacity": 0.4
}
```

### Using a wild CSS gradient (for test/demo)
```json
"bodyElement": {
  "background": "repeating-linear-gradient(45deg, red, red 30px, yellow 30px, yellow 60px)",
  "gridPatternOpacity": 0
}
```

### All bodyElement fields
| Field | Type | Description |
|---|---|---|
| `background` | CSS string | Any valid CSS `background` value — color, gradient, or `url(...)` |
| `gridPattern` | CSS string | A CSS gradient painted as an overlay on top of the background |
| `gridPatternSize` | string | e.g. `"36px 36px"` — size of the grid tile |
| `gridPatternOpacity` | number 0–1 | Set to `0` to disable the grid entirely |

### Frame and stage
These are two additional layers rendered on top of the body. For most image-based themes you want them transparent:
```json
"frame": {
  "background": "transparent"
},
"stage": {
  "backgroundImage": "none"
}
```
If you want a subtle vignette on top of your image you can use:
```json
"frame": {
  "background": "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
}
```

---

## 5. Character images

Two characters appear on the round page: **curator** (left side) and **signal** (right side).

### Swapping the image
```json
"stageCharacters": {
  "curator": {
    "image": "/characters/round1-curator.png"
  },
  "signal": {
    "image": "/characters/round1-signal.png"
  }
}
```

### Full character options
```json
"stageCharacters": {
  "curator": {
    "name": "Oracle",
    "image": "/characters/oracle.png",
    "accent": "#a855f7",
    "size": "20rem",
    "customStyles": {
      "borderRadiusClass": "rounded-[2rem]",
      "borderColor": "#a855f766",
      "shadowClass": "shadow-[0_35px_100px_rgba(168,85,247,0.4)]"
    }
  }
}
```

### All character fields
| Field | Type | Description |
|---|---|---|
| `name` | string | Display name shown below the character |
| `image` | string | URL path to the image. Use any PNG, JPG, SVG, WebP |
| `accent` | hex color | Glow/border color — use the character's theme color |
| `size` | CSS string | Width of the card e.g. `"18rem"`, `"24rem"` |
| `customStyles.borderRadiusClass` | Tailwind class | Corner rounding e.g. `"rounded-[2rem]"` or `"rounded-none"` |
| `customStyles.borderColor` | CSS color | Border color including opacity e.g. `"#ff000066"` |
| `customStyles.shadowClass` | Tailwind shadow | Drop shadow class |

**Image tips:**
- Recommended size: at least 400×440px, portrait orientation
- PNG with transparent background looks best
- SVG works and scales perfectly
- Characters are displayed at their `size` width with height = `size × 1.1`

---

## 6. Dialogue boxes

Dialogue boxes appear at the bottom center of the screen when characters speak. There are two types — regular dialogue and voice memo.

### Basic styling
```json
"dialogueBox": {
  "background": "linear-gradient(135deg, #1e1e2e, #2d1b4e)",
  "border": "1px solid rgba(168,85,247,0.4)",
  "color": "#e8d5ff",
  "bubbleContainerClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_25px_80px_rgba(168,85,247,0.3)]"
}
```

### Using a custom bubble image
You can use an image as the dialogue box background:
```json
"dialogueBox": {
  "bubbleImage": "/dialogue/speech-bubble.png",
  "bubbleImageOpacity": 0.95,
  "bubbleContainerClass": "rounded-[1rem]"
}
```

### Customising text styles inside the box
```json
"dialogueBox": {
  "background": "...",
  "customStyles": {
    "speakerClass": "text-xs uppercase tracking-[0.3em] text-purple-300",
    "textClass": "mt-4 text-base leading-8 text-white",
    "continueClass": "mt-5 text-right text-xs uppercase tracking-[0.25em] text-purple-400",
    "transcriptClass": "mt-5 rounded-xl border border-purple-300/20 bg-black/20 px-4 py-3 text-sm text-purple-200"
  }
}
```

### All dialogueBox fields
| Field | Type | Description |
|---|---|---|
| `background` | CSS string | Box background — gradient, color, or image |
| `border` | CSS string | e.g. `"2px solid rgba(255,255,255,0.3)"` |
| `color` | CSS color | Text color inside the box |
| `bubbleContainerClass` | Tailwind class | Border radius of the box |
| `boxShadow` | Tailwind shadow class | Drop shadow |
| `bubbleImage` | URL string | Image to use as box background |
| `bubbleImageOpacity` | number 0–1 | Opacity of the bubble image |
| `customStyles.speakerClass` | Tailwind classes | Style for the speaker name |
| `customStyles.textClass` | Tailwind classes | Style for the main dialogue text |
| `customStyles.continueClass` | Tailwind classes | Style for "Click to continue" |
| `customStyles.transcriptClass` | Tailwind classes | Style for voice memo transcript |

---

## 7. Question & answer cards

### Question card
```json
"questionBox": {
  "background": "linear-gradient(180deg, rgba(20,10,40,0.96), rgba(30,15,60,0.92))",
  "border": "1px solid rgba(168,85,247,0.3)",
  "borderRadiusClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_35px_100px_rgba(168,85,247,0.2)]",
  "numberClass": "text-xs uppercase tracking-[0.3em] text-purple-300",
  "titleClass": "mt-3 text-2xl font-medium text-white",
  "optionClass": "rounded-[1.5rem] border px-4 py-4 text-left text-sm transition"
}
```

### Answer reveal card
```json
"answerRevealBox": {
  "background": "linear-gradient(135deg, rgba(20,10,40,0.96), rgba(88,28,135,0.92))",
  "border": "1px solid rgba(168,85,247,0.4)",
  "borderRadiusClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_35px_100px_rgba(168,85,247,0.3)]",
  "labelClass": "text-xs uppercase tracking-[0.35em] text-purple-200/70",
  "answerClass": "mt-6 text-xl leading-8 text-white",
  "questionClass": "mt-3 text-sm text-purple-200"
}
```

---

## 8. Round narrative — dialogue script

The narrative controls what characters say during the round. It is split into four moments:

| Key | When it plays |
|---|---|
| `preQuestion` | Once at the very start, before the first question |
| `duringQuestion` | Before each question card appears |
| `afterAnswer` | After the participant submits an answer |
| `finished` | When the round is complete |

### Dialogue item types

**Regular dialogue** — character speaks, click to continue:
```json
{
  "id": "intro-1",
  "type": "dialogue",
  "speaker": "Oracle",
  "characterId": "curator",
  "text": "Welcome. The stage is live. Answer fast."
}
```

**Voice memo** — styled as an incoming message with optional transcript:
```json
{
  "id": "memo-1",
  "type": "voiceMemo",
  "speaker": "Signal",
  "characterId": "signal",
  "label": "Incoming transmission",
  "text": "Five questions. One shot each.",
  "transcript": "You have five questions. Each one carries points. Speed matters — tiebreakers use total time."
}
```

### `characterId` values
- `"curator"` — highlights and shows the left character
- `"signal"` — highlights and shows the right character

These must match the keys in `stageCharacters`, so if you rename them keep the `characterId` consistent.

### Targeting specific questions
Add `"questionNumber": 2` to show a dialogue item only before question 2:
```json
{
  "id": "hint-q2",
  "type": "dialogue",
  "speaker": "Oracle",
  "characterId": "curator",
  "text": "This one is tricky. Think carefully.",
  "questionNumber": 2
}
```
Or target multiple questions with an array: `"questionNumber": [1, 3]`

### Full narrative example
```json
"roundNarrative": {
  "preQuestion": [
    {
      "id": "open",
      "type": "dialogue",
      "speaker": "Oracle",
      "characterId": "curator",
      "text": "Five questions. One attempt each. Your time starts now."
    },
    {
      "id": "signal-intro",
      "type": "voiceMemo",
      "speaker": "Signal",
      "characterId": "signal",
      "label": "Briefing",
      "text": "Correct answers earn points. Fastest total time wins tiebreakers.",
      "transcript": "Each correct answer earns you the listed points. If scores tie, the participant with the lower total time wins."
    }
  ],
  "duringQuestion": [],
  "afterAnswer": [],
  "finished": []
}
```

Leave `duringQuestion`, `afterAnswer`, and `finished` as empty arrays `[]` if you don't want dialogue at those moments.

---

## 9. Using the Admin panel

The Admin panel is accessible at the top-right of the app when logged in with an Organizer account. Navigate to it via the Home button, or directly via `/admin`.

### Rounds tab

**Creating a round:**
1. Click the **Rounds** tab
2. Set a Start Time and End Time using the date/time pickers
3. Click **+ Create Round**
4. The new round appears in the list with a blue "Upcoming" badge
5. Note the Round ID — you'll need it for questions and your JSON file

**Round statuses:**
- **Upcoming** — scheduled but not started yet
- **Active** — currently live, participants can join
- **Completed** — past the end time

**Important timing note:** Participants can only join a round until **5 minutes before it ends**. This buffer exists so late joiners don't get a meaningless few seconds. Plan your end time accordingly — e.g. if you want 30 minutes of play, set the window to 35 minutes.

### Questions tab

**Adding a question:**
1. Click the **Questions** tab
2. Enter the Round ID in the "Round ID" field and click **Load Questions**
3. Fill in the form:
   - **Question text** — the question shown to participants (required)
   - **Answer** — the exact correct answer string, case-sensitive (required)
   - **Reward** — points awarded for a correct answer (required)
   - **Options** — comma-separated list for MCQ e.g. `Paris, London, Berlin, Tokyo`. Leave blank for a free-text answer
   - **Reference link** — optional image URL shown above the answer options
4. Click **+ Add Question**

**Question types:**
- **MCQ** — provide options as a comma-separated list. Participants pick from buttons A, B, C, D...
- **Free text** — leave options blank. Participants type their answer. The answer must match exactly (case-sensitive).

**Editing a question:**
Click the ✏️ button on any question. When editing, options must be entered as a JSON array e.g. `["Paris", "London", "Berlin", "Tokyo"]`.

**Deleting a question:**
Click the 🗑 button. This is permanent.

### Maintenance tab

**Truncate All Tables** — wipes all rounds, questions, responses and results from the database. Only use this between events to reset completely. There is a confirmation prompt but the action cannot be undone.

---

## 10. End-to-end checklist for a new round

Use this checklist before each round goes live:

**Assets (UI team):**
- [ ] Background image exported and placed in `public/backgrounds/`
- [ ] Character images exported (PNG with transparent bg recommended) and placed in `public/characters/`
- [ ] Optional dialogue bubble image placed in `public/dialogue/`
- [ ] `public/rounds/round-{id}.json` created and filled

**JSON file:**
- [ ] File is named exactly `round-{id}.json` where `{id}` matches the admin panel Round ID
- [ ] All image paths start with `/` e.g. `/backgrounds/round1.jpg`
- [ ] JSON is valid — paste it into [jsonlint.com](https://jsonlint.com) to check
- [ ] `"frame": { "background": "transparent" }` is set if using a body image
- [ ] Character `name` in `stageCharacters` matches `speaker` in `roundNarrative`

**Admin (content team):**
- [ ] Round created with correct start and end times
- [ ] Note the Round ID
- [ ] All questions added to the correct Round ID
- [ ] Each MCQ option list has at least 2 entries
- [ ] Answers are spelled exactly as participants should type them (for free text)
- [ ] Question reward points are set

**Smoke test:**
- [ ] Load the round page as a participant — background shows correctly
- [ ] Characters appear with correct images
- [ ] Dialogue plays in order
- [ ] Question card styling matches the theme
- [ ] Answer reveal card styling matches the theme

---

## 11. Common mistakes

**Background not showing:**
Make sure `"frame": { "background": "transparent" }` is in your JSON. The frame layer sits on top of the body and defaults to a dark gradient that covers everything.

**Image not loading:**
- Paths must start with `/` — e.g. `/backgrounds/round1.jpg` not `backgrounds/round1.jpg`
- File name is case-sensitive — `Round1.jpg` ≠ `round1.jpg`
- The file must be in the `public/` folder, not `src/`

**JSON file not loading:**
- File must be named exactly `round-1.json`, `round-2.json` etc. — matching the round ID from the admin panel
- File must be in `public/rounds/` — not `src/`
- Validate the JSON at jsonlint.com — a single missing comma breaks everything

**Character not highlighted during dialogue:**
The `characterId` in your narrative item must exactly match the key in `stageCharacters` — either `"curator"` or `"signal"`. If you only changed the `name` field, the `characterId` is still `"curator"` / `"signal"`.

**Answer marked wrong despite correct answer:**
Answers are case-sensitive and whitespace-sensitive. If the answer is `"Paris"` and a participant types `"paris"` or `"Paris "` (trailing space), it will be marked incorrect. Set answers in lowercase if you want to be lenient, or note the exact required format in the question text.

**MCQ options not appearing:**
Options must be a comma-separated list in the admin form e.g. `Paris, London, Berlin, Tokyo`. If there is only one option it will be rejected — minimum is 2.

**Round not appearing after refresh:**
This is a known-fixed bug. Make sure you're running the latest `round.controller.js` — the fix ensures in-progress rounds stay visible on refresh.

---

*Guide version: based on Deco codebase as of April 2026*
