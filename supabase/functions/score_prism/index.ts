// supabase/functions/score_prism/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------- types & constants ----------------
type ScaleType = 'LIKERT_1_7'|'LIKERT_1_5'|'STATE_1_7'|'FORCED_CHOICE_4'|'AGREE_1_5'|'FREQ_1_7'|string;
type Tag = string | null;
interface ScoringKeyRecord {
  question_id: number | string;
  scale_type: ScaleType;
  tag: Tag;
  reverse_scored?: boolean;
  pair_group?: string | null;
  social_desirability?: boolean;
  fc_map?: Record<string,string>;
}

// Capability matrix presets
type PresetKey = "AGREE_1_5" | "FREQ_1_7" | "STATE_1_7";

const CAPABILITY_MAPS = {
  AGREE_1_5: ["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"],
  FREQ_1_7: ["Never","Rarely","Sometimes","About half the time","Often","Very often","Always"],
  STATE_1_7: ["Very Low","Low","Slightly Low","Neutral","Slightly High","High","Very High"],
} as const;

interface CapabilityConfig {
  item_id: string;
  capability_name: string;
  ability_preset: PresetKey;
  frequency_preset: PresetKey;
  energy_preset: PresetKey;
  w_ability: number;
  w_frequency: number;
  w_energy: number;
  function_crosswalk?: string;
}

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

// ---------------- helpers ----------------
const safeNum = (x: unknown, def=0) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : def;
};

async function loadScoringConfigs(supabase: SupabaseClient) {
  const keys = ["dim_thresholds","neuro_norms","fc_block_map_default"] as const;
  const results = await Promise.all(keys.map(async (k) => {
    const { data, error } = await supabase.from("scoring_config").select("value").eq("key", k).single();
    if (error) throw new Error(`Failed to load config: ${k}`);
    return [k, data?.value ?? {}] as const;
  }));
  return Object.fromEntries(results) as {
    dim_thresholds: { one:number; two:number; three:number };
    neuro_norms: { mean:number; sd:number };
    fc_block_map_default: Record<string,string>;
  };
}

const mapDim = (avg: number, t: {one:number; two:number; three:number}) => {
  if (!avg) return 0;
  if (avg <= t.one)   return 1;
  if (avg <= t.two)   return 2;
  if (avg <= t.three) return 3;
  return 4;
};

// --- additional helpers for config + identity hashing ---
async function getCfg(supabase: SupabaseClient, key: string): Promise<any> {
  const { data } = await supabase
    .from("scoring_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? {};
}

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  if (!u || !d) return e;
  const head = u[0] || "";
  return `${head}${u.length > 1 ? "***" : ""}@${d}`;
}

async function hashKey(input: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}|${input}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function scoreType(
  code: string,
  strengths: Record<string, number>,
  dimensions: Record<string, number>,
  fcFuncCount: Record<string, number>
) {
  const { base: b, creative: c } = TYPE_MAP[code];
  const sb = strengths[b] || 0, sc = strengths[c] || 0;
  const db = dimensions[b] || 0, dc = dimensions[c] || 0;
  const fcTotal = Object.values(fcFuncCount).reduce((a,b)=>a+b,0) || 0;
  const fcpB = fcTotal ? ((fcFuncCount[b] || 0) / fcTotal) : 0;
  const fcpC = fcTotal ? ((fcFuncCount[c] || 0) / fcTotal) : 0;
  const oppB = strengths[OPP[b]] || 0, oppC = strengths[OPP[c]] || 0;

  let s = 0;
  s += 0.60*sb + 0.40*sc;        // usage
  s += 0.15*db + 0.10*dc;        // dimensionality
  s += 0.20*fcpB + 0.15*fcpC;    // forced-choice support
  s -= 0.10*Math.max(0, oppB - sb); // conflict penalties
  s -= 0.05*Math.max(0, oppC - sc);
  return s; // ~1..6
}

// ---------------- capability scoring functions ----------------
function codeFromLabel(preset: PresetKey, labelOrNumber: string | number): number | null {
  if (typeof labelOrNumber === "number") return labelOrNumber;
  const idx = CAPABILITY_MAPS[preset].findIndex(l => l.toLowerCase() === labelOrNumber.toLowerCase());
  return idx >= 0 ? idx + 1 : null; // 1-based
}

