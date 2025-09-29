// supabase/functions/_shared/results.schema.ts
// JSON schema validation for scoring results

export const ProfilePayloadSchema = {
  type: "object",
  required: [
    "results_version",
    "session_id", 
    "type_code",
    "confidence",
    "fit_band",
    "top_types",
    "strengths",
    "dimensions",
    "dims_highlights",
    "seat_coherence",
    "fit_parts",
    "blocks_norm",
    "validity_status",
    "scoring_version",
    "computed_at"
  ],
  properties: {
    results_version: { type: "string" },
    session_id: { type: "string" },
    type_code: { type: "string" },
    confidence: { type: "string", enum: ["High", "Moderate", "Low"] },
    conf_raw: { type: "number", minimum: 0, maximum: 1 },
    conf_calibrated: { type: "number", minimum: 0, maximum: 1 },
    fit_band: { type: "string", enum: ["High", "Moderate", "Low"] },
    top_gap: { type: "number", minimum: 0 },
    
    top_types: { 
      type: "array", 
      items: {
        type: "object", 
        required: ["code", "fit", "share"],
        properties: { 
          code: { type: "string" }, 
          fit: { type: "number" }, 
          share: { type: "number" } 
        }
      }
    },
    
    strengths: { 
      type: "object", 
      additionalProperties: { type: "number" } 
    },
    
    dimensions: { 
      type: "object", 
      additionalProperties: { type: "number" } 
    },
    
    dims_highlights: { 
      type: "object",
      required: ["coherent_dims", "unique_dims"],
      properties: {
        coherent_dims: { type: "array", items: { type: "string" } },
        unique_dims: { type: "array", items: { type: "string" } }
      }
    },
    
    seat_coherence: { type: "number", minimum: 0, maximum: 1 },
    
    fit_parts: { 
      type: "object",
      required: ["strengths_weight", "dims_weight", "fc_weight", "penalty_opp"],
      properties: {
        strengths_weight: { type: "number" },
        dims_weight: { type: "number" },
        fc_weight: { type: "number" },
        penalty_opp: { type: "number" }
      }
    },
    
    blocks_norm: { 
      type: "object",
      required: ["blended"],
      properties: {
        blended: {
          type: "object",
          required: ["Core", "Critic", "Hidden", "Instinct"],
          properties: {
            Core: { type: "number" },
            Critic: { type: "number" },
            Hidden: { type: "number" },
            Instinct: { type: "number" }
          }
        },
        likert: {
          type: "object",
          properties: {
            Core: { type: "number" },
            Critic: { type: "number" },
            Hidden: { type: "number" },
            Instinct: { type: "number" }
          }
        },
        fc: {
          type: "object", 
          properties: {
            Core: { type: "number" },
            Critic: { type: "number" },
            Hidden: { type: "number" },
            Instinct: { type: "number" }
          }
        }
      }
    },
    
    distance_metrics: { 
      type: "array", 
      items: { 
        type: "object",
        required: ["code", "raw", "dist", "norm"],
        properties: {
          code: { type: "string" },
          raw: { type: "number" },
          dist: { type: "number" },
          norm: { type: "number" }
        }
      } 
    },
    
    overlay: { type: "string", enum: ["+", "-", "0"] },
    overlay_neuro: { type: "string", enum: ["+", "-", "0"] },
    overlay_state: { type: "string", enum: ["+", "-", "0"] },
    neuro_mean: { type: "number" },
    neuro_z: { type: "number" },
    state_index: { type: "number" },
    
    validity_status: { type: "string", enum: ["pass", "warning", "fail"] },
    validity: { 
      type: "object",
      properties: {
        inconsistency_index: { type: "number" },
        sd_index: { type: "number" },
        attention_fails: { type: "number" }
      }
    },
    
    scoring_version: { type: "string" },
    computed_at: { type: "string" }
  }
} as const;