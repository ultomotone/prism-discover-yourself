import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { PrismCalibration } from '../_shared/calibration.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StratumData {
  dim_band: string;
  overlay: string;
  points: Array<{raw_conf: number; observed: number}>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const calibration = new PrismCalibration(supabase);

    console.log(`🎯 Starting confidence calibration training v${calibration.getVersion()}...`);

    // Get calibration configuration
    const { data: configData } = await supabase
      .from('scoring_config')
      .select('value')
      .eq('key', 'calibration')
      .single();

    const config = configData?.value || {enabled: true, method: 'isotonic', cohort_days: 90};
    
    if (!config.enabled) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Calibration training disabled in config'
      }), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'}
      });
    }

    // Fetch training data from calibration view
    const { data: trainingData, error: trainingError } = await supabase
      .from('v_calibration_training')
      .select('*')
      .gte('created_at', new Date(Date.now() - config.cohort_days * 24 * 60 * 60 * 1000).toISOString());

    if (trainingError) {
      console.error('Error fetching training data:', trainingError);
      throw trainingError;
    }

    if (!trainingData || trainingData.length < 10) {
      console.log('Insufficient training data:', trainingData?.length);
      return new Response(JSON.stringify({
        success: false,
        message: `Insufficient training data (${trainingData?.length || 0} points, need ≥10)`
      }), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'}
      });
    }

    console.log(`📊 Training on ${trainingData.length} calibration points`);

    // Group by stratum
    const strata = new Map<string, StratumData>();
    
    for (const row of trainingData) {
      const key = `${row.dim_band}-${row.overlay}`;
      if (!strata.has(key)) {
        strata.set(key, {
          dim_band: row.dim_band,
          overlay: row.overlay,
          points: []
        });
      }
      strata.get(key)!.points.push({
        raw_conf: row.raw_conf,
        observed: row.observed
      });
    }

    console.log(`🎲 Training ${strata.size} strata`);

    // Train calibration model for each stratum
    const results = [];
    
    for (const [key, stratumData] of strata) {
      if (stratumData.points.length < 5) {
        console.log(`⚠️  Skipping stratum ${key}: insufficient data (${stratumData.points.length} points)`);
        continue;
      }

      // Prepare points for regression
      const points = stratumData.points.map(p => ({
        x: Math.max(0, Math.min(1, p.raw_conf)), // Clamp to [0,1]
        y: p.observed
      }));

      // Choose calibration method using unified utility
      let knots;
      if (config.method === 'platt' || points.length < 10) {
        knots = PrismCalibration.plattScaling(points);
      } else {
        knots = PrismCalibration.isotonicRegression(points);
      }

      // Store calibration model with unified version
      const { error: insertError } = await supabase
        .from('calibration_model')
        .insert({
          version: calibration.getVersion(),
          method: config.method === 'platt' ? 'platt' : 'isotonic',
          stratum: {
            dim_band: stratumData.dim_band,
            overlay: stratumData.overlay
          },
          knots: knots,
          trained_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Error storing calibration for ${key}:`, insertError);
      } else {
        console.log(`✅ Trained calibration for ${key}: ${knots.length} knots`);
        results.push({
          stratum: key,
          method: config.method === 'platt' ? 'platt' : 'isotonic',
          knots: knots.length,
          sample_size: points.length
        });
      }
    }

    console.log('🎉 Calibration training completed');

    return new Response(JSON.stringify({
      success: true,
      message: `Trained ${results.length} calibration models`,
      results: results
    }), {
      headers: {...corsHeaders, 'Content-Type': 'application/json'}
    });

  } catch (error) {
    console.error('❌ Error in train_confidence_calibration:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {...corsHeaders, 'Content-Type': 'application/json'}
    });
  }
});