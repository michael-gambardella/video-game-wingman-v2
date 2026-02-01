# Video Game Wingman v2

A minimal, professional version of Video Game Wingman. One job: **answer questions about video games accurately**.

## Principles

- **Pristine structure** — Clear folders, single responsibility
- **Clean TypeScript** — Explicit types, no `any`
- **Testable** — Pure functions and thin API layer
- **Proper ENV** — Validated at startup, documented in `.env.example`
- **No hacks** — No commented-out code, no workarounds

## Project structure

```
src/
  app/           # Next.js App Router: layout, page, API routes
  components/     # React UI: AskForm, AnswerDisplay
  lib/           # Business logic: env, gameData, openai, question
  types/         # Shared TypeScript types
tests/           # Unit tests
data/            # Optional: games CSV (see below)
```

## Setup

1. **Clone and install**

   ```bash
   cd video-game-wingman-v2
   npm install
   ```

2. **Verify setup**

   ```bash
   npm test
   ```

3. **Environment**

   Copy `.env.example` to `.env` and set:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

   Optional: `DATA_PATH` — path to your games CSV (default: `data/games.csv`).

4. **Game data (optional but recommended)**

   For accurate release dates and metadata, add a CSV with columns: `title`, `console`, `genre`, `publisher`, `developer`, `release_date`.  
   Place it at `data/games.csv` or set `DATA_PATH` to its path.  
   You can reuse the CSV from the original Video Game Wingman project (e.g. `Video Games Data.csv`); ensure the header includes those column names.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run Next.js lint
- `npm test` — Run Jest tests

## API

- **POST /api/ask**  
  Body: `{ "question": "When was Grand Theft Auto V released?" }`  
  Response: `{ "answer": "..." }` or `{ "error": "..." }`

## Tech

- Next.js 14 (App Router)
- TypeScript (strict)
- OpenAI (gpt-4o-mini)

No database, auth, or extra services. Add them later if needed.
