/**
 * Extract game title from a question so we can look it up in CSV data
 * and inject verified facts into the AI prompt.
 */

/** Regexes with one capture group = game title. Tried in order; first match wins. */
const TITLE_PATTERNS: RegExp[] = [
  /when\s+(?:was|did)\s+(.+?)\s+(?:released|come\s+out)\??/i,
  /when\s+did\s+(.+?)\s+release\??/i,
  /what\s+year\s+(?:did|was)\s+(.+?)\s+(?:release|released)\??/i,
  /who\s+(?:developed|made|created)\s+(.+?)\s*\??$/i,
  /who\s+published\s+(.+?)\s*\??$/i,
  /what\s+genre\s+is\s+(.+?)\s*\??$/i,
  /what\s+(?:console|platform|system)\s+(?:is|was)\s+(.+?)\s+(?:on|for)\??/i,
];

/**
 * Extract a likely game title from the question. Returns null if no pattern matches.
 */
export function extractGameTitleFromQuestion(question: string): string | null {
  const trimmed = question.trim();
  for (const re of TITLE_PATTERNS) {
    const match = re.exec(trimmed);
    const title = match?.[1]?.trim();
    if (title) return title;
  }
  return null;
}
