// Unified PRISM scoring engine v1.2.1
// Pure module with no side effects; can run in Node or Deno

export type Func =
  | 'Ti' | 'Te' | 'Fi' | 'Fe'
  | 'Ni' | 'Ne' | 'Si' | 'Se';

export type Block =
  | 'base' | 'creative' | 'role' | 'vulnerable'
  | 'mobilizing' | 'suggestive' | 'ignoring' | 'demonstrative';

export type TypeCode =
  | 'LIE'|'ILI'|'ESE'|'SEI'|'LII'|'ILE'|'ESI'|'SEE'
  | 'LSE'|'SLI'|'EIE'|'IEI'|'LSI'|'SLE'|'EII'|'IEE';

export interface ResponseRow {
  question_id: string | number;
  answer_value: string | number;
}

export interface ScoringKeyRecord {
  scale_type: string;
  reverse_scored?: boolean;
  tag?: string;
  pair_group?: string | null;
  social_desirability?: boolean;
  fc_map?: Record<string, string> | null;
  meta?: unknown;
}

export interface ProfileConfig {
  results_version: string;
  dim_thresholds: { one: number; two: number; three: number };
  neuro_norms: { mean: number; sd: number };
  overlay_neuro_cut: number;
  overlay_state_weights: { stress: number; time: number; sleep: number; focus: number };
  softmax_temp: number;
  conf_raw_params: { a: number; b: number; c: number };
  fit_band_thresholds: { high_fit: number; moderate_fit: number; high_gap: number; moderate_gap: number };
  fc_expected_min: number;
  typePrototypes?: Record<TypeCode, Record<Func, Block>>;
}

export interface ProfileInput {
  sessionId: string;
  responses: ResponseRow[];
  scoringKey: Record<string, ScoringKeyRecord>;
  config: ProfileConfig;
  fcFunctionScores?: Record<string, number>; // 0-100 per function
  partial?: boolean;
  fc_expected?: number;
}

export interface ProfileResult {
  type_code: TypeCode;
  base_func: Func;
  creative_func: Func;
  top_types: Array<{ code: TypeCode; share: number }>;
  top_3_fits: Array<{ code: TypeCode; fit: number; share: number }>;
  score_fit_raw: number;
  score_fit_calibrated: number;
  fit_band: string;
  top_gap: number;
  close_call: boolean;
  strengths: Record<Func, number>;
  dimensions: Record<Func, number>;
  dims_highlights: { coherent: string[]; unique: string[] };
  blocks_norm: { Core: number; Critic: number; Hidden: number; Instinct: number };
  neuro_mean: number;
  neuro_z: number;
  overlay_neuro: string;
  overlay_state: string;
  state_index: number;
  overlay: string;
  validity_status: string;
  validity: { attention: number; inconsistency: number; sd_index: number; duplicates?: number };
  confidence: 'High' | 'Moderate' | 'Low';
  conf_raw: number;
  conf_calibrated: number;
  fc_answered_ct: number;
  fc_coverage_bucket: string;
  version: string;
  results_version: string;
}

export const FUNCS: Func[] = ['Ti','Te','Fi','Fe','Ni','Ne','Si','Se'];

export const TYPE_MAP: Record<TypeCode, { base: Func; creative: Func }> = {
  LIE:{ base:'Te', creative:'Ni' }, ILI:{ base:'Ni', creative:'Te' },
  ESE:{ base:'Fe', creative:'Si' }, SEI:{ base:'Si', creative:'Fe' },
  LII:{ base:'Ti', creative:'Ne' }, ILE:{ base:'Ne', creative:'Ti' },
  ESI:{ base:'Fi', creative:'Se' }, SEE:{ base:'Se', creative:'Fi' },
  LSE:{ base:'Te', creative:'Si' }, SLI:{ base:'Si', creative:'Te' },
  EIE:{ base:'Fe', creative:'Ni' }, IEI:{ base:'Ni', creative:'Fe' },
  LSI:{ base:'Ti', creative:'Se' }, SLE:{ base:'Se', creative:'Ti' },
  EII:{ base:'Fi', creative:'Ne' }, IEE:{ base:'Ne', creative:'Fi' }
};

