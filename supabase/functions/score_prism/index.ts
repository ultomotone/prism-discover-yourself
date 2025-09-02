// supabase/functions/score_prism/index.ts - PRISM v1.2.0 Enhanced Scoring Engine - Phase 3
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PrismCalibration } from "../_shared/calibration.ts";
import Ajv from "https://esm.sh/ajv@8";
// Phase 3: Import validation utilities
import { validateJSON, validateFCMap, validateMeta, sanitizeResponseValue } from "./validateJSON.ts";

const FUNCS = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"] as const;
const OPP: Record<string,string> = { Ti:"Fe", Fe:"Ti", Te:"Fi", Fi:"Te", Ni:"Se", Se:"Ni", Ne:"Si", Si:"Ne" };

// Type prototypes with 8-function Model A positions
type TypeCode = "LIE"|"ILI"|"ESE"|"SEI"|"LII"|"ILE"|"ESI"|"SEE"|"LSE"|"SLI"|"EIE"|"IEI"|"LSI"|"SLE"|"EII"|"IEE";
type Func = "Ti"|"Te"|"Fi"|"Fe"|"Ni"|"Ne"|"Si"|"Se";
type Block = "base"|"creative"|"role"|"vulnerable"|"mobilizing"|"suggestive"|"ignoring"|"demonstrative";

// Fallback prototypes (matches database seeded data)
const FALLBACK_PROTOTYPES: Record<TypeCode, Record<Func, Block>> = {
  LIE: { Te:"base", Ni:"creative", Se:"role", Fi:"vulnerable", Ti:"mobilizing", Ne:"suggestive", Si:"ignoring", Fe:"demonstrative" },
  ILI: { Ni:"base", Te:"creative", Fi:"role", Se:"vulnerable", Ne:"mobilizing", Ti:"suggestive", Fe:"ignoring", Si:"demonstrative" },
  ESE: { Fe:"base", Si:"creative", Ne:"role", Ti:"vulnerable", Fi:"mobilizing", Ni:"suggestive", Te:"ignoring", Se:"demonstrative" },
  SEI: { Si:"base", Fe:"creative", Ti:"role", Ne:"vulnerable", Ni:"mobilizing", Fi:"suggestive", Se:"ignoring", Te:"demonstrative" },
  LII: { Ti:"base", Ne:"creative", Ni:"role", Fe:"vulnerable", Te:"mobilizing", Si:"suggestive", Fi:"ignoring", Se:"demonstrative" },
  ILE: { Ne:"base", Ti:"creative", Fe:"role", Ni:"vulnerable", Si:"mobilizing", Te:"suggestive", Se:"ignoring", Fi:"demonstrative" },
  ESI: { Fi:"base", Se:"creative", Ni:"role", Te:"vulnerable", Fe:"mobilizing", Ne:"suggestive", Ti:"ignoring", Si:"demonstrative" },
  SEE: { Se:"base", Fi:"creative", Te:"role", Ni:"vulnerable", Ne:"mobilizing", Fe:"suggestive", Si:"ignoring", Ti:"demonstrative" },
  LSE: { Te:"base", Si:"creative", Se:"role", Fi:"vulnerable", Ti:"mobilizing", Ne:"suggestive", Ni:"ignoring", Fe:"demonstrative" },
  SLI: { Si:"base", Te:"creative", Fi:"role", Se:"vulnerable", Ni:"mobilizing", Ti:"suggestive", Fe:"ignoring", Ne:"demonstrative" },
  EIE: { Fe:"base", Ni:"creative", Ne:"role", Ti:"vulnerable", Fi:"mobilizing", Si:"suggestive", Te:"ignoring", Se:"demonstrative" },
  IEI: { Ni:"base", Fe:"creative", Ti:"role", Ne:"vulnerable", Si:"mobilizing", Fi:"suggestive", Se:"ignoring", Te:"demonstrative" },
  LSI: { Ti:"base", Se:"creative", Ni:"role", Fe:"vulnerable", Te:"mobilizing", Ne:"suggestive", Fi:"ignoring", Si:"demonstrative" },
  SLE: { Se:"base", Ti:"creative", Fe:"role", Ni:"vulnerable", Ne:"mobilizing", Te:"suggestive", Si:"ignoring", Fi:"demonstrative" },
  EII: { Fi:"base", Ne:"creative", Ni:"role", Te:"vulnerable", Fe:"mobilizing", Si:"suggestive", Se:"ignoring", Ti:"demonstrative" },
  IEE: { Ne:"base", Fi:"creative", Te:"role", Ni:"vulnerable", Si:"mobilizing", Fe:"suggestive", Se:"ignoring", Ti:"demonstrative" }
};

// Dynamic prototypes loaded from database (fallback to hardcoded)
let TYPE_PROTOTYPES = FALLBACK_PROTOTYPES;

// Block weights for prototype scoring
const BLOCK_WEIGHTS: Record<Block, number> = {
  base: 1.00,
  creative: 0.70,
  demonstrative: 0.45,
  ignoring: 0.35,
  role: 0.25,
  mobilizing: 0.25,
  suggestive: 0.20,
  vulnerable: 0.10
};

const SCORING_WEIGHTS = {
  dim: 0.10,
  fc: 0.10,
  penaltyOpp: 0.20
};

