/**
 * OpenAI chat completion for game Q&A.
 * Single responsibility: send question + optional context, return answer.
 */

import OpenAI from "openai";
import { getEnv } from "./env";
import type { GameInfo } from "@/types";

const SYSTEM_PROMPT = `You are a helpful video game expert. Answer the user's question about video games accurately and concisely. Keep answers focused and avoid unnecessary detail unless asked. Respond in plain text only — do not use markdown, asterisks, bullet symbols, or any other formatting syntax.

For factual metadata (release dates, developers, publishers, platforms, sales figures), answer confidently when you are certain.

For specific gameplay details — such as unlock conditions, exact item counts, puzzle solutions, character stats, missable content, named in-game items or gear, or step-by-step progression — follow this rule strictly: only answer if you are confident the information is correct. If you are not confident, do not attempt to answer anyway. Instead, clearly say you are not sure and tell the user to check a reliable source such as the game's wiki or an official guide. A short honest redirect is always better than a hedged guess that turns out to be wrong. Do not use phrases like "I believe" or "I'm not certain, but" as a way to soften a guess — if you are not certain, decline to guess entirely.`;


/**
 * Build system message with optional game context (from CSV) to improve accuracy.
 * Prefer verified data when provided.
 */
function buildSystemMessage(gameContext?: GameInfo): string {
  if (!gameContext) return SYSTEM_PROMPT;
  const parts: string[] = [
    `${gameContext.title} was released on ${gameContext.releaseDateFormatted} for ${gameContext.console}.`,
    `Genre: ${gameContext.genre}. Developer: ${gameContext.developer}. Publisher: ${gameContext.publisher}.`,
  ];
  if (gameContext.criticScore) parts.push(`Critic score: ${gameContext.criticScore}.`);
  if (gameContext.totalSales) parts.push(`Total sales: ${gameContext.totalSales} million.`);
  if (gameContext.otherPlatforms?.length) {
    parts.push(`Also released on: ${gameContext.otherPlatforms.join(", ")}.`);
  }
  const fact = parts.join(" ");
  return `${SYSTEM_PROMPT}\n\nPrefer this verified data when answering: ${fact}`;
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
    model: "gpt-5.2",
    messages: [
      { role: "system", content: systemMessage }, 
      { role: "user", content: question.trim() },
    ],
    max_completion_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("Empty response from OpenAI");
  }
  return content.trim();
}
