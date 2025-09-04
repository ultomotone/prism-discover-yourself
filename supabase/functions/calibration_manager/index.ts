// @ts-nocheck
// Phase 5: Calibration Model Management System
import { createServiceClient } from "../_shared/supabaseClient.ts";
import { PrismCalibration } from "../_shared/calibration.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();
    const calibration = new PrismCalibration(supabase);

    const { action, ...params } = await req.json().catch(() => ({ action: 'status' }));

    switch (action) {
      case 'status': {
        // Get calibration model status for all strata
        const { data: models, error } = await supabase
          .from('calibration_model')
          .select('*')
          .eq('version', calibration.getVersion())
          .order('trained_at', { ascending: false });

        if (error) throw error;

        // Group by stratum and get latest for each
        const latestByStratum = new Map();
        models?.forEach(model => {
          const key = `${model.stratum.dim_band}-${model.stratum.overlay}`;
          if (!latestByStratum.has(key) || model.trained_at > latestByStratum.get(key).trained_at) {
            latestByStratum.set(key, model);
          }
        });

        const expectedStrata = [
          '1D-plus', '1D-minus', '2D-plus', '2D-minus', '3-4D-plus', '3-4D-minus'
        ];

        const status = expectedStrata.map(stratum => {
          const model = latestByStratum.get(stratum);
          return {
            stratum,
            status: model ? 'active' : 'missing',
            model: model ? {
              method: model.method,
              knots: model.knots?.length || 0,
              trained_at: model.trained_at,
              training_size: model.training_size,
              calibration_error: model.calibration_error,
              brier_score: model.brier_score,
              age_hours: Math.round((Date.now() - new Date(model.trained_at).getTime()) / (1000 * 60 * 60))
            } : null
          };
        });

        return new Response(JSON.stringify({
          success: true,
          version: calibration.getVersion(),
          status,
          total_models: models?.length || 0,
          active_strata: status.filter(s => s.status === 'active').length,
          missing_strata: status.filter(s => s.status === 'missing').length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'health_check': {
        // Check calibration system health
        const errors = [];
        const warnings = [];

        // Check if models exist for all expected strata
        const { data: models } = await supabase
          .from('calibration_model')
          .select('stratum, trained_at, calibration_error, brier_score')
          .eq('version', calibration.getVersion());

        const modelsByStratum = new Map();
        models?.forEach(model => {
          const key = `${model.stratum.dim_band}-${model.stratum.overlay}`;
          modelsByStratum.set(key, model);
        });

        const expectedStrata = ['1D-plus', '1D-minus', '2D-plus', '2D-minus', '3-4D-plus', '3-4D-minus'];
        
        for (const stratum of expectedStrata) {
          const model = modelsByStratum.get(stratum);
          if (!model) {
            errors.push(`Missing calibration model for ${stratum}`);
          } else {
            const ageHours = (Date.now() - new Date(model.trained_at).getTime()) / (1000 * 60 * 60);
            if (ageHours > 7 * 24) { // 7 days
              warnings.push(`Calibration model for ${stratum} is ${Math.round(ageHours / 24)} days old`);
            }
            if (model.calibration_error && model.calibration_error > 0.15) {
              warnings.push(`High calibration error for ${stratum}: ${(model.calibration_error * 100).toFixed(1)}%`);
            }
          }
        }

        // Check training data availability
        const { data: trainingData } = await supabase
          .from('v_calibration_training')
          .select('dim_band, overlay')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const recentDataByStratum = new Map();
        trainingData?.forEach(row => {
          const overlay = row.overlay === '+' ? 'plus' : 'minus';
          const key = `${row.dim_band}-${overlay}`;
          recentDataByStratum.set(key, (recentDataByStratum.get(key) || 0) + 1);
        });

        for (const stratum of expectedStrata) {
          const recentCount = recentDataByStratum.get(stratum) || 0;
          if (recentCount < 5) {
            warnings.push(`Low recent training data for ${stratum}: ${recentCount} points in last 7 days`);
          }
        }

        const healthScore = Math.max(0, 1 - (errors.length * 0.2) - (warnings.length * 0.1));

        return new Response(JSON.stringify({
          success: true,
          health_score: Math.round(healthScore * 100),
          status: errors.length === 0 ? (warnings.length === 0 ? 'healthy' : 'warnings') : 'critical',
          errors,
          warnings,
          recommendations: errors.length > 0 
            ? ['Run calibration training to create missing models'] 
            : warnings.length > 0 
              ? ['Consider retraining outdated models', 'Monitor training data collection']
              : ['System operating normally']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'cleanup': {
        // Clean up old calibration models
        const { keep_versions = 3, dry_run = false } = params;
        
        const { data: allModels } = await supabase
          .from('calibration_model')
          .select('id, version, stratum, trained_at')
          .order('trained_at', { ascending: false });

        const modelsByStratum = new Map();
        allModels?.forEach(model => {
          const key = `${model.stratum.dim_band}-${model.stratum.overlay}`;
          if (!modelsByStratum.has(key)) {
            modelsByStratum.set(key, []);
          }
          modelsByStratum.get(key).push(model);
        });

        const toDelete = [];
        for (const [stratum, models] of modelsByStratum) {
          if (models.length > keep_versions) {
            const sortedModels = models.sort((a, b) => new Date(b.trained_at).getTime() - new Date(a.trained_at).getTime());
            const oldModels = sortedModels.slice(keep_versions);
            toDelete.push(...oldModels.map(m => ({ id: m.id, stratum, trained_at: m.trained_at })));
          }
        }

        let deletedCount = 0;
        if (!dry_run && toDelete.length > 0) {
          const { error } = await supabase
            .from('calibration_model')
            .delete()
            .in('id', toDelete.map(m => m.id));
          
          if (error) throw error;
          deletedCount = toDelete.length;
        }

        return new Response(JSON.stringify({
          success: true,
          dry_run,
          models_to_delete: toDelete.length,
          models_deleted: deletedCount,
          kept_per_stratum: keep_versions,
          details: toDelete.map(m => `${m.stratum}: ${m.trained_at}`)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'benchmark': {
        // Benchmark calibration performance
        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('conf_raw, conf_calibrated, conf_band, overlay, created_at')
          .eq('results_version', 'v1.2.0')
          .not('conf_raw', 'is', null)
          .not('conf_calibrated', 'is', null)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1000);

        if (!recentProfiles || recentProfiles.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: 'No recent calibrated profiles found for benchmarking'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Calculate calibration metrics
        const byBand = { High: [], Moderate: [], Low: [] };
        recentProfiles.forEach(profile => {
          if (profile.conf_band && byBand[profile.conf_band]) {
            byBand[profile.conf_band].push({
              raw: profile.conf_raw,
              calibrated: profile.conf_calibrated
            });
          }
        });

        const bandMetrics = {};
        for (const [band, values] of Object.entries(byBand)) {
          if (values.length > 0) {
            const avgRaw = values.reduce((sum, v) => sum + v.raw, 0) / values.length;
            const avgCalibrated = values.reduce((sum, v) => sum + v.calibrated, 0) / values.length;
            const calibrationShift = avgCalibrated - avgRaw;
            
            bandMetrics[band] = {
              sample_size: values.length,
              avg_raw_confidence: Number(avgRaw.toFixed(4)),
              avg_calibrated_confidence: Number(avgCalibrated.toFixed(4)),
              calibration_shift: Number(calibrationShift.toFixed(4)),
              percentage: Number((values.length / recentProfiles.length * 100).toFixed(1))
            };
          }
        }

        return new Response(JSON.stringify({
          success: true,
          period_days: 7,
          total_profiles: recentProfiles.length,
          band_metrics: bandMetrics,
          summary: {
            avg_calibration_shift: Number(Object.values(bandMetrics)
              .reduce((sum, m: any) => sum + (m.calibration_shift * m.sample_size), 0) / recentProfiles.length)
              .toFixed(4),
            confidence_distribution: Object.fromEntries(
              Object.entries(bandMetrics).map(([band, metrics]: [string, any]) => 
                [band, `${metrics.percentage}%`]
              )
            )
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          valid_actions: ['status', 'health_check', 'cleanup', 'benchmark']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Calibration manager error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});