function norm(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

function scoreGeneratingNovelOptions(input: {
  ability: string | number;
  frequency: string | number;
  energy: string | number;
  weights?: { ability?: number; frequency?: number; energy?: number };
}) {
  const wA = input.weights?.ability ?? 0.50;
  const wF = input.weights?.frequency ?? 0.35;
  const wE = input.weights?.energy ?? 0.15;

  const aNum = codeFromLabel("AGREE_1_5", input.ability);
  const fNum = codeFromLabel("FREQ_1_7", input.frequency);
  const eNum = codeFromLabel("STATE_1_7", input.energy);

  if ([aNum, fNum, eNum].some(v => v === null)) {
    return { ok: false, error: "Missing or unmappable label." };
  }

  const A = norm(aNum!, 1, 5); // 0..1
  const F = norm(fNum!, 1, 7); // 0..1
  const E = norm(eNum!, 1, 7); // 0..1 (intensity)

  const score = 100 * (wA * A + wF * F + wE * E);

  // Optional valence (keep for interpretation)
  const energyValence = (eNum! - 4) / 3; // -1..+1

  // Simple completeness-based confidence
  const answered = [aNum, fNum, eNum].filter(v => v !== null).length;
  const confidence = answered === 3 ? "High" : answered === 2 ? "Medium" : "Low";

  return {
    ok: true,
    score: Math.round(score * 10) / 10, // one decimal
    parts: { ability: aNum, frequency: fNum, energy: eNum },
    energyValence,
    confidence
  };
}

// Configuration for capability matrix questions
const CAPABILITY_CONFIGS: Record<string, CapabilityConfig> = {
  "247": { // Question ID for "Generating novel options"
    item_id: "CAP_GNO",
    capability_name: "Generating novel options",
    ability_preset: "AGREE_1_5",
    frequency_preset: "FREQ_1_7",
    energy_preset: "STATE_1_7",
    w_ability: 0.50,
    w_frequency: 0.35,
    w_energy: 0.15,
    function_crosswalk: "Ne"
  }
};

// ---------------- handler ----------------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: any = {};
  try { body = await req.json(); } catch { /* fallthrough */ }

  const user_id = body?.user_id;
  const session_id = body?.session_id;

  // Input validation: session_id required; user_id optional but must be string if present
  if (!session_id || typeof session_id !== "string" || session_id.trim() === "") {
    return new Response(JSON.stringify({ status:"error", error:"session_id required (non-empty string)" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
  if (user_id !== undefined && (typeof user_id !== "string" || user_id.trim() === "")) {
    return new Response(JSON.stringify({ status:"error", error:"Invalid user_id (must be a non-empty string if provided)" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }

  // Env
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ status:"error", error:"Missing configuration: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Structured start log
  console.log(JSON.stringify({ event:"profile_scoring_started", user_id, session_id }));

  try {
    // Parallel fetches
    const [
      { data: answers, error: aerr },
      { data: skey, error: kerr },
      cfgs
    ] = await Promise.all([
      supabase.from("assessment_responses").select("question_id, answer_value, answer_array").eq("session_id", session_id),
      supabase.from("assessment_scoring_key").select("*"),
      loadScoringConfigs(supabase)
    ]);

    if (aerr) {
      console.error("Responses fetch error:", aerr);
      throw new Error(`Failed to fetch responses: ${aerr.message}`);
    }
    if (!answers || answers.length === 0) {
      return new Response(JSON.stringify({ status:"success", profile:{ empty:true } }), {
        headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }
    if (kerr) {
      console.error("Scoring key fetch error:", kerr);
      throw new Error(`Failed to fetch scoring key: ${kerr.message}`);
    }

    const { dim_thresholds, neuro_norms, fc_block_map_default } = cfgs;
    const keyByQ: Record<string, ScoringKeyRecord> = {};
    (skey || []).forEach((r: any) => keyByQ[String(r.question_id)] = r as ScoringKeyRecord);

    // Aggregation buckets
    const likert: Record<string, number[]> = {};
    const dims: Record<string, number[]> = {};
    const fcFuncCount: Record<string, number> = {};
    const blockCount: Record<"Core"|"Critic"|"Hidden"|"Instinct", number> = { Core:0, Critic:0, Hidden:0, Instinct:0 };
    const neuroVals: number[] = [];
    const pairs: Record<string, number[]> = {};
    let sdSum = 0, sdN = 0;
    
    // Capability matrix results storage
    const capabilityResults: Record<string, any> = {};

    // Pass 1: aggregate
    for (const ans of answers) {
      const qid = String(ans.question_id);
      const rec = keyByQ[qid]; if (!rec) continue;

      const scale = String(rec.scale_type);
      const tag = rec.tag as Tag;
      const reverse = !!rec.reverse_scored;
      const pgroup = rec.pair_group as (string | null);
      const sd = !!rec.social_desirability;
      const atext = String(ans.answer_value).trim();

      if (scale.startsWith("LIKERT") || scale === "STATE_1_7") {
        let v = safeNum(atext);
        if (reverse && scale === "LIKERT_1_7") v = 8 - v;
        if (reverse && scale === "LIKERT_1_5") v = 6 - v;

        if (tag === "N" || tag === "N_R") neuroVals.push(v);
        else if (tag?.endsWith("_S")) { const f = tag.split("_")[0]; (likert[f] ||= []).push(v); }
        else if (tag?.endsWith("_D")) { const f = tag.split("_")[0]; (dims[f]   ||= []).push(v); }
        else if (["Core","Critic","Hidden","Instinct"].includes(tag || "")) blockCount[tag as keyof typeof blockCount] += v;

        if (sd) { sdSum += v; sdN += 1; }
        if (pgroup) { (pairs[pgroup] ||= []).push(v); }
      }

      if (scale.startsWith("FORCED_CHOICE")) {
        const choice = atext.toUpperCase();
        const map = rec.fc_map ?? (scale === "FORCED_CHOICE_4" ? fc_block_map_default : null);
        if (map && map[choice]) {
          const m = map[choice];
          if (["Core","Critic","Hidden","Instinct"].includes(m)) {
            blockCount[m as keyof typeof blockCount] = (blockCount[m as keyof typeof blockCount] || 0) + 1;
          } else if (FUNCS.includes(m as any)) {
            fcFuncCount[m] = (fcFuncCount[m] || 0) + 1;
          }
        }
      }

      // Process capability matrix questions
      if (CAPABILITY_CONFIGS[qid] && ans.answer_array) {
        const config = CAPABILITY_CONFIGS[qid];
        const matrixAnswers = ans.answer_array as string[];
        
        if (matrixAnswers.length >= 3) {
          const result = scoreGeneratingNovelOptions({
            ability: matrixAnswers[0],
            frequency: matrixAnswers[1], 
            energy: matrixAnswers[2],
            weights: {
              ability: config.w_ability,
              frequency: config.w_frequency,
              energy: config.w_energy
            }
          });

          if (result.ok) {
            capabilityResults[config.item_id] = {
              score: result.score,
              parts_ability: result.parts.ability,
              parts_frequency: result.parts.frequency,
              parts_energy: result.parts.energy,
              energy_valence: result.energyValence,
              confidence: result.confidence
            };
          }
        }
      }
    }

    // Strengths (1..5), blended with FC
    const strengths: Record<string, number> = {};
    const fcTotal = Object.values(fcFuncCount).reduce((a,b)=>a+b,0) || 0;
    for (const f of FUNCS) {
      const L = likert[f] || [];
      const meanL = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0; // 1..5
      const fcPct = fcTotal ? ((fcFuncCount[f] || 0) / fcTotal) : 0; // 0..1
      const fcScaled = 1 + fcPct*4;                                   // 1..5
      const hasFC = fcTotal > 0 && fcFuncCount[f] !== undefined;
      strengths[f] = hasFC ? (meanL*0.5 + fcScaled*0.5) : meanL;
    }

// Dimensions (1..4) with optional person-mean centering + coherence gate
const dimCenterCfg = await getCfg(supabase, "dim_centering"); // { enabled:boolean, lambda:number }
const gateCfg = await getCfg(supabase, "dim_coherence_gate"); // { min_strength_for_3D:number }
const lambda = Number(dimCenterCfg?.lambda ?? 0.75);

// 1) compute raw averages 1..5
const dimAvgRaw: Record<string, number> = {};
let allDsum = 0, allDn = 0;
for (const f of FUNCS) {
  const L = dims[f] || [];
  const avg = L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0;
  dimAvgRaw[f] = avg;
  if (avg) { allDsum += avg; allDn++; }
}

// 2) optional person-mean centering: shrink toward 3
const dimAdj: Record<string, number> = {};
const globalMeanD = allDn ? (allDsum / allDn) : 0;
for (const f of FUNCS) {
  const raw = dimAvgRaw[f] || 0;
  if (dimCenterCfg?.enabled && globalMeanD) {
    const centered = 3 + (raw - globalMeanD) * lambda;
    dimAdj[f] = Math.max(1, Math.min(5, centered));
  } else {
    dimAdj[f] = raw;
  }
}

// 3) map to 1..4 cutpoints
const dimensions: Record<string, number> = {};
for (const f of FUNCS) {
  const avg = dimAdj[f];
  let d = avg ? mapDim(avg, dim_thresholds) : 0;
  // 4) coherence gate for >=3D
  const minS = Number(gateCfg?.min_strength_for_3D ?? 3.0);
  const s = strengths[f] || 0;
  dimensions[f] = (d >= 3 && s < minS) ? 2 : d;
}

    // Base & Creative selection
    const sortedFuncs = [...FUNCS].sort((a,b)=> (strengths[b]||0) - (strengths[a]||0));
    const isJ = (x:string)=> ["Ti","Te","Fi","Fe"].includes(x);
    const isP = (x:string)=> ["Ni","Ne","Si","Se"].includes(x);
    let base = sortedFuncs[0];
    let creative = sortedFuncs.find(f => (isJ(f) && isP(base)) || (isP(f) && isJ(base))) || sortedFuncs[1];
    if ((dimensions[base]||0) < 3 && (dimensions[creative]||0) === 4) { const swap = base; base = creative; creative = swap; }

    // Socionics code
    const pair = `${base}_${creative}`;
    const socMap: Record<string,string> = {
      "Te_Ni":"LIE","Ni_Te":"ILI","Fe_Si":"ESE","Si_Fe":"SEI",
      "Ti_Ne":"LII","Ne_Ti":"ILE","Fi_Se":"ESI","Se_Fi":"SEE",
      "Te_Si":"LSE","Si_Te":"SLI","Fe_Ni":"EIE","Ni_Fe":"IEI",
      "Ti_Se":"LSI","Se_Ti":"SLE","Fi_Ne":"EII","Ne_Fi":"IEE"
    };
    const typeCode = socMap[pair] ?? "UNK";

    // Neuro overlay (guard sd=0)
    const nMean = neuroVals.length ? neuroVals.reduce((a,b)=>a+b,0)/neuroVals.length : 0;
    const sdSafe = (neuro_norms.sd && Number(neuro_norms.sd) !== 0) ? Number(neuro_norms.sd) : 1;
    const z = (nMean - (neuro_norms.mean ?? 4)) / sdSafe;
    const overlay = z >= 0 ? "+" : "–";

    // Validity & confidence
    let inconsistency = 0, pc = 0;
    for (const k of Object.keys(pairs)) {
      const arr = pairs[k];
      if (arr.length === 2) { inconsistency += Math.abs(arr[0] - arr[1]); pc++; }
    }
    const inconsIdx = pc ? (inconsistency/pc) : 0;
    const sdIndex   = sdN ? (sdSum/sdN) : 0;
    const validity = { attention:false, inconsistency: Number(inconsIdx.toFixed(3)), sd_index: Number(sdIndex.toFixed(3)) };
    let confidence: "High"|"Moderate"|"Low" = "High";
    if (validity.inconsistency >= 1.5 || validity.sd_index >= 4.6) confidence = "Low";
    else if (validity.inconsistency >= 1.0 || validity.sd_index >= 4.3) confidence = "Moderate";

    // Type likelihoods (absolute fit + relative share)
    const rawScores: Record<string, number> = {};
    for (const code of Object.keys(TYPE_MAP)) rawScores[code] = scoreType(code, strengths, dimensions, fcFuncCount);

    const fitAbs: Record<string, number> = {};
    for (const [code, s] of Object.entries(rawScores)) {
      const v = Math.max(0, Math.min(100, (s/6.5)*100)); // invariant 0..100
      fitAbs[code] = Math.round(v*10)/10;
    }
    const temp = 1.0;
    const exps = Object.fromEntries(Object.entries(rawScores).map(([k,v])=>[k, Math.exp(v/temp)]));
    const sumExp = Object.values(exps).reduce((a,b)=>a+b,0);
    const sharePct: Record<string, number> = {};
    for (const [k,v] of Object.entries(exps)) sharePct[k] = Math.round((v/sumExp)*1000)/10;

    const top3 = Object.keys(TYPE_MAP).sort((a,b)=> fitAbs[b]-fitAbs[a]).slice(0,3);
    const type_scores: Record<string, { fit_abs:number; share_pct:number }> = {};
    for (const code of Object.keys(TYPE_MAP)) type_scores[code] = { fit_abs: fitAbs[code], share_pct: sharePct[code] };

    // Dimensional highlights
    const coherent: string[] = [];
    const unique: string[] = [];
    const main = TYPE_MAP[top3[0]] || { base, creative };
    for (const f of FUNCS) {
      if ((dimensions[f]||0) >= 3) {
        if (f === main.base || f === main.creative) coherent.push(f); else unique.push(f);
      }
    }
    const dims_highlights = { coherent, unique };

    // Blocks (raw + normalized)
    const blocks = { ...blockCount };
    const bSum = (blocks.Core||0)+(blocks.Critic||0)+(blocks.Hidden||0)+(blocks.Instinct||0);
    const blocks_norm = bSum>0 ? {
      Core: Math.round((blocks.Core/bSum)*1000)/10,
      Critic: Math.round((blocks.Critic/bSum)*1000)/10,
      Hidden: Math.round((blocks.Hidden/bSum)*1000)/10,
      Instinct: Math.round((blocks.Instinct/bSum)*1000)/10
    } : { Core:0, Critic:0, Hidden:0, Instinct:0 };

// --- Retest linking: derive person_key/email from responses; find previous run; compute deltas
let person_key: string | null = null;
let email_mask: string | null = null;
let run_index = 1;
let prev: string | null = null;
let baseline: string | null = null;
let deltas: any = null;

try {
  const emailCfg = await getCfg(supabase, "dashboard_email_qid"); // { id: number }
  const saltCfg = await getCfg(supabase, "hash_salt"); // { value: string }
  let emailRaw = "";
  for (const a of (answers || [])) {
    if (String(a.question_id) === String(emailCfg?.id)) {
      emailRaw = String(a.answer_value ?? "").trim();
      break;
    }
  }
  if (emailRaw) {
    const norm = normalizeEmail(emailRaw);
    person_key = await hashKey(norm, String(saltCfg?.value || "default_salt"));
    email_mask = maskEmail(norm);
  }

  if (person_key) {
    const { data: prior } = await supabase
      .from("profiles")
      .select("session_id, created_at")
      .eq("person_key", person_key)
      .order("created_at", { ascending: true });

    if (prior && prior.length > 0) {
      baseline = prior[0].session_id;
      const last = prior[prior.length - 1];
      prev = last.session_id;
      run_index = prior.length + 1;
    }

    if (prev) {
      const { data: pprev } = await supabase
        .from("profiles")
        .select("type_code, strengths, dimensions, neuroticism, overlay")
        .eq("session_id", prev)
        .single();

      if (pprev) {
        const d_strengths: Record<string, number> = {};
        const d_dimensions: Record<string, number> = {};
        for (const f of FUNCS) {
          d_strengths[f] = Number(((strengths[f] || 0) - (pprev.strengths?.[f] || 0)).toFixed(3));
          d_dimensions[f] = (dimensions[f] || 0) - (pprev.dimensions?.[f] || 0);
        }

        // optional state reasons if configured
        const stateCfg = await getCfg(supabase, "state_qids");
        const reasons: string[] = [];
        let stateMap: Record<string, number> = {};
        let statePrev: Record<string, number> = {};
        if (stateCfg && Object.keys(stateCfg).length) {
          const ids = Object.values(stateCfg).map((v: any) => Number(v));
          const { data: curS } = await supabase
            .from("assessment_responses")
            .select("question_id, answer_value")
            .eq("session_id", session_id)
            .in("question_id", ids);
          curS?.forEach((r: any) => {
            const k = Object.keys(stateCfg).find((k) => String((stateCfg as any)[k]) === String(r.question_id));
            if (k) stateMap[k] = Number(r.answer_value);
          });
          const { data: prevS } = await supabase
            .from("assessment_responses")
            .select("question_id, answer_value")
            .eq("session_id", prev)
            .in("question_id", ids);
          prevS?.forEach((r: any) => {
            const k = Object.keys(stateCfg).find((k) => String((stateCfg as any)[k]) === String(r.question_id));
            if (k) statePrev[k] = Number(r.answer_value);
          });
        }

        const d_neuro = {
          mean: Number((nMean - (pprev.neuroticism?.raw_mean ?? 0)).toFixed(3)),
          z: Number((z - (pprev.neuroticism?.z ?? 0)).toFixed(3)),
          overlay_from: pprev.overlay || null,
          overlay_to: overlay
        };
        if (Math.abs(d_neuro.z) >= 0.5) reasons.push("Shift in neuroticism likely influenced expression.");
        if (stateMap.stress && statePrev.stress && (stateMap.stress - statePrev.stress) >= 2)
          reasons.push("Higher situational stress increased reactive patterns.");
        if (stateMap.sleep && statePrev.sleep && (statePrev.sleep - stateMap.sleep) >= 2)
          reasons.push("Worse sleep likely reduced consistency.");
        const biggest = [...FUNCS]
          .map((f) => ({ f, dv: Math.abs(d_strengths[f]) }))
          .sort((a, b) => b.dv - a.dv)[0];
        if (biggest && biggest.dv >= 0.8) reasons.push(`Largest functional shift in ${biggest.f}.`);

        deltas = {
          strengths: d_strengths,
          dimensions: d_dimensions,
          neuro: d_neuro,
          type: { from: pprev.type_code || null, to: `${typeCode}${overlay}` },
          reasons
        };
      }
    }
  }
} catch (e) {
  console.warn("Retest linking/deltas skipped:", e?.message || String(e));
}

const payload: any = {
  version: "v2.2",
  session_id,
  ...(user_id ? { user_id } : {}),
  type_code: `${typeCode}${overlay}`,
  base_func: base,
  creative_func: creative,
  overlay,
  strengths,
  dimensions,
  blocks,
  blocks_norm,
  neuroticism: { raw_mean: nMean, z },
  validity,
  confidence,
  type_scores,
  top_types: top3,
  dims_highlights,
  // capability matrix results
  capabilities: capabilityResults,
  // new linkage fields
  ...(person_key ? { person_key } : {}),
  ...(email_mask ? { email_mask } : {}),
  ...(baseline ? { baseline_session_id: baseline } : { baseline_session_id: run_index === 1 ? session_id : null }),
  prev_session_id: prev,
  run_index,
  ...(deltas ? { deltas } : {})
};

    // Save
    const { error: perr } = await supabase.from("profiles").upsert(payload);
    if (perr) {
      console.error("Error saving profile:", perr);
      throw new Error("Failed to save profile");
    }

    // Structured done log
    console.log(JSON.stringify({
      event:"profile_scoring_completed",
      session_id, user_id,
      type_code: payload.type_code,
      top1: top3[0], confidence
    }));

    return new Response(JSON.stringify({ status:"success", profile: payload }), {
      headers: { ...corsHeaders, "Content-Type":"application/json" }
    });

  } catch (err: any) {
    console.error("score_prism error:", err?.message || String(err));
    return new Response(JSON.stringify({ status:"error", error: String(err?.message || err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
});