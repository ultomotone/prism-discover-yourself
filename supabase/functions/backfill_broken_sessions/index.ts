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

function resolveFunctionsBase(url: string): string {
  if (url.endsWith("/functions/v1")) {
    return url;
  }
  return `${url.replace(/\/$/, "")}/functions/v1`;
}

async function recomputeSession(baseUrl: string, serviceKey: string, sessionId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/score_prism`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === "string" ? payload.error : `recompute fail ${response.status}`;
    throw new Error(message);
  }
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
    const days = Number(payload?.days ?? 180);
    const batchSize = Number(payload?.batchSize ?? 50);

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return errorResponse("Service configuration missing", 500);
    }

    const client = createClient(url, key);
    const { data, error } = await client.rpc("find_broken_sessions_sql", {
      p_days: Number.isFinite(days) && days > 0 ? days : 180,
      p_limit: 10000,
    });

    if (error) {
      throw new Error(error.message);
    }

    const candidates = Array.isArray(data) ? data : [];
    const selected = candidates.slice(0, Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 50);

    let ok = 0;
    let fail = 0;
    const errors: Array<{ id: string; err: string }> = [];
    const base = resolveFunctionsBase(url);

    for (const record of selected) {
      const sessionId = record?.session_id as string | undefined;
      if (!sessionId) {
        continue;
      }
      try {
        await recomputeSession(base, key, sessionId);
        ok += 1;
      } catch (error) {
        fail += 1;
        const message = error instanceof Error ? error.message : String(error ?? "");
        errors.push({ id: sessionId, err: message });
      }
    }

    return new Response(
      JSON.stringify({ batched: selected.length, ok, fail, errors }),
      { headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
});
