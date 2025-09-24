import { Hono } from "npm:hono@4.5.11";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATIC_ORIGINS = new Set([
  "https://prismpersonality.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  if (STATIC_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    return (
      u.hostname.endsWith(".lovable.app") ||
      u.hostname.endsWith(".lovableproject.com")
    );
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null, req: Request) {
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : "";
  const reqHeaders =
    req.headers.get("Access-Control-Request-Headers") ??
    "authorization, x-client-info, apikey, content-type";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": reqHeaders,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
  } as Record<string, string>;
}

const app = new Hono();

app.options("/*", (c) =>
  c.newResponse(null, {
    status: 200,
    headers: corsHeaders(c.req.header("Origin") || null, c.req.raw),
  })
);

app.post("/link_session_to_account", async (c) => {
  const origin = c.req.header("Origin") || null;
  const headers = corsHeaders(origin, c.req.raw);
  if (origin && headers["Access-Control-Allow-Origin"] === "") {
    return c.json({ success: false, error: "origin_not_allowed" }, 403, headers);
  }

  try {
    let body: { session_id?: string; account_id?: string; email?: string | null };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ success: false, error: "invalid_json" }, 400, headers);
    }

    const sessionId = body.session_id;
    const accountId = body.account_id;
    const email = body.email ?? null;

    if (!sessionId || !accountId) {
      return c.json({ success: false, error: "missing_params" }, 400, headers);
    }

    const authorization = c.req.header("Authorization") ?? c.req.header("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return c.json({ success: false, error: "unauthorized" }, 401, headers);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error("Missing Supabase configuration");
      return c.json({ success: false, error: "configuration_error" }, 500, headers);
    }

    const authedClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });

    const { data: userResult, error: userError } = await authedClient.auth.getUser();
    if (userError) {
      console.error("Failed to load authenticated user", userError);
      return c.json({ success: false, error: "unauthorized" }, 401, headers);
    }

    const authUser = userResult?.user;
    if (!authUser) {
      return c.json({ success: false, error: "unauthorized" }, 401, headers);
    }

    if (authUser.id !== accountId) {
      return c.json({ success: false, error: "user_mismatch" }, 403, headers);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: sess, error: lookupError } = await supabase
      .from("assessment_sessions")
      .select("account_id, user_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (lookupError) {
      console.error("Session lookup failed", lookupError);
      return c.json({ success: false, error: "lookup_failed" }, 500, headers);
    }

    if (!sess) {
      return c.json({ success: false, error: "not_found" }, 404, headers);
    }

    const existingOwner = sess.user_id ?? sess.account_id ?? null;
    if (existingOwner && existingOwner !== accountId) {
      return c.json({ success: false, code: "ALREADY_LINKED" }, 409, headers);
    }

    if (existingOwner === accountId) {
      return c.json({ success: true, note: "already linked" }, 200, headers);
    }

    const { error: updateError } = await supabase
      .from("assessment_sessions")
      .update({ user_id: accountId, account_id: accountId, email })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Update error:", updateError);
      return c.json({ success: false, error: "link_failed" }, 500, headers);
    }

    return c.json({ success: true }, 200, headers);
  } catch (e) {
    console.error("link_session_to_account error:", e instanceof Error ? e.message : String(e));
    return c.json({ success: false, error: "link_failed" }, 500, headers);
  }
});

Deno.serve((req) => app.fetch(req));
