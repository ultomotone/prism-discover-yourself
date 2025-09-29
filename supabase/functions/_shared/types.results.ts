// supabase/functions/_shared/types.results.ts
// Shared types for unified scoring results

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
    user_id?: string;
    created_at?: string;
    computed_at?: string;
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