// supabase/functions/score_prism/index.ts - PRISM v1.1 Enhanced Scoring Engine
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

// Defensive value validation
function isValidForScale(value: number, scale: string): boolean {
  if (!Number.isFinite(value)) return false;
  if (scale === "LIKERT_1_5" || scale === "CATEGORICAL_5" || scale === "FREQUENCY") {
    return value >= 1 && value <= 5;
  }
  if (scale === "LIKERT_1_7" || scale === "STATE_1_7") {
    return value >= 1 && value <= 7;
  }
  return true; // Allow others through
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

    console.log(`evt:scoring_start,session_id:${session_id},version:v1.1`);

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
    let fcAnsweredCount = 0; // NEW: Track FC answer count
    let attentionFailed = 0; // NEW: Track attention check failures

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

      // Skip invalid values for scale type
      if (!isValidForScale(raw, scale)) continue;

      // reverse on native, then normalize to 1..5
      const v5 = toCommon5(rec.reverse_scored ? reverseOnNative(raw, scale) : raw, scale);

      // strength / dims / blocks
      if (tag === "N" || tag === "N_R") neuroVals.push(v5);
      else if (tag?.endsWith("_S")) { const f = tag.split("_")[0]; (likert[f] ||= []).push(v5); }
      else if (tag?.endsWith("_D")) { const f = tag.split("_")[0]; (dims[f]   ||= []).push(v5); }
      else if (["Core","Critic","Hidden","Instinct"].includes(tag || "")) blockCount[tag!] += v5;

      if (sd) { sdSum += v5; sdN += 1; }
      if (pair) (pairs[pair] ||= []).push(v5);

      // NEW: forced-choice mapping with numeric fallback and tracking
      if (scale?.startsWith("FORCED_CHOICE")) {
        fcAnsweredCount++; // Count FC answers
        const rawChoice = String(row.answer_value).trim().toUpperCase();
        // NEW: Map numeric inputs to letters as fallback
        const letterMap: Record<string, string> = {"1":"A","2":"B","3":"C","4":"D","5":"E"};
        const choice = letterMap[rawChoice] || rawChoice;
        
        const map = rec.fc_map ?? (scale === "FORCED_CHOICE_4" ? fcBlockDefault : null);
        if (map && map[choice]) {
          const m = map[choice];
          if (["Core","Critic","Hidden","Instinct"].includes(m)) blockCount[m] = (blockCount[m] || 0) + 1;
          else if (FUNCS.includes(m)) fcFuncCount[m] = (fcFuncCount[m] || 0) + 1;
        }
      }

      // NEW: Attention check tracking (simplified - check for extreme inconsistency)
      if (tag === "attention_check") {
        // This would need specific attention check logic based on your items
        // For now, using a placeholder
        if (v5 <= 2 || v5 >= 4) attentionFailed++;
      }
    }

    // NEW: Force FC intake - reject sessions with < 24 FC answers
    if (fcAnsweredCount < 24) {
      console.log(`evt:incomplete_fc,session_id:${session_id},fc_count:${fcAnsweredCount}`);
      
      // Update session status to incomplete_fc
      await supabase
        .from('assessment_sessions')
        .update({ status: 'incomplete_fc' })
        .eq('id', session_id);

      return new Response(JSON.stringify({ 
        status:"error", 
        error:"Insufficient forced-choice responses", 
        fc_answered: fcAnsweredCount,
        required: 24 
      }), { 
        status:400, 
        headers:{...corsHeaders,"Content-Type":"application/json"}
      });
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

    // ---- validity calculations ----
    let inconsistency = 0, pc = 0;
    for (const k of Object.keys(pairs)) {
      const arr = pairs[k];
      if (arr.length === 2) { inconsistency += Math.abs(arr[0] - arr[1]); pc++; } // 1..5 scale
    }
    const inconsIdx = pc ? (inconsistency / pc) : 0;
    const sdIndex = sdN ? (sdSum / sdN) : 0;

    // NEW: Dynamic weighting based on data quality
    let dynamicLikertWeight = 1.0;
    let dynamicFCWeight = 1.0;
    if (inconsIdx > 1.0 || sdIndex > 2.5) {
      dynamicLikertWeight = 0.85; // Reduce Likert weight by 15%
      dynamicFCWeight = 1.15;     // Increase FC weight by 15%
      console.log(`evt:dynamic_weighting,session_id:${session_id},inconsistency:${inconsIdx},sd_index:${sdIndex}`);
    }

    // ---- strengths: enhanced dynamic Likert/FC blending ----
    const strengths: Record<string, number> = {};
    const fcTotal = Object.values(fcFuncCount).reduce((a,b)=>a+b,0) || 0;
    const w_fc_base  = Math.min(0.5, (fcTotal / 12) * 0.5);
    const w_lik_base = 1 - w_fc_base;

    // Apply both state and quality-based dynamic weighting
    const w_fc     = w_fc_base * wFCState * dynamicFCWeight;
    const w_likert = w_lik_base * wLikertState * dynamicLikertWeight;
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

    // NEW: Enhanced validity status with tuned gates
    const validity = {
      attention: attentionFailed,
      inconsistency: Number(inconsIdx.toFixed(3)),
      sd_index: Number(sdIndex.toFixed(3)),
      duplicates: duplicateCount,
      state_modifiers: { stress:sStress, time:sTime, sleep:sSleep, focus:sFocus }
    };

    // NEW: Tuned validity gates (loosened SD band by +0.3, attention warning)
    let validityStatus = "pass";
    let confidence: "High"|"Moderate"|"Low" = "High";
    
    // Fail conditions (strict)
    if (validity.inconsistency >= 2.0 || validity.sd_index >= 5.2) { // Loosened SD from 4.9 to 5.2
      validityStatus = "fail";
      confidence = "Low";
    }
    // Warning conditions
    else if (validity.inconsistency >= 1.5 || validity.sd_index >= 4.9 || attentionFailed >= 2) { // Multiple attention fails = warning
      validityStatus = "warning";
      confidence = attentionFailed === 1 ? "Moderate" : "Low"; // Single attention fail = moderate
    }
    // Moderate confidence
    else if (validity.inconsistency >= 1.0 || validity.sd_index >= 4.3 || attentionFailed === 1) {
      confidence = "Moderate";
    }

    console.log(`evt:validity_check,session_id:${session_id},status:${validityStatus},confidence:${confidence},inconsistency:${inconsIdx},sd_index:${sdIndex},attention_failed:${attentionFailed}`);

    // ---- blocks (early for likelihood scoring) ----
    const blocks = { ...blockCount };
    const bSum = (blocks.Core||0)+(blocks.Critic||0)+(blocks.Hidden||0)+(blocks.Instinct||0);
    const blocks_norm = bSum > 0 ? {
      Core: Math.round(blocks.Core / bSum * 1000)/10,
      Critic: Math.round(blocks.Critic / bSum * 1000)/10,
      Hidden: Math.round(blocks.Hidden / bSum * 1000)/10,
      Instinct: Math.round(blocks.Instinct / bSum * 1000)/10
    } : { Core:0, Critic:0, Hidden:0, Instinct:0 };

    // ---- type likelihoods ----
    function scoreType(code:string){
      const { base: b, creative: c } = TYPE_MAP[code];

      const sb = strengths[b] || 0, sc = strengths[c] || 0;
      const db = (dimensions[b]||0), dc = (dimensions[c]||0);

      // Existing FC support from direct function hits
      const fcTotalLocal = Object.values(fcFuncCount).reduce((a:any,b:any)=>a as number + (b as number),0) || 0;
      const fcpB_raw = fcTotalLocal ? ((fcFuncCount[b]||0)/fcTotalLocal) : 0;
      const fcpC_raw = fcTotalLocal ? ((fcFuncCount[c]||0)/fcTotalLocal) : 0;

      // NEW: convert block distribution into soft support for B/C
      const blockSum = (blocks.Core||0)+(blocks.Hidden||0)+(blocks.Critic||0)+(blocks.Instinct||0) || 1;
      const coreP   = (blocks.Core   || 0) / blockSum;   // aligns with Base+Creative
      const hiddenP = (blocks.Hidden || 0) / blockSum;   // yearning → mild support
      const criticP = (blocks.Critic || 0) / blockSum;   // pain points → slight penalty

      // weights: tuneable; keep small so direct FC still leads
      const fcpB = Math.max(0, Math.min(1, fcpB_raw + 0.50*coreP + 0.25*hiddenP - 0.20*criticP));
      const fcpC = Math.max(0, Math.min(1, fcpC_raw + 0.50*coreP + 0.25*hiddenP - 0.20*criticP));

      // Opposite-function conflict
      const oppB = strengths[OPP[b]] || 0;
      const oppC = strengths[OPP[c]] || 0;

      let s = 0;
      s += 0.60 * sb + 0.40 * sc; // primary use
      s += 0.15 * db + 0.10 * dc; // dimensional mastery
      s += 0.20 * fcpB + 0.15 * fcpC; // FC + block-derived support (clamped 0..1)
      s -= 0.10 * Math.max(0, oppB - sb); // conflict penalty vs opposite
      s -= 0.05 * Math.max(0, oppC - sc);

      return s; // ~1..6 range before fit mapping
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

    // NEW: Calculate top_gap, close_call, fit_band
    const topFit = fitAbs[top3[0]] || 0;
    const secondFit = fitAbs[top3[1]] || 0;
    const topGap = topFit - secondFit;
    const closeCall = topGap < 5;
    const fitBand = topFit >= 60 ? "High" : topFit >= 40 ? "Moderate" : "Low";

    // NEW: Top-3 fit explainer data
    const top3Fits = top3.map(code => ({
      code,
      fit: fitAbs[code],
      share: sharePct[code]
    }));

    console.log(`evt:fit_calculation,session_id:${session_id},top_fit:${topFit},top_gap:${topGap},close_call:${closeCall},fit_band:${fitBand}`);

    // ---- highlights & blocks ----
    const coherent: string[] = []; const unique: string[] = [];
    const main = TYPE_MAP[top3[0]] || { base, creative };
    for (const f of FUNCS) {
      if ((dimensions[f]||0) >= 3) {
        if (f === main.base || f === main.creative) coherent.push(f); else unique.push(f);
      }
    }
    const dims_highlights = { coherent, unique };

    // ---- Session classification and save ----
    // Mark session as completed
    const { error: sessionUpdateError } = await supabase
      .from('assessment_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', session_id);

    if (sessionUpdateError) {
      console.error('Error updating session status:', sessionUpdateError);
    }

    // Get session data for classification
    const { data: currentSession } = await supabase
      .from('assessment_sessions')
      .select('email, user_id, started_at, ip_hash, ua_hash')
      .eq('id', session_id)
      .single();

    // Enhanced profile data with v1.1 fields
    const profileData = {
      session_id: session_id,
      user_id: user_id || currentSession?.user_id || null,
      type_code: typeCode,
      base_func: base,
      creative_func: creative,
      overlay: overlay,
      confidence: confidence,
      validity_status: validityStatus, // NEW
      top_gap: topGap, // NEW
      close_call: closeCall, // NEW
      fit_band: fitBand, // NEW
      fc_answered_ct: fcAnsweredCount, // NEW
      top_3_fits: top3Fits, // NEW
      fit_explainer: { // NEW
        dynamic_weights: { likert: w_likert, fc: w_fc },
        quality_metrics: { inconsistency: inconsIdx, sd_index: sdIndex },
        state_impact: wLikertState !== 1.0 || wFCState !== 1.0
      },
      strengths: strengths,
      dimensions: dimensions,
      blocks: blocks,
      blocks_norm: blocks_norm,
      neuroticism: { raw_mean: nMean, z: z },
      validity: validity,
      type_scores: type_scores,
      top_types: top3,
      dims_highlights: dims_highlights,
      version: "v1.1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert or update profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('session_id', session_id);
      if (updateError) console.error('Error updating profile:', updateError);
    } else {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);
      if (insertError) console.error('Error inserting profile:', insertError);
    }

    console.log(`evt:scoring_complete,session_id:${session_id},type:${typeCode}${overlay},confidence:${confidence},validity:${validityStatus},top_gap:${topGap}`);

    return new Response(JSON.stringify({ 
      status: "success", 
      profile: profileData 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Scoring error:", error);
    return new Response(JSON.stringify({ 
      status: "error", 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
