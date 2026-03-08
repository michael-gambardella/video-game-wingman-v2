/**
 * Tests for resolveGameContext logic.
 * Pure functions only — no file I/O, no mocks.
 */

import { scanQuestionForTitle, resolveGameContextFromRecords } from "../src/lib/ask/resolveGameContext";
import type { GameRecord } from "../src/types";

const makeRecord = (title: string, platform = "PS4", releaseDate = "01-01-2020"): GameRecord => ({
  title,
  console: platform,
  genre: "Action",
  publisher: "Publisher",
  developer: "Developer",
  release_date: releaseDate,
});

const RECORDS: GameRecord[] = [
  makeRecord("Halo"),
  makeRecord("Halo 3"),
  makeRecord("Grand Theft Auto V", "PS3", "17-09-2013"),
  makeRecord("Grand Theft Auto V", "PS4", "18-11-2014"),
  makeRecord("The Last of Us"),
  makeRecord("Red Dead Redemption 2"),
];

// ---------------------------------------------------------------------------
// scanQuestionForTitle
// ---------------------------------------------------------------------------

describe("scanQuestionForTitle", () => {
  it("finds a title when the question contains it verbatim", () => {
    expect(scanQuestionForTitle("Tell me about Halo 3", RECORDS)).toBe("Halo 3");
  });

  it("is case-insensitive", () => {
    expect(scanQuestionForTitle("tell me about halo 3", RECORDS)).toBe("Halo 3");
    expect(scanQuestionForTitle("TELL ME ABOUT HALO 3", RECORDS)).toBe("Halo 3");
  });

  it("prefers the longer title when a shorter title is a substring of a longer one", () => {
    // "Halo" is a substring of "Halo 3" — should match "Halo 3" first (longer)
    expect(scanQuestionForTitle("Is Halo 3 worth playing?", RECORDS)).toBe("Halo 3");
  });

  it("falls back to shorter title when only that title is in the question", () => {
    expect(scanQuestionForTitle("Tell me about Halo", RECORDS)).toBe("Halo");
  });

  it("handles multi-word titles", () => {
    expect(scanQuestionForTitle("What's the story in The Last of Us?", RECORDS)).toBe(
      "The Last of Us"
    );
  });

  it("handles titles with numbers", () => {
    expect(scanQuestionForTitle("Is Red Dead Redemption 2 on PC?", RECORDS)).toBe(
      "Red Dead Redemption 2"
    );
  });

  it("returns null when no title appears in the question", () => {
    expect(scanQuestionForTitle("What is the best RPG ever made?", RECORDS)).toBeNull();
  });

  it("returns null for an empty question", () => {
    expect(scanQuestionForTitle("", RECORDS)).toBeNull();
  });

  it("returns null when records list is empty", () => {
    expect(scanQuestionForTitle("Tell me about Halo", [])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resolveGameContextFromRecords
// ---------------------------------------------------------------------------

describe("resolveGameContextFromRecords", () => {
  it("uses regex path for structured questions and returns correct GameInfo", () => {
    const result = resolveGameContextFromRecords(
      "When was Grand Theft Auto V released?",
      RECORDS
    );
    expect(result).toBeDefined();
    expect(result?.title).toBe("Grand Theft Auto V");
    // Earliest release: PS3 on 17-09-2013
    expect(result?.console).toBe("PS3");
    expect(result?.releaseDateFormatted).toBe("09/17/2013");
  });

  it("uses scan path for open-ended questions and returns correct GameInfo", () => {
    const result = resolveGameContextFromRecords("Tell me about The Last of Us", RECORDS);
    expect(result).toBeDefined();
    expect(result?.title).toBe("The Last of Us");
  });

  it("uses scan path when regex does not match", () => {
    const result = resolveGameContextFromRecords("Is Halo 3 worth playing?", RECORDS);
    expect(result).toBeDefined();
    expect(result?.title).toBe("Halo 3");
  });

  it("returns undefined when no title is found by either pass", () => {
    const result = resolveGameContextFromRecords("What is the best RPG ever?", RECORDS);
    expect(result).toBeUndefined();
  });

  it("returns undefined for an empty question", () => {
    const result = resolveGameContextFromRecords("", RECORDS);
    expect(result).toBeUndefined();
  });

  it("includes otherPlatforms when the same title has multiple CSV rows", () => {
    // GTA V has PS3 (earliest) and PS4 rows
    const result = resolveGameContextFromRecords("Tell me about Grand Theft Auto V", RECORDS);
    expect(result?.otherPlatforms).toContain("PS4");
  });
});
