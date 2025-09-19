import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type QaResponse = {
  ok: boolean;
  types: number;
  functions: number;
  state: number;
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

    const payload = await req.json().catch(() => null);
    const sessionId = payload?.session_id as string | undefined;
    if (!sessionId) {
      return errorResponse("session_id required", 400);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return errorResponse("Service configuration missing", 500);
    }

    const client = createClient(url, key);

    const types = await client
      .from("scoring_results_types")
      .select("type_code,share,fit", { count: "exact", head: false })
      .eq("session_id", sessionId)
      .eq("results_version", "v2");
    if (types.error) {
      throw new Error(types.error.message);
    }

    const functions = await client
      .from("scoring_results_functions")
      .select("func,strength_z,dimension", { count: "exact", head: false })
      .eq("session_id", sessionId)
      .eq("results_version", "v2");
    if (functions.error) {
      throw new Error(functions.error.message);
    }

    const state = await client
      .from("scoring_results_state")
      .select("*", { count: "exact", head: false })
      .eq("session_id", sessionId)
      .eq("results_version", "v2");
    if (state.error) {
      throw new Error(state.error.message);
    }

    const response: QaResponse = {
      ok: (types.data?.length ?? 0) === 16 && (functions.data?.length ?? 0) === 8 && (state.data?.length ?? 0) === 1,
      types: types.data?.length ?? 0,
      functions: functions.data?.length ?? 0,
      state: state.data?.length ?? 0,
    };

    return new Response(JSON.stringify(response), { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
});
