/**
 * Tests for game data parsing and formatting.
 */

import {
  parseGamesCsv,
  formatReleaseDate,
  toGameInfo,
  pickEarliestRelease,
  buildGameContext,
  resolveTitle,
} from "../src/lib/gameData";
import type { GameRecord } from "../src/types";

const makeRecord = (title: string, platform = "PS4"): GameRecord => ({
  title,
  console: platform,
  genre: "Action",
  publisher: "Publisher",
  developer: "Developer",
  release_date: "01-01-2020",
});

describe("parseGamesCsv", () => {
  it("returns empty array for empty content", () => {
    expect(parseGamesCsv("")).toEqual([]);
    expect(parseGamesCsv("title,console,genre\n")).toEqual([]);
  });

  it("parses CSV with expected columns", () => {
    const csv = `img,title,console,genre,publisher,developer,release_date
,Grand Theft Auto V,PS4,Action,Rockstar Games,Rockstar North,18-11-2014`;
    const result = parseGamesCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: "Grand Theft Auto V",
      console: "PS4",
      genre: "Action",
      publisher: "Rockstar Games",
      developer: "Rockstar North",
      release_date: "18-11-2014",
    });
  });

  it("skips rows without title", () => {
    const csv = `title,console,genre,publisher,developer,release_date
,PS4,Action,Rockstar,Rockstar North,18-11-2014
Red Dead 2,PS4,Action-Adventure,Rockstar,Rockstar,26-10-2018`;
    const result = parseGamesCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Red Dead 2");
  });

  it("parses optional critic_score and total_sales when present", () => {
    const csv = `title,console,genre,publisher,developer,release_date,critic_score,total_sales
Grand Theft Auto V,PS3,Action,Rockstar,Rockstar North,17-09-2013,9.4,20.32`;
    const result = parseGamesCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0].critic_score).toBe("9.4");
    expect(result[0].total_sales).toBe("20.32");
  });
});

describe("formatReleaseDate", () => {
  it("formats DD-MM-YYYY to MM/DD/YYYY", () => {
    expect(formatReleaseDate("18-11-2014")).toBe("11/18/2014");
    expect(formatReleaseDate("26-10-2018")).toBe("10/26/2018");
  });

  it("returns original string when not matching pattern", () => {
    expect(formatReleaseDate("")).toBe("");
    expect(formatReleaseDate("2013-09-17")).toBe("2013-09-17");
  });
});

describe("toGameInfo", () => {
  it("converts GameRecord to GameInfo with formatted date", () => {
    const record: GameRecord = {
      title: "GTA V",
      console: "PS4",
      genre: "Action",
      publisher: "Rockstar",
      developer: "Rockstar North",
      release_date: "18-11-2014",
    };
    const info = toGameInfo(record);
    expect(info.title).toBe("GTA V");
    expect(info.releaseDateFormatted).toBe("11/18/2014");
  });

  it("includes criticScore, totalSales, and otherPlatforms when provided", () => {
    const record: GameRecord = {
      title: "GTA V",
      console: "PS3",
      genre: "Action",
      publisher: "Rockstar",
      developer: "Rockstar North",
      release_date: "17-09-2013",
      critic_score: "9.4",
      total_sales: "20.32",
    };
    const info = toGameInfo(record, ["PS4", "XOne", "X360"]);
    expect(info.criticScore).toBe("9.4");
    expect(info.totalSales).toBe("20.32");
    expect(info.otherPlatforms).toEqual(["PS4", "XOne", "X360"]);
  });
});

describe("pickEarliestRelease", () => {
  it("returns the record with earliest release when multiple match same title", () => {
    const records: GameRecord[] = [
      {
        title: "Grand Theft Auto V",
        console: "PS4",
        genre: "Action",
        publisher: "Rockstar Games",
        developer: "Rockstar North",
        release_date: "18-11-2014",
      },
      {
        title: "Grand Theft Auto V",
        console: "PS3",
        genre: "Action",
        publisher: "Rockstar Games",
        developer: "Rockstar North",
        release_date: "17-09-2013",
      },
    ];
    const result = pickEarliestRelease(records, "Grand Theft Auto V");
    expect(result?.release_date).toBe("17-09-2013");
    expect(result?.console).toBe("PS3");
  });

  it("returns undefined when no record matches title", () => {
    const records: GameRecord[] = [
      {
        title: "Other Game",
        console: "PS4",
        genre: "Action",
        publisher: "P",
        developer: "D",
        release_date: "01-01-2020",
      },
    ];
    expect(pickEarliestRelease(records, "Grand Theft Auto V")).toBeUndefined();
  });
});

