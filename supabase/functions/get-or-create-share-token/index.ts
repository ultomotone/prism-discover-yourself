import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: corsHeaders 
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json().catch(() => ({}));

    if (!session_id) {
      return jsonResponse({ ok: false, error: "session_id required" }, 400);
    }

    // Caller must be signed in - use anon client with Authorization header
    const authHeader = req.headers.get("Authorization") || "";
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { 
          headers: { Authorization: authHeader }
        },
        auth: { persistSession: false },
      }
    );

    const { data: userData } = await anonClient.auth.getUser();
    const user = userData?.user;
    
    if (!user) {
      return jsonResponse({ ok: false, error: "unauthorized" }, 401);
    }

    console.log(`Getting share token for session ${session_id}, user ${user.id}`);

    // Use service role client for database operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: { persistSession: false },
      }
    );

    // Check if session exists and belongs to user
    const { data: session, error: sessionError } = await serviceClient
      .from("assessment_sessions")
      .select("id, user_id, share_token")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      console.error("Session lookup error:", sessionError);
      return jsonResponse({ ok: false, error: "session not found" }, 404);
    }

    if (session.user_id !== user.id) {
      console.error(`Access denied: session ${session_id} belongs to ${session.user_id}, not ${user.id}`);
      return jsonResponse({ ok: false, error: "forbidden" }, 403);
    }

    // If share token already exists, return it
    if (session.share_token) {
      console.log(`Returning existing share token for session ${session_id}`);
      return jsonResponse({ ok: true, share_token: session.share_token });
    }

    // Generate new share token
    const newShareToken = crypto.randomUUID();
    
    const { error: updateError } = await serviceClient
      .from("assessment_sessions")
      .update({ share_token: newShareToken })
      .eq("id", session_id);

    if (updateError) {
      console.error("Failed to update share token:", updateError);
      return jsonResponse({ ok: false, error: updateError.message }, 500);
    }

    console.log(`Created new share token for session ${session_id}`);
    return jsonResponse({ ok: true, share_token: newShareToken });

  } catch (error: any) {
    console.error("Error in get-or-create-share-token:", error);
    return jsonResponse({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, 500);
  }
});