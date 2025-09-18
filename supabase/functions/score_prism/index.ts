import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { scoreAssessment, FALLBACK_PROTOTYPES, Func, TypeCode, Block } from "../_shared/scoreEngine.ts";
import { PrismCalibration } from "../_shared/calibration.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { session_id } = await req.json();
    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ status: "error", error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(JSON.stringify({ evt: "prism_start", session_id }));

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return new Response(JSON.stringify({ status: "error", error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(url, key);

    const { data: rawResponses, error: respErr } = await supabase
      .from("assessment_responses")
      .select("id, question_id, answer_value, created_at")
      .eq("session_id", session_id);
    if (respErr) throw respErr;
    if (!rawResponses || rawResponses.length === 0) {
      return new Response(JSON.stringify({ status: "error", error: "no responses" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // dedupe latest answer per question
    const lastByQ = new Map<string, any>();
    for (const r of rawResponses) {
      const k = String(r.question_id);
      const prev = lastByQ.get(k);
      const tPrev = prev ? new Date(prev.created_at || 0).getTime() : -Infinity;
      const tCurr = new Date(r.created_at || 0).getTime();
      const newer = Number.isFinite(tCurr) && Number.isFinite(tPrev) ? tCurr >= tPrev : (r.id ?? 0) >= (prev?.id ?? 0);
      if (!prev || newer) lastByQ.set(k, r);
    }
    const responses = Array.from(lastByQ.values()).map((r) => ({ question_id: r.question_id, answer_value: r.answer_value }));

    const { data: keyRows, error: keyErr } = await supabase.from("assessment_scoring_key").select("*");
    if (keyErr) throw keyErr;
    const scoringKey: Record<string, any> = {};
    keyRows?.forEach((r) => {
      scoringKey[String(r.question_id)] = r;
    });

    const { data: cfgRows } = await supabase
      .from("scoring_config")
      .select("key, value")
      .in("key", [
        "results_version",
        "softmax_temp",
        "conf_raw_params",
        "fit_band_thresholds",
        "fc_expected_min",
      ]);
    const cfg = Object.fromEntries(cfgRows?.map((r) => [r.key, r.value]) || []);

    let typePrototypes = FALLBACK_PROTOTYPES;
    const { data: protoData } = await supabase.from("type_prototypes").select("type_code, func, block");
    if (protoData && protoData.length === 16 * 8) {
      const dbProtos: Record<TypeCode, Record<Func, Block>> = {} as any;
      for (const row of protoData) {
        (dbProtos[row.type_code as TypeCode] ||= {} as any)[row.func as Func] = row.block as Block;
      }
      typePrototypes = dbProtos;
    }

    let fcScores: Record<string, number> | undefined;
    const { data: fcRow } = await supabase
      .from("fc_scores")
      .select("scores_json")
      .eq("session_id", session_id)
      .eq("version", "v1.2")
      .eq("fc_kind", "functions")
      .maybeSingle();
    if (fcRow?.scores_json) {
      fcScores = fcRow.scores_json as Record<string, number>;
      console.log(JSON.stringify({ evt: "fc_scores_loaded", session_id }));
    } else {
      console.log(JSON.stringify({ evt: "fc_fallback_legacy", session_id }));
    }

    const profile = scoreAssessment({
      sessionId: session_id,
      responses,
      scoringKey,
      fcFunctionScores: fcScores,
      config: {
        results_version: cfg.results_version || "v1.2.1",
        dim_thresholds: { one: 0, two: 0, three: 0 },
        neuro_norms: { mean: 0, sd: 1 },
        overlay_neuro_cut: 0,
        overlay_state_weights: { stress: 0, time: 0, sleep: 0, focus: 0 },
        softmax_temp: cfg.softmax_temp || 1,
        conf_raw_params: cfg.conf_raw_params || { a: 0.25, b: 0.35, c: 0.2 },
        fit_band_thresholds: cfg.fit_band_thresholds || {
          high_fit: 10,
          moderate_fit: 5,
          high_gap: 0.2,
          moderate_gap: 0.1,
        },
        fc_expected_min: cfg.fc_expected_min || 0,
        typePrototypes,
      },
    });

    // Confidence calibration
    const sharesMap = Object.fromEntries(profile.top_types.map((t) => [t.code, t.share]));
    const entropy = -Object.values(sharesMap).reduce((s: number, p: number) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
    const topGap = profile.top_3_fits[0].fit - (profile.top_3_fits[1]?.fit || 0);
    const shareMargin = (profile.top_types[0].share - (profile.top_types[1]?.share || 0)) * 100;
    const calibrator = new PrismCalibration(supabase);
    const conf = await calibrator.calculateConfidence({
      topGap,
      shareMargin,
      shareEntropy: entropy,
      dimBand: profile.fit_band,
      overlay: profile.overlay,
      sessionId: session_id,
    });
    profile.conf_raw = Number(conf.raw.toFixed(4));
    profile.conf_calibrated = Number(conf.calibrated.toFixed(4));
    profile.confidence = conf.band as any;

    // Emit telemetry if database config doesn't match engine expectation
    if (cfg.results_version && cfg.results_version !== "v1.2.1") {
      console.log(`evt:engine_version_override,db_version:${cfg.results_version},engine_version:v1.2.1,session_id:${session_id}`);
    }

    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, submitted_at")
      .eq("session_id", session_id)
      .maybeSingle();

    const profileRow = {
      ...profile,
      session_id,
      submitted_at: existing?.submitted_at || now,
      recomputed_at: existing ? now : null,
      created_at: existing?.submitted_at || now,
      updated_at: now,
      results_version: "v1.2.1",
      version: "v1.2.1",
    };

    await supabase.from("profiles").upsert(profileRow, { onConflict: "session_id" });

    console.log(JSON.stringify({ 
      evt: "prism_complete", 
      session_id, 
      type_code: profileRow.type_code, 
      confidence: profileRow.conf_calibrated,
      results_version: "v1.2.1"
    }));

    return new Response(
      JSON.stringify({
        status: "success",
        profile: profileRow,
        gap_to_second: profileRow.top_gap,
        confidence_numeric: Number((profileRow.conf_calibrated * 100).toFixed(1)),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.log(JSON.stringify({ evt: "prism_error", session_id, error: e?.message || String(e) }));
    return new Response(JSON.stringify({ status: "error", error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
