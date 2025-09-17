// Results view model normalization layer
// Prevents crashes from undefined properties and provides safe defaults

export interface NormalizedProfile {
  // Core identity
  id?: string;
  session_id?: string;
  type_code?: string;
  overlay?: string;
  version?: string;
  
  // Scoring data
  top_types?: any[];
  strengths?: Record<string, any>;
  dimensions?: Record<string, any>;
  blocks_norm?: Record<string, number>;
  
  // Confidence and fit
  conf_band?: string;
  conf_calibrated?: number;
  score_fit_calibrated?: number;
  
  // Metadata and validity
  validity?: Record<string, any>;
  meta?: Record<string, any>;
  
  // Safe properties (normalized from various sources)
  coherent?: boolean;
  unique?: any[];
  dims_highlights?: {
    coherent?: string[];
    unique?: string[];
  };
  
  // Timestamps
  created_at?: string;
  submitted_at?: string;
  recomputed_at?: string;
}

/**
 * Normalizes a raw profile object to prevent undefined crashes
 * and provide consistent default values across components
 */
export function normalizeProfile(p: any): NormalizedProfile {
  if (!p) {
    return createEmptyProfile();
  }

  const validity = p?.validity ?? {};
  const meta = p?.meta ?? {};
  const dims_highlights = p?.dims_highlights ?? {};

  return {
    // Core identity
    id: p?.id,
    session_id: p?.session_id,
    type_code: p?.type_code ?? 'Unknown',
    overlay: p?.overlay ?? '0',
    version: p?.version ?? p?.results_version ?? 'unknown',
    
    // Scoring data with defaults
    top_types: Array.isArray(p?.top_types) ? p.top_types : [],
    strengths: p?.strengths ?? {},
    dimensions: p?.dimensions ?? {},
    blocks_norm: p?.blocks_norm ?? { 
      Core: 0, 
      Critic: 0, 
      Hidden: 0, 
      Instinct: 0 
    },
    
    // Confidence and fit
    conf_band: p?.conf_band ?? 'Low',
    conf_calibrated: p?.conf_calibrated ?? 0,
    score_fit_calibrated: p?.score_fit_calibrated ?? 0,
    
    // Raw metadata (preserved)
    validity,
    meta,
    
    // Normalized safe properties that commonly cause crashes
    coherent: Boolean(
      meta?.coherent ?? 
      validity?.coherent ?? 
      dims_highlights?.coherent?.length > 0 ??
      false
    ),
    unique: Array.isArray(dims_highlights?.unique) ? dims_highlights.unique : [],
    dims_highlights: {
      coherent: Array.isArray(dims_highlights?.coherent) ? dims_highlights.coherent : [],
      unique: Array.isArray(dims_highlights?.unique) ? dims_highlights.unique : [],
    },
    
    // Timestamps
    created_at: p?.created_at,
    submitted_at: p?.submitted_at,
    recomputed_at: p?.recomputed_at,
  };
}

/**
 * Creates an empty profile with safe defaults
 */
function createEmptyProfile(): NormalizedProfile {
  return {
    type_code: 'Unknown',
    overlay: '0',
    version: 'unknown',
    top_types: [],
    strengths: {},
    dimensions: {},
    blocks_norm: { Core: 0, Critic: 0, Hidden: 0, Instinct: 0 },
    conf_band: 'Low',
    conf_calibrated: 0,
    score_fit_calibrated: 0,
    validity: {},
    meta: {},
    coherent: false,
    unique: [],
    dims_highlights: {
      coherent: [],
      unique: [],
    },
  };
}

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