// supabase/functions/_shared/persistResultsV3.ts
// Unified persistence layer for scoring results with validation

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ScoringPayload, PersistResultsV3Params } from "./types.results.ts";
import { persistResultsV2, type PersistResultsV2Payload } from "./persistResultsV2.ts";
import Ajv from "https://esm.sh/ajv@8";

// Toggle for legacy table writes - controlled by env var for safer production rollouts
const WRITE_EXPLODED = (Deno.env.get("PRISM_WRITE_EXPLODED") ?? "false") === "true";

// Basic schema validation - validate core required fields
const coreRequiredFields = [
  'version', 'results_version'
];

const profileRequiredFields = [
  'session_id', 'type_code', 'confidence'
];

function validatePayload(payload: ScoringPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check top-level fields
  for (const field of coreRequiredFields) {
    const v = (payload as any)[field];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check profile fields
  if (!payload.profile) {
    errors.push('Missing profile object');
  } else {
    for (const field of profileRequiredFields) {
      const v = (payload.profile as any)[field];
      // allow 0 (number) and "0" (string) but disallow null/undefined/empty-string
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        errors.push(`Missing required profile field: ${field}`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export async function persistResultsV3(
  db: SupabaseClient,
  params: PersistResultsV3Params
): Promise<void> {
  const startTime = Date.now();
  const { session_id, user_id, payload } = params;

  // Validate payload
  const validation = validatePayload(payload);
  if (!validation.valid) {
    console.error(JSON.stringify({
      evt: "persistResultsV3_validation_failed",
      session_id,
      errors: validation.errors
    }));
    throw new Error(`Payload validation failed: ${validation.errors.join(", ")}`);
  }

  const scoring_version = payload.version || payload.results_version;
  const type_code = payload.profile?.type_code ?? null;
  const confidence = payload.profile?.confidence ?? null;

  // 1) Unified table (UPSERT) - this is the primary write
  const upsertStart = Date.now();
  const { error: upsertErr } = await db
    .from("scoring_results")
    .upsert(
      {
        session_id,
        user_id: user_id ?? null,
        scoring_version,
        payload,
        type_code,
        confidence,
        computed_at: payload.profile?.computed_at || new Date().toISOString()
      },
      { onConflict: "session_id" }
    );
  const upsertMs = Date.now() - upsertStart;

  if (upsertErr) {
    console.error(JSON.stringify({
      evt: "persistResultsV3_unified_failed",
      session_id,
      error: upsertErr.message,
      upsert_ms: upsertMs
    }));
    throw new Error(`persistResultsV3: unified table upsert failed: ${upsertErr.message}`);
  }

  // Log performance metrics with new field tracking
  const profile = payload.profile || {};
  console.log(JSON.stringify({
    evt: "persistResultsV3_unified_success",
    session_id,
    scoring_version,
    upsert_ms: upsertMs,
    write_exploded: WRITE_EXPLODED,
    had_dims_highlights: !!profile.dims_highlights,
    had_distance_metrics: !!profile.distance_metrics,
    had_seat_coherence: typeof profile.seat_coherence === 'number',
    had_fit_parts: !!profile.fit_parts,
    had_blocks_norm_blended: !!(profile.blocks_norm as any)?.blended,
    had_profile_confidence: typeof confidence === 'number' || typeof confidence === 'string'
  }));

  if (!WRITE_EXPLODED) {
    // Log total execution time
    const totalMs = Date.now() - startTime;
    console.log(JSON.stringify({
      evt: "persistResultsV3_complete",
      session_id,
      total_ms: totalMs,
      served_from_cache: false
    }));
    return; // Phase 2: only write to unified table
  }

  // 2) Legacy/exploded writes (best-effort; do not throw)
  try {
    // Write to profiles table - convert to legacy format
    const profileData = {
      session_id,
      type_code: profile.type_code,
      confidence: profile.confidence,
      scoring_version,
      computed_at: profile.computed_at || new Date().toISOString(),
      payload: payload, // store full payload as well
      // Map new fields to legacy columns
      conf_raw: profile.conf_raw,
      conf_calibrated: profile.conf_calibrated,
      score_fit_calibrated: payload.types?.[0]?.fit || profile.score_fit_calibrated || 0,
      top_gap: profile.top_gap,
      fit_band: profile.fit_band,
      validity_status: profile.validity_status,
      overlay: profile.overlay,
      top_types: payload.types?.slice(0, 3) || [], // Store top 3 as JSONB
      results_version: payload.results_version
    };

    await db.from("profiles").upsert(profileData, { onConflict: "session_id" });

    console.log(JSON.stringify({
      evt: "persistResultsV3_legacy_success",
      session_id,
      total_ms: Date.now() - startTime
    }));

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(JSON.stringify({
      evt: "persistResultsV3_legacy_failed_non_fatal",
      session_id,
      error: msg
    }));
    // Don't throw - legacy writes are best-effort
  }
}