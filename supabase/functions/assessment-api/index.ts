import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { GetRecentAssessmentsParams } from "./lib.ts";
import { getRecentAssessmentsSafe, corsHeaders } from "./lib.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const authHeader = req.headers.get("Authorization") ?? undefined;

    if (path === "/assessment-api/recent-assessments") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
      );

      if (req.method === "GET") {
        const limitParam = url.searchParams.get("limit");
        const params: GetRecentAssessmentsParams = {
          limit: limitParam ? parseInt(limitParam) : undefined,
          cursor: url.searchParams.get("cursor"),
          filter_status: url.searchParams.get("status"),
          filter_user_id: url.searchParams.get("user_id"),
          filter_email: url.searchParams.get("email"),
        };

        const result = await getRecentAssessmentsSafe(supabase as any, params);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (req.method === "POST") {
        const body = await req.json();
        const params: GetRecentAssessmentsParams = {
          limit: typeof body.limit === "number" ? body.limit : undefined,
          cursor: body.cursor ?? null,
          filter_status: body.filter_status ?? null,
          filter_user_id: body.filter_user_id ?? null,
          filter_email: body.filter_email ?? null,
        };

        const result = await getRecentAssessmentsSafe(supabase as any, params);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
