// supabase/functions/admin-batch-recompute/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin emails that can access this function
const ADMIN_EMAILS = [
  'daniel.joseph.speiss@gmail.com'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with anon key to verify the user
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { limit = 100, since = null, dry_run = false } = body;

    console.log(JSON.stringify({
      evt: "admin_batch_recompute_request",
      user_email: user.email,
      limit,
      since,
      dry_run
    }));

    // Call the actual recompute-batch function with service role key
    const recomputeResponse = await fetch(`${SUPABASE_URL}/functions/v1/recompute-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ limit, since, dry_run })
    });

    const result = await recomputeResponse.json();

    if (!recomputeResponse.ok) {
      console.error(JSON.stringify({
        evt: "recompute_batch_error",
        error: result.error,
        status: recomputeResponse.status
      }));
      
      return new Response(JSON.stringify({ 
        error: result.error || "Batch recompute failed",
        code: "RECOMPUTE_ERROR"
      }), {
        status: recomputeResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(JSON.stringify({
      evt: "admin_batch_recompute_success",
      user_email: user.email,
      result
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(JSON.stringify({
      evt: "admin_batch_recompute_error",
      error: errorMessage,
      stack: errorStack
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "ADMIN_BATCH_RECOMPUTE_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});