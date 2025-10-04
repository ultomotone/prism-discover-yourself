import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactSubmission {
  name: string;
  email: string;
  organization?: string;
  message: string;
  consent: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const submission: ContactSubmission = await req.json();

    // Validate input
    if (!submission.name || !submission.email || !submission.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!submission.consent) {
      return new Response(
        JSON.stringify({ error: "Consent is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submission.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Extract user agent and create hash for spam prevention
    const userAgent = req.headers.get("user-agent") || "unknown";
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const ipHash = ip !== "unknown" ? await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip)
    ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')) : null;

    // Store submission in database
    const { data: dbData, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: submission.name,
        email: submission.email,
        organization: submission.organization || null,
        message: submission.message,
        consent: submission.consent,
        ip_hash: ipHash,
        user_agent: userAgent,
        status: "new",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Submission saved to database:", dbData.id);

    // Send email to team
    const teamEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🔔 New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>From:</strong> ${submission.name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${submission.email}">${submission.email}</a></p>
          ${submission.organization ? `<p style="margin: 8px 0;"><strong>Organization:</strong> ${submission.organization}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${submission.message}</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 14px;">
          <em>Reply directly to this email to respond to ${submission.name}</em>
        </p>
      </div>
    `;

    const { error: teamEmailError } = await resend.emails.send({
      from: "PRISM Contact <onboarding@resend.dev>",
      to: ["team@prismpersonality.com"],
      replyTo: submission.email,
      subject: `🔔 New Contact: ${submission.name}`,
      html: teamEmailHtml,
    });

    if (teamEmailError) {
      console.error("Failed to send team email:", teamEmailError);
      // Don't fail the request, just log the error
    } else {
      console.log("Team notification email sent successfully");
    }

    // Send auto-reply to submitter
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thanks for reaching out!</h2>
        <p>Hi ${submission.name},</p>
        <p>We've received your message and will respond within 24 hours during business days.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Your message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${submission.message}</p>
        </div>
        <br>
        <p>Best regards,<br><strong>The PRISM Team</strong></p>
        <p style="font-size: 12px; color: #888; margin-top: 30px;">
          team@prismpersonality.com
        </p>
      </div>
    `;

    const { error: autoReplyError } = await resend.emails.send({
      from: "PRISM Team <onboarding@resend.dev>",
      to: [submission.email],
      subject: "We received your message - PRISM Personality",
      html: autoReplyHtml,
    });

    if (autoReplyError) {
      console.error("Failed to send auto-reply:", autoReplyError);
      // Don't fail the request, just log the error
    } else {
      console.log("Auto-reply email sent successfully");
    }

    // Log to fn_logs
    await supabase.from("fn_logs").insert({
      evt: "contact_form_submitted",
      level: "info",
      payload: {
        submission_id: dbData.id,
        name: submission.name,
        email: submission.email,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your message has been sent successfully!",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-contact-form:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
