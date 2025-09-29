// supabase/functions/_shared/results.types.ts
// Unified types for extensible scoring system

export type TopType = { 
  code: string; 
  fit: number; 
  share: number; 
};

export type DistanceMetric = {
  code: string;
  raw: number;          // pre-calibration raw match (0..6.5)
  dist: number;         // euclidean distance
  norm: number;         // 0..1 normalization used for ordering
};

export type FitParts = {
  strengths_weight: number;
  dims_weight: number;
  fc_weight: number;
  penalty_opp: number;
};

export type DimsHighlights = {
  coherent_dims: string[]; // functions whose "ego" dims exceed threshold for top type
  unique_dims: string[];   // functions that exceed a uniqueness threshold vs cohort
};

export type BlocksNorm = {
  blended: Record<"Core"|"Critic"|"Hidden"|"Instinct", number>; // 0..100 sum ~100
  likert?: Record<"Core"|"Critic"|"Hidden"|"Instinct", number>;
  fc?:     Record<"Core"|"Critic"|"Hidden"|"Instinct", number>;
};

export type ProfilePayload = {
  results_version: string;
  session_id: string;
  type_code: string;
  confidence: string; // High/Moderate/Low (reliability label)
  conf_raw: number;   // 0..1
  conf_calibrated: number; // 0..1
  fit_band: "High"|"Moderate"|"Low";
  top_gap: number; // difference top1-top2 fitAbs
  top_types: TopType[]; // ALWAYS objects {code,fit,share}

  // Functions/Dimensions
  strengths: Record<"Ti"|"Te"|"Fi"|"Fe"|"Ni"|"Ne"|"Si"|"Se", number>;
  dimensions: Record<"Ti"|"Te"|"Fi"|"Fe"|"Ni"|"Ne"|"Si"|"Se", number>;

  // Highlights & coherence
  dims_highlights: DimsHighlights;
  seat_coherence: number; // 0..1
  fit_parts: FitParts;

  // Blocks
  blocks_norm: BlocksNorm;

  // Per-type diagnostics (optional but useful)
  distance_metrics?: DistanceMetric[]; // for all 16 types

  // Overlays & state
  overlay: "+"|"-"|"0";
  overlay_neuro?: "+"|"-"|"0";
  overlay_state?: "+"|"-"|"0";
  neuro_mean?: number;
  neuro_z?: number;
  state_index?: number;

  // Validity
  validity_status: "pass"|"warning"|"fail";
  validity?: {
    inconsistency_index?: number;
    sd_index?: number;
    attention_fails?: number;
  };

  // Meta
  scoring_version: string;
  computed_at: string;
};

// Legacy compatibility types
export type LegacyTopType = string | TopType;

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