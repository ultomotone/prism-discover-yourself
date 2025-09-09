// supabase/functions/_shared/scoreEngine.ts
// Pure scoring engine for PRISM assessments
// Provides functional building blocks and an orchestrator used by edge functions

export type Func =
  | "Ti" | "Te" | "Fi" | "Fe"
  | "Ni" | "Ne" | "Si" | "Se";

export type Block =
  | "base" | "creative" | "role" | "vulnerable"
  | "mobilizing" | "suggestive" | "ignoring" | "demonstrative";

export type TypeCode =
  | "LIE"|"ILI"|"ESE"|"SEI"|"LII"|"ILE"|"ESI"|"SEE"
  | "LSE"|"SLI"|"EIE"|"IEI"|"LSI"|"SLE"|"EII"|"IEE";

export interface AnswerRow {
  question_id: number | string;
  answer_value: unknown;
}

export interface KeyRecord {
  tag?: string | null;
  fc_map?: Record<string,string> | null;
  scale_type: string;
  reverse_scored?: boolean;
}

export interface EngineConfig {
  typePrototypes?: Record<TypeCode, Record<Func, Block>>;
  softmaxTemp: number;
  confRawParams?: { a: number; b: number; c: number };
  resultsVersion?: string;
}

export interface EngineInput {
  answers: AnswerRow[];
  keyByQ: Record<string, KeyRecord>;
  config: EngineConfig;
  fc_scores?: Record<Func, number>;
}

export interface EngineProfile {
  type_code: TypeCode;
  type: TypeCode;
  base_func: Func;
  creative_func: Func;
  top_types: Array<{ code: TypeCode; share: number; score: number }>;
  strengths: Record<Func, number>;
  type_scores: Record<TypeCode, number>;
  blocks: { likert: Record<string, unknown>; fc: Record<string, unknown> };
  blocks_norm: Record<string, number>;
  overlay: string;
  overlay_neuro: string;
  overlay_state: string;
  validity: Record<string, unknown>;
  validity_status: string;
  confidence: string;
  conf_calibrated: number;
  score_fit_raw: number;
  score_fit_calibrated: number;
  top_gap: number;
  close_call: boolean;
  results_version: string;
  fc_source: "session" | "none";
  version: string;
}

export interface EngineResult {
  profile: EngineProfile;
  gap_to_second: number;
  confidence_margin: number;
  confidence_raw: number;
  confidence_calibrated: number;
  results_version: string;
  fc_source: "session" | "none";
}

export const FUNCS: Func[] = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"];

export const TYPE_MAP: Record<TypeCode, { base: Func; creative: Func }> = {
  LIE:{ base:"Te", creative:"Ni" }, ILI:{ base:"Ni", creative:"Te" },
  ESE:{ base:"Fe", creative:"Si" }, SEI:{ base:"Si", creative:"Fe" },
  LII:{ base:"Ti", creative:"Ne" }, ILE:{ base:"Ne", creative:"Ti" },
  ESI:{ base:"Fi", creative:"Se" }, SEE:{ base:"Se", creative:"Fi" },
  LSE:{ base:"Te", creative:"Si" }, SLI:{ base:"Si", creative:"Te" },
  EIE:{ base:"Fe", creative:"Ni" }, IEI:{ base:"Ni", creative:"Fe" },
  LSI:{ base:"Ti", creative:"Se" }, SLE:{ base:"Se", creative:"Ti" },
  EII:{ base:"Fi", creative:"Ne" }, IEE:{ base:"Ne", creative:"Fi" }
};

