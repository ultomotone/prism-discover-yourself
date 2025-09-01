import { supabase } from "@/lib/supabase/client";

export const PRISM_CONFIG_FALLBACK = {
  fc_expected_min: 24,
  dim_thresholds: { one: 2.1, two: 3.0, three: 3.8 },
  neuro_norms: { mean: 3, sd: 1 },
  gate_strict_mode: true,
  required_question_tags: [
    "Ti_S", "Te_S", "Fi_S", "Fe_S", "Ni_S", "Ne_S", "Si_S", "Se_S",
    "N", "N_R", "SD", "INC_A", "INC_B", "AC_1"
  ]
} as const;

export interface PrismConfig {
  fc_expected_min: number;
  dim_thresholds: { one: number; two: number; three: number };
  neuro_norms: { mean: number; sd: number };
  gate_strict_mode: boolean;
  required_question_tags: readonly string[];
  source: 'server' | 'fallback';
}

/**
 * Fetches PRISM configuration from the server with graceful fallback
 * Never blocks form submission - always returns usable config
 */
export async function getPrismConfig(): Promise<PrismConfig> {
  try {
    console.log('Attempting to fetch config from getConfig edge function...');
    
    // Call without body to avoid JSON parsing issues
    const result = await supabase.functions.invoke('getConfig', {
      body: {}
    });
    
    console.log('Config fetch result:', result);
    
    // Check for non-2xx status or missing data
    if (result.error) {
      console.warn('Config fetch failed, using fallback:', result.error);
      return { ...PRISM_CONFIG_FALLBACK, source: 'fallback' };
    }
    
    if (!result.data?.config) {
      console.warn('Config response missing data, using fallback');
      return { ...PRISM_CONFIG_FALLBACK, source: 'fallback' };
    }
    
    console.log('Successfully fetched config from server');
    return { 
      ...PRISM_CONFIG_FALLBACK,
      ...result.data.config,
      source: 'server' 
    };
    
  } catch (error) {
    console.warn('Config fetch exception, using fallback:', error);
    return { ...PRISM_CONFIG_FALLBACK, source: 'fallback' };
  }
}

// Total number of questions in the PRISM assessment
export const TOTAL_PRISM_QUESTIONS = 248;

export function getPrismTotalQuestions(): number {
  return TOTAL_PRISM_QUESTIONS;
}