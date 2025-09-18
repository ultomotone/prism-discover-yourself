import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendRedditCapiEvent, RedditEvent } from "../_shared/redditCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const payload: RedditEvent = await req.json();
    await sendRedditCapiEvent(payload);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("reddit-capi error:", err);
    
    // If missing env secrets, return success with disabled flag instead of 500
    if (err?.message?.includes("Missing env REDDIT_")) {
      console.log("Reddit CAPI disabled due to missing environment variables");
      return new Response(JSON.stringify({ ok: true, disabled: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
