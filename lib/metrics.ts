import { logger } from "../src/lib/logger.ts";

export type MetricFields = Record<string, string | number | boolean | null | undefined>;

function readEnv(name: string): string | undefined {
  try {
    if (typeof Deno !== "undefined" && typeof Deno.env?.get === "function") {
      const value = Deno.env.get(name);
      if (value != null) return value;
    }
  } catch (_) {
    /* ignore */
  }
  if (typeof process !== "undefined" && typeof process.env === "object") {
    const value = (process.env as Record<string, string | undefined>)[name];
    if (value != null) return value;
  }
  return undefined;
}

function now(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

const METRICS_ENDPOINT = readEnv("METRICS_ENDPOINT") ?? readEnv("METRICS_WEBHOOK_URL");
const NODE_ENV = (readEnv("NODE_ENV") ?? readEnv("ENVIRONMENT") ?? "").toLowerCase();
const METRICS_ENABLED = NODE_ENV === "production";

async function dispatchMetric(name: string, fields: MetricFields): Promise<void> {
  if (!METRICS_ENDPOINT) {
    logger.info("metric.emit", { name, fields });
    return;
  }

  try {
    await fetch(METRICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, fields }),
    });
  } catch (error) {
    logger.error("metric.error", {
      name,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function emitMetric(name: string, fields: MetricFields = {}): Promise<void> {
  if (!METRICS_ENABLED) return;
  await dispatchMetric(name, fields);
}

export interface TimedResult<T> {
  result?: T;
  error?: unknown;
  durationMs: number;
}

function elapsed(start: number): number {
  const end = now();
  return end - start;
}

export async function withTimer<T>(fn: () => Promise<T> | T): Promise<TimedResult<T>> {
  const start = now();
  try {
    const result = await fn();
    return { result, durationMs: elapsed(start) };
  } catch (error) {
    const durationMs = elapsed(start);
    if (error && typeof error === "object") {
      try {
        Object.defineProperty(error, "__durationMs", {
          value: durationMs,
          enumerable: false,
          configurable: true,
        });
      } catch (_) {
        (error as Record<string, unknown>)["__durationMs"] = durationMs;
      }
    }
    return { error, durationMs };
  }
}
