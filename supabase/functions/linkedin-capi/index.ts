// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sha256HexLower } from "../_shared/crypto.ts";
import {
  buildLinkedInRequestBody,
  shouldRetry,
  type BuildLinkedInPayloadResult,
  type LinkedInRequestBody,
} from "../_shared/linkedinCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-consent-analytics",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

const LINKEDIN_ENDPOINT = "https://api.linkedin.com/rest/conversionEvents";
const LINKEDIN_VERSION = "202405";
const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 250;

type JsonResponse = Record<string, unknown> | undefined;

type ConsentFlag = boolean | undefined;

interface IncomingPayload {
  conversionId?: unknown;
  eventId?: unknown;
  eventTime?: unknown;
  value?: unknown;
  currency?: unknown;
  email?: unknown;
  phone?: unknown;
  hashed?: unknown;
  ip?: unknown;
  userAgent?: unknown;
  debug?: unknown;
  dryRun?: unknown;
  consentAnalytics?: unknown;
}

function parseBoolean(input: unknown): ConsentFlag {
  if (typeof input === "boolean") return input;
  if (typeof input === "string") {
    const lowered = input.trim().toLowerCase();
    if (lowered === "true") return true;
    if (lowered === "false") return false;
  }
  return undefined;
}

function resolveEnvironment(): "prod" | "dev" {
  const raw = (Deno.env.get("SUPABASE_ENV") || Deno.env.get("ENVIRONMENT") || Deno.env.get("NODE_ENV") || "").toLowerCase();
  if (raw.startsWith("prod")) return "prod";
  return "dev";
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

async function hashIfNeeded(raw: unknown, alreadyHashed: boolean): Promise<string | undefined> {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (alreadyHashed) {
    return trimmed.toLowerCase();
  }
  return sha256HexLower(trimmed);
}

function bestEffortIp(req: Request, provided?: unknown): string | undefined {
  if (typeof provided === "string" && provided.trim().length > 0) {
    return provided.trim();
  }
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return undefined;
  const first = forwarded.split(",")[0];
  return first?.trim() || undefined;
}

function bestEffortUserAgent(req: Request, provided?: unknown): string | undefined {
  if (typeof provided === "string" && provided.trim().length > 0) {
    return provided.trim();
  }
  const fromHeader = req.headers.get("user-agent");
  return fromHeader?.trim() || undefined;
}

function extractWarnings(body: JsonResponse): unknown {
  if (!body) return undefined;
  if (Array.isArray((body as any).warnings) && (body as any).warnings.length > 0) {
    return (body as any).warnings;
  }
  if (Array.isArray((body as any).elements)) {
    const aggregated: unknown[] = [];
    for (const element of (body as any).elements) {
      if (Array.isArray(element?.warnings)) {
        aggregated.push(...element.warnings);
      }
    }
    if (aggregated.length > 0) return aggregated;
  }
  return undefined;
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJsonSafe(resp: Response): Promise<JsonResponse> {
  const text = await resp.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (_) {
    return undefined;
  }
}

function responseInit(status: number): ResponseInit {
  return {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  };
}

function okResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), responseInit(status));
}

function errorResponse(payload: Record<string, unknown>, status = 500): Response {
  return new Response(JSON.stringify(payload), responseInit(status));
}

function summarizeIdentifiers(result: BuildLinkedInPayloadResult): { hasEmail: boolean; hasPhone: boolean } {
  return {
    hasEmail: result.identifiers.hasEmail,
    hasPhone: result.identifiers.hasPhone,
  };
}

type FetchLike = typeof fetch;

