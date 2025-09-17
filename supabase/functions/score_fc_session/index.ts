import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Weights = Record<string, number>;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { session_id, basis = "functions", version = "v1.2" } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Version validation warning
    if (!version || version === 'v1.1') {
      console.warn(`evt:fc_version_mismatch,session_id:${session_id},version:${version || 'undefined'},expected:v1.2`);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!  // service role so RLS never blocks scoring
    );

    console.log(`evt:fc_scoring_start,session_id:${session_id},basis:${basis},version:${version}`);

    // 1) Load blocks + options + this session's responses
    const { data: blocks } = await supabase
      .from("fc_blocks")
      .select("id, code, is_active")
      .eq("version", version)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    const { data: options } = await supabase
      .from("fc_options")
      .select("id, block_id, option_code, weights_json");

    const { data: reps } = await supabase
      .from("fc_responses")
      .select("block_id, option_id")
      .eq("session_id", session_id);

    if (!reps || reps.length === 0) {
      console.log(`evt:fc_no_responses,session_id:${session_id}`);
      return new Response(JSON.stringify({
        session_id, version, basis, blocks_answered: 0,
        scores: {}, info: "no fc responses"
      }), { headers: { ...cors, "Content-Type": "application/json" }});
    }

    // 2) Index options by id
    const optById = new Map(options?.map(o => [o.id, o]) ?? []);

    // 3) Aggregate weights for each answered block
    const tally: Record<string, number> = {};
    let answered = 0;

    for (const r of reps) {
      const opt = optById.get(r.option_id);
      if (!opt) {
        console.warn(`evt:fc_option_not_found,session_id:${session_id},option_id:${r.option_id}`);
        continue;
      }
      answered += 1;

      const w: Weights = opt.weights_json || {};
      for (const k of Object.keys(w)) {
        // If you're mixing bases, guard here. For v1.1 keep a single basis.
        tally[k] = (tally[k] ?? 0) + (Number(w[k]) || 0);
      }
    }

    console.log(`evt:fc_tally_complete,session_id:${session_id},answered:${answered},keys:${Object.keys(tally).length}`);

    // 4) Normalize
    // functions -> scale to 0-100 per key; types -> L1 normalize to sum=1
    const keys = Object.keys(tally);
    const scores: Record<string, number> = {};
    if (basis === "functions") {
      // min-max scale by observed domain: divide by max then 0-100
      const maxVal = Math.max(...keys.map(k => tally[k] || 0), 1e-9);
      for (const k of keys) scores[k] = +( (tally[k] / maxVal) * 100 ).toFixed(2);
    } else {
      // 'types': make them probabilities
      const sum = keys.reduce((a,k)=>a+(tally[k]||0), 0) || 1e-9;
      for (const k of keys) scores[k] = +((tally[k] / sum)).toFixed(4);
    }

    console.log(`evt:fc_scores_normalized,session_id:${session_id},basis:${basis},score_keys:${Object.keys(scores).join(',')}`);

    // 5) Write to fc_scores (upsert)
    const { error: upsertError } = await supabase.from("fc_scores").upsert({
      session_id, version, fc_kind: basis,
      scores_json: scores, blocks_answered: answered
    }, { onConflict: "session_id,version,fc_kind" });

    if (upsertError) {
      console.error(`evt:fc_upsert_error,session_id:${session_id},error:${upsertError.message}`);
      throw new Error(`Failed to save FC scores: ${upsertError.message}`);
    }

    console.log(`evt:fc_scoring_complete,session_id:${session_id},blocks_answered:${answered}`);

    return new Response(JSON.stringify({
      session_id, version, basis, blocks_answered: answered, scores
    }), { headers: { ...cors, "Content-Type": "application/json" }});

  } catch (e) {
    console.error("score_fc_session error", e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
