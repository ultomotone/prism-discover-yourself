// supabase/functions/recompute-new-metrics/index.ts
// Backfill function to compute missing scoring metrics

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { recomputeSession } from "../_shared/recomputeSession.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecomputeRequest {
  limit?: number;
  session_ids?: string[];
  dry_run?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: Require authentication (user or service role)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Use service role for internal operations but verify user access
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let requestBody: RecomputeRequest = {};
    if (req.method === 'POST') {
      requestBody = await req.json();
    }

    const { limit = 500, session_ids, dry_run = false } = requestBody;

    console.log(JSON.stringify({
      evt: "recompute_new_metrics_start",
      limit,
      has_session_ids: !!session_ids,
      dry_run
    }));

    let sessionsToProcess: string[] = [];

    if (session_ids && Array.isArray(session_ids)) {
      // Process specific sessions - but only if user owns them
      const { data: userSessions, error: sessionError } = await supabase
        .from('assessment_sessions')
        .select('id')
        .eq('user_id', user.id)
        .in('id', session_ids);
      
      if (sessionError) throw sessionError;
      
      sessionsToProcess = userSessions?.map(s => s.id) || [];
      
      if (sessionsToProcess.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No accessible sessions found' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Find sessions missing new fields using SQL view
      const { data: missingSessions, error: queryError } = await supabase
        .from('v_results_missing_new_fields')
        .select('session_id')
        .limit(limit);

      if (queryError) {
        console.error('Failed to query missing sessions:', queryError);
        // Fallback: get recent sessions from scoring_results
        const { data: fallbackSessions, error: fallbackError } = await supabase
          .from('scoring_results')
          .select('session_id')
          .order('computed_at', { ascending: false })
          .limit(limit);

        if (fallbackError) throw fallbackError;
        sessionsToProcess = fallbackSessions?.map(s => s.session_id) || [];
      } else {
        sessionsToProcess = missingSessions?.map(s => s.session_id) || [];
      }
    }

    if (sessionsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No sessions need recomputing',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      total_sessions: sessionsToProcess.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process sessions in batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < sessionsToProcess.length; i += batchSize) {
      const batch = sessionsToProcess.slice(i, i + batchSize);
      
      for (const sessionId of batch) {
        try {
          console.log(`Processing session ${sessionId}...`);
          
          if (!dry_run) {
            await recomputeSession(supabase, sessionId, false);
          }
          
          results.successful++;
          
          if (results.successful % 50 === 0) {
            console.log(`Progress: ${results.successful}/${sessionsToProcess.length} sessions processed`);
          }
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`Failed to process session ${sessionId}:`, errorMsg);
          results.failed++;
          results.errors.push(`${sessionId}: ${errorMsg}`);
        }
      }
      
      // Small delay between batches to reduce load
      if (i + batchSize < sessionsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(JSON.stringify({
      evt: "recompute_new_metrics_complete",
      ...results
    }));

    const response = {
      success: true,
      dry_run,
      ...results,
      message: `Processed ${results.successful}/${results.total_sessions} sessions successfully`
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Recompute function error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});