/**
 * Shared types for Video Game Wingman v2.
 * No `any`. Explicit types only.
 */

/** One row from the games CSV (matches column names). */
export interface GameRecord {
  title: string;
  console: string;
  genre: string;
  publisher: string;
  developer: string;
  release_date: string;
  critic_score?: string;
  total_sales?: string;
}

/** Formatted game info used when augmenting an answer. */
export interface GameInfo {
  title: string;
  console: string;
  genre: string;
  publisher: string;
  developer: string;
  releaseDateFormatted: string;
  /** From CSV when present (e.g. "9.4"). */
  criticScore?: string;
  /** From CSV when present (e.g. "20.32" million). */
  totalSales?: string;
  /** Other platforms when game has multiple rows (e.g. ["PS4", "XOne"]). */
  otherPlatforms?: string[];
}

/** Request body for POST /api/ask */
export interface AskRequest {
  question: string;
}

/** Response from POST /api/ask */
export interface AskResponse {
  answer: string;
}

/** Error response shape */
export interface ApiError {
  error: string;
}
