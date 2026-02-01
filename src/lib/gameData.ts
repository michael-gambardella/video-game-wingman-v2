/**
 * Game data: load CSV and lookup by title.
 * Pure functions where possible; single responsibility.
 */

import { readFile } from "fs/promises";
import path from "path";
import { getEnv } from "./env";
import type { GameRecord, GameInfo } from "@/types";

const DEFAULT_CSV = "data/games.csv";

/**
 * Parse a CSV line into columns (handles quoted fields).
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parse CSV string into records. First row = headers.
 * Expected columns: title, console, genre, publisher, developer, release_date (others optional).
 */
export function parseGamesCsv(csvText: string): GameRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s/g, "_"));
  const titleIdx = header.indexOf("title");
  const consoleIdx = header.indexOf("console");
  const genreIdx = header.indexOf("genre");
  const publisherIdx = header.indexOf("publisher");
  const developerIdx = header.indexOf("developer");
  const releaseIdx = header.indexOf("release_date");

  if (titleIdx === -1) return [];

  const records: GameRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const get = (idx: number) => (idx >= 0 && idx < cols.length ? cols[idx] ?? "" : "");
    const title = get(titleIdx);
    if (!title) continue;
    records.push({
      title,
      console: get(consoleIdx),
      genre: get(genreIdx),
      publisher: get(publisherIdx),
      developer: get(developerIdx),
      release_date: get(releaseIdx),
    });
  }
  return records;
}

/**
 * Format DD-MM-YYYY to MM/DD/YYYY for display.
 */
export function formatReleaseDate(dateStr: string): string {
  if (!dateStr || !/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) return dateStr;
  const [day, month, year] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

/**
 * Convert a GameRecord to display-friendly GameInfo.
 */
export function toGameInfo(record: GameRecord): GameInfo {
  return {
    title: record.title,
    console: record.console,
    genre: record.genre,
    publisher: record.publisher,
    developer: record.developer,
    releaseDateFormatted: formatReleaseDate(record.release_date),
  };
}

/**
 * Normalize title for lookup: lowercase, trim.
 */
function normalizeTitle(title: string): string {
  return title.toLowerCase().trim();
}

/** Parse DD-MM-YYYY to YYYY-MM-DD for sorting; returns empty string if invalid. */
function parseReleaseSortKey(dateStr: string): string {
  if (!dateStr || !/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) return "";
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * From records matching the title (case-insensitive), return the one with earliest release_date.
 * Used so "When was GTA V released?" returns initial release (e.g. PS3 2013) not a port (e.g. PS4 2014).
 */
export function pickEarliestRelease(records: GameRecord[], title: string): GameRecord | undefined {
  const normalized = normalizeTitle(title);
  const matches = records.filter((r) => normalizeTitle(r.title) === normalized);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  return matches.sort(
    (a, b) => parseReleaseSortKey(a.release_date).localeCompare(parseReleaseSortKey(b.release_date))
  )[0];
}

let cachedRecords: GameRecord[] | null = null;
let cachedPath: string | null = null;

/**
 * Resolve CSV path: explicit path > DATA_PATH env > default data/games.csv.
 */
function resolveCsvPath(csvPath?: string): string {
  const base = process.cwd();
  const pathToUse = csvPath ?? getEnv().dataPath ?? DEFAULT_CSV;
  return path.resolve(base, pathToUse);
}

/**
 * Load game records from CSV. Uses in-memory cache per path.
 */
export async function loadGameRecords(csvPath?: string): Promise<GameRecord[]> {
  const resolved = resolveCsvPath(csvPath);

  if (cachedRecords !== null && cachedPath === resolved) {
    return cachedRecords;
  }

  try {
    const text = await readFile(resolved, "utf-8");
    const records = parseGamesCsv(text);
    cachedRecords = records;
    cachedPath = resolved;
    return records;
  } catch {
    cachedRecords = [];
    cachedPath = resolved;
    return [];
  }
}

/**
 * Find game by title (case-insensitive). When multiple rows match (e.g. same game
 * on several platforms), returns the one with the earliest release date (initial release).
 */
export async function findGameByTitle(
  title: string,
  csvPath?: string
): Promise<GameInfo | undefined> {
  const records = await loadGameRecords(csvPath);
  const record = pickEarliestRelease(records, title);
  return record ? toGameInfo(record) : undefined;
}