export const FALLBACK_PROTOTYPES: Record<TypeCode, Record<Func, Block>> = {
  LIE:{ Te:'base', Ni:'creative', Se:'role', Fi:'vulnerable', Ti:'mobilizing', Ne:'suggestive', Si:'ignoring', Fe:'demonstrative' },
  ILI:{ Ni:'base', Te:'creative', Fi:'role', Se:'vulnerable', Ne:'mobilizing', Ti:'suggestive', Fe:'ignoring', Si:'demonstrative' },
  ESE:{ Fe:'base', Si:'creative', Ne:'role', Ti:'vulnerable', Fi:'mobilizing', Ni:'suggestive', Te:'ignoring', Se:'demonstrative' },
  SEI:{ Si:'base', Fe:'creative', Ti:'role', Ne:'vulnerable', Ni:'mobilizing', Fi:'suggestive', Se:'ignoring', Te:'demonstrative' },
  LII:{ Ti:'base', Ne:'creative', Ni:'role', Fe:'vulnerable', Te:'mobilizing', Si:'suggestive', Fi:'ignoring', Se:'demonstrative' },
  ILE:{ Ne:'base', Ti:'creative', Fe:'role', Ni:'vulnerable', Si:'mobilizing', Te:'suggestive', Se:'ignoring', Fi:'demonstrative' },
  ESI:{ Fi:'base', Se:'creative', Ni:'role', Te:'vulnerable', Fe:'mobilizing', Ne:'suggestive', Ti:'ignoring', Si:'demonstrative' },
  SEE:{ Se:'base', Fi:'creative', Te:'role', Ni:'vulnerable', Ne:'mobilizing', Fe:'suggestive', Si:'ignoring', Ti:'demonstrative' },
  LSE:{ Te:'base', Si:'creative', Se:'role', Fi:'vulnerable', Ti:'mobilizing', Ne:'suggestive', Ni:'ignoring', Fe:'demonstrative' },
  SLI:{ Si:'base', Te:'creative', Fi:'role', Se:'vulnerable', Ni:'mobilizing', Ti:'suggestive', Fe:'ignoring', Ne:'demonstrative' },
  EIE:{ Fe:'base', Ni:'creative', Ne:'role', Ti:'vulnerable', Fi:'mobilizing', Si:'suggestive', Te:'ignoring', Se:'demonstrative' },
  IEI:{ Ni:'base', Fe:'creative', Ti:'role', Ne:'vulnerable', Si:'mobilizing', Fi:'suggestive', Se:'ignoring', Te:'demonstrative' },
  LSI:{ Ti:'base', Se:'creative', Ni:'role', Fe:'vulnerable', Te:'mobilizing', Ne:'suggestive', Fi:'ignoring', Si:'demonstrative' },
  SLE:{ Se:'base', Ti:'creative', Fe:'role', Ni:'vulnerable', Ne:'mobilizing', Te:'suggestive', Si:'ignoring', Fi:'demonstrative' },
  EII:{ Fi:'base', Ne:'creative', Ni:'role', Te:'vulnerable', Fe:'mobilizing', Si:'suggestive', Se:'ignoring', Ti:'demonstrative' },
  IEE:{ Ne:'base', Fi:'creative', Te:'role', Ni:'vulnerable', Si:'mobilizing', Fe:'suggestive', Se:'ignoring', Ti:'demonstrative' }
};

// Helper functions ---------------------------------------------------------
function parseNumber(v: string | number): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function softmax(scores: Record<string, number>, temp: number): Record<string, number> {
  const vals = Object.values(scores);
  const max = Math.max(...vals);
  const exps: Record<string, number> = {};
  let sum = 0;
  for (const [k, v] of Object.entries(scores)) {
    const e = Math.exp((v - max) / temp);
    exps[k] = e;
    sum += e;
  }
  for (const k of Object.keys(exps)) exps[k] = exps[k] / sum;
  return exps;
}

