import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const payload = await req.json().catch(() => ({}));
    const limit = Number(payload?.limit ?? 50);
    const days = Number(payload?.days ?? 365);

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return errorResponse("Service configuration missing", 500);
    }

    const client = createClient(url, key);
    const { data, error } = await client.rpc("find_broken_sessions_sql", {
      p_days: Number.isFinite(days) && days > 0 ? days : 365,
      p_limit: Number.isFinite(limit) && limit > 0 ? limit : 50,
    });

    if (error) {
      throw new Error(error.message);
    }

    const sessions = Array.isArray(data) ? data : [];

    return new Response(
      JSON.stringify({ count: sessions.length, sessions }),
      { headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
});
