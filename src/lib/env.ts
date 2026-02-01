/**
 * Environment variable validation.
 * Fail fast at startup; no scattered process.env reads.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}. Check .env or .env.local.`);
  }
  return value.trim();
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? undefined : value.trim();
}

export interface Env {
  openaiApiKey: string;
  dataPath: string | undefined;
}

let cached: Env | null = null;

/**
 * Validated env. Call once at app startup or at first API use.
 */
export function getEnv(): Env {
  if (cached) return cached;
  cached = {
    openaiApiKey: requireEnv("OPENAI_API_KEY"),
    dataPath: optionalEnv("DATA_PATH"),
  };
  return cached;
}
