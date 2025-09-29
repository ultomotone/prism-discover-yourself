// supabase/functions/_shared/persistResultsV3.ts
// Unified persistence layer for scoring results

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ScoringPayload, PersistResultsV3Params } from "./types.results.ts";
import { persistResultsV2, type PersistResultsV2Payload } from "./persistResultsV2.ts";

// Toggle for legacy table writes - set to false in Phase 2
const WRITE_EXPLODED = true;

export async function persistResultsV3(
  db: SupabaseClient,
  params: PersistResultsV3Params
): Promise<void> {
  const { session_id, user_id, payload } = params;
  const scoring_version = payload.version || payload.results_version;
  const type_code = payload.profile?.type_code ?? null;
  const confidence = payload.profile?.confidence ?? null;

  // 1) Unified table (UPSERT) - this is the primary write
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
        computed_at: new Date().toISOString()
      },
      { onConflict: "session_id" }
    );

  if (upsertErr) {
    console.error(JSON.stringify({
      evt: "persistResultsV3_unified_failed",
      session_id,
      error: upsertErr.message
    }));
    throw new Error(`persistResultsV3: unified table upsert failed: ${upsertErr.message}`);
  }

  console.log(JSON.stringify({
    evt: "persistResultsV3_unified_success",
    session_id,
    scoring_version
  }));

  if (!WRITE_EXPLODED) {
    return; // Phase 2: only write to unified table
  }

  // 2) Legacy/exploded writes (best-effort; do not throw)
  try {
    // Write to profiles table
    const profileData = {
      ...payload.profile, // spread profile fields first
      session_id,
      scoring_version,
      payload, // if column exists
      computed_at: new Date().toISOString()
    };

    await db.from("profiles").upsert(profileData, { onConflict: "session_id" });

    // Convert to legacy format for persistResultsV2
    if (payload.types?.length && payload.functions?.length && payload.state) {
      const legacyPayload: PersistResultsV2Payload = {
        types: payload.types.map(t => ({
          type_code: t.type_code,
          share_pct: t.share ?? 0,
          fit: t.fit,
          distance: t.distance ?? null,
          coherent_dims: t.coherent_dims ?? null,
          unique_dims: t.unique_dims ?? null,
          seat_coherence: t.seat_coherence ?? null,
          fit_parts: t.fit_parts ?? null
        })),
        functions: payload.functions.map(f => ({
          func: f.func_code as "Ti"|"Te"|"Fi"|"Fe"|"Ni"|"Ne"|"Si"|"Se",
          strength_z: f.strength,
          dimension: f.dimension ?? null,
          d_index_z: f.d_index_z ?? null
        })),
        state: {
          overlay_band: (payload.state.overlay_band as "Reg+"|"Reg0"|"Reg-") ?? "Reg0",
          overlay_z: payload.state.overlay_z ?? null,
          effect_fit: payload.state.effect_fit ?? null,
          effect_conf: payload.state.effect_conf ?? null,
          block_core: payload.state.block_core ?? null,
          block_critic: payload.state.block_critic ?? null,
          block_hidden: payload.state.block_hidden ?? null,
          block_instinct: payload.state.block_instinct ?? null,
          block_context: (payload.state.block_context as "calm"|"stress"|"flow") ?? "calm"
        }
      };

      await persistResultsV2(db, session_id, legacyPayload);
    }

    console.log(JSON.stringify({
      evt: "persistResultsV3_legacy_success",
      session_id
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