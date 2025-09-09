// supabase/functions/score_prism/index.ts
// Refactored to use shared scoring engine
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { scoreAssessment, FUNCS, FALLBACK_PROTOTYPES, TypeCode, Func, Block } from "../_shared/score-engine/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { session_id } = await req.json();
    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ status: "error", error: "Valid session_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ status: "error", error: "Server not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Prefer: 'tx=commit' } } });

    // load responses
    const { data: rawRows, error: aerr } = await supabase
      .from("assessment_responses")
      .select("id, question_id, answer_value, created_at")
      .eq("session_id", session_id);
    if (aerr) throw aerr;

    if (!rawRows || rawRows.length === 0) {
      return new Response(JSON.stringify({ status: "success", profile: { empty: true } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // dedup latest per question
    const lastByQ = new Map<string, any>();
    for (const r of rawRows) {
      const k = String(r.question_id);
      const prev = lastByQ.get(k);
      const tPrev = prev ? new Date(prev.created_at || 0).getTime() : -Infinity;
      const tCurr = new Date(r.created_at || 0).getTime();
      const newer = Number.isFinite(tCurr) && Number.isFinite(tPrev) ? (tCurr >= tPrev) : ((r.id ?? 0) >= (prev?.id ?? 0));
      if (!prev || newer) lastByQ.set(k, r);
    }
    const answers = Array.from(lastByQ.values());

    // load scoring key
    const { data: skey, error: kerr } = await supabase.from("assessment_scoring_key").select("*");
    if (kerr) throw kerr;
    const keyByQ: Record<string, any> = {};
    skey?.forEach((r: any) => { keyByQ[String(r.question_id)] = r; });

    // config helper
    const cfg = async (k: string) => {
      const { data } = await supabase.from("scoring_config").select("value").eq("key", k).maybeSingle();
      return data?.value ?? null;
    };
    const softmaxTemp = (await cfg("softmax_temp")) ?? 1.0;
    const fcExpectedMin = (await cfg("fc_expected_min")) ?? 12;

    // type prototypes
    let typePrototypes = FALLBACK_PROTOTYPES;
    const { data: protoData } = await supabase
      .from('type_prototypes')
      .select('type_code, func, block');
    if (protoData && protoData.length === 16 * 8) {
      const dbProtos: Record<TypeCode, Record<Func, Block>> = {} as any;
      for (const row of protoData) {
        if (!dbProtos[row.type_code as TypeCode]) dbProtos[row.type_code as TypeCode] = {} as any;
        dbProtos[row.type_code as TypeCode][row.func as Func] = row.block as Block;
      }
      typePrototypes = dbProtos;
    }

    // fc scores (optional)
    const { data: fcScores } = await supabase
      .from('fc_scores')
      .select('scores_json')
      .eq('session_id', session_id)
      .eq('version', 'v1.1')
      .eq('fc_kind', 'functions')
      .maybeSingle();
    let fcInit: any = undefined;
    if (fcScores && fcScores.scores_json) {
      const fcFuncCount: Record<Func, number> = {} as any;
      for (const f of FUNCS) {
        const score = fcScores.scores_json[f] || 0;
        fcFuncCount[f] = Math.max(1, Math.round((score / 100) * 12));
      }
      fcInit = { fcFuncCount };
    }

    const result = scoreAssessment({
      answers,
      keyByQ,
      config: { softmaxTemp, fcExpectedMin, typePrototypes },
      fcInit,
    });

    const answersHash = await sha256(JSON.stringify(answers));
    const configHash = await sha256(JSON.stringify({ softmaxTemp, fcExpectedMin }));
    console.log(`evt:scoring_inputs,session_id:${session_id},version:${result.results_version},answers_hash:${answersHash},config_hash:${configHash}`);

    const profileData = {
      ...result.profile,
      session_id: session_id,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'session_id', ignoreDuplicates: false });
    if (upsertError) {
      return new Response(JSON.stringify({ status: "error", error: upsertError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ status: "success", gap_to_second: result.gap_to_second, confidence_numeric: result.confidence_margin, profile: profileData }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Scoring error:", error);
    return new Response(JSON.stringify({ status: "error", error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