export const FALLBACK_PROTOTYPES: Record<TypeCode, Record<Func, Block>> = {
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

const RESULTS_VERSION = "v1.2.1";

// --- helper functions ------------------------------------------------------
function parseNum(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw);
  const m = s.match(/^(\d+)/);
  if (m) return Number(m[1]);
  const L = s.toLowerCase().trim();
  const map: Record<string, number> = {
    "strongly disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly agree": 5,
    "never": 1, "rarely": 2, "sometimes": 3, "often": 4, "always": 5,
    "very low": 1, "low": 2, "slightly low": 2, "moderate": 3, "slightly high": 4, "high": 4, "very high": 5
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
  if (scale === "LIKERT_1_5" || scale?.startsWith("CATEGORICAL") || scale === "FREQUENCY") return v;
  if (scale === "LIKERT_1_7" || scale === "STATE_1_7") return 1 + (v - 1) * (4/6);
  return v;
}

function softmax(scores: Record<string, number>, temp: number): Record<string, number> {
  const exps = Object.values(scores).map(v => Math.exp(v / temp));
  const sum = exps.reduce((a,b)=>a+b,0) || 1;
  const entries = Object.keys(scores).map((k,i)=>[k, exps[i]/sum]);
  return Object.fromEntries(entries);
}

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

// --- pipeline steps -------------------------------------------------------
export function processResponses(input: EngineInput) {
  const { answers, keyByQ, fc_scores } = input;
  const likert: Record<Func, number[]> = {} as any;
  for (const row of answers) {
    const qid = String(row.question_id);
    const rec = keyByQ[qid];
    if (!rec) continue;
    const raw = parseNum(row.answer_value);
    if (raw == null) continue;
    const v = toCommon5(rec.reverse_scored ? reverseOnNative(raw, rec.scale_type) : raw, rec.scale_type);
    const tag = rec.tag || undefined;
    if (tag?.endsWith("_S")) {
      const func = tag.split("_")[0] as Func;
      (likert[func] ||= []).push(v);
    }
  }
  const strengths: Record<Func, number> = {} as any;
  for (const f of FUNCS) {
    const lik = mean(likert[f] || []);
    const fcScore = fc_scores ? (fc_scores[f] / 100) * 5 : 0;
    strengths[f] = fc_scores ? 0.5 * lik + 0.5 * fcScore : lik;
  }
  return strengths;
}

export function computeTypeMatches(strengths: Record<Func, number>, protos: Record<TypeCode, Record<Func, Block>>) {
  const typeScores: Record<TypeCode, number> = {} as any;
  for (const code of Object.keys(TYPE_MAP) as TypeCode[]) {
    const proto = protos[code];
    let score = 0;
    for (const f of FUNCS) {
      const blk = proto[f];
      const w = blk === "base" ? 1 : blk === "creative" ? 0.7 : 0.2;
      score += w * strengths[f];
    }
    typeScores[code] = score;
  }
  return typeScores;
}

export function calibrateFitScores(scores: Record<TypeCode, number>): Record<TypeCode, number> {
  // placeholder for future calibration models
  return scores;
}

export function computeTypeProbabilities(scores: Record<TypeCode, number>, temp: number) {
  return softmax(scores, temp);
}

export function rankTypes(shares: Record<TypeCode, number>, scores: Record<TypeCode, number>) {
  const sorted = (Object.keys(shares) as TypeCode[]).sort((a,b)=>{
    const diff = shares[b] - shares[a];
    if (Math.abs(diff) < 1e-9) return scores[b] - scores[a];
    return diff;
  });
  const top3 = sorted.slice(0,3).map(code => ({ code, share: shares[code], score: scores[code] }));
  const gap = top3[0].share - (top3[1]?.share || 0);
  const scoreGap = top3[0].score - (top3[1]?.score || 0);
  return { top3, gap, scoreGap };
}

export function computeOverlays(): { overlay: string } {
  return { overlay: "0" };
}

export function assessValidity(): { validity_status: string } {
  return { validity_status: "ok" };
}

export function computeConfidence(topScoreGap: number, shareGap: number, shares: Record<TypeCode, number>, params: { a: number; b: number; c: number }) {
  const sortedShares = Object.values(shares).filter(v => v > 0);
  const entropy = -sortedShares.reduce((s,p)=>s+p*Math.log2(p),0);
  let raw = 1 / (1 + Math.exp(-(params.a * topScoreGap + params.b * shareGap - params.c * entropy)));
  raw = Math.max(0, Math.min(1, raw));
  const band = raw >= 0.8 ? "high" : raw >= 0.6 ? "med" : "low";
  return { raw, band };
}

export function assembleProfileResult(
  input: EngineInput,
  strengths: Record<Func, number>,
  typeScores: Record<TypeCode, number>,
  top3: Array<{code:TypeCode;share:number;score:number}>,
  gap: number,
  conf: { raw:number; band:string },
): EngineProfile {
  const type = top3[0].code;
  const base = TYPE_MAP[type].base;
  const creative = TYPE_MAP[type].creative;
  const resultsVersion = input.config.resultsVersion || RESULTS_VERSION;
  const closeCall = gap < 0.05;
  return {
    type_code: type,
    type: type,
    base_func: base,
    creative_func: creative,
    top_types: top3,
    strengths,
    type_scores: typeScores,
    blocks: { likert: {}, fc: {} },
    blocks_norm: { Core:0, Critic:0, Hidden:0, Instinct:0 },
    overlay: "0",
    overlay_neuro: "0",
    overlay_state: "0",
    validity: { attention:0, inconsistency:0, sd_index:0, duplicates:0, state_modifiers:{}, required_tag_gaps:[] },
    validity_status: "ok",
    confidence: conf.band,
    conf_calibrated: Number(conf.raw.toFixed(4)),
    score_fit_raw: top3[0].score,
    score_fit_calibrated: top3[0].score,
    top_gap: Number(gap.toFixed(3)),
    close_call: closeCall,
    results_version: resultsVersion,
    fc_source: input.fc_scores ? "session" : "none",
    version: resultsVersion,
  };
}

export function runScoreEngine(input: EngineInput): EngineResult {
  const protos = input.config.typePrototypes || FALLBACK_PROTOTYPES;
  const strengths = processResponses(input);
  const matches = computeTypeMatches(strengths, protos);
  const calibrated = calibrateFitScores(matches);
  const shares = computeTypeProbabilities(calibrated, input.config.softmaxTemp || 1.0);
  const { top3, gap, scoreGap } = rankTypes(shares, calibrated);
  const conf = computeConfidence(scoreGap, gap, shares, input.config.confRawParams || { a:0.25, b:0.35, c:0.2 });
  const profile = assembleProfileResult(input, strengths, calibrated, top3, gap, conf);
  return {
    profile,
    gap_to_second: profile.top_gap,
    confidence_margin: profile.top_gap,
    confidence_raw: Number(conf.raw.toFixed(4)),
    confidence_calibrated: profile.conf_calibrated,
    results_version: profile.results_version,
    fc_source: profile.fc_source,
  };
}

export { runScoreEngine as scoreAssessment };

