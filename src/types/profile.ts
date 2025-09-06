export interface ProfileResult {
  session_id: string;
  type_code: string;
  base_func: string;
  creative_func: string;
  overlay: string;
  overlay_state?: string;
  strengths: Record<string, number>;
  dimensions: Record<string, number>;
  trait_scores: Record<string, number>;
  score_fit_raw: number;
  score_fit_calibrated: number;
  fit_band: string;
  confidence: string;
  conf_raw: number;
  conf_calibrated: number;
  close_call: boolean;
  top_gap: number;
  top_types: string[];
  type_scores: Record<string, { fit_abs: number; share_pct: number }>;
  results_version: string;
}
