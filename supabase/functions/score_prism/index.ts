// supabase/functions/score_prism/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { persistResultsV2, type TypeResultInput, type FunctionResultInput, type StateResultInput } from "../_shared/persistResultsV2.ts";
import { scoreAssessment, FALLBACK_PROTOTYPES, Func } from "../_shared/scoreEngine.ts";
import { PrismCalibration } from "../_shared/calibration.ts";
import { RESULTS_VERSION, ensureResultsVersion, parseResultsVersion } from "../_shared/resultsVersion.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALL_TYPES: string[] = ["LIE","ILI","ESE","SEI","LII","ILE","ESI","SEE","LSE","SLI","EIE","IEI","LSI","SLE","EII","IEE"];

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

await ensureResultsVersion(db);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id } = await req.json();
    if (!session_id) return new Response(JSON.stringify({ status: "error", error: "session_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type":"application/json" } });

    // Pull responses (latest per question)
    const { data: rows, error: respErr } = await db
      .from("assessment_responses")
      .select("id, question_id, answer_value, created_at")
      .eq("session_id", session_id);
    if (respErr) throw respErr;
    if (!rows?.length) return new Response(JSON.stringify({ status: "error", error: "no responses" }), { status: 400, headers: { ...corsHeaders, "Content-Type":"application/json" } });
    const last = new Map<number, any>();
    for (const r of rows) {
      const k = r.question_id;
      const prev = last.get(k);
      if (!prev || new Date(r.created_at).getTime() >= new Date(prev.created_at).getTime()) last.set(k, r);
    }
    const responses = Array.from(last.values()).map(r => ({ question_id: r.question_id, answer_value: r.answer_value }));

    // Scoring key & config
    const { data: keyRows } = await db.from("assessment_scoring_key").select("*");
    const scoringKey: Record<string, any> = {};
    keyRows?.forEach(r => { scoringKey[String(r.question_id)] = r; });

    const { data: cfgRows } = await db.from("scoring_config").select("key,value").in("key", [
      "results_version", "softmax_temp", "conf_raw_params", "fit_band_thresholds", "fc_expected_min"
    ]);
    const cfg = Object.fromEntries((cfgRows ?? []).map(r => [r.key, r.value]));
    const configResultsVersion = parseResultsVersion(cfg.results_version);

    // Prototypes
    let typePrototypes = FALLBACK_PROTOTYPES;
    const { data: protoRows } = await db.from("type_prototypes").select("type_code, func, block");
    if (protoRows?.length === 16*8) {
      const p: any = {};
      for (const row of protoRows) {
        (p[row.type_code] ||= {})[row.func] = row.block;
      }
      typePrototypes = p;
    }

    // Optional FC
    let fcScores: Record<string, number> | undefined;
    const { data: fc } = await db.from("fc_scores")
      .select("scores_json").eq("session_id", session_id)
      .eq("version", "v1.2").eq("fc_kind","functions").maybeSingle();
    if (fc?.scores_json) fcScores = fc.scores_json;

    console.log(JSON.stringify({ evt: "prism_start", session_id }));

    // ---- Run legacy engine (deterministic) ----
    const profile = scoreAssessment({
      sessionId: session_id,
      responses,
      scoringKey,
      fcFunctionScores: fcScores,
      config: {
        results_version: configResultsVersion ?? RESULTS_VERSION,
        dim_thresholds: { one: 0, two: 0, three: 0 },
        neuro_norms: { mean: 0, sd: 1 },
        overlay_neuro_cut: 0,
        overlay_state_weights: { stress: 0, time: 0, sleep: 0, focus: 0 },
        softmax_temp: cfg.softmax_temp || 1,
        conf_raw_params: cfg.conf_raw_params || { a: 0.25, b: 0.35, c: 0.2 },
        fit_band_thresholds: cfg.fit_band_thresholds || { high_fit: 10, moderate_fit: 5, high_gap: 0.2, moderate_gap: 0.1 },
        fc_expected_min: cfg.fc_expected_min || 0,
        typePrototypes,
      },
    });

    // Confidence calibration
    const sharesMap = Object.fromEntries(profile.top_types.map((t: any) => [t.code, t.share]));
    const entropy = -Object.values(sharesMap).reduce((s: number, p: number) => s + (p>0 ? p * Math.log2(p) : 0), 0);
    const topGap = profile.top_3_fits[0].fit - (profile.top_3_fits[1]?.fit || 0);
    const shareMargin = (profile.top_types[0].share - (profile.top_types[1]?.share || 0)) * 100;
    const calibrator = new PrismCalibration(db);
    const conf = await calibrator.calculateConfidence({
      topGap, shareMargin, shareEntropy: entropy,
      dimBand: profile.fit_band, overlay: profile.overlay, sessionId: session_id,
    });
    profile.conf_raw = Number(conf.raw.toFixed(4));
    profile.conf_calibrated = Number(conf.calibrated.toFixed(4));
    profile.confidence = conf.band as any;

    // Upsert stable v1 profile (so UI always has good fallback)
    const now = new Date().toISOString();
    const { data: existing } = await db.from("profiles").select("id, submitted_at").eq("session_id", session_id).maybeSingle();
    const profileRow = {
      ...profile,
      session_id,
      submitted_at: existing?.submitted_at || now,
      recomputed_at: existing ? now : null,
      created_at: existing?.submitted_at || now,
      updated_at: now,
      results_version: RESULTS_VERSION,
      version: RESULTS_VERSION,
    };
    await db.from("profiles").upsert(profileRow, { onConflict: "session_id" });

    console.log(JSON.stringify({ evt: "persisting_v2_rows", session_id }));

    // Build deterministic V2 payloads from the same computed profile
    const typeScores: Record<string, any> = profile.type_scores ?? {};
    const seatCoherence = profile.meta?.seat_metrics?.coherence ?? null;

    const types: TypeResultInput[] = ALL_TYPES.map((code) => {
      const m = typeScores[code] ?? {};
      return {
        type_code: code,
        share_pct: (typeof m.share_pct === "number" ? m.share_pct : 0),
        fit: (typeof m.fit_abs === "number" ? m.fit_abs : 0),
        distance: m.distance ?? null,
        coherent_dims: code === profile.type_code ? profile.dims_highlights?.coherent?.length ?? null : null,
        unique_dims: code === profile.type_code ? profile.dims_highlights?.unique?.length ?? null : null,
        seat_coherence: code === profile.type_code ? seatCoherence : null,
        fit_parts: m.fit_parts ?? null,
      };
    });

    const functions: FunctionResultInput[] = (["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"] as Func[]).map((fn) => ({
      func: fn,
      strength_z: Number(profile.strengths?.[fn] ?? 0),
      dimension: Number(profile.dimensions?.[fn] ?? 0) || null,
      d_index_z: profile.meta?.diagnostics?.dim_index?.[fn] ?? null,
    }));

    const overlayBand = ({ "+":"Reg+","0":"Reg0","-":"Reg-","–":"Reg-" } as any)[profile.overlay ?? "0"] ?? "Reg0";
    const state: StateResultInput = {
      overlay_band: overlayBand,
      overlay_z: profile.neuroticism?.z ?? profile.neuro_z ?? 0,
      effect_fit: profile.meta?.state_effects?.fit ?? null,
      effect_conf: profile.meta?.state_effects?.confidence ?? null,
      block_core: profile.blocks_norm?.Core ?? profile.blocks?.Core ?? null,
      block_critic: profile.blocks_norm?.Critic ?? profile.blocks?.Critic ?? null,
      block_hidden: profile.blocks_norm?.Hidden ?? profile.blocks?.Hidden ?? null,
      block_instinct: profile.blocks_norm?.Instinct ?? profile.blocks?.Instinct ?? null,
      block_context: "calm",
    };

    await persistResultsV2(db, session_id, { types, functions, state });

    console.log(JSON.stringify({ 
      evt: "prism_complete", 
      session_id, 
      type_code: profileRow.type_code, 
      confidence: profileRow.conf_calibrated,
      results_version: RESULTS_VERSION
    }));

    return new Response(JSON.stringify({ status: "success", profile: profileRow, type_code: profileRow.type_code, confidence: profileRow.conf_calibrated }), { headers: { ...corsHeaders, "Content-Type":"application/json" } });
  } catch (e: any) {
    console.log(JSON.stringify({ evt: "prism_error", session_id: e?.session_id, error: e?.message || String(e) }));
    return new Response(JSON.stringify({ status:"error", error: e?.message || "internal" }), { status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" } });
  }
});