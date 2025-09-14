import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runScoreEngine, FALLBACK_PROTOTYPES, TypeCode, Func, Block } from "../_shared/scoreEngine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ status: "error", error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key, { global: { headers: { Prefer: "tx=commit" } } });

    const { data: rawAnswers } = await supabase
      .from("assessment_responses")
      .select("question_id, answer_value, created_at, id")
      .eq("session_id", session_id);
    if (!rawAnswers || rawAnswers.length === 0) {
      return new Response(JSON.stringify({ status: "success", profile: { empty: true } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const latest = new Map<string, any>();
    for (const r of rawAnswers) {
      const k = String(r.question_id);
      const prev = latest.get(k);
      const tPrev = prev ? new Date(prev.created_at || 0).getTime() : -Infinity;
      const tCurr = new Date(r.created_at || 0).getTime();
      const newer = Number.isFinite(tCurr) && Number.isFinite(tPrev) ? tCurr >= tPrev : (r.id ?? 0) >= (prev?.id ?? 0);
      if (!prev || newer) latest.set(k, r);
    }
    const answers = Array.from(latest.values());

    const { data: keyRows } = await supabase.from("assessment_scoring_key").select("*");
    const keyByQ: Record<string, any> = {};
    keyRows?.forEach((r: any) => (keyByQ[String(r.question_id)] = r));

    const cfg = async (k: string) => {
      const { data } = await supabase.from("scoring_config").select("value").eq("key", k).maybeSingle();
      return data?.value ?? null;
    };
    const softmaxTemp = (await cfg("softmax_temp")) ?? 1.0;
    const resultsVersion = (await cfg("results_version")) ?? "v1.2.1";

    let prototypes = FALLBACK_PROTOTYPES;
    const { data: protoData } = await supabase.from("type_prototypes").select("type_code, func, block");
    if (protoData && protoData.length === 16 * 8) {
      const dbProtos: Record<TypeCode, Record<Func, Block>> = {} as any;
      for (const row of protoData) {
        (dbProtos[row.type_code as TypeCode] ||= {} as any)[row.func as Func] = row.block as Block;
      }
      prototypes = dbProtos;
    }

    let fc_scores: Record<Func, number> | undefined;
    const { data: fcRow } = await supabase
      .from("fc_scores")
      .select("scores_json")
      .eq("session_id", session_id)
      .eq("version", "v1.1")
      .eq("fc_kind", "functions")
      .maybeSingle();
    if (fcRow?.scores_json) fc_scores = fcRow.scores_json as Record<Func, number>;

    const result = runScoreEngine({
      answers,
      keyByQ,
      config: { softmaxTemp, typePrototypes: prototypes, resultsVersion },
      fc_scores,
    });

    const profile = {
      ...result.profile,
      session_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await supabase.from("profiles").upsert(profile, { onConflict: "session_id" });

    return new Response(
      JSON.stringify({ status: "success", profile, fc_source: result.fc_source }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ status: "error", error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

