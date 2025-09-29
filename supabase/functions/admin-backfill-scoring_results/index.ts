// supabase/functions/admin-backfill-scoring_results/index.ts
// Admin function to backfill scoring_results from legacy tables

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { persistResultsV3 } from "../_shared/persistResultsV3.ts";
import type { ScoringPayload } from "../_shared/types.results.ts";

interface BackfillSession {
  session_id: string;
  user_id?: string;
  scoring_version: string;
}

Deno.serve(async (request) => {
  // Basic CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  try {
    // Find sessions that have profiles but no scoring_results entry
    const { data: sessionsToBackfill, error: queryError } = await supabase
      .from("profiles")
      .select(`
        session_id,
        scoring_version,
        payload,
        type_code,
        confidence,
        assessment_sessions!inner(user_id)
      `)
      .is("scoring_results.session_id", null)
      .limit(100); // Process in batches

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log(`Found ${sessionsToBackfill?.length || 0} sessions to backfill`);

    for (const row of sessionsToBackfill || []) {
      try {
        let payload: ScoringPayload;

        // Try to use existing payload first
        if (row.payload && typeof row.payload === 'object') {
          payload = row.payload as ScoringPayload;
        } else {
          // Rebuild payload from legacy tables
          payload = await rebuildPayloadFromLegacy(supabase, row.session_id, row.scoring_version);
        }

        // Ensure payload has required structure
        if (!payload.version) {
          payload.version = row.scoring_version || "v1.2.1";
        }
        if (!payload.results_version) {
          payload.results_version = payload.version;
        }

        // Persist using unified approach
        await persistResultsV3(supabase, {
          session_id: row.session_id,
          user_id: (row as any).assessment_sessions?.user_id || null,
          payload
        });

        successCount++;
      } catch (e) {
        errorCount++;
        const errorMsg = `Session ${row.session_id}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(errorMsg);
        console.error("backfill.session_failed", { session_id: row.session_id, error: errorMsg });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: sessionsToBackfill?.length || 0,
      successful: successCount,
      failed: errorCount,
      errors: errors.slice(0, 10) // Limit error details
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("backfill.failed", { error: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({
      error: 'Backfill failed',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function rebuildPayloadFromLegacy(
  supabase: any,
  sessionId: string,
  scoringVersion: string
): Promise<ScoringPayload> {
  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  // Fetch types data
  const { data: types } = await supabase
    .from("scoring_results_types")
    .select("*")
    .eq("session_id", sessionId)
    .eq("results_version", scoringVersion);

  // Fetch functions data
  const { data: functions } = await supabase
    .from("scoring_results_functions")
    .select("*")
    .eq("session_id", sessionId)
    .eq("results_version", scoringVersion);

  // Fetch state data
  const { data: state } = await supabase
    .from("scoring_results_state")
    .select("*")
    .eq("session_id", sessionId)
    .eq("results_version", scoringVersion)
    .single();

  // Fetch session data
  const { data: session } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  // Build unified payload
  const payload: ScoringPayload = {
    version: scoringVersion,
    results_version: scoringVersion,
    profile: {
      session_id: sessionId,
      type_code: profile?.type_code || "",
      confidence: profile?.confidence || 0,
      fit_band: profile?.fit_band,
      overlay: profile?.overlay,
      validity_status: profile?.validity_status,
      top_gap: profile?.top_gap,
      score_fit_calibrated: profile?.score_fit_calibrated,
      conf_calibrated: profile?.conf_calibrated,
      user_id: session?.user_id,
      created_at: profile?.created_at,
      computed_at: profile?.computed_at
    },
    types: (types || []).map((t: any) => ({
      type_code: t.type_code,
      fit: t.fit || 0,
      share: t.share,
      rank: t.rank,
      distance: t.distance,
      coherent_dims: t.coherent_dims,
      unique_dims: t.unique_dims,
      seat_coherence: t.seat_coherence,
      fit_parts: t.fit_parts
    })),
    functions: (functions || []).map((f: any) => ({
      func_code: f.func,
      strength: f.strength_z || 0,
      dimension: f.dimension,
      d_index_z: f.d_index_z
    })),
    state: state ? {
      overlay_band: state.overlay_band,
      overlay_z: state.overlay_z,
      effect_fit: state.effect_fit,
      effect_conf: state.effect_conf,
      block_core: state.block_core,
      block_critic: state.block_critic,
      block_hidden: state.block_hidden,
      block_instinct: state.block_instinct,
      block_context: state.block_context
    } : undefined,
    session: session ? {
      id: session.id,
      status: session.status,
      started_at: session.started_at,
      completed_at: session.completed_at
    } : undefined
  };

  return payload;
}