// Main engine --------------------------------------------------------------
export function scoreAssessment(input: ProfileInput): ProfileResult {
  const { responses, scoringKey, config, fcFunctionScores } = input;
  const likert: Record<Func, { sum: number; count: number }> = {} as any;
  const fcDerived: Record<Func, number> = {} as any;
  let fcAnswered = 0;

  for (const r of responses) {
    const key = scoringKey[String(r.question_id)];
    if (!key) continue;
    const val = parseNumber(r.answer_value);
    if (val === null) continue;
    if (key.reverse_scored) {
      // assume 1-5 scale
      const max = 5;
      const min = 1;
      const flipped = max + min - val;
      r.answer_value = flipped;
    }
    const tag = key.tag ? key.tag.substring(0,2) as Func : undefined;
    if (tag && key.scale_type.startsWith('LIKERT')) {
      const entry = likert[tag] || { sum: 0, count: 0 };
      entry.sum += Number(r.answer_value);
      entry.count += 1;
      likert[tag] = entry;
    }
    if (!fcFunctionScores && key.fc_map) {
      const f = key.fc_map[String(r.answer_value)] as Func | undefined;
      if (f) {
        fcDerived[f] = (fcDerived[f] || 0) + 1;
        fcAnswered++;
      }
    }
  }

  const strengths: Record<Func, number> = {} as any;
  let fcSource: 'session' | 'derived' | 'none' = 'none';
  const fcNorm: Record<Func, number> = {} as any;
  if (fcFunctionScores) {
    fcSource = 'session';
    for (const f of FUNCS) {
      const score = fcFunctionScores[f] ?? 0;
      fcNorm[f] = (score / 100) * 5;
    }
  } else if (Object.keys(fcDerived).length > 0) {
    fcSource = 'derived';
    const total = Object.values(fcDerived).reduce((a,b)=>a+b,0) || 1;
    for (const f of FUNCS) fcNorm[f] = (fcDerived[f] || 0) / total * 5;
  }

  for (const f of FUNCS) {
    const lik = likert[f] ? likert[f].sum / likert[f].count : 0;
    const fc = fcNorm[f] || 0;
    strengths[f] = fcSource === 'none' ? lik : 0.5 * lik + 0.5 * fc;
  }

  // Type matching
  const prototypes = config.typePrototypes || FALLBACK_PROTOTYPES;
  const typeScores: Record<TypeCode, number> = {} as any;
  for (const code of Object.keys(TYPE_MAP) as TypeCode[]) {
    const proto = prototypes[code];
    let score = 0;
    for (const f of FUNCS) {
      const block = proto[f];
      const w = block === 'base' ? 1 : block === 'creative' ? 0.7 : 0.2;
      score += w * strengths[f];
    }
    typeScores[code] = Number(score.toFixed(4));
  }

  const shares = softmax(typeScores, config.softmax_temp || 1);
  const sorted = (Object.keys(shares) as TypeCode[]).sort((a,b)=>{
    const diff = shares[b] - shares[a];
    if (Math.abs(diff) < 1e-9) return typeScores[b] - typeScores[a];
    return diff;
  });
  const top3 = sorted.slice(0,3).map(code => ({ code, share: shares[code], fit: typeScores[code] }));
  const top = top3[0];
  const second = top3[1];
  const shareGap = top.share - (second?.share ?? 0);
  const scoreGap = top.fit - (second?.fit ?? 0);

  const params = config.conf_raw_params;
  const entropy = -Object.values(shares).reduce((s,p)=>s+(p>0?p*Math.log2(p):0),0);
  const rawConf = 1 / (1 + Math.exp(-(params.a * scoreGap + params.b * shareGap - params.c * entropy)));
  const conf_raw = Number(rawConf.toFixed(4));
  const confidence = conf_raw >= 0.75 ? 'High' : conf_raw >= 0.55 ? 'Moderate' : 'Low';

  const fit_band = top.fit >= config.fit_band_thresholds.high_fit
    ? 'high_fit'
    : top.fit >= config.fit_band_thresholds.moderate_fit
      ? 'moderate_fit'
      : 'low_fit';
  const fc_answered_ct = fcFunctionScores ? Object.keys(fcFunctionScores).length : fcAnswered;
  const coverage = fc_answered_ct >= (input.fc_expected ?? config.fc_expected_min) ? 'full' : 'low';

  const result: ProfileResult = {
    type_code: top.code,
    base_func: TYPE_MAP[top.code].base,
    creative_func: TYPE_MAP[top.code].creative,
    top_types: top3.map(t => ({ code: t.code, share: t.share })),
    top_3_fits: top3.map(t => ({ code: t.code, fit: t.fit, share: t.share })),
    score_fit_raw: top.fit,
    score_fit_calibrated: top.fit,
    fit_band,
    top_gap: Number(shareGap.toFixed(3)),
    close_call: shareGap < 0.05,
    strengths: FUNCS.reduce((acc,f)=>{acc[f]=Number(strengths[f].toFixed(3));return acc;}, {} as Record<Func,number>),
    dimensions: FUNCS.reduce((acc,f)=>{acc[f]=0;return acc;}, {} as Record<Func,number>),
    dims_highlights:{ coherent: [], unique: [] },
    blocks_norm:{ Core:0, Critic:0, Hidden:0, Instinct:0 },
    neuro_mean:0,
    neuro_z:0,
    overlay_neuro:'none',
    overlay_state:'none',
    state_index:0,
    overlay:'0',
    validity_status:'valid',
    validity:{ attention:0, inconsistency:0, sd_index:0 },
    confidence,
    conf_raw,
    conf_calibrated: conf_raw,
    fc_answered_ct,
    fc_coverage_bucket: coverage,
    version: config.results_version,
    results_version: config.results_version,
  };

  return result;
}
