/**
 * OpenAI chat completion for game Q&A.
 * Single responsibility: send question + optional context, return answer.
 */

import OpenAI from "openai";
import { getEnv } from "./env";
import type { GameInfo } from "@/types";

const SYSTEM_PROMPT = `You are a helpful video game expert. Answer the user's question about video games accurately and concisely. If you are not sure, say so. Keep answers focused and avoid unnecessary detail unless asked.`;

/**
 * Build system message with optional game context (e.g. from CSV) to improve accuracy.
 */
function buildSystemMessage(gameContext?: GameInfo): string {
  if (!gameContext) return SYSTEM_PROMPT;
  const fact = `${gameContext.title} was released on ${gameContext.releaseDateFormatted} for ${gameContext.console}. Genre: ${gameContext.genre}. Developer: ${gameContext.developer}. Publisher: ${gameContext.publisher}.`;
  return `${SYSTEM_PROMPT}\n\nWhen relevant, use this verified data: ${fact}`;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const { openaiApiKey } = getEnv();
    client = new OpenAI({ apiKey: openaiApiKey });
  }
  return client;
}

export interface AskOptions {
  question: string;
  gameContext?: GameInfo;
}

/**
 * Get a single answer from OpenAI for the given question.
 * Optionally include gameContext (from findGameByTitle) to ground the answer.
 */
export async function askOpenAI(options: AskOptions): Promise<string> {
  const { question, gameContext } = options;
  const systemMessage = buildSystemMessage(gameContext);
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: question.trim() },
    ],
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("Empty response from OpenAI");
  }
  return content.trim();
}
