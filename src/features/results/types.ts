// Results view model normalization utilities
// Prevents crashes from undefined properties and provides safe defaults

/**
 * Safe accessor for nested properties with fallback
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current != null ? current : defaultValue;
}

/**
 * Safe array accessor with default empty array
 */
export function safeArray<T>(value: any, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Safe object accessor with default empty object
 */
export function safeObject<T extends Record<string, any>>(value: any, defaultValue: T = {} as T): T {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
}

/**
 * Normalizes a profile to prevent undefined property crashes
 */
export function normalizeProfileData(p: any): any {
  if (!p) return p;
  
  return {
    ...p,
    // Ensure critical nested properties exist
    dims_highlights: {
      coherent: safeArray(p?.dims_highlights?.coherent),
      unique: safeArray(p?.dims_highlights?.unique),
      ...safeObject(p?.dims_highlights)
    },
    validity: safeObject(p?.validity, {}),
    meta: safeObject(p?.meta, {}),
    strengths: safeObject(p?.strengths, {}),
    dimensions: safeObject(p?.dimensions, {}),
    blocks_norm: safeObject(p?.blocks_norm, { Core: 0, Critic: 0, Hidden: 0, Instinct: 0 }),
    top_types: safeArray(p?.top_types),
  };
}

export const FUNCS = ['Ti', 'Te', 'Fi', 'Fe', 'Ni', 'Ne', 'Si', 'Se'] as const;
export type Func = typeof FUNCS[number];

export interface Profile {
  id: string;
  type_code: string;
  base_func: Func;
  creative_func: Func;
  overlay: '+' | '–';
  strengths: Record<Func, number>;
  dimensions: Record<Func, number>; // 1..4
  blocks: { Core: number; Critic: number; Hidden: number; Instinct: number };
  blocks_norm: { Core: number; Critic: number; Hidden: number; Instinct: number };
  neuroticism: { raw_mean: number; z: number };
  validity: { inconsistency: number; sd_index: number };
  confidence: 'High' | 'Moderate' | 'Low';
  validity_status?: string;
  conf_raw?: number;
  conf_calibrated?: number;
  conf_band?: 'High' | 'Moderate' | 'Low';
  results_version?: string;
  score_fit_calibrated?: number;
  score_fit_raw?: number;
  fit_band?: 'High' | 'Moderate' | 'Low';
  top_gap?: number;
  invalid_combo_flag?: boolean;
  close_call?: boolean;
  fc_answered_ct?: number;
  top_3_fits?: Array<{ code: string; fit: number; share: number }>;
  diagnostics?: {
    invalid_combo_attempts: number;
    top_gap: number;
    considered: Array<{ type: string; fit: number }>;
  };
  meta?: {
    diagnostics?: {
      considered: Array<{ type: string; fit: number }>;
    };
    [key: string]: any;
  };
  type_scores: Record<string, { fit_abs: number; share_pct: number }>;
  top_types: string[];
  dims_highlights: { coherent: Func[]; unique: Func[] };
}

export interface ResultsSession {
  id: string;
  status: string; // 'completed' | 'processing' | etc.
}

export interface FetchResultsResponse {
  ok: boolean;
  session?: any;
  profile?: any;
  types?: any[];
  functions?: any[];
  state?: any[];
  results_version?: string;
  code?: string;
  error?: string;
}

