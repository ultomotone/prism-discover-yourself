// supabase/functions/_shared/types.results.ts
// Shared types for unified scoring results - ENHANCED VERSION

export interface TopType { 
  code: string; 
  fit: number; 
  share: number; 
}

export interface DistanceMetric {
  code: string;
  raw: number;          // pre-calibration raw match (0..6.5)
  dist: number;         // euclidean distance
  norm: number;         // 0..1 normalization used for ordering
}

export interface FitParts {
  strengths_weight: number;
  dims_weight: number;
  fc_weight: number;
  penalty_opp: number;
}

export interface DimsHighlights {
  coherent: string[]; // functions whose "ego" dims exceed threshold for top type
  unique: string[];   // functions that exceed a uniqueness threshold vs cohort
}

export interface BlocksNorm {
  // Legacy format (for backward compatibility)
  Core: number;
  Critic: number; 
  Hidden: number;
  Instinct: number;
  // Enhanced format
  blended?: Record<"Core"|"Critic"|"Hidden"|"Instinct", number>; // 0..100 sum ~100
  likert?: Record<"Core"|"Critic"|"Hidden"|"Instinct", number>;
  fc?:     Record<"Core"|"Critic"|"Hidden"|"Instinct", number>;
}

export interface ScoringPayload {
  version: string;                 // e.g., "v1.2.1"
  profile: {
    session_id: string;
    type_code: string;
    confidence: number;
    fit_band?: string;
    overlay?: string;
    validity_status?: string;
    top_gap?: number;
    score_fit_calibrated?: number;
    conf_calibrated?: number;
    conf_raw?: number;
    user_id?: string;
    created_at?: string;
    computed_at?: string;
    
    // Enhanced fields
    strengths?: Record<string, number>;
    dimensions?: Record<string, number>;
    dims_highlights?: DimsHighlights;
    seat_coherence?: number;
    fit_parts?: FitParts;
    blocks_norm?: BlocksNorm;
    distance_metrics?: DistanceMetric[];
    
    [key: string]: unknown;
  };
  types: Array<{ 
    type_code: string; 
    fit: number; 
    share?: number | null; 
    rank?: number | null;
    distance?: number | null;
    coherent_dims?: number | null;
    unique_dims?: number | null;
    seat_coherence?: number | null;
    fit_parts?: Record<string, number> | null;
  }>;
  functions: Array<{ 
    func_code: string; 
    strength: number; 
    dimension?: number | null;
    d_index_z?: number | null;
  }>;
  state?: {
    overlay_band?: string;
    overlay_z?: number | null;
    effect_fit?: number | null;
    effect_conf?: number | null;
    block_core?: number | null;
    block_critic?: number | null;
    block_hidden?: number | null;
    block_instinct?: number | null;
    block_context?: string | null;
  };
  session?: {
    id: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    [key: string]: unknown;
  } | null;
  results_version: string;
}

export interface PersistResultsV3Params {
  session_id: string;
  user_id?: string | null;
  payload: ScoringPayload;
}

// Utility function to ensure top_types are always objects
export function safeTopTypes(topTypes: any[]): TopType[] {
  if (!Array.isArray(topTypes)) return [];
  
  return topTypes.map((item, index) => {
    if (typeof item === 'string') {
      // Convert legacy string format to object
      return { code: item, fit: 0, share: 0 };
    } else if (typeof item === 'object' && item !== null) {
      // Ensure object has required fields
      return {
        code: item.code || `Unknown${index}`,
        fit: typeof item.fit === 'number' ? item.fit : 0,
        share: typeof item.share === 'number' ? item.share : 0
      };
    }
    return { code: `Unknown${index}`, fit: 0, share: 0 };
  });
}