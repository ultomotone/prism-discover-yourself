// supabase/functions/recompute-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getNormalizedAnswers } from "../_shared/normalizeResponses.ts";
import { persistNormalizedAnswers } from "../_shared/persistNormalization.ts";
import { scoreAssessment } from "../_shared/scoreEngine.ts";
import { persistResultsV3 } from "../_shared/persistResultsV3.ts";
import { RESULTS_VERSION } from "../_shared/resultsVersion.ts";

const WRITE_NORMALIZED = (Deno.env.get("PRISM_WRITE_NORMALIZED") ?? "true") === "true";
const NORMALIZE_VERSION = RESULTS_VERSION;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, dry_run = false } = await req.json().catch(() => ({}));
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(JSON.stringify({
      evt: "recompute_session_start",
      session_id,
      dry_run,
      write_normalized: WRITE_NORMALIZED,
      normalize_version: NORMALIZE_VERSION
    }));

    // 1) Recompute normalized responses
    const normalized = await getNormalizedAnswers(supabase, session_id);
    console.log(JSON.stringify({
      evt: "normalized_responses_computed",
      session_id,
      count: normalized.length
    }));

    if (!dry_run && WRITE_NORMALIZED) {
      await persistNormalizedAnswers(supabase, session_id, normalized, NORMALIZE_VERSION);
      console.log(JSON.stringify({
        evt: "normalized_responses_persisted",
        session_id
      }));
    }

    // 2) Recompute scores using the normalized data
    // First get the scoring configuration and responses
    const [responsesRes, configRes, prototypesRes] = await Promise.all([
      supabase.from("assessment_responses").select("*").eq("session_id", session_id),
      supabase.from("scoring_config").select("*"),
      supabase.from("type_prototypes").select("*")
    ]);

    if (responsesRes.error) throw responsesRes.error;
    if (configRes.error) throw configRes.error;
    if (prototypesRes.error) throw prototypesRes.error;

    // Get scoring keys
    const { data: scoringKeys, error: scoringError } = await supabase
      .from("assessment_scoring_key")
      .select("*");
    if (scoringError) throw scoringError;

    // Prepare input for scoring engine with correct interface
    const scoringKeyMap = scoringKeys.reduce((acc, key) => {
      acc[key.question_id] = key;
      return acc;
    }, {} as Record<string, any>);

    const config = configRes.data.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);

    const typePrototypes = prototypesRes.data.reduce((acc, row) => {
      if (!acc[row.type_code]) acc[row.type_code] = {};
      acc[row.type_code][row.func] = row.block;
      return acc;
    }, {} as Record<string, Record<string, string>>);

    const profileInput = {
      sessionId: session_id,
      responses: responsesRes.data.map(r => ({
        question_id: r.question_id,
        answer_value: r.answer_numeric || r.answer_value
      })),
      scoringKey: scoringKeyMap,
      config: {
        ...config,
        typePrototypes
      }
    };

    const scoredResult = scoreAssessment(profileInput);
    
    // Build types, functions, and state arrays from ProfileResult
    const types = scoredResult.top_3_fits.map((fit, index) => ({
      type_code: fit.code,
      fit: fit.fit,
      share: fit.share,
      rank: index + 1,
      distance: null,
      coherent_dims: null,
      unique_dims: null,
      seat_coherence: null,
      fit_parts: null
    }));

    const functions = Object.entries(scoredResult.strengths).map(([func, strength]) => ({
      func_code: func,
      strength,
      dimension: scoredResult.dimensions[func as keyof typeof scoredResult.dimensions] || null,
      d_index_z: null
    }));

    const state = {
      overlay_band: scoredResult.overlay,
      overlay_z: scoredResult.neuro_z,
      effect_fit: null,
      effect_conf: null,
      block_core: scoredResult.blocks_norm.Core,
      block_critic: scoredResult.blocks_norm.Critic,
      block_hidden: scoredResult.blocks_norm.Hidden,
      block_instinct: scoredResult.blocks_norm.Instinct,
      block_context: "calm"
    };

    // Prepare payload for persistResultsV3 with correct structure
    const payload = {
      version: RESULTS_VERSION,
      results_version: RESULTS_VERSION,
      profile: {
        session_id,
        type_code: scoredResult.type_code,
        confidence: scoredResult.conf_calibrated,
        fit_band: scoredResult.fit_band,
        overlay: scoredResult.overlay,
        validity_status: scoredResult.validity_status,
        top_gap: scoredResult.top_gap,
        score_fit_calibrated: scoredResult.score_fit_calibrated,
        conf_calibrated: scoredResult.conf_calibrated
      },
      types,
      functions,
      state,
      session: { 
        id: session_id,
        status: "completed"
      }
    };

    if (!dry_run) {
      await persistResultsV3(supabase, {
        session_id,
        user_id: null,
        payload
      });
      console.log(JSON.stringify({
        evt: "scoring_results_persisted",
        session_id,
        version: RESULTS_VERSION
      }));
    }

    const response = {
      session_id,
      normalized_count: normalized.length,
      scored: !dry_run,
      version: RESULTS_VERSION,
      type_code: scoredResult.type_code,
      confidence: scoredResult.conf_calibrated
    };

    console.log(JSON.stringify({
      evt: "recompute_session_complete",
      session_id,
      dry_run,
      success: true
    }));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(JSON.stringify({
      evt: "recompute_session_error",
      error: errorMessage,
      stack: errorStack
    }));
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "RECOMPUTE_SESSION_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});