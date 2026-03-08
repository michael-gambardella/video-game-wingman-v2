/**
 * Client-side API call for POST /api/ask.
 * Pure async function — no React, no state. Fully testable.
 */

import type { AskResponse, ApiError } from "@/types";

export interface AskApiResult {
  answer: string;
}

/** Thrown when the API call fails for any reason. */
export class AskApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AskApiError";
  }
}

/**
 * Send a question to the /api/ask endpoint and return the answer.
 * Throws AskApiError on network failure, non-ok response, or malformed response.
 */
export async function askApi(question: string): Promise<AskApiResult> {
  let res: Response;
  try {
    res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    throw new AskApiError("Network error. Please try again.");
  }

  const data = (await res.json()) as AskResponse | ApiError;

  if (!res.ok) {
    const message = "error" in data ? data.error : "Something went wrong.";
    throw new AskApiError(message);
  }

  if (!("answer" in data) || typeof data.answer !== "string") {
    throw new AskApiError("Unexpected response from server.");
  }

  return { answer: data.answer };
}
