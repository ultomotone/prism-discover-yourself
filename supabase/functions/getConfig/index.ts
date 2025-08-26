import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfigRequest {
  keys?: string[];  // Optional: specific config keys to retrieve
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Safely parse JSON body, handle empty bodies
    let body: ConfigRequest = {};
    if (req.method === 'POST') {
      try {
        const text = await req.text();
        if (text && text.trim() !== '') {
          body = JSON.parse(text);
        }
      } catch (parseError) {
        console.warn('Failed to parse request body, using empty object:', parseError);
      }
    }
    
    const { keys } = body;

    console.log(`getConfig called with keys:`, keys);

    // Build query
    let query = supabaseClient
      .from('scoring_config')
      .select('key, value');

    // Filter by keys if provided
    if (keys && Array.isArray(keys) && keys.length > 0) {
      query = query.in('key', keys);
    }

    const { data: config, error } = await query;

    if (error) {
      console.error('Error fetching config:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to key-value object for easier consumption
    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>) || {};

    // Add defaults for critical values if missing
    const defaults = {
      results_version: "v1.1.2",
      fc_expected_min: 24,
      // State weighting used by fit/scoring UIs (can be tuned later)
      state_weights: {
        "N+": -0.15,  // higher neuroticism (stress) lowers fit
        "N0":  0.00,
        "N-":  0.15   // lower neuroticism (calm) raises fit
      },
      dim_thresholds: { one: 2.1, two: 3.0, three: 3.8 },
      neuro_norms: { mean: 3, sd: 1 },
      system_status: { status: "ok", message: "PRISM online", last_updated: null, updated_by: "admin" },
      required_question_tags: [
        "Ti_S", "Te_S", "Fi_S", "Fe_S", "Ni_S", "Ne_S", "Si_S", "Se_S",
        "N", "N_R", "SD", "INC_A", "INC_B", "AC_1"
      ]
    };

    // Merge with defaults
    const finalConfig = { ...defaults, ...configMap };

    return new Response(
      JSON.stringify({
        config: finalConfig,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in getConfig function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});