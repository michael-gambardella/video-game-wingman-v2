/**
 * Tests for game data parsing and formatting.
 */

import {
  parseGamesCsv,
  formatReleaseDate,
  toGameInfo,
  pickEarliestRelease,
  buildGameContext,
} from "../src/lib/gameData";
import type { GameRecord } from "../src/types";

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
});
