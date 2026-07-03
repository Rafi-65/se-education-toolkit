# Software Requirements Engineering Learning Platform

A Next.js-based educational platform designed to help users practice requirements engineering skills through interactive labs. The platform features guided exercises on user stories, use cases, and other requirements engineering concepts.

## Project Overview

This platform provides:

- Interactive labs with structured learning paths
- Different software development areas (requirements engineering, coding maintainers)
- Various topics per area (user stories, requirements engineering, etc.)
- Role-based exercises (tutor, student, professional)
- A two-prompt workflow that seeds each lab with a selectable problem, user story, and acceptance criteria
- URL-based filtering with query parameters
- Points-based feedback system
- Hint systems with progressive assistance

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/sse-site.git
cd sse-site
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/
├── app/                 # Next.js App Router routes (/, /labs, /about, /talks)
├── components/          # Reusable UI components (incl. components/labs/)
├── data/                # Lab content and configuration
│   ├── lab-data.json    # Canonical source: areas[] (topics[], games[]), personas[], problems[]
│   ├── prompts/         # One .ts file per game prompt, registered in prompts/index.ts
│   └── index.ts         # Builds GAMES, LABS, PROBLEMS, AREAS, PERSONAS from the above
├── lib/                 # Utility functions (lab-utils.ts, download.ts, ...)
└── public/              # Static assets (images, slides, ...)
```

## The two-prompt lab workflow

Every lab is run as a **two-message conversation** with an AI assistant, mirroring the two `steps[]` of each game:

1. **Prompt 1 · Set up the game** (the `setup` step) — pasted into a fresh AI chat. The AI welcomes the student, explains the rules and scoring, and then waits.
2. **Prompt 2 · Start the game** (the `interaction` step) — the student's selected context (problem, user story, acceptance criteria) plus a kickoff line, pasted as the next message to begin play. This step stays locked until a problem, user story, and acceptance criteria are selected.

Prompt 1 comes from a prompt file (`data/prompts/<name>.ts`); Prompt 2 is assembled at render time from the selected `Problem`. Setup prompts do **not** inline the case-study context — the two prompts are kept separate on purpose.

## Creating a New Lab

Content lives in two places: `data/lab-data.json` (the canonical JSON source) and `data/prompts/` (one `.ts` file per prompt). `data/index.ts` reads both and builds the `GAMES` and `LABS` exports consumed by the app.

1. Add a game to the relevant topic in `data/lab-data.json`. Each game has a `steps[]` array where every step declares a `type`:

```jsonc
{
  "id": "unique-game-id",
  "title": "Lab Title",
  "description": "Brief description of the lab",
  "steps": [
    {
      "type": "setup",            // holds Prompt 1
      "title": "Part 1: Setup",
      "time": 5,
      "setup": ["Open your preferred LLM assistant", "Copy and paste the following prompt:"],
      "promptFile": "unique-game-id"   // references data/prompts/unique-game-id.ts
    },
    {
      "type": "interaction",      // Prompt 2 is built from the selected problem — no prompt field
      "title": "Part 2: Game Interaction",
      "time": 10,
      "guidelines": ["Analyze each step carefully", "Try finding issues before requesting hints"]
    }
  ]
}
```

2. Create the prompt file `data/prompts/unique-game-id.ts` and register it in `data/prompts/index.ts`. Prompt strings may contain the `{{PERSONA_INTRO}}` placeholder, which is replaced at render time from the area's `personaIntros`:

```typescript
// data/prompts/unique-game-id.ts
export const uniqueGameId = `{{PERSONA_INTRO}}
You are running the ... game. Explain the rules and points briefly, then wait
for me to paste the scenario in my next message. Do not invent a scenario
yourself — begin only once I have pasted it.`;
```

3. Make the topic offer the game by adding problem ids to the topic's `problemIds`, and ensure those `Problem` objects exist in the top-level `problems[]`:

```jsonc
// top-level "problems": [ ... ]
{
  "id": "reset-password-problem",
  "name": "Reset Password",
  "statement": "Users who forget their password need a secure way to regain access.",
  "description": "A flow that lets a user request a reset link and set a new password.",
  "context": "Account security",
  "personas": [
    { "name": "Alex", "role": "Registered user", "description": "..." }
  ]
}
```

Topic names use `snake_case` (e.g. `use_cases`, `user_stories_and_acceptance_criteria`); `formatTopicForDisplay` in `lib/lab-utils.ts` converts them to title case for the UI.

## Query Parameter Filtering

The platform supports URL-based filtering with query parameters:

- `?area=requirements%20engineering` — Filter by area
- `?topic=use_cases` — Filter by topic (`snake_case`)
- `?persona=tutor` — Filter by persona
- `?problemId=reset-password-problem` — Preselect a problem for Prompt 2
- `?userStoryId=...` — Preselect a user story
- `?acceptanceCriteriaIds=...` — Preselect acceptance criteria (comma-separated)

Changing `area` resets `topic`. You can combine parameters to deep-link a fully seeded lab:

```
/labs?area=requirements%20engineering&topic=use_cases&persona=tutor&problemId=reset-password-problem
```

## Development Workflow

### Git Best Practices

1. Create a new branch for each feature or fix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-you-are-fixing
```

2. Make your changes and commit with descriptive messages:

```bash
git add .
git commit -m "feat: add new user story lab for professionals"
```

3. Push your branch and create a pull request:

```bash
git push origin feature/your-feature-name
```

4. In your GitHub repository, create a pull request with:

   - Clear title describing the change
   - Description of what was changed and why
   - Any testing performed
   - Reference to related issues (if applicable)

5. After review and approval, merge your PR into the main branch

### Code Style

- Follow existing patterns and conventions in the codebase
- Keep lab content structured and consistent with existing examples
- Use TypeScript types for all new code

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
# or
vercel
```
