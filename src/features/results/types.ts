export type Func =
  | 'Ti'
  | 'Te'
  | 'Fi'
  | 'Fe'
  | 'Ni'
  | 'Ne'
  | 'Si'
  | 'Se';

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
  type_scores: Record<string, { fit_abs: number; share_pct: number }>;
  top_types: string[];
  dims_highlights: { coherent: Func[]; unique: Func[] };
}

export interface ResultsSession {
  id: string;
  status: string; // 'completed' | 'processing' | etc.
}

export interface FetchResultsResponse {
  profile: Profile;
  session: ResultsSession;
}

