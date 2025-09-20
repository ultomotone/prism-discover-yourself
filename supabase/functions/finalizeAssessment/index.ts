import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ensureResultsVersion } from "../_shared/resultsVersion.ts";
import { finalizeAssessment } from "./finalize.ts";

const url = Deno.env.get("SUPABASE_URL");
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!url) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!key) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

const supabase = createClient(url, key);

await ensureResultsVersion(supabase);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id, responses } = await req.json();
    if (!session_id) {
      return json({ status: "error", error: "session_id required" }, 400);
    }

    const siteUrl =
      Deno.env.get("RESULTS_BASE_URL") ||
      req.headers.get("origin") ||
      "https://prismassessment.com";

    const result = await finalizeAssessment({
      supabase,
      sessionId: session_id,
      responses,
      siteUrl,
      now: () => new Date(),
      logger: (payload) => console.log(JSON.stringify(payload)),
    });

    return json(result, 200);
  } catch (error: any) {
    console.log(JSON.stringify({ evt: "finalize_error", error: error?.message ?? String(error) }));
    return json({ status: "error", error: error?.message ?? "Internal server error" }, 500);
  }
});

