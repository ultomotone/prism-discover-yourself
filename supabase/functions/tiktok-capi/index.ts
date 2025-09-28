// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendTikTokEvent, TikTokEvent } from "../_shared/tiktokCapi.ts";

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
    const payload: TikTokEvent = await req.json();
    await sendTikTokEvent(payload);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("tiktok-capi error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? "unknown" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