// Valid base-creative combinations (Model A enforcement)
const VALID_CREATIVES_BY_BASE: Record<Func, Func[]> = {
  Ne: ["Ti", "Fi"],
  Ni: ["Te", "Fe"],
  Se: ["Ti", "Fi"],
  Si: ["Te", "Fe"],
  Ti: ["Ne", "Se"],
  Te: ["Ni", "Si"],
  Fi: ["Ne", "Se"],
  Fe: ["Ni", "Si"]
};

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
// Hard-locked parser to known synonyms + numeric capture (1..5 only)
function parseNum(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw);
  const m = s.match(/^(\d+)/); // e.g. "7=Very High" -> 7
  if (m) return Number(m[1]);
  const L = s.toLowerCase().trim();
  const map: Record<string, number> = {
    // agreement
    "strongly disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly agree": 5,
    // frequency
    "never": 1, "rarely": 2, "sometimes": 3, "often": 4, "always": 5,
    // intensity
    "very low": 1, "low": 2, "slightly low": 2, "moderate": 3, "slightly high": 4, "high": 4, "very high": 5
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
    // Phase 3: Enhanced partial-session handling with robust JSON validation
    const requestBody = await req.json().catch(() => ({}));
    const { user_id, session_id, debug, partial_session = false, force_recompute = false } = requestBody;
    const debugMode = !!debug;
    
    if (!session_id || typeof session_id !== 'string') {
      return new Response(JSON.stringify({ status:"error", error:"Valid session_id required" }), { status:400, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ status:"error", error:"Server not configured" }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const calibration = new PrismCalibration(supabase);

    console.log(`evt:scoring_start,session_id:${session_id},version:v1.2.0`);

    // ---- Load type prototypes from database ----
    try {
      const { data: prototypeData, error: protoErr } = await supabase
        .from('type_prototypes')
        .select('type_code, func, block');
      
      if (protoErr) {
        console.warn(`evt:prototype_load_error,session_id:${session_id},error:${protoErr.message}`);
      } else if (prototypeData && prototypeData.length > 0) {
        const dbPrototypes: Record<TypeCode, Record<Func, Block>> = {} as Record<TypeCode, Record<Func, Block>>;
        
        // Group by type_code and build structure
        for (const row of prototypeData) {
          const { type_code, func, block } = row;
          if (!dbPrototypes[type_code as TypeCode]) {
            dbPrototypes[type_code as TypeCode] = {} as Record<Func, Block>;
          }
          dbPrototypes[type_code as TypeCode][func as Func] = block as Block;
        }
        
        // Only use database data if complete (all 16 types with 8 functions each)
        const expectedSize = 16 * 8; // 16 types × 8 functions
        const actualSize = Object.values(dbPrototypes).reduce((sum, type) => sum + Object.keys(type).length, 0);
        
        if (actualSize === expectedSize) {
          TYPE_PROTOTYPES = dbPrototypes;
          console.log(`evt:prototypes_loaded_db,session_id:${session_id},count:${actualSize}`);
        } else {
          console.warn(`evt:prototypes_incomplete_fallback,session_id:${session_id},expected:${expectedSize},actual:${actualSize}`);
        }
      }
    } catch (error) {
      console.warn(`evt:prototype_load_exception,session_id:${session_id},error:${error.message}`);
    }

    // ---- load answers (with created_at for dedup) ----
    const { data: rawRows, error: aerr } = await supabase
      .from("assessment_responses")
      .select("id, question_id, answer_value, created_at")
      .eq("session_id", session_id);
    if (aerr) {
      console.error("Error fetching responses", aerr);
      return new Response(JSON.stringify({ status:"error", error:"Failed to fetch responses" }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"}});
    }
    // Phase 3: Enhanced partial session handling
    if (!rawRows || rawRows.length === 0) {
      if (partial_session) {
        console.log(`evt:partial_session_empty,session_id:${session_id}`);
        return new Response(JSON.stringify({ 
          status: "partial", 
          profile: { empty: true, partial_session: true },
          message: "No responses yet - continue assessment"
        }), { headers:{...corsHeaders,"Content-Type":"application/json"}});
      }
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
    // Phase 3: Enhanced JSON schema validation for scoring key
    const keyByQ: Record<string, any> = {};
    skey?.forEach((r:any)=> {
      try {
        // Validate and sanitize JSON fields
        const sanitizedRecord = {
          ...r,
          fc_map: validateJSON(r.fc_map, 'fc_map'),
          meta: validateJSON(r.meta, 'meta', {})
        };
        keyByQ[String(r.question_id)] = sanitizedRecord;
      } catch (error) {
        console.warn(`evt:scoring_key_validation_error,session_id:${session_id},question_id:${r.question_id},error:${error.message}`);
        keyByQ[String(r.question_id)] = { ...r, fc_map: null, meta: {} }; // Safe fallback
      }
    });

    const cfg = async (k: string) => {
      const { data } = await supabase.from("scoring_config").select("value").eq("key", k).maybeSingle();
      return data?.value ?? null;
    };
    const resultsVersion = (await cfg("results_version")) || "v1.1.2";
    let dimThresh: any = (await cfg("dim_thresholds")) || { one: 2.1, two: 3.0, three: 3.8 };
    const neuroNorms: any = (await cfg("neuro_norms")) || { mean: 3, sd: 1 };
    const fcBlockDefault: any = await cfg("fc_block_map_default");
    const stateQids: any = await cfg("state_qids");           // { stress,time,sleep,focus }
    const fcExpectedMinCfg: any = await cfg("fc_expected_min");
    const fcExpectedMin: number = typeof fcExpectedMinCfg === 'number' ? fcExpectedMinCfg : 24;
    const softmaxTempCfg: any = await cfg("softmax_temp");
    const softmaxTemp: number = typeof softmaxTempCfg === 'number' ? softmaxTempCfg : 1.0;
    const confParams: any = (await cfg("conf_raw_params")) || { a: 0.25, b: 0.35, c: 0.20 };
    const bandCuts: any = (await cfg("conf_band_cuts")) || { high: 0.75, moderate: 0.55 };
    const requiredTags: string[] = (await cfg("required_question_tags")) || [];
    const attentionQids: number[] = Array.isArray(await cfg("attention_qids")) ? await cfg("attention_qids") : null;
    // Phase 4: Fit band thresholds from config
    const fitBandCfg: any = await cfg("fit_band_thresholds");
    const fitBandThresholds = fitBandCfg || { high_fit: 60, moderate_fit: 45, high_gap: 5, moderate_gap: 2 };
    // System status gate
    const sys = (await cfg("system_status")) || { status: "ok" };
    if (sys.status && String(sys.status).toLowerCase() !== "ok" && !debugMode) {
      return new Response(JSON.stringify({
        status: "maintenance",
        message: sys.message || "Scoring temporarily paused. Please try again soon."
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    if (!dimThresh || dimThresh.one == null || dimThresh.two == null || dimThresh.three == null) {
      dimThresh = { one: 2.1, two: 3.0, three: 3.8 };
      console.log(`evt:dim_defaulted,session_id:${session_id}`);
      // ensure config exists with defaults
      await supabase.from('scoring_config').upsert({ key: 'dim_thresholds', value: dimThresh });
    }

    // ---- aggregation buckets ----
    const likert: Record<string, number[]> = {};
    const dims:   Record<string, number[]> = {};
    const fcFuncCount: Record<string, number> = {};
    const blockLikertCount: Record<string, number> = { Core:0, Critic:0, Hidden:0, Instinct:0 };
    const blockFCCount: Record<string, number> = { Core:0, Critic:0, Hidden:0, Instinct:0 };
    const neuroVals: number[] = [];
    const pairs: Record<string, number[]> = {};
    let sdSum = 0, sdN = 0;
    let fcAnsweredCount = 0;
    let attentionFailed = 0;

    // NEW: Try to load FC scores from the new fc_scores table first
    const { data: fcScores } = await supabase
      .from('fc_scores')
      .select('scores_json, blocks_answered')
      .eq('session_id', session_id)
      .eq('version', 'v1.1')
      .eq('fc_kind', 'functions')
      .maybeSingle();

    let usedRealFCScores = false;
    if (fcScores && fcScores.scores_json) {
      console.log(`evt:fc_scores_loaded,session_id:${session_id},blocks:${fcScores.blocks_answered}`);
      
      // Use real FC scores (already normalized 0-100)
      const realFCScores = fcScores.scores_json as Record<string, number>;
      fcAnsweredCount = fcScores.blocks_answered || 0;
      usedRealFCScores = true;
      
      // Convert 0-100 scores to counts (approximate for compatibility)
      for (const func of FUNCS) {
        const score = realFCScores[func] || 0;
        // Ensure minimum of 1 to avoid zeros, scale appropriately
        fcFuncCount[func] = Math.max(1, Math.round((score / 100) * 12));
      }
      
      console.log(`evt:fc_real_scores,session_id:${session_id},scores:${JSON.stringify(realFCScores)}`);
    } else {
      console.log(`evt:fc_fallback_legacy,session_id:${session_id}`);
    }

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

    // Phase 3: Enhanced answer processing with JSON validation and sanitization
    for (const row of answers) {
      const qid = String(row.question_id);
      const rec = keyByQ[qid]; if (!rec) continue;
      const scale = rec.scale_type as string;
      const tag   = rec.tag as (string | null);
      const pair  = rec.pair_group as (string | null);
      const sd    = !!rec.social_desirability;

      // Phase 3: Sanitize response value before processing
      const sanitizedValue = sanitizeResponseValue(row.answer_value);
      const raw = parseNum(sanitizedValue);
      if (raw == null) continue;

      // Skip invalid values for scale type
      if (!isValidForScale(raw, scale)) {
        console.warn(`evt:invalid_scale_value,session_id:${session_id},qid:${qid},value:${raw},scale:${scale}`);
        continue;
      }

      // reverse on native, then normalize to 1..5
      const v5 = toCommon5(rec.reverse_scored ? reverseOnNative(raw, scale) : raw, scale);

      if (tag === "N" || tag === "N_R") neuroVals.push(v5);
      else if (tag?.endsWith("_S")) { const f = tag.split("_")[0]; (likert[f] ||= []).push(v5); }
      else if (tag?.endsWith("_D")) { const f = tag.split("_")[0]; (dims[f]   ||= []).push(v5); }
      else if (["Core","Critic","Hidden","Instinct"].includes(tag || "")) blockLikertCount[tag!] += v5;

      if (sd) { sdSum += v5; sdN += 1; }
      if (pair) (pairs[pair] ||= []).push(v5);

      // Phase 3: Enhanced forced-choice mapping with safer JSON handling and numeric fallback
      if (scale?.startsWith("FORCED_CHOICE") && !usedRealFCScores) {
        fcAnsweredCount++; // Count FC answers only if not using real FC scores
        const rawChoice = String(sanitizedValue).trim().toUpperCase();
        // NEW: Map numeric inputs to letters as fallback
        const letterMap: Record<string, string> = {"1":"A","2":"B","3":"C","4":"D","5":"E"};
        const choice = letterMap[rawChoice] || rawChoice;
        
        // Phase 3: Use validated fc_map from keyByQ
        const map = validateFCMap(rec.fc_map) ?? (scale === "FORCED_CHOICE_4" ? fcBlockDefault : null);
        if (map && map[choice]) {
          const m = map[choice];
          if (["Core","Critic","Hidden","Instinct"].includes(m)) blockFCCount[m] = (blockFCCount[m] || 0) + 1;
          else if (FUNCS.includes(m)) fcFuncCount[m] = (fcFuncCount[m] || 0) + 1;
        } else if (map) {
          console.warn(`evt:fc_mapping_miss,session_id:${session_id},qid:${qid},choice:${choice},available:${Object.keys(map).join(',')}`);
        }
      }

      // attention checks handled after aggregation via attention_qids
    }

    // Phase 3: Enhanced FC completeness with partial session support
    let fcCompleteness = "complete";
    const fcExpectedMinUsed = Math.max(4, typeof fcExpectedMin === 'number' ? fcExpectedMin : get_config_number('fc_expected_min', 4)); // Use config value if available
    const fcCompletionRate = Math.min(1, fcAnsweredCount / fcExpectedMinUsed);
    
    if (fcAnsweredCount < fcExpectedMinUsed) {
      console.log(`evt:incomplete_fc,session_id:${session_id},fc_count:${fcAnsweredCount},expected_min:${fcExpectedMinUsed},completion_rate:${fcCompletionRate}`);
      fcCompleteness = "incomplete";
      
      // Phase 3: Allow partial scoring if we have minimum viable data (>50% complete for real FC blocks)
      if (partial_session && fcCompletionRate < 0.5) {
        console.log(`evt:insufficient_partial_data,session_id:${session_id},completion_rate:${fcCompletionRate}`);
        return new Response(JSON.stringify({ 
          status: "partial_insufficient", 
          profile: { 
            partial_session: true, 
            completion_rate: fcCompletionRate,
            fc_answered: fcAnsweredCount,
            fc_expected: fcExpectedMinUsed
          },
          message: "Need more responses for reliable results"
        }), { headers:{...corsHeaders,"Content-Type":"application/json"}});
      }
    }

    // Attention checks from config
    if (Array.isArray(attentionQids)) {
      let failCt = 0, passCt = 0;
      for (const qid of attentionQids) {
        const v = getV5(qid);
        if (v == null) continue;
        if (v < 1.5 || v > 4.5) failCt++;
        if (v < 2 || v > 4) passCt++;
      }
      attentionFailed = failCt;
      console.log(`evt:attention_eval,session_id:${session_id},pass_ct:${passCt},fail_ct:${failCt}`);
    } else {
      console.log(`evt:attention_config_missing,session_id:${session_id}`);
      attentionFailed = 0;
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

    // Log aggregation counts
    const aggCounts = {
      likert_S: Object.fromEntries(FUNCS.map(f => [f, (likert[f]||[]).length])),
      dims_D: Object.fromEntries(FUNCS.map(f => [f, (dims[f]||[]).length])),
      fc: Object.fromEntries(FUNCS.map(f => [f, (fcFuncCount[f]||0)])),
    };
    console.log(`evt:agg_counts,session_id:${session_id},counts:${JSON.stringify(aggCounts)}`);

    // Apply both state and quality-based dynamic weighting
    const w_fc     = w_fc_base * wFCState * dynamicFCWeight;
    const w_likert = w_lik_base * wLikertState * dynamicLikertWeight;
    const norm     = (w_fc + w_likert) || 1;

    // Calculate z-scores for Likert and FC methods within session for MAI improvement
    const likertValues: number[] = [];
    const fcValues: number[] = [];
    
    for (const f of FUNCS) {
      const L = likert[f] || [];
      const meanL = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0;
      likertValues.push(meanL);
      
      const fcPct = fcTotal ? ((fcFuncCount[f] || 0) / fcTotal) : 0;
      fcValues.push(fcPct);
    }
    
    const likertMean = likertValues.reduce((a, b) => a + b, 0) / likertValues.length;
    const likertStd = Math.sqrt(likertValues.reduce((sum, v) => sum + Math.pow(v - likertMean, 2), 0) / likertValues.length) || 1;
    
    const fcMean = fcValues.reduce((a, b) => a + b, 0) / fcValues.length;
    const fcStd = Math.sqrt(fcValues.reduce((sum, v) => sum + Math.pow(v - fcMean, 2), 0) / fcValues.length) || 1;
    
    // Compute z-scored versions and blend with reliability weighting
    const likertZ: Record<string, number> = {};
    const fcZ: Record<string, number> = {};
    const blendedStrengths: Record<string, number> = {};
    
    for (const f of FUNCS) {
      const L = likert[f] || [];
      const meanL = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0;
      const fcPct = fcTotal ? ((fcFuncCount[f] || 0) / fcTotal) : 0;
      
      likertZ[f] = (meanL - likertMean) / likertStd;
      fcZ[f] = (fcPct - fcMean) / fcStd;
      
      // Enhanced reliability-weighted blending for MAI
      const qualityBonus = (inconsIdx < 1.5 && sdIndex < 4.6) ? 0.1 : 0;
      const fcCoverage = Math.min(1, fcAnsweredCount / Math.max(1, (typeof fcExpectedMin === 'number' ? fcExpectedMin : 4)));
      const wFcEnhanced = Math.min(0.55, Math.max(0.2, fcCoverage * 0.4 + qualityBonus));
      const wLikertEnhanced = 1 - wFcEnhanced;
      
      // Blend z-scored methods and convert back to 1-5 scale
      const zBlended = wLikertEnhanced * likertZ[f] + wFcEnhanced * fcZ[f];
      blendedStrengths[f] = Math.max(1, Math.min(5, 3 + zBlended)); // center at 3 with z-score spread
      
      // Fallback to original method if z-score fails
      const fcScaled = 1 + fcPct * 4;
      const originalBlended = (w_likert * meanL + w_fc * fcScaled) / norm;
      strengths[f] = Number.isFinite(blendedStrengths[f]) ? blendedStrengths[f] : 
                     Math.max(1, Math.min(5, Number.isFinite(originalBlended) ? originalBlended : 0));
    }
    
    // Store method metrics for MAI computation (async, don't block main flow)
    supabase
      .from('session_method_metrics')
      .upsert({
        session_id: session_id,
        created_at: new Date().toISOString(),
        likert_z: likertZ,
        fc_z: fcZ
      })
      .then(({ error }) => {
        if (error) console.error('Error storing method metrics:', error);
      });

    // ---- dimensions: map 1..5 avg -> 1..4 ----
    const mapDim = (avg:number)=>{
      if (!avg) return 0;
      if (avg <= dimThresh.one) return 1;
      if (avg <= dimThresh.two) return 2;
      if (avg <= dimThresh.three) return 3;
      return 4;
    };
    const dimensions: Record<string, number> = {};
    let dimFallbackUsed = false;
    for (const f of FUNCS) {
      const L = dims[f] || [];
      const avg5 = L.length ? (L.reduce((a,b)=>a+b,0)/L.length) : 0;
      if (avg5) {
        dimensions[f] = mapDim(avg5);
      } else {
        // Fallback: if we have any answers but no direct dimensional items, derive from strengths (1..5 -> 1..4)
        if ((answers?.length || 0) > 0) {
          const s = strengths[f] || 0;
          dimensions[f] = s ? mapDim(s) : 0;
          if (s) dimFallbackUsed = true;
        } else {
          dimensions[f] = 0;
        }
      }
    }
    if (dimFallbackUsed) {
      console.log(`evt:dimensions_fallback_strengths,session_id:${session_id}`);
    }

    // ---- PROTOTYPE-BASED TYPE SCORING (v2) ----
    
    // Helper to normalize dimensionality (1-4 -> 0-1)
    function normDim(d: number): number {
      return Math.max(0, (d - 1) / 3);
    }

    // Helper to get opposite function penalty
    function oppositePenalty(typeCode: TypeCode, S: Record<Func, number>): number {
      const prototype = TYPE_PROTOTYPES[typeCode];
      let penalty = 0;
      
      // Penalize if opposite functions have higher strength than valued functions
      for (const func of FUNCS) {
        const block = prototype[func];
        if (["base", "creative"].includes(block)) {
          const opp = OPP[func] as Func;
          const oppBlock = prototype[opp];
          if (["vulnerable", "ignoring"].includes(oppBlock) && (S[opp] - S[func]) > 0.5) {
            penalty += S[opp] - S[func];
          }
        }
      }
      
      return penalty;
    }

    // Score each type using prototype-based method
    function scoreType(typeCode: TypeCode, S: Record<Func, number>, D: Record<Func, number>, FC: Record<Func, number>): number {
      const prototype = TYPE_PROTOTYPES[typeCode];
      let score = 0;
      
      for (const func of FUNCS) {
        const block = prototype[func];
        const weight = BLOCK_WEIGHTS[block] ?? 0;
        
        // Base score from strength
        score += weight * S[func];
        
        // Dimensionality bonus
        score += SCORING_WEIGHTS.dim * weight * normDim(D[func]);
        
        // Forced-choice support
        score += SCORING_WEIGHTS.fc * weight * FC[func];
      }
      
      // Apply opposite penalty
      score -= SCORING_WEIGHTS.penaltyOpp * oppositePenalty(typeCode, S);
      
      return score;
    }

    // Prepare FC support data
    const fcSupport: Record<Func, number> = {};
    const fcTotalCount = Object.values(fcFuncCount).reduce((a, b) => a + b, 0) || 1;
    for (const func of FUNCS) {
      fcSupport[func] = (fcFuncCount[func] || 0) / fcTotalCount;
    }

    // Score all 16 types
    const typeScores: Record<TypeCode, number> = {} as Record<TypeCode, number>;
    let invalidComboAttempts = 0;
    
    for (const typeCode of Object.keys(TYPE_PROTOTYPES) as TypeCode[]) {
      // Validate base-creative combination
      const { base: baseFunc, creative: creativeFunc } = TYPE_MAP[typeCode];
      const validCreatives = VALID_CREATIVES_BY_BASE[baseFunc as Func];
      
      if (!validCreatives || !validCreatives.includes(creativeFunc as Func)) {
        console.log(`evt:invalid_combo_blocked,session_id:${session_id},type:${typeCode},base:${baseFunc},creative:${creativeFunc}`);
        invalidComboAttempts++;
        continue; // Skip invalid combinations
      }
      
      typeScores[typeCode] = scoreType(typeCode, strengths, dimensions, fcSupport);
    }

    // Find the best valid type
    const validTypes = Object.entries(typeScores).filter(([_, score]) => score > 0);
    if (validTypes.length === 0) {
      console.error(`evt:no_valid_types,session_id:${session_id},invalid_attempts:${invalidComboAttempts}`);
      // Fallback - this should not happen
      const sorted = [...FUNCS].sort((a,b)=>(strengths[b]||0)-(strengths[a]||0));
      const baseGuess = sorted[0];
      const creativeGuess = sorted[1];
      console.log(`evt:fallback_type,session_id:${session_id},base:${baseGuess},creative:${creativeGuess}`);
    }

    // Defer type selection until after distance-based scoring

    // ---- trait: Neuroticism (N) + overlays ----
    const nMean = neuroVals.length ? neuroVals.reduce((a,b)=>a+b,0) / neuroVals.length : 0; // 1..5
    const sdSafe = neuroNorms?.sd && Number(neuroNorms.sd) !== 0 ? Number(neuroNorms.sd) : 1;
    const zN = (nMean - (neuroNorms?.mean ?? 3)) / sdSafe;

    // neuro overlay: ± by cut
    const cut = Number((await cfg("overlay_neuro_cut")) ?? 0.50);
    let overlay_neuro: "+"|"–"|"0" = "0";
    if (zN >= +cut) overlay_neuro = "+";
    else if (zN <= -cut) overlay_neuro = "–";

    // state overlay: weighted index from stress/time/sleep/focus
    const wStateCfg = await cfg("overlay_state_weights");
    const W = wStateCfg ?? {stress:0.35, time:0.25, sleep:-0.20, focus:-0.20};
    const c = (v:number|null)=> (v ?? 3) - 3;
    const state_index = (W.stress||0)*c(sStress) + (W.time||0)*c(sTime) + (W.sleep||0)*c(sSleep) + (W.focus||0)*c(sFocus);

    let overlay_state: "+"|"–"|"0" = "0";
    if (state_index >= +cut) overlay_state = "+";
    else if (state_index <= -cut) overlay_state = "–";

    // Legacy alias to avoid breaking UI that expects 'overlay'
    const overlay = overlay_neuro;

    // Required tag coverage check
    let missingTags: string[] = [];
    try {
      if (Array.isArray(requiredTags) && requiredTags.length > 0) {
        const haveTags = new Set((skey || []).map((r: any) => r?.tag).filter(Boolean));
        missingTags = requiredTags.filter((t: string) => !haveTags.has(t));
      }
    } catch (_e) { missingTags = []; }

    // NEW: Enhanced validity status with tuned gates
    const validity = {
      attention: attentionFailed,
      inconsistency: Number(inconsIdx.toFixed(3)),
      sd_index: Number(sdIndex.toFixed(3)),
      duplicates: duplicateCount,
      state_modifiers: { stress:sStress, time:sTime, sleep:sSleep, focus:sFocus },
      required_tag_gaps: missingTags
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

    // ---- blocks (normalized for display only; keep Likert and FC separate) ----
    const blocks_likert = { ...blockLikertCount };
    const blocks_fc = { ...blockFCCount };
    const bLikertSum = (blocks_likert.Core||0)+(blocks_likert.Critic||0)+(blocks_likert.Hidden||0)+(blocks_likert.Instinct||0);
    const bFCSum = (blocks_fc.Core||0)+(blocks_fc.Critic||0)+(blocks_fc.Hidden||0)+(blocks_fc.Instinct||0);
    const blocks_norm_likert = bLikertSum > 0 ? {
      Core: Math.round((blocks_likert.Core / bLikertSum) * 1000)/10,
      Critic: Math.round((blocks_likert.Critic / bLikertSum) * 1000)/10,
      Hidden: Math.round((blocks_likert.Hidden / bLikertSum) * 1000)/10,
      Instinct: Math.round((blocks_likert.Instinct / bLikertSum) * 1000)/10,
    } : { Core:0, Critic:0, Hidden:0, Instinct:0 };
    const blocks_norm_fc = bFCSum > 0 ? {
      Core: Math.round((blocks_fc.Core / bFCSum) * 1000)/10,
      Critic: Math.round((blocks_fc.Critic / bFCSum) * 1000)/10,
      Hidden: Math.round((blocks_fc.Hidden / bFCSum) * 1000)/10,
      Instinct: Math.round((blocks_fc.Instinct / bFCSum) * 1000)/10,
    } : { Core:0, Critic:0, Hidden:0, Instinct:0 };

    // Blend Likert and FC into a single normalized blocks percentage using source-weighted average
    const totalB = bLikertSum + bFCSum;
    const wLik = totalB > 0 ? (bLikertSum / totalB) : 1;
    const wFC  = totalB > 0 ? (bFCSum / totalB) : 0;
    const blocks_norm_blend = {
      Core: Math.round(((wLik * blocks_norm_likert.Core) + (wFC * blocks_norm_fc.Core)) * 10) / 10,
      Critic: Math.round(((wLik * blocks_norm_likert.Critic) + (wFC * blocks_norm_fc.Critic)) * 10) / 10,
      Hidden: Math.round(((wLik * blocks_norm_likert.Hidden) + (wFC * blocks_norm_fc.Hidden)) * 10) / 10,
      Instinct: Math.round(((wLik * blocks_norm_likert.Instinct) + (wFC * blocks_norm_fc.Instinct)) * 10) / 10,
    };

    // ---- Distance-based type matching (PRISM Scoring 6.18) ----
    // Build numeric prototype targets (1..5) from block weights
    const MIN_W = Math.min(...Object.values(BLOCK_WEIGHTS));
    const MAX_W = Math.max(...Object.values(BLOCK_WEIGHTS));
    const MAX_DIST = Math.sqrt(FUNCS.length * Math.pow(4, 2)); // worst-case distance across 8 funcs (1..5)
    const protoTargets: Record<string, Record<Func, number>> = {};
    for (const code of Object.keys(TYPE_MAP)) {
      const proto = TYPE_PROTOTYPES[code as TypeCode];
      const targets: Record<Func, number> = {} as Record<Func, number>;
      for (const f of FUNCS) {
        const w = BLOCK_WEIGHTS[proto[f]];
        const t = 1 + 4 * ((w - MIN_W) / (MAX_W - MIN_W)); // map weight -> 1..5
        targets[f] = t;
      }
      protoTargets[code] = targets;
    }
    
    // Calculate match scores from Euclidean distance
    const rawScores: Record<string, number> = {};
    for (const code of Object.keys(typeScores)) {
      const targets = protoTargets[code];
      let sumSq = 0;
      for (const f of FUNCS) {
        const diff = (strengths[f] || 0) - (targets[f] || 0);
        sumSq += diff * diff;
      }
      const dist = Math.sqrt(sumSq);
      const match = Math.max(0, 1 - dist / MAX_DIST); // 0..1
      // Scale to legacy 0..6.5 range so downstream calibration stays consistent
      rawScores[code] = match * 6.5;
    }
    
    // Raw type scores usually fall ~0..6.5; clamp and map linearly for raw fit
    function mapFitRaw(s: number): number {
      const sClamped = Math.max(0, Math.min(6.5, s));
      const v = (sClamped / 6.5) * 100;
      return Math.round(v * 10) / 10;
    }

    // Calculate raw fit scores (percentage)
    const fitRaw: Record<string, number> = {};
    for (const [code, s] of Object.entries(rawScores)) {
      fitRaw[code] = mapFitRaw(s);
    }

    // --- Fit Calibration (v1.1.2): z-score against cohort RAW fits ---
    const { data: cohortData } = await supabase
      .from('profiles')
      .select('score_fit_raw')
      .gte('created_at', new Date(Date.now() - 90*24*60*60*1000).toISOString())
      .not('score_fit_raw','is',null);

    const cohortRaw = (cohortData||[])
      .map(r => Number(r.score_fit_raw))
      .filter(v => Number.isFinite(v));

    function zScaleTo50_15(x:number, mean:number, sd:number) {
      const z = sd > 0 ? (x - mean) / sd : 0;
      return 50 + 15*z;
    }

    const fitAbs: Record<string, number> = {};
    const topRawFit = fitRaw[Object.keys(fitRaw).sort((a,b)=>fitRaw[b]-fitRaw[a])[0]] ?? 50;

    if (cohortRaw.length >= 50) {
      const cMean = cohortRaw.reduce((a,b)=>a+b,0)/cohortRaw.length;
      const cSd = Math.sqrt(cohortRaw.reduce((s,v)=>s + Math.pow(v - cMean,2), 0) / Math.max(1,cohortRaw.length-1));
      for (const [code, rawFit] of Object.entries(fitRaw)) {
        let v = zScaleTo50_15(rawFit, cMean, cSd); // center ~50
        // clamp sensibly to 20..85 for UI stability
        v = Math.max(20, Math.min(85, v));
        fitAbs[code] = Math.round(v*10)/10;
      }
      console.log(`evt:fit_calibrated_z,session_id:${session_id},cohort_n:${cohortRaw.length},mean:${cMean.toFixed(2)},sd:${cSd.toFixed(2)},raw_top:${topRawFit}`);
    } else {
      // fallback: mild shrink + offset
      for (const [code, rawFit] of Object.entries(fitRaw)) {
        let v = rawFit * 0.65 + 20;
        v = Math.max(20, Math.min(85, v));
        fitAbs[code] = Math.round(v*10)/10;
      }
      console.log(`evt:fit_calibrated_fallback,session_id:${session_id},cohort_n:${cohortRaw.length}`);
    }
    const temp = softmaxTemp;
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
      .sort((a, b) => {
        const fitCmp = (fitAbs[b] - fitAbs[a]);
        if (fitCmp !== 0) return fitCmp;
        const shareCmp = (sharePct[b] - sharePct[a]);
        if (shareCmp !== 0) return shareCmp;
        const cohCmp = (coherentCountFor(b) - coherentCountFor(a));
        if (cohCmp !== 0) return cohCmp;
        const fcSumA = (fcSupport[TYPE_MAP[a].base as Func] || 0) + (fcSupport[TYPE_MAP[a].creative as Func] || 0);
        const fcSumB = (fcSupport[TYPE_MAP[b].base as Func] || 0) + (fcSupport[TYPE_MAP[b].creative as Func] || 0);
        return fcSumB - fcSumA;
      })
      .slice(0, 3);
    const type_scores: Record<string,{fit_abs:number; share_pct:number}> = {};
    for (const code of Object.keys(TYPE_MAP)) type_scores[code] = { fit_abs: fitAbs[code], share_pct: sharePct[code] };

    // NEW: Calculate top_gap, close_call, fit_band with enhanced logic
    const topFit = fitAbs[top3[0]] || 0;
    const secondFit = fitAbs[top3[1]] || 0;
    const topGap = Math.round((topFit - secondFit) * 10) / 10; // gap_to_second (fit-based)
    const closeCall = topGap < 3;

    // Enhanced confidence calculation with unified calibration
    const p1 = (sharePct[top3[0]] || 0);
    const p2 = (sharePct[top3[1]] || 0);
    const confidenceMargin = Math.round(((p1 - p2)) * 10) / 10; // 0..100 scale
    
    // Calculate entropy from share distribution for calibration
    const shareEntropy = -Object.values(sharePct).reduce((sum: number, share: number) => {
      if (share > 0) sum += (share / 100) * Math.log2(share / 100);
      return sum;
    }, 0);
    
    // Determine dimensional profile for calibration stratum
    const dimBand = Math.max(...Object.values(dimensions)) >= 3 ? '3-4D' : 
                    Math.max(...Object.values(dimensions)) === 2 ? '2D' : '1D';
    
    // Use unified calibration system
    const confidenceResult = await calibration.calculateConfidence({
      topGap,
      shareMargin: confidenceMargin,
      shareEntropy,
      dimBand,
      overlay,
      sessionId: session_id
    });
    
    const rawConf = confidenceResult.raw;
    const calibratedConf = confidenceResult.calibrated;
    const confBand = confidenceResult.band;
    
    // Phase 4: Fit band logic driven by config thresholds
    const { high_fit, moderate_fit, high_gap, moderate_gap } = fitBandThresholds;
    let fitBand = "Low";
    if (topFit >= high_fit && topGap >= high_gap) {
      fitBand = "High";
    } else if ((topFit >= moderate_fit && topFit < high_fit) || (topGap >= moderate_gap && topGap < high_gap)) {
      fitBand = "Moderate"; 
    }

    // NEW: Top-3 fit explainer data
    const top3Fits = top3.map(code => ({
      code,
      fit: fitAbs[code],
      share: sharePct[code]
    }));

    console.log(`evt:fit_calculation,session_id:${session_id},top_fit:${topFit},top_gap:${topGap},close_call:${closeCall},fit_band:${fitBand},invalid_combo_attempts:${invalidComboAttempts}`);

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
    if (debugMode) {
      console.log(`evt:debug_mode,session_id:${session_id}`);
      const penalty_components = Object.fromEntries(
        Object.keys(TYPE_MAP).map(code => [code, oppositePenalty(code as TypeCode, strengths)])
      );
      const debugPayload = {
        counts: {
          likert_S: Object.fromEntries(FUNCS.map(f => [f, (likert[f]||[]).length])),
          dims_D: Object.fromEntries(FUNCS.map(f => [f, (dims[f]||[]).length])),
          fc: Object.fromEntries(FUNCS.map(f => [f, (fcFuncCount[f]||0)]))
        },
        strengths,
        dimensions,
        raw_type_scores: typeScores,
        penalty_components,
        top3,
        fit_abs: fitAbs,
        share_pct: sharePct,
        state_values: { stress: sStress, time: sTime, sleep: sSleep, focus: sFocus },
        weights: { w_fc_base, w_lik_base, w_fc, w_likert },
        blocks_raw: { likert: blocks_likert, fc: blocks_fc },
        blocks_norm_likert,
        blocks_norm_fc,
      };
      return new Response(JSON.stringify({ status: "debug", debug: debugPayload }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Mark session as completed (preserve timestamps)
    const { data: currentSessionTiming } = await supabase
      .from('assessment_sessions')
      .select('status, completed_at, started_at, created_at')
      .eq('id', session_id)
      .single();

    const updates: any = { status: 'completed' };
    // Only set completed_at if null to preserve accurate timing
    if (!currentSessionTiming?.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { error: sessionUpdateError } = await supabase
      .from('assessment_sessions')
      .update(updates)
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

    // Determine final type selection after distance-based scoring
    const typeCode = top3[0];
    const { base, creative } = TYPE_MAP[typeCode];

    // Compute final blocks_norm with fallback when no block tags were present
    let blocks_norm_final = blocks_norm_blend;
    const blocksZero = (blocks_norm_blend.Core + blocks_norm_blend.Critic + blocks_norm_blend.Hidden + blocks_norm_blend.Instinct) === 0;
    if (blocksZero && (answers?.length || 0) > 0) {
      // Fallback: estimate blocks from function strengths by ranking
      const sortedFuncs = [...FUNCS].sort((a,b) => (strengths[b]||0) - (strengths[a]||0));
      const groups: Record<string, string[]> = {
        Core: sortedFuncs.slice(0,2),
        Instinct: sortedFuncs.slice(2,4),
        Hidden: sortedFuncs.slice(4,6),
        Critic: sortedFuncs.slice(6,8),
      };
      const sums: Record<string, number> = { Core:0, Critic:0, Hidden:0, Instinct:0 };
      let total = 0;
      for (const [k, fs] of Object.entries(groups)) {
        const s = fs.reduce((acc,f)=> acc + (strengths[f]||0), 0);
        sums[k as keyof typeof sums] = s; total += s;
      }
      if (total > 0) {
        blocks_norm_final = {
          Core: Math.round((sums.Core/total)*1000)/10,
          Critic: Math.round((sums.Critic/total)*1000)/10,
          Hidden: Math.round((sums.Hidden/total)*1000)/10,
          Instinct: Math.round((sums.Instinct/total)*1000)/10,
        };
        console.log(`evt:blocks_fallback_strengths,session_id:${session_id}`);
      }
    }

    // Enhanced profile data with v1.1 fields (timestamps & recompute handling)
    const now = new Date().toISOString();
    const profileData = {
      session_id: session_id,
      user_id: user_id || currentSession?.user_id || null,
      type_code: typeCode,
      base_func: base,
      creative_func: creative,
      confidence: confidence,
      validity_status: validityStatus,

      // NEW v1.2.0 fields with unified calibration
      results_version: "v1.2.0",
      score_fit_raw: fitRaw[typeCode] || 0,
      score_fit_calibrated: fitAbs[typeCode] || 0,
      fit_band: fitBand,
      top_gap: topGap,
      invalid_combo_flag: invalidComboAttempts > 0,

      close_call: closeCall,
      fc_answered_ct: fcAnsweredCount,

      // Enhanced confidence fields
      conf_raw: Number(rawConf.toFixed(4)),
      conf_calibrated: Number(calibratedConf.toFixed(4)),
      conf_band: confBand,
      top_3_fits: top3Fits,
      fit_explainer: {
        top_3_comparison: top3Fits,
        interpretation: {
          fit_band: fitBand,
          close_call: closeCall,
          top_gap: topGap,
          confidence_margin: confidenceMargin,
          calibration_note: "Fit is calibrated to typical PRISM ranges; 35≈weak, 55≈solid, 75≈strong"
        },
        metrics: {
          gap_to_second: topGap,
          confidence_margin: confidenceMargin,
          p1: p1,
          p2: p2
        }
      },
      strengths: strengths,
      dimensions: dimensions,
      neuroticism: { raw_mean: nMean, z: zN },
      neuro_mean: nMean,
      neuro_z: Number(zN.toFixed(3)),
      overlay_neuro: overlay_neuro,
      overlay_state: overlay_state,
      state_index: Number(state_index.toFixed(3)),
      trait_scores: { N: Number(nMean?.toFixed(3)) },
      overlay: overlay,
      validity: validity,
      type_scores: type_scores,
      top_types: top3,
      dims_highlights: dims_highlights,
      blocks_norm: blocks_norm_final,
      blocks: { likert: blocks_norm_likert, fc: blocks_norm_fc },
      version: "v1.2.0",
      
      // FIXED: Use actual submission time with microsecond precision to avoid clustering
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Runtime contract validation against v1.1 schema
    try {
      const ajv = new Ajv({ allErrors: true, strict: false });
      const schemaReq = await (await fetch(new URL("../../contracts/scoring_contract.v1_1.json", import.meta.url))).json();
      const validate = ajv.compile(schemaReq);
      if (!validate(profileData)) {
        console.error("evt:contract_violation", validate.errors);
        return new Response(
          JSON.stringify({ status: "error", error: "Contract violation", details: validate.errors }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (err) {
      console.error("evt:contract_validation_error", err);
      return new Response(
        JSON.stringify({ status: "error", error: "Contract validation error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if profile exists to determine if this is a recompute
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('session_id, submitted_at')
      .eq('session_id', session_id)
      .maybeSingle();

    // Insert or update profile using ON CONFLICT for proper upsert
    const upsertData = {
      ...profileData,
      session_id: session_id,
      version: "v1.2.0"
    };

    // If existing profile, preserve original submitted_at and add recomputed_at
    if (existingProfile) {
      upsertData.submitted_at = existingProfile.submitted_at; // preserve original
      upsertData.recomputed_at = new Date().toISOString(); // mark recomputation time with fresh timestamp
      upsertData.updated_at = new Date().toISOString();
    } else {
      // For new profiles, ensure unique timestamp by adding microsecond-level uniqueness
      const uniqueTime = new Date();
      uniqueTime.setMilliseconds(uniqueTime.getMilliseconds() + Math.random() * 1000);
      upsertData.submitted_at = uniqueTime.toISOString();
      upsertData.created_at = uniqueTime.toISOString();
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(upsertData, {
        onConflict: 'session_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error upserting profile:', upsertError);
      return new Response(JSON.stringify({ 
        status: "error", 
        error: upsertError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`evt:scoring_complete,session_id:${session_id},type:${typeCode}${overlay},confidence:${confidence},validity:${validityStatus},top_gap:${topGap}`);

    return new Response(JSON.stringify({ 
      status: "success", 
      gap_to_second: topGap,
      confidence_numeric: confidenceMargin,
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