async function postWithRetry(
  fetchImpl: FetchLike,
  token: string,
  body: LinkedInRequestBody,
): Promise<{ response?: Response; error?: unknown }> {
  const serializedBody = JSON.stringify(body);
  let attempt = 0;
  let lastError: unknown;
  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    try {
      const response = await fetchImpl(LINKEDIN_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": LINKEDIN_VERSION,
          "X-Restli-Protocol-Version": "2.0.0",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === "GET" && url.searchParams.get("status") === "1") {
    const hasToken = Boolean(Deno.env.get("LI_CAPI_TOKEN"));
    const now = Math.floor(Date.now() / 1000);
    return okResponse({ ok: true, hasToken, now, env: resolveEnvironment() });
  }

  if (req.method !== "POST") {
    return errorResponse({ ok: false, code: "method_not_allowed" }, 405);
  }

  let payload: IncomingPayload;
  try {
    payload = await req.json();
  } catch (_) {
    return errorResponse({ ok: false, code: "invalid_json" }, 400);
  }

  const conversionId = typeof payload.conversionId === "string" && payload.conversionId.trim().length > 0
    ? payload.conversionId.trim()
    : undefined;

  if (!conversionId) {
    return errorResponse({ ok: false, code: "missing_conversion_id" }, 400);
  }

  const consentHeader = parseBoolean(req.headers.get("x-consent-analytics"));
  const consentFlag = parseBoolean(payload.consentAnalytics);
  const consent = consentHeader ?? consentFlag;

  const eventId = typeof payload.eventId === "string" && payload.eventId.trim().length > 0
    ? payload.eventId.trim()
    : crypto.randomUUID();

  if (consent === false) {
    console.info("linkedin-capi: skipped (no consent)", {
      conversionId,
      eventId,
    });
    return okResponse({ ok: true, skipped: "no_consent" }, 204);
  }

  const token = Deno.env.get("LI_CAPI_TOKEN");
  if (!token) {
    return errorResponse({ ok: false, code: "missing_token" }, 500);
  }

  const alreadyHashed = payload.hashed === true;
  const hashedEmail = await hashIfNeeded(payload.email, alreadyHashed);
  const hashedPhone = await hashIfNeeded(payload.phone, alreadyHashed);
  const parsedEventTime = parseNumber(payload.eventTime);
  const eventTime = typeof parsedEventTime === "number" ? Math.floor(parsedEventTime) : Math.floor(Date.now() / 1000);
  const ip = bestEffortIp(req, payload.ip);
  const userAgent = bestEffortUserAgent(req, payload.userAgent);
  const value = parseNumber(payload.value);
  const currency = typeof payload.currency === "string" ? payload.currency : undefined;

  const buildResult = buildLinkedInRequestBody({
    conversionId,
    eventId,
    eventTime,
    hashedEmail,
    hashedPhone,
    value,
    currency,
    ip,
    userAgent,
  });

  if (payload.dryRun === true) {
    console.info("linkedin-capi: dry run", {
      conversionId,
      eventId,
      ...summarizeIdentifiers(buildResult),
    });
    return okResponse({ ok: true, eventId, status: "dry_run" });
  }

  const { response, error } = await postWithRetry(fetch, token, buildResult.body);

  if (!response) {
    console.error("linkedin-capi: network error", {
      conversionId,
      eventId,
      ...summarizeIdentifiers(buildResult),
      error: error instanceof Error ? error.message : String(error ?? "unknown"),
    });
    return errorResponse({ ok: false, code: "network_error", error: error instanceof Error ? error.message : String(error ?? "unknown") }, 502);
  }

  const responseBody = await readJsonSafe(response);
  const requestId = response.headers.get("x-restli-request-id")
    || response.headers.get("x-li-traceid")
    || response.headers.get("x-request-id")
    || undefined;
  const warnings = extractWarnings(responseBody);

  if (response.ok) {
    console.info("linkedin-capi: delivered", {
      conversionId,
      eventId,
      status: response.status,
      requestId,
      ...summarizeIdentifiers(buildResult),
    });
    return okResponse({ ok: true, eventId, status: response.status, requestId, warnings });
  }

  const errorMessage = (responseBody as any)?.message || (responseBody as any)?.error || (responseBody as any)?.details || response.statusText || "unknown";
  const status = response.status;
  let code = "unknown_error";
  if (status === 401 || status === 403) code = "unauthorized";
  else if (status === 404) code = "not_found";
  else if (status === 429) code = "rate_limited";
  else if (status >= 500) code = "remote_error";
  else if (status >= 400) code = "bad_request";

  console.error("linkedin-capi: failed", {
    conversionId,
    eventId,
    status,
    requestId,
    ...summarizeIdentifiers(buildResult),
    error: errorMessage,
  });

  const statusCode = status >= 500 ? 502 : 400;
  return errorResponse({ ok: false, code, status, error: errorMessage, requestId, warnings }, statusCode);
});
