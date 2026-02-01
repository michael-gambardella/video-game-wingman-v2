/**
 * Parse and validate POST /api/ask request body.
 * Keeps route thin and logic testable.
 */

import type { AskRequest } from "@/types";

/**
 * Parse body into AskRequest. Returns null if invalid.
 */
export function parseAskBody(body: unknown): AskRequest | null {
  if (body === null || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const question = o.question;
  if (typeof question !== "string" || question.trim() === "") return null;
  return { question: question.trim() };
}
