import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { buildEventPayload } from "../_shared/reddit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackBody {
  event: string;
  conversion_id: string;
  click_id?: string;
  email?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pixelId = Deno.env.get("REDDIT_PIXEL_ID");
    const token = Deno.env.get("REDDIT_CAPI_TOKEN");
    if (!pixelId || !token) {
      return new Response(
        JSON.stringify({ success: false, error: "misconfigured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as TrackBody;
    if (typeof body.event !== "string" || typeof body.conversion_id !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const ua = req.headers.get("user-agent") || undefined;

    const payload = await buildEventPayload({
      event: body.event,
      conversionId: body.conversion_id,
      pixelId,
      clickId: body.click_id,
      email: body.email,
      userAgent: ua,
      ipAddress: ip,
    });

    const resp = await fetch("https://ads-api.reddit.com/api/v2/track/conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return new Response(
        JSON.stringify({ success: false, error: "capi_error", detail }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: "internal", detail: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
