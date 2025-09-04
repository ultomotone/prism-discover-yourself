// @ts-nocheck
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store"
};

interface NotifyPayload {
  type: "signup" | "assessment_completed";
  email?: string;
  session_id?: string;
  share_token?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotifyPayload = await req.json();

    if (!payload?.type) {
      return new Response(JSON.stringify({ ok: false, error: "type is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminEmail = "daniel.joseph.speiss@gmail.com"; // Change if needed

    const subject =
      payload.type === "signup"
        ? `New signup: ${payload.email ?? "unknown email"}`
        : `Assessment completed: ${payload.session_id ?? "unknown session"}`;

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">PRISM Notification — Applied Personality Lab</h2>
        <p style="margin: 0 0 8px;">Type: <strong>${payload.type}</strong></p>
        ${payload.email ? `<p style="margin: 0 0 8px;">Email: <strong>${payload.email}</strong></p>` : ""}
        ${payload.session_id ? `<p style="margin: 0 0 8px;">Session ID: <strong>${payload.session_id}</strong></p>` : ""}
        ${payload.share_token ? `<p style="margin: 0 0 8px;">Share Token: <strong>${payload.share_token}</strong></p>` : ""}
        ${payload.session_id && payload.share_token ? `<p style=\"margin: 16px 0 0;\"><a href=\"https://prismassessment.com/results/${payload.session_id}?token=${payload.share_token}\">View results (public link)</a></p>` : ""}
      </div>
    `;

    const res = await fetch("https://api.resend.com/v1/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PRISM Notifications <onboarding@resend.dev>",
        to: [adminEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("notify_admin send error:", body);
      return new Response(JSON.stringify({ ok: false, error: body?.error?.message || "Failed to send" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("notify_admin error:", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
