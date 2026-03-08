/**
 * Tests for title alias resolution.
 */

import { resolveAlias, TITLE_ALIASES } from "../src/lib/titleAliases";

describe("resolveAlias", () => {
  it("resolves lowercase alias to canonical title", () => {
    expect(resolveAlias("gta v")).toBe("Grand Theft Auto V");
    expect(resolveAlias("rdr2")).toBe("Red Dead Redemption 2");
    expect(resolveAlias("botw")).toBe("The Legend of Zelda: Breath of the Wild");
  });

  it("is case-insensitive", () => {
    expect(resolveAlias("GTA V")).toBe("Grand Theft Auto V");
    expect(resolveAlias("GTA v")).toBe("Grand Theft Auto V");
    expect(resolveAlias("RDR2")).toBe("Red Dead Redemption 2");
  });

  it("trims whitespace before lookup", () => {
    expect(resolveAlias("  gta v  ")).toBe("Grand Theft Auto V");
  });

  it("returns undefined for an unknown alias", () => {
    expect(resolveAlias("unknown game")).toBeUndefined();
    expect(resolveAlias("")).toBeUndefined();
  });

  it("all alias values are non-empty strings", () => {
    for (const [alias, canonical] of Object.entries(TITLE_ALIASES)) {
      expect(typeof canonical).toBe("string");
      expect(canonical.trim().length).toBeGreaterThan(0);
      expect(alias.trim().length).toBeGreaterThan(0);
    }
  });

  it("all alias keys are stored in lowercase", () => {
    for (const key of Object.keys(TITLE_ALIASES)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});
