// supabase/functions/_shared/score-engine/index.ts
// Shared pure scoring engine for PRISM assessments
// Exposes a single entry point `scoreAssessment` used by edge functions.

export type Func =
  | "Ti" | "Te" | "Fi" | "Fe"
  | "Ni" | "Ne" | "Si" | "Se";

export type Block =
  | "base" | "creative" | "role" | "vulnerable"
  | "mobilizing" | "suggestive" | "ignoring" | "demonstrative";

export type TypeCode =
  | "LIE"|"ILI"|"ESE"|"SEI"|"LII"|"ILE"|"ESI"|"SEE"
  | "LSE"|"SLI"|"EIE"|"IEI"|"LSI"|"SLE"|"EII"|"IEE";

export const FUNCS: Func[] = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"];

export const VALID_CREATIVES_BY_BASE: Record<Func, Func[]> = {
  Ne: ["Ti", "Fi"],
  Ni: ["Te", "Fe"],
  Se: ["Ti", "Fi"],
  Si: ["Te", "Fe"],
  Ti: ["Ne", "Se"],
  Te: ["Ni", "Si"],
  Fi: ["Ne", "Se"],
  Fe: ["Ni", "Si"],
};

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

export interface ScoreAssessmentInput {
  answers: AnswerRow[];
  keyByQ: Record<string, KeyRecord>;
  config: {
    typePrototypes?: Record<TypeCode, Record<Func, Block>>;
    softmaxTemp: number;
    fcExpectedMin: number;
  };
  fcInit?: {
    usedRealFCScores?: boolean;
    fcFuncCount?: Record<Func, number>;
    blockFCCount?: Record<string, number>;
    fcAnsweredCount?: number;
  };
}

export interface ScoreAssessmentResult {
  profile: any;
  gap_to_second: number;
  confidence_margin: number;
  results_version: string;
}

const RESULTS_VERSION = "v1.2.1";

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

export function scoreAssessment(input: ScoreAssessmentInput): ScoreAssessmentResult {
  const { answers, keyByQ, config, fcInit } = input;
  const typePrototypes = config.typePrototypes || FALLBACK_PROTOTYPES;
  const temp = config.softmaxTemp || 1.0;
  const fcExpectedMin = config.fcExpectedMin || 12;

  const likert: Record<Func, number[]> = {} as any;
  const fcFuncCount: Record<Func, number> = { Ti:0,Te:0,Fi:0,Fe:0,Ni:0,Ne:0,Si:0,Se:0 };

  if (fcInit?.fcFuncCount) {
    for (const f of FUNCS) fcFuncCount[f] = fcInit.fcFuncCount[f] || 0;
  }

  // Aggregate answers
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
    if (rec.fc_map) {
      const choice = String(row.answer_value).trim().toUpperCase();
      const func = rec.fc_map[choice];
      if (func && FUNCS.includes(func as Func)) {
        fcFuncCount[func as Func] = (fcFuncCount[func as Func] || 0) + 1;
      }
    }
  }

  // Compute strengths
  const strengths: Record<Func, number> = {} as any;
  for (const f of FUNCS) {
    const lik = mean(likert[f] || []);
    const fcScore = (fcFuncCount[f] / fcExpectedMin) * 5;
    strengths[f] = 0.5*lik + 0.5*fcScore;
  }

  // Type scores based on prototypes
  const typeScores: Record<TypeCode, number> = {} as any;
  for (const code of Object.keys(TYPE_MAP) as TypeCode[]) {
    const proto = typePrototypes[code];
    let score = 0;
    for (const f of FUNCS) {
      const blk = proto[f];
      const w = blk === "base" ? 1 : blk === "creative" ? 0.7 : 0.2;
      score += w * strengths[f];
    }
    typeScores[code] = score;
  }

  // Shares via softmax
  const shares = softmax(typeScores, temp);
  const sorted = (Object.keys(shares) as TypeCode[]).sort((a,b)=>{
    const diff = shares[b] - shares[a];
    if (Math.abs(diff) < 1e-9) return a.localeCompare(b);
    return diff;
  });
  const top3 = sorted.slice(0,3).map(code => ({ code, share: shares[code], score: typeScores[code] }));

  const gap = top3[0].share - (top3[1]?.share || 0);

  const profile = {
    type_code: top3[0].code,
    type: top3[0].code,
    top_types: top3,
    strengths,
    type_scores: typeScores,
    blocks: { likert:{}, fc:{} },
    blocks_norm: { Core:0, Critic:0, Hidden:0, Instinct:0 },
    overlay: "0",
    overlay_neuro: "0",
    overlay_state: "0",
    validity: { attention:0, inconsistency:0, sd_index:0, duplicates:0, state_modifiers:{}, required_tag_gaps:[] },
    version: RESULTS_VERSION,
  };

  return {
    profile,
    gap_to_second: Number(gap.toFixed(3)),
    confidence_margin: Number(gap.toFixed(3)),
    results_version: RESULTS_VERSION,
  };
}

export default { scoreAssessment };

