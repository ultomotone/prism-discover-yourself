// _shared/cors.ts
export const DEFAULT_ORIGIN =
  (typeof Deno !== "undefined" && typeof Deno.env?.get === "function"
    ? Deno.env.get("RESULTS_ALLOWED_ORIGIN")
    : undefined) ?? "https://prismpersonality.com";
const ORIGIN_ALLOWLIST: (string | RegExp)[] = [
  "https://prismpersonality.com",
  "https://www.prismpersonality.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://lovable.dev",
  /\.lovable\.app$/i,
  /\.lovableproject\.com$/i,
];

function normalizeOrigin(o?: string | null) {
  if (!o) return null;
  try {
    return new URL(o).origin;
  } catch {
    return null;
  }
}

export function resolveOrigin(req: Request) {
  const o = normalizeOrigin(req.headers.get("origin"));
  if (o && ORIGIN_ALLOWLIST.some((r) => (typeof r === "string" ? r === o : (r as RegExp).test(o)))) return o;
  return DEFAULT_ORIGIN;
}

export function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin, Authorization",
  };
}

export function json(origin: string, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
