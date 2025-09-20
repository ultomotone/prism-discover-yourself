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
    const rawPayload = await req.json();
    const conversionId = typeof rawPayload?.conversion_id === "string" && rawPayload.conversion_id.length > 0
      ? rawPayload.conversion_id
      : undefined;
    if (!conversionId) {
      console.warn("reddit-capi: dropping event without conversion_id");
      return new Response(JSON.stringify({
        ok: true,
        skipped: true,
        reason: "missing_conversion_id",
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const rawEventName = typeof rawPayload?.event_name === "string" && rawPayload.event_name.length > 0
      ? rawPayload.event_name
      : undefined;
    const rawEventType = typeof rawPayload?.event_type === "string" && rawPayload.event_type.length > 0
      ? rawPayload.event_type
      : undefined;
    if (!rawEventName && !rawEventType) {
      console.warn("reddit-capi: dropping event without event name", { conversion_id: conversionId });
      return new Response(JSON.stringify({
        ok: true,
        skipped: true,
        reason: "missing_event_name",
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload: RedditEvent = {
      event_name: rawEventName ?? rawEventType!,
      event_type: rawEventType ?? undefined,
      custom_event_name: typeof rawPayload?.custom_event_name === "string" && rawPayload.custom_event_name.length > 0
        ? rawPayload.custom_event_name
        : undefined,
      conversion_id: conversionId,
      click_id: typeof rawPayload?.click_id === "string" && rawPayload.click_id.length > 0 ? rawPayload.click_id : undefined,
      email: typeof rawPayload?.email === "string" && rawPayload.email.length > 0 ? rawPayload.email : undefined,
    };

    const inferredEventType = payload.event_type ?? payload.event_name;
    if (inferredEventType === "Custom") {
      const customName = payload.custom_event_name;
      if (!customName) {
        console.warn("reddit-capi: dropping Custom event without custom_event_name", {
          conversion_id: payload.conversion_id,
          click_id: payload.click_id,
        });
        return new Response(JSON.stringify({
          ok: true,
          skipped: true,
          reason: "missing_custom_event_name",
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      payload.event_name = customName;
      payload.event_type = "Custom";
      payload.custom_event_name = customName;
    } else if (!payload.event_type) {
      payload.event_type = payload.event_name;
    }

    await sendRedditCapiEvent(payload);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("reddit-capi error:", err);
    
    // If missing env secrets OR auth failures, return success with disabled flag instead of 500
    if (err?.message?.includes("Missing env REDDIT_") || 
        err?.message?.includes("Failed to fetch access token") ||
        err?.message?.includes("401")) {
      console.log("Reddit CAPI disabled due to missing/invalid credentials");
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
