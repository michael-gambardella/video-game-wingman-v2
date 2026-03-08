/**
 * Resolve game context from a question using two passes:
 *   1. Regex pattern matching (fast, no I/O).
 *   2. Scan question text against all known CSV titles (catches open-ended questions).
 *
 * Keeping both passes in one place means the route stays thin and
 * the logic stays testable without file I/O.
 */

import { extractGameTitleFromQuestion } from "@/lib/question";
import { loadGameRecords, buildGameContext } from "@/lib/gameData";
import type { GameRecord, GameInfo } from "@/types";

/**
 * Scan the question for any known game title.
 * Titles are checked longest-first so a specific title (e.g. "Halo 3")
 * is preferred over a shorter partial match (e.g. "Halo").
 * Returns the matched title string, or null if none found.
 */
export function scanQuestionForTitle(
  question: string,
  records: GameRecord[]
): string | null {
  const lower = question.toLowerCase();
  const uniqueTitles = [...new Set(records.map((r) => r.title))];
  uniqueTitles.sort((a, b) => b.length - a.length);

  for (const title of uniqueTitles) {
    if (lower.includes(title.toLowerCase())) {
      return title;
    }
  }
  return null;
}

/**
 * Pure coordination: given a question and already-loaded records, return GameInfo.
 * Pass 1 — regex extraction (handles structured questions like "When was X released?").
 * Pass 2 — title scan (handles open-ended questions like "Tell me about Halo").
 * Returns undefined if neither pass finds a match.
 */
export function resolveGameContextFromRecords(
  question: string,
  records: GameRecord[]
): GameInfo | undefined {
  const regexTitle = extractGameTitleFromQuestion(question);
  if (regexTitle) {
    return buildGameContext(records, regexTitle);
  }

  const scannedTitle = scanQuestionForTitle(question, records);
  if (!scannedTitle) return undefined;
  return buildGameContext(records, scannedTitle);
}

/**
 * Async entry point: load records from CSV, then run both passes.
 * This is the function the route calls.
 */
export async function resolveGameContext(
  question: string,
  csvPath?: string
): Promise<GameInfo | undefined> {
  const records = await loadGameRecords(csvPath);
  return resolveGameContextFromRecords(question, records);
}
