/**
 * Known title aliases: common abbreviations and shorthand that have no
 * substring relationship to the canonical CSV title.
 *
 * Keys must be lowercase. Values must match the CSV title exactly.
 * Add entries here when a user-facing abbreviation cannot be resolved
 * by substring matching alone.
 */
export const TITLE_ALIASES: Record<string, string> = {
  "gta v": "Grand Theft Auto V",
  "gta 5": "Grand Theft Auto V",
  "gta iv": "Grand Theft Auto IV",
  "gta 4": "Grand Theft Auto IV",
  "gta san andreas": "Grand Theft Auto: San Andreas",
  "gta sa": "Grand Theft Auto: San Andreas",
  "gta vc": "Grand Theft Auto: Vice City",
  "rdr2": "Red Dead Redemption 2",
  "rdr": "Red Dead Redemption",
  "botw": "The Legend of Zelda: Breath of the Wild",
  "totk": "The Legend of Zelda: Tears of the Kingdom",
};

/**
 * Look up a title alias. Returns the canonical title if found, undefined otherwise.
 */
export function resolveAlias(title: string): string | undefined {
  return TITLE_ALIASES[title.toLowerCase().trim()];
}
