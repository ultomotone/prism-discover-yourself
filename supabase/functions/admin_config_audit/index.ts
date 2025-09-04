// @ts-nocheck
// Phase 4: Config/Band Audit Tool for PRISM Configuration Management
import { createServiceClient } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfigAuditResult {
  key: string;
  value: any;
  status: 'ok' | 'missing' | 'invalid';
  recommendation?: string;
  current_type: string;
  expected_type: string;
}

const CONFIG_SCHEMA = {
  // Core thresholds
  dim_thresholds: {
    type: 'object',
    required: ['one', 'two', 'three'],
    defaults: { one: 2.1, two: 3.0, three: 3.8 }
  },
  fc_expected_min: {
    type: 'number',
    defaults: 16,
    min: 8,
    max: 32
  },
  
  // Confidence system
  conf_raw_params: {
    type: 'object',
    required: ['a', 'b', 'c'],
    defaults: { a: 0.25, b: 0.35, c: 0.20 }
  },
  conf_band_cuts: {
    type: 'object',
    required: ['high', 'moderate'],
    defaults: { high: 0.75, moderate: 0.55 }
  },
  
  // Fit bands
  fit_band_thresholds: {
    type: 'object',
    required: ['high_fit', 'moderate_fit', 'high_gap', 'moderate_gap'],
    defaults: { high_fit: 60, moderate_fit: 45, high_gap: 5, moderate_gap: 2 }
  },
  
  // Neuroticism
  neuro_norms: {
    type: 'object',
    required: ['mean', 'sd'],
    defaults: { mean: 3, sd: 1 }
  },
  
  // Question sets
  state_qids: {
    type: 'object',
    required: ['stress', 'time', 'sleep', 'focus'],
    defaults: null // No defaults - requires manual configuration
  },
  attention_qids: {
    type: 'array',
    defaults: null // No defaults - requires manual configuration
  },
  
  // Phase 3 additions
  partial_session_enabled: {
    type: 'boolean',
    defaults: true
  },
  partial_session_min_completion_rate: {
    type: 'number',
    defaults: 0.3,
    min: 0.1,
    max: 0.8
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    const { action = 'audit', config_updates = {} } = await req.json().catch(() => ({}));

    if (action === 'audit') {
      // Perform configuration audit
      const auditResults: ConfigAuditResult[] = [];
      
      for (const [key, schema] of Object.entries(CONFIG_SCHEMA)) {
        const { data: configData } = await supabase
          .from('scoring_config')
          .select('value')
          .eq('key', key)
          .maybeSingle();
        
        const currentValue = configData?.value;
        const result: ConfigAuditResult = {
          key,
          value: currentValue,
          status: 'ok',
          current_type: typeof currentValue,
          expected_type: schema.type
        };

        // Check if configuration exists
        if (currentValue === null || currentValue === undefined) {
          result.status = 'missing';
          result.recommendation = `Add default value: ${JSON.stringify(schema.defaults)}`;
        }
        // Check type
        else if (schema.type === 'object' && (typeof currentValue !== 'object' || Array.isArray(currentValue))) {
          result.status = 'invalid';
          result.recommendation = `Expected object, got ${typeof currentValue}`;
        }
        else if (schema.type === 'array' && !Array.isArray(currentValue)) {
          result.status = 'invalid';
          result.recommendation = `Expected array, got ${typeof currentValue}`;
        }
        else if (schema.type === 'number' && typeof currentValue !== 'number') {
          result.status = 'invalid';
          result.recommendation = `Expected number, got ${typeof currentValue}`;
        }
        else if (schema.type === 'boolean' && typeof currentValue !== 'boolean') {
          result.status = 'invalid';
          result.recommendation = `Expected boolean, got ${typeof currentValue}`;
        }
        // Check required fields for objects
        else if (schema.type === 'object' && schema.required) {
          const missingFields = schema.required.filter(field => !(field in currentValue));
          if (missingFields.length > 0) {
            result.status = 'invalid';
            result.recommendation = `Missing required fields: ${missingFields.join(', ')}`;
          }
        }
        // Check numeric ranges
        else if (schema.type === 'number' && typeof currentValue === 'number') {
          if (schema.min !== undefined && currentValue < schema.min) {
            result.status = 'invalid';
            result.recommendation = `Value ${currentValue} below minimum ${schema.min}`;
          }
          if (schema.max !== undefined && currentValue > schema.max) {
            result.status = 'invalid';
            result.recommendation = `Value ${currentValue} above maximum ${schema.max}`;
          }
        }

        auditResults.push(result);
      }

      // Check calibration models
      const { data: calibrationModels, error: calError } = await supabase
        .from('calibration_model')
        .select('version, stratum, method, trained_at, id')
        .eq('version', 'v1.2.0')
        .order('trained_at', { ascending: false });

      if (calError) {
        console.error('Error checking calibration models:', calError);
      }

      // Group by stratum
      const modelsByStratum = new Map<string, any[]>();
      calibrationModels?.forEach(model => {
        const stratumKey = `${model.stratum.dim_band}-${model.stratum.overlay}`;
        if (!modelsByStratum.has(stratumKey)) {
          modelsByStratum.set(stratumKey, []);
        }
        modelsByStratum.get(stratumKey)!.push(model);
      });

      const expectedStrata = [
        '1D-plus', '1D-minus', '2D-plus', '2D-minus', 
        '3-4D-plus', '3-4D-minus'
      ];

      const calibrationStatus = expectedStrata.map(stratum => ({
        stratum,
        models: modelsByStratum.get(stratum) || [],
        status: modelsByStratum.has(stratum) ? 'present' : 'missing'
      }));

      return new Response(JSON.stringify({
        status: 'success',
        audit_results: auditResults,
        calibration_status: calibrationStatus,
        total_configs: auditResults.length,
        issues_count: auditResults.filter(r => r.status !== 'ok').length,
        calibration_models_count: calibrationModels?.length || 0,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'fix') {
      // Apply fixes for missing/invalid configurations
      const fixes = [];
      
      for (const [key, updates] of Object.entries(config_updates)) {
        const schema = CONFIG_SCHEMA[key as keyof typeof CONFIG_SCHEMA];
        if (!schema) {
          fixes.push({ key, status: 'error', message: 'Unknown configuration key' });
          continue;
        }

        try {
          const { error: upsertError } = await supabase
            .from('scoring_config')
            .upsert({ 
              key, 
              value: updates,
              updated_at: new Date().toISOString()
            });

          if (upsertError) {
            fixes.push({ key, status: 'error', message: upsertError.message });
          } else {
            fixes.push({ key, status: 'success', message: 'Configuration updated' });
          }
        } catch (error) {
          fixes.push({ key, status: 'error', message: error.message });
        }
      }

      return new Response(JSON.stringify({
        status: 'success',
        fixes,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'defaults') {
      // Return default configurations for missing items
      const defaults: Record<string, any> = {};
      
      for (const [key, schema] of Object.entries(CONFIG_SCHEMA)) {
        if (schema.defaults !== null) {
          defaults[key] = schema.defaults;
        }
      }

      return new Response(JSON.stringify({
        status: 'success',
        defaults,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({
        error: 'Invalid action',
        valid_actions: ['audit', 'fix', 'defaults']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Config audit error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});