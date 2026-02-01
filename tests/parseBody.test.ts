/**
 * Tests for POST /api/ask request body parsing.
 */

import { parseAskBody } from "../src/lib/ask/parseBody";

describe("parseAskBody", () => {
  it("returns AskRequest for valid body with non-empty question", () => {
    expect(parseAskBody({ question: "When was GTA V released?" })).toEqual({
      question: "When was GTA V released?",
    });
    expect(parseAskBody({ question: "  trimmed  " })).toEqual({ question: "trimmed" });
  });

  it("returns null for non-object body", () => {
    expect(parseAskBody(null)).toBeNull();
    expect(parseAskBody(undefined)).toBeNull();
    expect(parseAskBody("string")).toBeNull();
    expect(parseAskBody(42)).toBeNull();
  });

  it("returns null when question is missing or not a string", () => {
    expect(parseAskBody({})).toBeNull();
    expect(parseAskBody({ question: 123 })).toBeNull();
    expect(parseAskBody({ question: "" })).toBeNull();
    expect(parseAskBody({ question: "   " })).toBeNull();
  });
});
