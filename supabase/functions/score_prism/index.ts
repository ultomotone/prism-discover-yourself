import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Strengths = Record<string, number>;
type Dims = Record<string, number>;

const FUNCS = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"] as const;
const OPP: Record<string,string> = { Ti:"Fe", Fe:"Ti", Te:"Fi", Fi:"Te", Ni:"Se", Se:"Ni", Ne:"Si", Si:"Ne" };

const TYPE_MAP: Record<string,{ base:string, creative:string }> = {
  LIE:{ base:"Te", creative:"Ni" }, ILI:{ base:"Ni", creative:"Te" },
  ESE:{ base:"Fe", creative:"Si" }, SEI:{ base:"Si", creative:"Fe" },
  LII:{ base:"Ti", creative:"Ne" }, ILE:{ base:"Ne", creative:"Ti" },
  ESI:{ base:"Fi", creative:"Se" }, SEE:{ base:"Se", creative:"Fi" },
  LSE:{ base:"Te", creative:"Si" }, SLI:{ base:"Si", creative:"Te" },
  EIE:{ base:"Fe", creative:"Ni" }, IEI:{ base:"Ni", creative:"Fe" },
  LSI:{ base:"Ti", creative:"Se" }, SLE:{ base:"Se", creative:"Ti" },
  EII:{ base:"Fi", creative:"Ne" }, IEE:{ base:"Ne", creative:"Fi" }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ status: 'error', error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars');
      return new Response(JSON.stringify({ status: 'error', error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load responses
    const { data: answers, error: aerr } = await supabase
      .from("assessment_responses")
      .select("question_id, answer_value")
      .eq("session_id", session_id);
    if (aerr) {
      console.error('Error fetching responses', aerr);
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch responses' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!answers || answers.length === 0) {
      return new Response(JSON.stringify({ status: 'success', profile: { empty: true } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load scoring key
    const { data: skey, error: kerr } = await supabase.from("assessment_scoring_key").select("*");
    if (kerr) {
      console.error('Error fetching scoring key', kerr);
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch scoring key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const keyByQ: Record<string, any> = {}; 
    skey?.forEach((r:any)=> keyByQ[String(r.question_id)] = r);

    // Load config
    const cfg = async (k:string) => {
      const { data } = await supabase.from("scoring_config").select("value").eq("key",k).single();
      return data?.value ?? {};
    };
    const dimThresh = await cfg("dim_thresholds"); // {one,two,three}
    const neuroNorms = await cfg("neuro_norms");   // {mean,sd}
    const fcBlockDefault = await cfg("fc_block_map_default");

    // Aggregation buckets
    const likert: Record<string, number[]> = {};  // per function *_S
    const dims: Record<string, number[]> = {};    // per function *_D
    const fcFuncCount: Record<string, number> = {};
    const blockCount: Record<string, number> = { Core:0, Critic:0, Hidden:0, Instinct:0 };
    const neuroVals: number[] = [];
    const pairs: Record<string, number[]> = {};
    let sdSum=0, sdN=0;

    const toNum = (s:string)=> Number(s);
    const mapDim = (avg:number)=> {
      if (!avg) return 0;
      if (avg <= dimThresh.one) return 1;
      if (avg <= dimThresh.two) return 2;
      if (avg <= dimThresh.three) return 3;
      return 4;
    };

    // Pass 1: aggregate raw
    for (const ans of (answers||[])) {
      const qid = String(ans.question_id);
      const rec = keyByQ[qid]; if (!rec) continue;
      const scale = rec.scale_type as string; const tag = rec.tag as string | null;
      const reverse = !!rec.reverse_scored; const pair = rec.pair_group as string | null;
      const sd = !!rec.social_desirability; const atext = String(ans.answer_value).trim();

      if (scale?.startsWith("LIKERT") || scale === "STATE_1_7") {
        let v = toNum(atext);
        if (reverse && scale === "LIKERT_1_7") v = 8 - v;
        if (reverse && scale === "LIKERT_1_5") v = 6 - v;

        if (tag === "N" || tag === "N_R") neuroVals.push(v);
        else if (tag?.endsWith("_S")) { const f = tag.split("_")[0]; (likert[f] ||= []).push(v); }
        else if (tag?.endsWith("_D")) { const f = tag.split("_")[0]; (dims[f]   ||= []).push(v); }
        else if (["Core","Critic","Hidden","Instinct"].includes(tag||"")) blockCount[tag!] += v;

        if (sd) { sdSum += v; sdN += 1; }
        if (pair) { (pairs[pair] ||= []).push(v); }
      }

      if (scale?.startsWith("FORCED_CHOICE")) {
        const choice = atext.toUpperCase();
        const map = rec.fc_map ?? (scale === "FORCED_CHOICE_4" ? fcBlockDefault : null);
        if (map && map[choice]) {
          const m = map[choice];
          if (["Core","Critic","Hidden","Instinct"].includes(m)) blockCount[m] = (blockCount[m]||0) + 1;
          else if (FUNCS.includes(m)) fcFuncCount[m] = (fcFuncCount[m]||0) + 1;
        }
      }
    }

    // Strengths (Likert mean, blended with FC if present)
    const strengths: Strengths = {};
    const fcTotal = Object.values(fcFuncCount).reduce((a:any,b:any)=>a+b,0) || 0;
    for (const f of FUNCS) {
      const L = likert[f] || []; const meanL = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0; // 1..5
      const fcPct = fcTotal ? ((fcFuncCount[f]||0)/fcTotal) : 0; // 0..1
      const fcScaled = 1 + fcPct * 4; // map to 1..5
      const hasFC = fcTotal > 0 && fcFuncCount[f] !== undefined;
      strengths[f] = hasFC ? (meanL*0.5 + fcScaled*0.5) : meanL;
    }

    // Dimensions 1..4
    const dimensions: Dims = {};
    for (const f of FUNCS) {
      const L = dims[f] || []; const avg = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0;
      dimensions[f] = avg ? mapDim(avg) : 0;
    }

    // Pick Base & Creative as before (greedy with sanity)
    const sortedFuncs = [...FUNCS].sort((a,b)=> (strengths[b]||0) - (strengths[a]||0));
    const isJ = (x:string)=> ["Ti","Te","Fi","Fe"].includes(x);
    const isP = (x:string)=> ["Ni","Ne","Si","Se"].includes(x);
    let base = sortedFuncs[0];
    let creative = sortedFuncs.find(f => (isJ(f) && isP(base)) || (isP(f) && isJ(base))) || sortedFuncs[1];
    if ((dimensions[base]||0) < 3 && (dimensions[creative]||0) === 4) { const swap = base; base = creative; creative = swap; }

    // Socionics code from base/creative (kept for backward compatibility)
    const pair = `${base}_${creative}`;
    const socMap: Record<string,string> = {
      "Te_Ni":"LIE","Ni_Te":"ILI","Fe_Si":"ESE","Si_Fe":"SEI",
      "Ti_Ne":"LII","Ne_Ti":"ILE","Fi_Se":"ESI","Se_Fi":"SEE",
      "Te_Si":"LSE","Si_Te":"SLI","Fe_Ni":"EIE","Ni_Fe":"IEI",
      "Ti_Se":"LSI","Se_Ti":"SLE","Fi_Ne":"EII","Ne_Fi":"IEE"
    };
    const typeCode = socMap[pair] ?? "UNK";

    // Neuroticism overlay
    const nMean = neuroVals.length ? neuroVals.reduce((a,b)=>a+b,0)/neuroVals.length : 0;
    const z = (nMean - (neuroNorms.mean ?? 4)) / (neuroNorms.sd || 1);
    const overlay = z >= 0 ? "+" : "–";

    // Validity
    let inconsistency = 0, pc=0; for (const k of Object.keys(pairs)) { const arr = pairs[k]; if (arr.length===2) { inconsistency += Math.abs(arr[0]-arr[1]); pc++; } }
    const inconsIdx = pc ? (inconsistency/pc) : 0; const sdIndex = sdN ? (sdSum / sdN) : 0;
    const validity = { attention:false, inconsistency: Number(inconsIdx.toFixed(3)), sd_index: Number(sdIndex.toFixed(3)) };
    let confidence: "High"|"Moderate"|"Low" = "High";
    if (validity.inconsistency >= 1.5 || validity.sd_index >= 4.6) confidence = "Low"; else if (validity.inconsistency >= 1.0 || validity.sd_index >= 4.3) confidence = "Moderate";

    // --- New: Type likelihoods (absolute fit + relative share) -------------
    function scoreType(code:string){
      const { base: b, creative: c } = TYPE_MAP[code];
      const sb = strengths[b] || 0, sc = strengths[c] || 0;
      const db = (dimensions[b]||0), dc = (dimensions[c]||0);
      const fcTotal = Object.values(fcFuncCount).reduce((a,b)=>a+b,0) || 0;
      const fcpB = fcTotal ? ((fcFuncCount[b]||0)/fcTotal) : 0;
      const fcpC = fcTotal ? ((fcFuncCount[c]||0)/fcTotal) : 0;
      const oppB = strengths[OPP[b]] || 0; const oppC = strengths[OPP[c]] || 0;

      let s = 0;
      s += 0.60*sb + 0.40*sc;                 // primary use
      s += 0.15*db + 0.10*dc;                 // dimensional mastery
      s += 0.20*fcpB + 0.15*fcpC;             // forced-choice support
      s -= 0.10*Math.max(0, oppB - sb);       // conflict penalty vs opposite
      s -= 0.05*Math.max(0, oppC - sc);
      return s; // typical range ~ 1..6
    }

    const rawScores: Record<string, number> = {};
    for (const code of Object.keys(TYPE_MAP)) rawScores[code] = scoreType(code);

    // Absolute fit (0..100) – fixed linear map (cap/clamp for invariance)
    // Expected score range ~0..6.5; map: fit_abs = clamp(100 * s / 6.5)
    const fitAbs: Record<string, number> = {};
    for (const [code, s] of Object.entries(rawScores)) {
      const v = Math.max(0, Math.min(100, (s/6.5)*100));
      fitAbs[code] = Math.round(v*10)/10;
    }

    // Relative share% among all 16 (softmax or linear). We'll use softmax for nicer separation.
    const temp = 1.0; // temperature; 1.0 standard
    const exps = Object.fromEntries(Object.entries(rawScores).map(([k,v])=>[k, Math.exp(v/temp)]));
    const sumExp = Object.values(exps).reduce((a,b)=>a+b,0);
    const sharePct: Record<string, number> = {};
    for (const [k,v] of Object.entries(exps)) sharePct[k] = Math.round((v/sumExp)*1000)/10; // 0.1% precision

    // Rank & top3
    const top3 = Object.keys(TYPE_MAP).sort((a,b)=> fitAbs[b]-fitAbs[a]).slice(0,3);

    const type_scores: Record<string, any> = {};
    for (const code of Object.keys(TYPE_MAP)) type_scores[code] = { fit_abs: fitAbs[code], share_pct: sharePct[code] };

    // Dimensional highlights: coherent (type-congruent >=3D) vs unique (non-core >=3D)
    const coherent: string[] = []; const unique: string[] = [];
    const main = TYPE_MAP[top3[0]] || {base, creative};
    for (const f of FUNCS) {
      if ((dimensions[f]||0) >= 3) {
        if (f === main.base || f === main.creative) coherent.push(f); else unique.push(f);
      }
    }

    const dims_highlights = { coherent, unique };

    // Blocks (already computed as blockCount)
    const blocks = blockCount;

    // Save profile
    const payload = {
      user_id, session_id,
      type_code: `${typeCode}${overlay}`,
      base_func: base, creative_func: creative, overlay,
      strengths, dimensions, blocks,
      neuroticism: { raw_mean: nMean, z },
      validity, confidence,
      type_scores, top_types: top3, dims_highlights
    };

    const { error: perr } = await supabase.from("profiles").upsert(payload);
    if (perr) {
      console.error('Error saving profile', perr);
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to save profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: "success", profile: payload }), { 
      headers: { ...corsHeaders, "content-type":"application/json" } 
    });
  } catch (err) {
    console.error('score_prism error', err);
    return new Response(JSON.stringify({ status: 'error', error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
