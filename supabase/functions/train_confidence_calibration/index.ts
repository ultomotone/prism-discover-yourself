// @ts-nocheck
import { createServiceClient } from '../_shared/supabaseClient.ts';
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
    const supabase = createServiceClient();
    const calibration = new PrismCalibration(supabase);

    // Get scoring version from config
    const { data: versionData } = await supabase.from('scoring_config').select('value').eq('key', 'results_version').maybeSingle();
    const scoringVersion = versionData?.value || 'v1.1.2';

    // Phase 5: Enhanced calibration training with better error handling and validation
    console.log(`🎯 Starting confidence calibration training v${calibration.getVersion()}...`);

    // Get calibration configuration with enhanced defaults
    const { data: configData } = await supabase
      .from('scoring_config')
      .select('value')
      .eq('key', 'calibration_config')
      .maybeSingle();

    const config = configData?.value || {
      enabled: true, 
      method: 'isotonic', 
      cohort_days: 90,
      min_sample_size: 10,
      min_stratum_size: 5,
      validation_split: 0.2
    };
    
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

    // Phase 5: Enhanced training data validation and quality metrics
    if (!trainingData || trainingData.length < config.min_sample_size) {
      console.log('Insufficient training data:', trainingData?.length);
      return new Response(JSON.stringify({
        success: false,
        message: `Insufficient training data (${trainingData?.length || 0} points, need ≥${config.min_sample_size})`,
        recommendation: 'Wait for more assessment completions or reduce min_sample_size in calibration_config'
      }), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'}
      });
    }

    console.log(`📊 Training on ${trainingData.length} calibration points from last ${config.cohort_days} days`);

    // Phase 5: Enhanced stratum processing with validation
    const strata = new Map<string, StratumData>();
    const skippedRows = [];
    
    for (const row of trainingData) {
      // Validate row data
      if (row.raw_conf === null || row.observed === null || row.dim_band === null || row.overlay === null) {
        skippedRows.push(`Missing data: raw_conf=${row.raw_conf}, observed=${row.observed}, dim_band=${row.dim_band}, overlay=${row.overlay}`);
        continue;
      }
      
      // Normalize overlay to match calibration system expectations
      const normalizedOverlay = row.overlay === '+' ? 'plus' : (row.overlay === '–' || row.overlay === '-') ? 'minus' : row.overlay;
      const key = `${row.dim_band}-${normalizedOverlay}`;
      
      if (!strata.has(key)) {
        strata.set(key, {
          dim_band: row.dim_band,
          overlay: normalizedOverlay,
          points: []
        });
      }
      strata.get(key)!.points.push({
        raw_conf: row.raw_conf,
        observed: row.observed
      });
    }

    if (skippedRows.length > 0) {
      console.log(`⚠️ Skipped ${skippedRows.length} invalid rows:`, skippedRows.slice(0, 5));
    }

    console.log(`🎲 Training ${strata.size} strata with overlay normalization`);

    // Phase 5: Enhanced model training with quality validation
    const results = [];
    const qualityMetrics = [];
    
    for (const [key, stratumData] of strata) {
      if (stratumData.points.length < config.min_stratum_size) {
        console.log(`⚠️  Skipping stratum ${key}: insufficient data (${stratumData.points.length} points, need ≥${config.min_stratum_size})`);
        continue;
      }

      // Prepare and clean points for regression
      const cleanPoints = stratumData.points
        .filter(p => Number.isFinite(p.raw_conf) && Number.isFinite(p.observed))
        .map(p => ({
          x: Math.max(0, Math.min(1, p.raw_conf)), // Clamp raw confidence to [0,1]
          y: Math.max(0, Math.min(1, p.observed))   // Clamp observed to [0,1]
        }));

      if (cleanPoints.length < config.min_stratum_size) {
        console.log(`⚠️  Skipping stratum ${key}: insufficient clean data (${cleanPoints.length} valid points)`);
        continue;
      }

      // Split data for validation if enough samples
      const useValidation = cleanPoints.length >= 20;
      let trainPoints = cleanPoints;
      let validationPoints = [];
      
      if (useValidation) {
        const splitIndex = Math.floor(cleanPoints.length * (1 - config.validation_split));
        trainPoints = cleanPoints.slice(0, splitIndex);
        validationPoints = cleanPoints.slice(splitIndex);
      }

      // Choose calibration method
      let knots;
      const method = (config.method === 'platt' || trainPoints.length < 10) ? 'platt' : 'isotonic';
      
      if (method === 'platt') {
        knots = PrismCalibration.plattScaling(trainPoints);
      } else {
        knots = PrismCalibration.isotonicRegression(trainPoints);
      }

      // Calculate quality metrics on validation set
      let calibrationError = null;
      let brier_score = null;
      
      if (useValidation && validationPoints.length > 0) {
        let totalError = 0;
        let brierSum = 0;
        
        for (const point of validationPoints) {
          // Interpolate calibrated value
          let calibrated = point.x; // fallback
          for (let i = 0; i < knots.length - 1; i++) {
            if (point.x >= knots[i].x && point.x <= knots[i + 1].x) {
              const t = (point.x - knots[i].x) / (knots[i + 1].x - knots[i].x);
              calibrated = knots[i].y + t * (knots[i + 1].y - knots[i].y);
              break;
            }
          }
          
          totalError += Math.abs(calibrated - point.y);
          brierSum += Math.pow(calibrated - point.y, 2);
        }
        
        calibrationError = totalError / validationPoints.length;
        brier_score = brierSum / validationPoints.length;
      }

      // Store calibration model with enhanced metadata
      const modelData = {
        version: scoringVersion,
        method: method,
        stratum: {
          dim_band: stratumData.dim_band,
          overlay: stratumData.overlay
        },
        knots: knots,
        trained_at: new Date().toISOString(),
        // Phase 5: Enhanced metadata
        training_size: trainPoints.length,
        validation_size: validationPoints.length,
        total_sample_size: cleanPoints.length,
        calibration_error: calibrationError,
        brier_score: brier_score
      };

      const { error: insertError } = await supabase
        .from('calibration_model')
        .upsert(modelData, { onConflict: 'version,stratum' });

      if (insertError) {
        console.error(`Error storing calibration for ${key}:`, insertError);
      } else {
        console.log(`✅ Trained ${method} calibration for ${key}: ${knots.length} knots, ${trainPoints.length} training points`);
        if (calibrationError !== null) {
          console.log(`   📊 Validation: MAE=${calibrationError.toFixed(4)}, Brier=${brier_score?.toFixed(4)}`);
        }
        
        const result = {
          stratum: key,
          method: method,
          knots: knots.length,
          training_size: trainPoints.length,
          validation_size: validationPoints.length,
          calibration_error: calibrationError,
          brier_score: brier_score,
          quality_score: calibrationError ? Math.max(0, 1 - calibrationError * 2) : null
        };
        
        results.push(result);
        qualityMetrics.push(result);
      }
    }

    // Phase 5: Enhanced response with quality summary
    const avgQuality = qualityMetrics.length > 0 
      ? qualityMetrics.filter(r => r.quality_score !== null).reduce((sum, r) => sum + (r.quality_score || 0), 0) / qualityMetrics.filter(r => r.quality_score !== null).length
      : null;

    console.log('🎉 Calibration training completed');
    if (avgQuality !== null) {
      console.log(`📈 Average model quality: ${(avgQuality * 100).toFixed(1)}%`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Trained ${results.length} calibration models`,
      summary: {
        models_trained: results.length,
        total_strata: strata.size,
        training_points: trainingData.length,
        skipped_invalid: skippedRows.length,
        average_quality: avgQuality,
        cohort_days: config.cohort_days
      },
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