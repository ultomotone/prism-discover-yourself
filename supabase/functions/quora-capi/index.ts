import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sha256HexLower } from "../_shared/crypto.ts";
import {
  buildQuoraRequestBody,
  shouldRetry,
  type BuildQuoraPayloadInput,
  type QuoraRequestBody,
} from "../_shared/quoraCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-consent-analytics",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

const PIXEL_ID = Deno.env.get("QUORA_PIXEL_ID") ?? "3b47052b877e48a5b43d5f0d775d8e06";
const QUORA_ENDPOINT = "https://q.quora.com/conversion_api/event";
const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 250;

interface IncomingPayload {
  event_name?: unknown;
  event_time?: unknown;
  conversion_id?: unknown;
  value?: unknown;
  currency?: unknown;
  email?: unknown;
  contents?: unknown;
  content_ids?: unknown;
  client_ip?: unknown;
  user_agent?: unknown;
  consentAnalytics?: unknown;
}

type JsonObject = Record<string, unknown>;

type ConsentFlag = boolean | undefined;

type FetchLike = typeof fetch;

function parseBoolean(input: unknown): ConsentFlag {
  if (typeof input === "boolean") return input;
  if (typeof input === "string") {
    const lowered = input.trim().toLowerCase();
    if (lowered === "true") return true;
    if (lowered === "false") return false;
  }
  return undefined;
}

function parseString(input: unknown): string | undefined {
  if (typeof input === "string" && input.trim().length > 0) return input.trim();
  return undefined;
}

function parseNumber(input: unknown): number | undefined {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string" && input.trim().length > 0) {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function parseContents(input: unknown): Array<Record<string, unknown>> | undefined {
  if (!Array.isArray(input)) return undefined;
  const filtered = input.filter((item) => item && typeof item === "object") as Array<
    Record<string, unknown>
  >;
  return filtered.length > 0 ? filtered : undefined;
}

function parseStringArray(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const filtered = input
    .map((value) => parseString(value))
    .filter((value): value is string => typeof value === "string");
  return filtered.length > 0 ? filtered : undefined;
}

function bestEffortIp(req: Request, provided?: unknown): string | undefined {
  const direct = parseString(provided);
  if (direct) return direct;
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return undefined;
  const first = forwarded.split(",")[0]?.trim();
  return first && first.length > 0 ? first : undefined;
}

function bestEffortUserAgent(req: Request, provided?: unknown): string | undefined {
  const direct = parseString(provided);
  if (direct) return direct;
  const fromHeader = req.headers.get("user-agent");
  return fromHeader?.trim() || undefined;
}

function parseEventTime(input: unknown): number | undefined {
  const parsed = parseNumber(input);
  if (!parsed) return undefined;
  const rounded = Math.floor(parsed);
  return Number.isFinite(rounded) ? rounded : undefined;
}

async function ensureHashedEmail(input: unknown): Promise<string | undefined> {
  const value = parseString(input);
  if (!value) return undefined;
  const lowered = value.toLowerCase();
  if (/^[0-9a-f]{64}$/.test(lowered)) {
    return lowered;
  }
  return sha256HexLower(lowered);
}

async function postWithRetry(
  fetchImpl: FetchLike,
  token: string,
  body: QuoraRequestBody,
): Promise<{ response?: Response; error?: unknown }> {
  const serializedBody = JSON.stringify(body);
  let attempt = 0;
  let lastError: unknown;
  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    try {
      const response = await fetchImpl(QUORA_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: serializedBody,
      });
      if (response.ok || !shouldRetry(response.status) || attempt === MAX_ATTEMPTS) {
        return { response };
      }
      await wait(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1));
      continue;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) {
        return { error: lastError };
      }
      await wait(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1));
    }
  }
  return { error: lastError };
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function okResponse(payload: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function errorResponse(payload: JsonObject, status = 500): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function consentFromHeader(req: Request): ConsentFlag {
  const headerValue = req.headers.get("x-consent-analytics");
  return parseBoolean(headerValue || undefined);
}

async function readJsonSafe<T>(req: Request): Promise<T | undefined> {
  try {
    return (await req.json()) as T;
  } catch {
    return undefined;
  }
}

function resolveEnvironment(): "prod" | "dev" {
  const raw = (Deno.env.get("SUPABASE_ENV") || Deno.env.get("ENVIRONMENT") || "").toLowerCase();
  if (raw.startsWith("prod")) return "prod";
  return "dev";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get("QUORA_TOKEN");
  if (!token) {
    return errorResponse({ ok: false, code: "missing_token" }, 500);
  }

  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.get("status") === "1") {
    return okResponse({ ok: true, hasToken: true, pixelId: PIXEL_ID, env: resolveEnvironment() });
  }

  if (req.method !== "POST") {
    return errorResponse({ ok: false, code: "method_not_allowed" }, 405);
  }

  const rawBody = await readJsonSafe<IncomingPayload>(req);
  if (!rawBody) {
    return errorResponse({ ok: false, code: "invalid_json" }, 400);
  }

  const consentHeader = consentFromHeader(req);
  const consentBody = parseBoolean(rawBody.consentAnalytics);
  const consent = consentBody ?? consentHeader;
  if (consent === false) {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const eventName = parseString(rawBody.event_name);
  if (!eventName) {
    return errorResponse({ ok: false, code: "missing_event_name" }, 400);
  }

  const conversionId = parseString(rawBody.conversion_id);
  if (!conversionId) {
    return errorResponse({ ok: false, code: "missing_conversion_id" }, 400);
  }

  const eventTime = parseEventTime(rawBody.event_time) ?? Math.floor(Date.now() / 1000);
  const value = parseNumber(rawBody.value);
  const currency = parseString(rawBody.currency);
  const contents = parseContents(rawBody.contents);
  const contentIds = parseStringArray(rawBody.content_ids);
  const clientIp = bestEffortIp(req, rawBody.client_ip);
  const userAgent = bestEffortUserAgent(req, rawBody.user_agent);
  const hashedEmail = await ensureHashedEmail(rawBody.email);

  const buildInput: BuildQuoraPayloadInput = {
    pixelId: PIXEL_ID,
    eventName,
    eventTime,
    conversionId,
    value,
    currency,
    contents,
    contentIds,
    hashedEmail,
    clientIp,
    userAgent,
  };

  const body = buildQuoraRequestBody(buildInput);
  const { response, error } = await postWithRetry(fetch, token, body);
  if (error) {
    return errorResponse({ ok: false, code: "network_error" }, 502);
  }
  if (!response) {
    return errorResponse({ ok: false, code: "unknown_error" }, 500);
  }

  const responseBody = await safeReadResponse(response);

  if (!response.ok) {
    return errorResponse(
      {
        ok: false,
        code: "quora_error",
        status: response.status,
        body: responseBody,
      },
      response.status,
    );
  }

  return okResponse({ ok: true, status: response.status, eventId: conversionId, body: responseBody });
});

async function safeReadResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
