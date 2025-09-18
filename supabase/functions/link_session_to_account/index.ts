import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface LinkRequest {
  session_id: string;
  user_id: string;
  email?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, user_id, email }: LinkRequest = await req.json();
    
    if (!session_id || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "missing_params" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check current session state
    const { data: sess } = await supabase
      .from("assessment_sessions")
      .select("user_id")
      .eq("id", session_id)
      .maybeSingle();

    if (!sess) {
      return new Response(
        JSON.stringify({ success: false, error: "not_found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Already linked to same user - no-op
    if (sess.user_id && sess.user_id === user_id) {
      return new Response(
        JSON.stringify({ success: true, note: "already linked" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already linked to different user - conflict
    if (sess.user_id && sess.user_id !== user_id) {
      return new Response(
        JSON.stringify({ success: false, code: "ALREADY_LINKED" }),
        { 
          status: 409, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Link the session
    const { error: updErr } = await supabase
      .from("assessment_sessions")
      .update({ user_id, email })
      .eq("id", session_id);

    if (updErr) {
      console.error("Update error:", updErr);
      return new Response(
        JSON.stringify({ success: false, error: "link_failed" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: any) {
    console.error("link_session_to_account error:", e?.message || e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "link_failed" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});