/**
 * Integration tests for POST /api/ask route.
 * Verifies the route composes its dependencies correctly.
 *
 * Mocks: next/server, env, resolveGameContext, askOpenAI.
 * Does NOT mock parseAskBody — it is a pure function and is part of the contract.
 */

// Must be declared before imports; Jest hoists jest.mock() calls.
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      body: data,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock("@/lib/env");
jest.mock("@/lib/ask/resolveGameContext");
jest.mock("@/lib/openai");

import { getEnv } from "@/lib/env";
import { resolveGameContext } from "@/lib/ask/resolveGameContext";
import { askOpenAI } from "@/lib/openai";
import { POST } from "../src/app/api/ask/route";
import type { GameInfo } from "../src/types";

const mockGetEnv = jest.mocked(getEnv);
const mockResolveGameContext = jest.mocked(resolveGameContext);
const mockAskOpenAI = jest.mocked(askOpenAI);

/** Shape returned by our NextResponse.json mock. */
interface MockResponse {
  body: unknown;
  status: number;
}

type RouteRequest = Parameters<typeof POST>[0];

function makeRequest(body: unknown): RouteRequest {
  return { json: async () => body } as unknown as RouteRequest;
}

function makeInvalidJsonRequest(): RouteRequest {
  return {
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  } as unknown as RouteRequest;
}

const VALID_GAME_CONTEXT: GameInfo = {
  title: "Grand Theft Auto V",
  console: "PS3",
  genre: "Action",
  publisher: "Rockstar Games",
  developer: "Rockstar North",
  releaseDateFormatted: "09/17/2013",
};

beforeEach(() => {
  jest.resetAllMocks();
  mockGetEnv.mockReturnValue({ openaiApiKey: "test-key", dataPath: undefined });
  mockResolveGameContext.mockResolvedValue(undefined);
  mockAskOpenAI.mockResolvedValue("Test answer.");
});

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

describe("success", () => {
  it("returns 200 with the answer from askOpenAI", async () => {
    mockAskOpenAI.mockResolvedValue("GTA V was released in September 2013.");

    const res = (await POST(
      makeRequest({ question: "When was GTA V released?" })
    )) as unknown as MockResponse;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ answer: "GTA V was released in September 2013." });
  });

  it("calls resolveGameContext with the question", async () => {
    await POST(makeRequest({ question: "When was GTA V released?" }));

    expect(mockResolveGameContext).toHaveBeenCalledWith("When was GTA V released?");
  });

  it("passes gameContext returned by resolveGameContext to askOpenAI", async () => {
    mockResolveGameContext.mockResolvedValue(VALID_GAME_CONTEXT);

    await POST(makeRequest({ question: "When was GTA V released?" }));

    expect(mockAskOpenAI).toHaveBeenCalledWith({
      question: "When was GTA V released?",
      gameContext: VALID_GAME_CONTEXT,
    });
  });

  it("passes undefined gameContext to askOpenAI when no game is found", async () => {
    mockResolveGameContext.mockResolvedValue(undefined);

    await POST(makeRequest({ question: "What is the best RPG?" }));

    expect(mockAskOpenAI).toHaveBeenCalledWith({
      question: "What is the best RPG?",
      gameContext: undefined,
    });
  });
});

// ---------------------------------------------------------------------------
// Validation errors (400)
// ---------------------------------------------------------------------------

describe("validation errors", () => {
  it("returns 400 with message when the JSON body is malformed", async () => {
    const res = (await POST(makeInvalidJsonRequest())) as unknown as MockResponse;

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid JSON body" });
  });

  it("returns 400 when the body has no question field", async () => {
    const res = (await POST(makeRequest({}))) as unknown as MockResponse;

    expect(res.status).toBe(400);
  });

  it("returns 400 when question is an empty string", async () => {
    const res = (await POST(makeRequest({ question: "" }))) as unknown as MockResponse;

    expect(res.status).toBe(400);
  });

  it("returns 400 when question is whitespace only", async () => {
    const res = (await POST(makeRequest({ question: "   " }))) as unknown as MockResponse;

    expect(res.status).toBe(400);
  });

  it("returns 400 with length message when question exceeds 2000 characters", async () => {
    const res = (await POST(
      makeRequest({ question: "a".repeat(2001) })
    )) as unknown as MockResponse;

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Question must be at most 2000 characters." });
  });

  it("accepts a question of exactly 2000 characters", async () => {
    const res = (await POST(
      makeRequest({ question: "a".repeat(2000) })
    )) as unknown as MockResponse;

    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Server errors (500)
// ---------------------------------------------------------------------------

describe("server errors", () => {
  it("returns 500 with the env error message when env is not configured", async () => {
    mockGetEnv.mockImplementation(() => {
      throw new Error("Missing required environment variable: OPENAI_API_KEY");
    });

    const res = (await POST(makeRequest({ question: "test" }))) as unknown as MockResponse;

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: "Missing required environment variable: OPENAI_API_KEY",
    });
  });

  it("returns 500 with the error message when askOpenAI throws an Error", async () => {
    mockAskOpenAI.mockRejectedValue(new Error("OpenAI rate limit exceeded"));

    const res = (await POST(makeRequest({ question: "test" }))) as unknown as MockResponse;

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "OpenAI rate limit exceeded" });
  });

  it("returns 500 with fallback message when askOpenAI throws a non-Error value", async () => {
    mockAskOpenAI.mockRejectedValue("something unexpected");

    const res = (await POST(makeRequest({ question: "test" }))) as unknown as MockResponse;

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to get answer" });
  });
});
