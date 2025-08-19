// supabase/functions/score_prism/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// ---- helpers ----
function parseNum(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw).trim();
  const m = s.match(/^(\d+)/);                    // "7=Very High" -> 7
  if (m) return Number(m[1]);
  const L = s.toLowerCase();
  const map: Record<string, number> = {
    "strongly disagree":1, "disagree":2, "neutral":3, "agree":4, "strongly agree":5,
    "never":1, "rarely":2, "sometimes":3, "often":4, "always":5,
    "very low":1, "low":2, "slightly low":3, "slightly high":4, "high":5, "very high":5
  };
  return map[L] ?? null;
}
function reverseOnNative(v: number, scale: string): number {
  if (!Number.isFinite(v)) return v;
  if (scale === "LIKERT_1_7" || scale === "STATE_1_7") return 8 - v;
  if (scale === "LIKERT_1_5" || scale?.startsWith("CATEGORICAL") || scale === "FREQUENCY") return 6 - v;
  return v;
}
function toCommon5(v: number, scale: string): number {
  if (!Number.isFinite(v)) return 0;
  if (scale === "LIKERT_1_5" || scale?.startsWith("CATEGORICAL") || scale === "FREQUENCY") return v; // already 1..5
  if (scale === "LIKERT_1_7" || scale === "STATE_1_7") return 1 + (v - 1) * (4/6);                   // 1..7 -> 1..5
  return v;
}
const isJ = (x:string)=>["Ti","Te","Fi","Fe"].includes(x);
const isP = (x:string)=>["Ni","Ne","Si","Se"].includes(x);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ status:"error", error:"session_id required" }), { status:400, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ status:"error", error:"Server not configured" }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ---- load answers (with created_at for dedup) ----
    const { data: rawRows, error: aerr } = await supabase
      .from("assessment_responses")
      .select("id, question_id, answer_value, created_at")
      .eq("session_id", session_id);
    if (aerr) {
      console.error("Error fetching responses", aerr);
      return new Response(JSON.stringify({ status:"error", error:"Failed to fetch responses" }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    if (!rawRows || rawRows.length === 0) {
      return new Response(JSON.stringify({ status:"success", profile:{ empty:true } }), { headers:{...corsHeaders,"Content-Type":"application/json"}});
    }

    // dedup: keep latest per question
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
    const duplicateCount = (rawRows?.length ?? 0) - answers.length;

    // ---- key + config ----
    const { data: skey, error: kerr } = await supabase.from("assessment_scoring_key").select("*");
    if (kerr) {
      console.error("Error fetching scoring key", kerr);
      return new Response(JSON.stringify({ status:"error", error:"Failed to fetch scoring key" }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    const keyByQ: Record<string, any> = {};
    skey?.forEach((r:any)=> keyByQ[String(r.question_id)] = r);

    const cfg = async (k:string) => {
      const { data } = await supabase.from("scoring_config").select("value").eq("key", k).single();
      return data?.value ?? {};
    };
    const dimThresh      = await cfg("dim_thresholds");         // { one, two, three } on 1..5
    const neuroNorms     = await cfg("neuro_norms");            // { mean, sd } on 1..5
    const fcBlockDefault = await cfg("fc_block_map_default");
    const stateQids      = await cfg("state_qids");             // { stress:201, mood:202, sleep:203, time:204, focus:205 }

    // ---- aggregation buckets ----
    const likert: Record<string, number[]> = {};
    const dims:   Record<string, number[]> = {};
    const fcFuncCount: Record<string, number> = {};
    const blockCount: Record<string, number> = { Core:0, Critic:0, Hidden:0, Instinct:0 };
    const neuroVals: number[] = [];
    const pairs: Record<string, number[]> = {};
    let sdSum = 0, sdN = 0;

    // helper to read normalized 1..5 for a specific qid
    const getV5 = (qid: number | string): number | null => {
      const r = answers.find(x => String(x.question_id) === String(qid));
      if (!r) return null;
      const rec = keyByQ[String(qid)];
      if (!rec) return null;
      const scale = rec.scale_type as string;
      const raw = parseNum(r.answer_value);
      if (raw == null) return null;
      const vRev = rec.reverse_scored ? reverseOnNative(raw, scale) : raw;
      return toCommon5(vRev, scale);
    };

    // ---- pass 1: normalize + aggregate ----
    for (const row of answers) {
      const qid = String(row.question_id);
      const rec = keyByQ[qid]; if (!rec) continue;
      const scale = rec.scale_type as string;
      const tag   = rec.tag as (string | null);
      const pair  = rec.pair_group as (string | null);
      const sd    = !!rec.social_desirability;

      const raw = parseNum(row.answer_value);
      if (raw == null) continue;

      // reverse on native, then normalize to 1..5
      const v5 = toCommon5(rec.reverse_scored ? reverseOnNative(raw, scale) : raw, scale);

      // strength / dims / blocks
      if (tag === "N" || tag === "N_R") neuroVals.push(v5);
      else if (tag?.endsWith("_S")) { const f = tag.split("_")[0]; (likert[f] ||= []).push(v5); }
      else if (tag?.endsWith("_D")) { const f = tag.split("_")[0]; (dims[f]   ||= []).push(v5); }
      else if (["Core","Critic","Hidden","Instinct"].includes(tag || "")) blockCount[tag!] += v5;

      if (sd) { sdSum += v5; sdN += 1; }
      if (pair) (pairs[pair] ||= []).push(v5);

      // forced-choice mapping (function or block counts)
      if (scale?.startsWith("FORCED_CHOICE")) {
        const choice = String(row.answer_value).toUpperCase().trim();
        const map = rec.fc_map ?? (scale === "FORCED_CHOICE_4" ? fcBlockDefault : null);
        if (map && map[choice]) {
          const m = map[choice];
          if (["Core","Critic","Hidden","Instinct"].includes(m)) blockCount[m] = (blockCount[m] || 0) + 1;
          else if (FUNCS.includes(m)) fcFuncCount[m] = (fcFuncCount[m] || 0) + 1;
        }
      }
    }

    // ---- state modifiers (stress, time, sleep, focus) ----
    const sStress = stateQids?.stress ? getV5(stateQids.stress) : null;   // 1..5
    const sTime   = stateQids?.time   ? getV5(stateQids.time)   : null;
    const sSleep  = stateQids?.sleep  ? getV5(stateQids.sleep)  : null;
    const sFocus  = stateQids?.focus  ? getV5(stateQids.focus)  : null;

    let wLikertState = 1.0, wFCState = 1.0;
    const hi = (v:number|null)=> v!=null && v>=4.5;
    const lo = (v:number|null)=> v!=null && v<=2.5;
    if (hi(sStress) || hi(sTime) || lo(sSleep) || lo(sFocus)) {
      wLikertState = 0.85;   // down-weight Likert when state is noisy
      wFCState     = 1.15;   // up-weight FC/scenario support
    }

    // ---- strengths: dynamic Likert/FC blending with state (normalized 1..5) ----
    const strengths: Record<string, number> = {};
    const fcTotal = Object.values(fcFuncCount).reduce((a,b)=>a+b,0) || 0;
    const w_fc_base  = Math.min(0.5, (fcTotal / 12) * 0.5);
    const w_lik_base = 1 - w_fc_base;

    const w_fc     = w_fc_base * wFCState;
    const w_likert = w_lik_base * wLikertState;
    const norm     = (w_fc + w_likert) || 1;

    for (const f of FUNCS) {
      const L       = likert[f] || [];
      const meanL   = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0;   // 1..5
      const fcPct   = fcTotal ? ((fcFuncCount[f] || 0) / fcTotal) : 0;    // 0..1
      const fcScaled= 1 + fcPct * 4;                                      // 1..5
      const blended = (w_likert * meanL + w_fc * fcScaled) / norm;        // normalize
      strengths[f]  = Math.max(1, Math.min(5, Number.isFinite(blended) ? blended : 0)); // clamp 1..5
    }

    // ---- dimensions: map 1..5 avg -> 1..4 ----
    const mapDim = (avg:number)=>{
      if (!avg) return 0;
      if (avg <= dimThresh.one) return 1;
      if (avg <= dimThresh.two) return 2;
      if (avg <= dimThresh.three) return 3;
      return 4;
    };
    const dimensions: Record<string, number> = {};
    for (const f of FUNCS) {
      const L = dims[f] || [];
      const avg5 = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0;
      dimensions[f] = avg5 ? mapDim(avg5) : 0;
    }

    // ---- base & creative ----
    const sorted = [...FUNCS].sort((a,b)=>(strengths[b]||0)-(strengths[a]||0));
    let base = sorted[0];
    let creative = sorted.find(f => (isJ(f)&&isP(base)) || (isP(f)&&isJ(base))) || sorted[1];
    if ((dimensions[base]||0) < 3 && (dimensions[creative]||0) === 4) { const tmp = base; base = creative; creative = tmp; }

    const socMap: Record<string,string> = {
      "Te_Ni":"LIE","Ni_Te":"ILI","Fe_Si":"ESE","Si_Fe":"SEI",
      "Ti_Ne":"LII","Ne_Ti":"ILE","Fi_Se":"ESI","Se_Fi":"SEE",
      "Te_Si":"LSE","Si_Te":"SLI","Fe_Ni":"EIE","Ni_Fe":"IEI",
      "Ti_Se":"LSI","Se_Ti":"SLE","Fi_Ne":"EII","Ne_Fi":"IEE"
    };
    const typeCode = socMap[`${base}_${creative}`] ?? "UNK";

    // ---- neuro overlay ----
    const nMean = neuroVals.length ? neuroVals.reduce((a,b)=>a+b,0)/neuroVals.length : 0; // 1..5
    const sdSafe = neuroNorms.sd && Number(neuroNorms.sd) !== 0 ? Number(neuroNorms.sd) : 1;
    const z = (nMean - (neuroNorms.mean ?? 3)) / sdSafe;
    const overlay = z >= 0 ? "+" : "–";

    // ---- validity ----
    let inconsistency = 0, pc = 0;
    for (const k of Object.keys(pairs)) {
      const arr = pairs[k];
      if (arr.length === 2) { inconsistency += Math.abs(arr[0] - arr[1]); pc++; } // 1..5 scale
    }
    const inconsIdx = pc ? (inconsistency / pc) : 0;
    const sdIndex = sdN ? (sdSum / sdN) : 0;
    const validity = {
      attention: false,
      inconsistency: Number(inconsIdx.toFixed(3)),
      sd_index: Number(sdIndex.toFixed(3)),
      duplicates: duplicateCount,
      state_modifiers: { stress:sStress, time:sTime, sleep:sSleep, focus:sFocus }
    };
    let confidence: "High"|"Moderate"|"Low" = "High";
    if (validity.inconsistency >= 1.5 || validity.sd_index >= 4.6) confidence = "Low";
    else if (validity.inconsistency >= 1.0 || validity.sd_index >= 4.3) confidence = "Moderate";

    // ---- type likelihoods ----
    function scoreType(code:string){
      const { base: b, creative: c } = TYPE_MAP[code];
      const sb = strengths[b] || 0, sc = strengths[c] || 0;
      const db = (dimensions[b]||0), dc = (dimensions[c]||0);
      const fcTotalLocal = Object.values(fcFuncCount).reduce((a,b)=>a+b,0) || 0;
      const fcpB = fcTotalLocal ? ((fcFuncCount[b]||0)/fcTotalLocal) : 0;
      const fcpC = fcTotalLocal ? ((fcFuncCount[c]||0)/fcTotalLocal) : 0;
      const oppB = strengths[OPP[b]] || 0;
      const oppC = strengths[OPP[c]] || 0;
      let s = 0;
      s += 0.60 * sb + 0.40 * sc;   // primary use (unchanged)
      s += 0.18 * db + 0.12 * dc;   // ↑ dimensional mastery (was 0.15/0.10)
      s += 0.15 * fcpB + 0.10 * fcpC; // ↓ FC influence (was 0.20/0.15)
      s -= 0.10 * Math.max(0, oppB - sb);
      s -= 0.05 * Math.max(0, oppC - sc);
      return s;
    }
    const rawScores: Record<string, number> = {};
    for (const code of Object.keys(TYPE_MAP)) rawScores[code] = scoreType(code);
    // Map raw type score s (~1..6.5) to 0..100 without saturating
    function mapFitAbs(s: number): number {
      // Center near the top of typical range; slope tuned to avoid flatlining
      const v = 100 / (1 + Math.exp(-(s - 5.2) * 1.35));
      // Keep visible headroom so UI almost never shows 100
      return Math.round(Math.min(99.4, Math.max(0, v)) * 10) / 10;
    }

    const fitAbs: Record<string, number> = {};
    for (const [code, s] of Object.entries(rawScores)) {
      fitAbs[code] = mapFitAbs(s);
    }
    const temp = 1.0;
    const exps = Object.fromEntries(Object.entries(rawScores).map(([k,v])=>[k, Math.exp(v/temp)]));
    const sumExp = Object.values(exps).reduce((a,b)=>a+b,0);
    const sharePct: Record<string, number> = {};
    for (const [k,v] of Object.entries(exps)) sharePct[k] = Math.round((v/sumExp)*1000)/10;
    function coherentCountFor(code: string) {
      const t = TYPE_MAP[code];
      let c = 0;
      if ((dimensions[t.base] ?? 0) >= 3) c++;
      if ((dimensions[t.creative] ?? 0) >= 3) c++;
      return c;
    }

    const top3 = Object.keys(TYPE_MAP)
      .sort((a, b) =>
        (fitAbs[b] - fitAbs[a]) ||                 // 1) higher absolute fit first
        (sharePct[b] - sharePct[a]) ||             // 2) then higher relative share
        (coherentCountFor(b) - coherentCountFor(a))// 3) then more ≥3D on base/creative
      )
      .slice(0, 3);
    const type_scores: Record<string,{fit_abs:number; share_pct:number}> = {};
    for (const code of Object.keys(TYPE_MAP)) type_scores[code] = { fit_abs: fitAbs[code], share_pct: sharePct[code] };

    // ---- highlights & blocks ----
    const coherent: string[] = []; const unique: string[] = [];
    const main = TYPE_MAP[top3[0]] || { base, creative };
    for (const f of FUNCS) {
      if ((dimensions[f]||0) >= 3) {
        if (f === main.base || f === main.creative) coherent.push(f); else unique.push(f);
      }
    }
    const dims_highlights = { coherent, unique };

    const blocks = { ...blockCount };
    const bSum = (blocks.Core||0)+(blocks.Critic||0)+(blocks.Hidden||0)+(blocks.Instinct||0);
    const blocks_norm = bSum > 0 ? {
      Core: Math.round(blocks.Core / bSum * 1000)/10,
      Critic: Math.round(blocks.Critic / bSum * 1000)/10,
      Hidden: Math.round(blocks.Hidden / bSum * 1000)/10,
      Instinct: Math.round(blocks.Instinct / bSum * 1000)/10
    } : { Core:0, Critic:0, Hidden:0, Instinct:0 };

    // ---- save & return ----
    const payload = {
      version: "v2.5",
      user_id, session_id,
      type_code: `${typeCode}${overlay}`,
      base_func: base, creative_func: creative, overlay,
      strengths, dimensions,
      blocks, blocks_norm,
      neuroticism: { raw_mean: nMean, z },
      validity, confidence,
      type_scores, top_types: top3, dims_highlights
    };
    const { error: perr } = await supabase.from("profiles").upsert(payload);
    if (perr) {
      console.error("Error saving profile", perr);
      return new Response(JSON.stringify({ status:"error", error:"Failed to save profile" }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    
    // Telemetry for debugging
    console.log(JSON.stringify({
      evt:"score_summary",
      session_id,
      version:"v2.5",
      maxStrength: Math.max(...Object.values(strengths)),
      fitAbsMax: Math.max(...Object.values(type_scores).map(x=>x.fit_abs)),
      incons: validity.inconsistency,
      sd: validity.sd_index
    }));
    
    return new Response(JSON.stringify({ status:"success", profile: payload }), { headers:{...corsHeaders,"Content-Type":"application/json"}});
  } catch (err) {
    console.error("score_prism error", err);
    return new Response(JSON.stringify({ status:"error", error:String(err) }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
  }
});
