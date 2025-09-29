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
      u.hostname.endsWith(".lovableproject.com") ||
      u.hostname.endsWith(".supabase.co") // Allow Supabase functions
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

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin") || null;
  const headers = corsHeaders(origin, request);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers,
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (origin && headers["Access-Control-Allow-Origin"] === "") {
    return new Response(JSON.stringify({ success: false, error: "origin_not_allowed" }), {
      status: 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    let body: { session_id?: string; user_id?: string; account_id?: string; email?: string | null };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: "invalid_json" }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const sessionId = body.session_id;
    const accountId = body.user_id || body.account_id; // Accept both user_id and account_id
    const email = body.email ?? null;

    if (!sessionId || !accountId) {
      return new Response(JSON.stringify({ success: false, error: "missing_params" }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const authorization = request.headers.get("Authorization") ?? request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ success: false, error: "configuration_error" }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const authedClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });

    const { data: userResult, error: userError } = await authedClient.auth.getUser();
    if (userError) {
      console.error("Failed to load authenticated user", userError);
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const authUser = userResult?.user;
    if (!authUser) {
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (authUser.id !== accountId) {
      return new Response(JSON.stringify({ success: false, error: "user_mismatch" }), {
        status: 403,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: sess, error: lookupError } = await supabase
      .from("assessment_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (lookupError) {
      console.error("Session lookup failed", lookupError);
      return new Response(JSON.stringify({ success: false, error: "lookup_failed" }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!sess) {
      return new Response(JSON.stringify({ success: false, error: "not_found" }), {
        status: 404,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const existingOwner = sess.user_id ?? null;
    if (existingOwner && existingOwner !== accountId) {
      return new Response(JSON.stringify({ success: false, code: "ALREADY_LINKED" }), {
        status: 409,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (existingOwner === accountId) {
      return new Response(JSON.stringify({ success: true, note: "already linked" }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const { error: updateError } = await supabase
      .from("assessment_sessions")
      .update({ user_id: accountId, email })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Update error:", updateError);
      
      // Handle specific constraint errors more gracefully
      if (updateError.code === "23505" && updateError.message?.includes("uq_active_session_per_email")) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "email_already_linked",
          message: "This email is already linked to another active session"
        }), {
          status: 409,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "link_failed",
        message: updateError.message || "Failed to link session"
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("link_session_to_account error:", e instanceof Error ? e.message : String(e));
    
    // Handle specific database errors more gracefully
    if (e instanceof Error && e.message?.includes("uq_active_session_per_email")) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "email_already_linked",
        message: "This email is already linked to another active session"
      }), {
        status: 409,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ success: false, error: "link_failed" }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});