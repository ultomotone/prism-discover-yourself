// @ts-nocheck
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID") || "";
const INGEST_TOKEN = Deno.env.get("RESEND_INGEST_TOKEN");

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

  const authHeader = req.headers.get("authorization") || "";
  if (INGEST_TOKEN && authHeader !== `Bearer ${INGEST_TOKEN}`) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const res = await fetch("https://api.resend.com/v1/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        audience_id: AUDIENCE_ID,
        unsubscribed: false,
      }),
    });

    if (res.ok) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const errBody = await res.json().catch(() => ({}));
    if (res.status === 409 || res.status === 422) {
      return new Response(JSON.stringify({ ok: true, note: "already in audience" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ ok: false, error: errBody?.error?.message || "Failed to add contact" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (err: any) {
    console.error("add_to_resend error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