describe("resolveTitle", () => {
  describe("alias pass", () => {
    it("resolves a known abbreviation to its canonical CSV title", () => {
      const records = [makeRecord("Grand Theft Auto V")];
      expect(resolveTitle("GTA V", records)).toBe("Grand Theft Auto V");
      expect(resolveTitle("gta 5", records)).toBe("Grand Theft Auto V");
      expect(resolveTitle("RDR2", records)).toBe("Red Dead Redemption 2");
    });

    it("alias takes precedence over substring matching", () => {
      // "rdr2" is an alias for "Red Dead Redemption 2"; substring of "rdr2"
      // could theoretically appear in a CSV title too, but alias wins.
      const records = [makeRecord("Red Dead Redemption 2"), makeRecord("rdr2 Special Edition")];
      expect(resolveTitle("RDR2", records)).toBe("Red Dead Redemption 2");
    });
  });

  describe("substring pass", () => {
    it("expands a partial name when exactly one CSV title contains it", () => {
      const records = [makeRecord("The Elder Scrolls V: Skyrim")];
      expect(resolveTitle("Skyrim", records)).toBe("The Elder Scrolls V: Skyrim");
    });

    it("is case-insensitive for substring matching", () => {
      const records = [makeRecord("The Elder Scrolls V: Skyrim")];
      expect(resolveTitle("skyrim", records)).toBe("The Elder Scrolls V: Skyrim");
      expect(resolveTitle("SKYRIM", records)).toBe("The Elder Scrolls V: Skyrim");
    });

    it("returns the original when the substring matches multiple unique titles (ambiguous)", () => {
      const records = [makeRecord("Red Dead Redemption"), makeRecord("Red Dead Redemption 2")];
      expect(resolveTitle("Red Dead", records)).toBe("Red Dead");
    });

    it("is not ambiguous when multiple rows share the same title (multi-platform)", () => {
      // "Skyrim" matches both rows but they have the same title — only one unique title.
      const records = [makeRecord("The Elder Scrolls V: Skyrim", "PS3"), makeRecord("The Elder Scrolls V: Skyrim", "PC")];
      expect(resolveTitle("Skyrim", records)).toBe("The Elder Scrolls V: Skyrim");
    });
  });

  describe("original pass", () => {
    it("returns the title unchanged when no alias or substring match is found", () => {
      const records = [makeRecord("Halo 3")];
      expect(resolveTitle("Unknown Game", records)).toBe("Unknown Game");
    });

    it("returns the exact title unchanged when it already matches a CSV entry", () => {
      const records = [makeRecord("Halo 3")];
      expect(resolveTitle("Halo 3", records)).toBe("Halo 3");
    });
  });
});

describe("buildGameContext", () => {
  it("returns GameInfo with otherPlatforms when multiple rows match same title", () => {
    const records: GameRecord[] = [
      {
        title: "Grand Theft Auto V",
        console: "PS4",
        genre: "Action",
        publisher: "Rockstar",
        developer: "Rockstar North",
        release_date: "18-11-2014",
      },
      {
        title: "Grand Theft Auto V",
        console: "PS3",
        genre: "Action",
        publisher: "Rockstar",
        developer: "Rockstar North",
        release_date: "17-09-2013",
      },
      {
        title: "Grand Theft Auto V",
        console: "XOne",
        genre: "Action",
        publisher: "Rockstar",
        developer: "Rockstar North",
        release_date: "18-11-2014",
      },
    ];
    const result = buildGameContext(records, "Grand Theft Auto V");
    expect(result?.console).toBe("PS3");
    expect(result?.releaseDateFormatted).toBe("09/17/2013");
    expect(result?.otherPlatforms).toContain("PS4");
    expect(result?.otherPlatforms).toContain("XOne");
    expect(result?.otherPlatforms).toHaveLength(2);
  });

  it("resolves alias input and returns correct GameInfo", () => {
    const records = [makeRecord("Grand Theft Auto V")];
    const result = buildGameContext(records, "GTA V");
    expect(result?.title).toBe("Grand Theft Auto V");
  });

  it("resolves partial name via substring and returns correct GameInfo", () => {
    const records = [makeRecord("The Elder Scrolls V: Skyrim")];
    const result = buildGameContext(records, "Skyrim");
    expect(result?.title).toBe("The Elder Scrolls V: Skyrim");
  });

  it("returns undefined for an unrecognised title", () => {
    const records = [makeRecord("Halo 3")];
    expect(buildGameContext(records, "Unknown Game")).toBeUndefined();
  });
});
