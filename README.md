# Video Game Wingman v2

A minimal, professional version of Video Game Wingman. One job: **answer questions about video games accurately**.

## Development standards

This v2 remake is built to demonstrate **clean, reliable code**—one thing done exceptionally rather than many things done averagely. All changes should uphold:

| Standard | Meaning |
|----------|---------|
| **Pristine structure** | Clear folders, single responsibility per file/module |
| **Clean TypeScript** | Explicit types only; no `any` |
| **Testable** | Pure functions in `lib/`; thin API layer in `app/api/` |
| **Proper ENV** | Validated at startup in `lib/env.ts`; documented in `.env.example` |
| **No hacks** | No commented-out code, no workarounds, no shortcuts |

### Adding features

- Add **one feature at a time**; keep each change small and reviewable.
- **Follow the existing structure**: new logic in `lib/` (or a new subfolder), types in `types/`, UI in `components/`, API in `app/api/`.
- **Name clearly**: files and exports should describe what they do (e.g. `parseBody.ts`, `pickEarliestRelease`).
- **Test new logic**: add or extend tests in `tests/` for new pure functions and behavior.
- **Document env**: if a feature needs config, add it to `lib/env.ts` and `.env.example`.

The goal is to build on the base main functionality while keeping the codebase clean, organized, and predictable.

## Project structure

```
src/
  app/           # Next.js App Router: layout, page, API routes
  components/    # React UI: AskForm, AnswerDisplay
  lib/          # Business logic: env, gameData, openai, question
  types/        # Shared TypeScript types
tests/          # Unit tests
data/
  games/        # Video Games Data.csv, vg_data_dictionary.csv (see Setup)
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

   Optional: `DATA_PATH` — path to your games CSV (default: `data/games/Video Games Data.csv`).

4. **Game data (optional but recommended)**

   Place the games CSV and data dictionary in `data/games/`:

   - `data/games/Video Games Data.csv` — main dataset (columns: `title`, `console`, `genre`, `publisher`, `developer`, `release_date`, etc.).
   - `data/games/vg_data_dictionary.csv` — column reference (for your use; the app only reads the main CSV).

   Copy these from the original Video Game Wingman project. To use a different path or filename, set `DATA_PATH` in `.env`.

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
