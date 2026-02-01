/**
 * Tests for question parsing (game title extraction).
 */

import { extractGameTitleFromQuestion } from "../src/lib/question";

describe("extractGameTitleFromQuestion", () => {
  it("extracts title from 'when was X released?'", () => {
    expect(extractGameTitleFromQuestion("When was Grand Theft Auto V released?")).toBe(
      "Grand Theft Auto V"
    );
  });

  it("extracts title from 'when did X come out?'", () => {
    expect(extractGameTitleFromQuestion("When did Red Dead Redemption 2 come out?")).toBe(
      "Red Dead Redemption 2"
    );
  });

  it("extracts title from 'when did X release?'", () => {
    expect(extractGameTitleFromQuestion("When did Super Mario Galaxy release?")).toBe(
      "Super Mario Galaxy"
    );
  });

  it("extracts title from 'who developed X?'", () => {
    expect(extractGameTitleFromQuestion("Who developed Hollow Knight?")).toBe("Hollow Knight");
  });

  it("extracts title from 'who made X?'", () => {
    expect(extractGameTitleFromQuestion("Who made Grand Theft Auto V?")).toBe(
      "Grand Theft Auto V"
    );
  });

  it("extracts title from 'who published X?'", () => {
    expect(extractGameTitleFromQuestion("Who published Halo?")).toBe("Halo");
  });

  it("extracts title from 'what genre is X?'", () => {
    expect(extractGameTitleFromQuestion("What genre is The Elder Scrolls V: Skyrim?")).toBe(
      "The Elder Scrolls V: Skyrim"
    );
  });

  it("extracts title from 'what console is X on?'", () => {
    expect(extractGameTitleFromQuestion("What console is GTA V on?")).toBe("GTA V");
  });

  it("returns null for non-matching questions", () => {
    expect(extractGameTitleFromQuestion("What is the best RPG?")).toBeNull();
    expect(extractGameTitleFromQuestion("")).toBeNull();
  });
});
