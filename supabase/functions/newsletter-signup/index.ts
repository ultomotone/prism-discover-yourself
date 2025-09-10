import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSignupRequest {
  email: string;
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

    const { email }: NewsletterSignupRequest = await req.json();

    if (!email) {
      console.error("Email is required");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing newsletter signup for:", email);

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();

    // Insert newsletter signup
    const { data, error } = await supabase
      .from("newsletter_signups")
      .insert({
        email,
        signup_source: "website_popup",
        interests: ["updates", "model_news", "tips", "insights"],
        confirmed: false,
        confirmation_token: confirmationToken,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      
      // Handle duplicate email
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "You're already subscribed! Thank you for your interest." 
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to subscribe. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Newsletter signup successful:", data);

    // TODO: In a real implementation, you'd send a confirmation email here
    // For now, we'll just mark it as confirmed immediately
    await supabase
      .from("newsletter_signups")
      .update({ confirmed: true })
      .eq("id", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully subscribed to PRISM newsletter!",
        data: { id: data.id, email: data.email }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Newsletter signup error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);