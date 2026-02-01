/**
 * POST /api/ask
 * Body: { question: string }
 * Returns: { answer: string } or { error: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { parseAskBody } from "@/lib/ask/parseBody";
import { getEnv } from "@/lib/env";
import { findGameByTitle } from "@/lib/gameData";
import { askOpenAI } from "@/lib/openai";
import { extractGameTitleFromQuestion } from "@/lib/question";
import type { AskResponse, ApiError } from "@/types";

const MAX_QUESTION_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    getEnv();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server configuration error";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseAskBody(body);
  if (!parsed) {
    return NextResponse.json<ApiError>(
      { error: "Body must be { question: string } with non-empty question." },
      { status: 400 }
    );
  }

  if (parsed.question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json<ApiError>(
      { error: `Question must be at most ${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  try {
    const gameTitle = extractGameTitleFromQuestion(parsed.question);
    const gameContext = gameTitle
      ? await findGameByTitle(gameTitle)
      : undefined;

    const answer = await askOpenAI({
      question: parsed.question,
      gameContext,
    });

    return NextResponse.json<AskResponse>({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get answer";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
