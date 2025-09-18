// supabase/functions/_shared/persistResultsV2.ts
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface TypeResultInput {
  type_code: string;
  share_pct: number;       // 0–100 OR 0–1; we normalize below
  fit: number;             // 0–100
  distance?: number | null;
  coherent_dims?: number | null;
  unique_dims?: number | null;
  seat_coherence?: number | null;
  fit_parts?: Record<string, number> | null;
}

export interface FunctionResultInput {
  func: "Ti"|"Te"|"Fi"|"Fe"|"Ni"|"Ne"|"Si"|"Se";
  strength_z: number;
  dimension?: number | null;   // 1..4
  d_index_z?: number | null;
}

export interface StateResultInput {
  overlay_band: "Reg+"|"Reg0"|"Reg-";
  overlay_z: number | null;
  effect_fit?: number | null;
  effect_conf?: number | null;
  block_core?: number | null;
  block_critic?: number | null;
  block_hidden?: number | null;
  block_instinct?: number | null;
  block_context?: "calm"|"stress"|"flow" | null;
}

export interface PersistResultsV2Payload {
  types: TypeResultInput[];
  functions: FunctionResultInput[];
  state: StateResultInput;
}

const RESULTS_VERSION = "v2";

function normalizeShare(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value > 1 ? Number(value.toFixed(2)) : Number((value * 100).toFixed(2));
}

function sanitizeDimension(value: number | null | undefined): number | null {
  if (!Number.isFinite(value as number)) return null;
  const r = Math.round(value as number);
  if (r < 1) return 1;
  if (r > 4) return 4;
  return r;
}

export async function persistResultsV2(
  client: SupabaseClient,
  sessionId: string,
  payload: PersistResultsV2Payload,
): Promise<void> {
  // --- types (16 required) ---
  const types = payload.types.map((row) => ({
    session_id: sessionId,
    results_version: RESULTS_VERSION,
    type_code: row.type_code,
    share: normalizeShare(row.share_pct),
    fit: Number.isFinite(row.fit) ? Number(row.fit.toFixed(2)) : 0,
    distance: row.distance ?? null,
    coherent_dims: row.coherent_dims ?? null,
    unique_dims: row.unique_dims ?? null,
    seat_coherence: row.seat_coherence != null ? Number(row.seat_coherence.toFixed(3)) : null,
    fit_parts: row.fit_parts ?? null,
  }));
  if (types.length < 16) throw new Error("persistResultsV2: expected 16 type rows");

  // sanity (sum≈100)
  const shareSum = types.reduce((s, r) => s + (r.share ?? 0), 0);
  if (Math.abs(shareSum - 100) > 1) {
    console.warn(JSON.stringify({ evt: "persist_v2_share_warn", session_id: sessionId, share_sum: Number(shareSum.toFixed(2)) }));
  }

  const { error: typesErr } = await client
    .from("scoring_results_types")
    .upsert(types, { onConflict: "results_version,session_id,type_code" });
  if (typesErr) throw new Error(`persistResultsV2: types upsert failed: ${typesErr.message}`);

  // --- functions (8) ---
  const functions = payload.functions.map((row) => ({
    session_id: sessionId,
    results_version: RESULTS_VERSION,
    func: row.func,
    strength_z: Number(row.strength_z.toFixed(3)),
    dimension: sanitizeDimension(row.dimension ?? null),
    d_index_z: row.d_index_z != null ? Number(row.d_index_z.toFixed(3)) : null,
  }));
  if (functions.length !== 8) throw new Error("persistResultsV2: expected 8 function rows");

  const { error: funcsErr } = await client
    .from("scoring_results_functions")
    .upsert(functions, { onConflict: "results_version,func,session_id" });
  if (funcsErr) throw new Error(`persistResultsV2: functions upsert failed: ${funcsErr.message}`);

  // --- state (by context; use 'calm' for now) ---
  const state = {
    session_id: sessionId,
    results_version: RESULTS_VERSION,
    overlay_band: payload.state.overlay_band,
    overlay_z: payload.state.overlay_z != null ? Number(payload.state.overlay_z.toFixed(3)) : null,
    effect_fit: payload.state.effect_fit != null ? Number(payload.state.effect_fit.toFixed(3)) : null,
    effect_conf: payload.state.effect_conf != null ? Number(payload.state.effect_conf.toFixed(3)) : null,
    block_core: payload.state.block_core != null ? Number(payload.state.block_core.toFixed(3)) : null,
    block_critic: payload.state.block_critic != null ? Number(payload.state.block_critic.toFixed(3)) : null,
    block_hidden: payload.state.block_hidden != null ? Number(payload.state.block_hidden.toFixed(3)) : null,
    block_instinct: payload.state.block_instinct != null ? Number(payload.state.block_instinct.toFixed(3)) : null,
    block_context: payload.state.block_context ?? "calm",
  };

  const { error: stateErr } = await client
    .from("scoring_results_state")
    // IMPORTANT: match PK (block_context, session_id, results_version)
    .upsert(state, { onConflict: "results_version,session_id,block_context" });
  if (stateErr) throw new Error(`persistResultsV2: state upsert failed: ${stateErr.message}`);
}