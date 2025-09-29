// supabase/functions/_shared/recomputeSession.ts
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getNormalizedAnswers } from "./normalizeResponses.ts";
import { persistNormalizedAnswers } from "./persistNormalization.ts";
import { scoreAssessment } from "./scoreEngine.ts";
import { persistResultsV3 } from "./persistResultsV3.ts";
import { RESULTS_VERSION } from "./resultsVersion.ts";

const WRITE_NORMALIZED = (Deno.env.get("PRISM_WRITE_NORMALIZED") ?? "true") === "true";
const NORMALIZE_VERSION = RESULTS_VERSION;

export interface RecomputeResult {
  session_id: string;
  normalized_count: number;
  scored: boolean;
  version: string;
  type_code: string;
  confidence: number;
}

export async function recomputeSession(
  supabase: SupabaseClient,
  session_id: string,
  dry_run: boolean = false
): Promise<RecomputeResult> {
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
  // First get the scoring configuration, responses, and FC scores if they exist
  const [responsesRes, configRes, prototypesRes, fcScoresRes] = await Promise.all([
    supabase.from("assessment_responses").select("*").eq("session_id", session_id),
    supabase.from("scoring_config").select("*"),
    supabase.from("type_prototypes").select("*"),
    supabase.from("fc_scores").select("*").eq("session_id", session_id).maybeSingle()
  ]);

  if (responsesRes.error) throw responsesRes.error;
  if (configRes.error) throw configRes.error;
  if (prototypesRes.error) throw prototypesRes.error;
  if (fcScoresRes.error && fcScoresRes.error.code !== 'PGRST116') throw fcScoresRes.error;

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

  // Extract FC scores if available
  const fcFunctionScores = fcScoresRes.data?.scores_json ? {
    Ti: fcScoresRes.data.scores_json.Ti || 0,
    Te: fcScoresRes.data.scores_json.Te || 0,
    Fi: fcScoresRes.data.scores_json.Fi || 0,
    Fe: fcScoresRes.data.scores_json.Fe || 0,
    Ni: fcScoresRes.data.scores_json.Ni || 0,
    Ne: fcScoresRes.data.scores_json.Ne || 0,
    Si: fcScoresRes.data.scores_json.Si || 0,
    Se: fcScoresRes.data.scores_json.Se || 0
  } : undefined;

  console.log(JSON.stringify({
    evt: "fc_scores_loaded",
    session_id,
    has_fc_scores: !!fcFunctionScores
  }));

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
    },
    fcFunctionScores
  };

  try {
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

    console.log(JSON.stringify({
      evt: "recompute_session_complete",
      session_id,
      dry_run,
      success: true
    }));

    return {
      session_id,
      normalized_count: normalized.length,
      scored: !dry_run,
      version: RESULTS_VERSION,
      type_code: scoredResult.type_code,
      confidence: scoredResult.conf_calibrated
    };

  } catch (error) {
    console.error(JSON.stringify({
      evt: "recompute_session_error",
      session_id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }));
    throw error;
  }
}