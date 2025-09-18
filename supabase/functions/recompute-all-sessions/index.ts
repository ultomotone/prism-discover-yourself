import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting recomputation of all sessions");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all completed sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("assessment_sessions")
      .select("id, completed_at")
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return new Response(JSON.stringify({ error: sessionsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${sessions?.length || 0} sessions to recompute`);

    let processed = 0;
    let failed = 0;
    const failedSessions: string[] = [];

    // Process sessions in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < (sessions || []).length; i += batchSize) {
      const batch = sessions!.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sessions!.length/batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (session) => {
        try {
          const { error: invokeError } = await supabase.functions.invoke('enhanced-score-engine', {
            body: { session_id: session.id }
          });

          if (invokeError) {
            console.error(`Failed to recompute session ${session.id}:`, invokeError);
            failed++;
            failedSessions.push(session.id);
            return false;
          }

          processed++;
          if (processed % 10 === 0) {
            console.log(`Progress: ${processed}/${sessions!.length} sessions processed`);
          }
          return true;
        } catch (e) {
          console.error(`Exception recomputing session ${session.id}:`, e);
          failed++;
          failedSessions.push(session.id);
          return false;
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update dashboard statistics
    console.log("Updating dashboard statistics...");
    await supabase.rpc('update_dashboard_statistics');

    const result = {
      success: true,
      total_sessions: sessions?.length || 0,
      processed,
      failed,
      failed_sessions: failedSessions,
      completed_at: new Date().toISOString()
    };

    console.log(`✅ Recomputation complete: ${processed} processed, ${failed} failed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("Recomputation error:", e);
    return new Response(JSON.stringify({ 
      error: e?.message || String(e),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});