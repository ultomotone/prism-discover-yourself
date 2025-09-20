export const RESULTS_VERSION = "v1.2.1" as const;

export class ResultsVersionMismatchError extends Error {
  public readonly expected: string;
  public readonly received: string;

  constructor(expected: string, received: string) {
    super(`scoring_config.results_version mismatch: expected ${expected}, received ${received}`);
    this.name = "ResultsVersionMismatchError";
    this.expected = expected;
    this.received = received;
  }
}

export function parseResultsVersion(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
      if (typeof parsed === "string") {
        return parsed;
      }
    } catch {
      // fall through
    }

    let candidate = trimmed;
    const patterns = [
      /^"(.*)"$/s,
      /^'(.*)'$/s,
      /^\\"(.*)\\"$/s,
      /^\\'(.*)\\'$/s,
    ];

    for (const pattern of patterns) {
      const match = candidate.match(pattern);
      if (match && match[1] !== undefined) {
        candidate = match[1];
      }
    }

    return candidate || null;
  }

  if (typeof value === "object") {
    const candidate = (value as Record<string, unknown>).results_version ??
      (value as Record<string, unknown>).version ??
      null;
    if (typeof candidate === "string") {
      return candidate;
    }
    return parseResultsVersion(candidate ?? null);
  }

  return null;
}

interface ResultsVersionQuery {
  select(columns: string): ResultsVersionQuery;
  eq(column: string, value: string): ResultsVersionQuery;
  maybeSingle(): Promise<{
    data: { value: unknown } | null;
    error: { message?: string } | null;
  }>;
}

export interface ResultsVersionClient {
  from(table: string): ResultsVersionQuery;
}

export async function ensureResultsVersion(client: ResultsVersionClient): Promise<string> {
  const { data, error } = await client
    .from("scoring_config")
    .select("value")
    .eq("key", "results_version")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load scoring_config.results_version: ${error.message ?? "unknown error"}`);
  }

  const dbVersion = parseResultsVersion(data?.value ?? null);
  if (!dbVersion) {
    throw new Error("scoring_config.results_version is missing or malformed");
  }

  if (dbVersion !== RESULTS_VERSION) {
    throw new ResultsVersionMismatchError(RESULTS_VERSION, dbVersion);
  }

  return dbVersion;
}
