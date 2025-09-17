// Unified PRISM Configuration Management v1.2.0
// Ensures consistent configuration loading across all scoring functions

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface PrismConfig {
  version: string;
  fc_expected_min: number;
  dim_thresholds: {
    one: number;
    two: number;
    three: number;
  };
  neuro_norms: {
    mean: number;
    sd: number;
  };
  required_question_tags: string[];
  fc_block_map_default: Record<string, string>;
  dashboard_email_qid: { id: number };
  dashboard_country_qid: { id: number };
  hash_salt: { value: string };
  state_qids: {
    stress: number;
    time: number;
    sleep: number;
    focus: number;
    mood: number;
  };
  enforce_type_guard: { enabled: boolean };
  valid_type_combinations: Record<string, any>;
  fit_calibration: {
    enabled: boolean;
    cohort_days: number;
    extreme_cap: { min: number; max: number };
    target_range: { min: number; max: number };
    z_score_threshold: number;
  };
  fc_weight_toggle: Record<string, any>;
  flag_duration_threshold_minutes: number;
  min_fit_abs_for_typing: number;
  min_top_gap_for_high_conf: number;
  fit_bands: {
    low: { fit_max: number; gap_max: number };
    moderate: { fit_min: number; fit_max: number; gap_min: number; gap_max: number };
    high: { fit_min: number; gap_min: number };
  };
  top_gap_logic: {
    top_gap_field: string;
    top_gap_enabled: boolean;
    fallback_if_null: number;
  };
  conf_raw_params: {
    a: number;
    b: number;
    c: number;
  };
  conf_band_cuts: {
    high: number;
    moderate: number;
  };
  calibration: {
    method: string;
    enabled: boolean;
    cohort_days: number;
  };
  system_status: {
    status: string;
    message: string;
    updated_by: string;
    last_updated: string;
  };
}

export class PrismConfigManager {
  private supabase: SupabaseClient;
  private version = 'v1.2.1';
  private configCache: PrismConfig | null = null;
  private lastCacheTime = 0;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Load complete PRISM configuration with caching and fallbacks
   */
  async loadConfig(forceRefresh = false): Promise<PrismConfig> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (!forceRefresh && this.configCache && (now - this.lastCacheTime) < this.cacheTTL) {
      return this.configCache;
    }

    try {
      // Load all config in parallel for efficiency
      const configKeys = [
        'fc_expected_min', 'dim_thresholds', 'neuro_norms', 'required_question_tags',
        'fc_block_map_default', 'dashboard_email_qid', 'dashboard_country_qid',
        'hash_salt', 'state_qids', 'enforce_type_guard', 'valid_type_combinations',
        'fit_calibration', 'fc_weight_toggle', 'flag_duration_threshold_minutes',
        'min_fit_abs_for_typing', 'min_top_gap_for_high_conf', 'fit_bands',
        'top_gap_logic', 'conf_raw_params', 'conf_band_cuts', 'calibration',
        'system_status'
      ];

      const { data: configData, error } = await this.supabase
        .from('scoring_config')
        .select('key, value')
        .in('key', configKeys);

      if (error) {
        console.error('Error loading configuration:', error);
        return this.getFallbackConfig();
      }

      // Convert array to object
      const configMap = Object.fromEntries(
        (configData || []).map(item => [item.key, item.value])
      );

      // Build config with defaults where needed
      const config: PrismConfig = {
        version: this.version,
        fc_expected_min: configMap.fc_expected_min ?? 16,
        dim_thresholds: configMap.dim_thresholds ?? { one: 2.1, two: 3.0, three: 3.8 },
        neuro_norms: configMap.neuro_norms ?? { mean: 3, sd: 0.8 },
        required_question_tags: configMap.required_question_tags ?? [
          'Ti_S', 'Te_S', 'Fi_S', 'Fe_S', 'Ni_S', 'Ne_S', 'Si_S', 'Se_S',
          'N', 'N_R', 'SD', 'INC_A', 'INC_B', 'AC_1'
        ],
        fc_block_map_default: configMap.fc_block_map_default ?? {
          A: 'Core', B: 'Critic', C: 'Hidden', D: 'Instinct'
        },
        dashboard_email_qid: configMap.dashboard_email_qid ?? { id: 1 },
        dashboard_country_qid: configMap.dashboard_country_qid ?? { id: 4 },
        hash_salt: configMap.hash_salt ?? { 
          value: 'PRISM_RETEST_SALT_2025_CHANGE_ME_IN_PRODUCTION' 
        },
        state_qids: configMap.state_qids ?? {
          stress: 217, time: 220, sleep: 219, focus: 221, mood: 218
        },
        enforce_type_guard: configMap.enforce_type_guard ?? { enabled: true },
        valid_type_combinations: configMap.valid_type_combinations ?? {},
        fit_calibration: configMap.fit_calibration ?? {
          enabled: true,
          cohort_days: 90,
          extreme_cap: { min: 20, max: 85 },
          target_range: { min: 35, max: 75 },
          z_score_threshold: 2
        },
        fc_weight_toggle: configMap.fc_weight_toggle ?? {},
        flag_duration_threshold_minutes: configMap.flag_duration_threshold_minutes ?? 60,
        min_fit_abs_for_typing: configMap.min_fit_abs_for_typing ?? 60,
        min_top_gap_for_high_conf: configMap.min_top_gap_for_high_conf ?? 1.5,
        fit_bands: configMap.fit_bands ?? {
          low: { fit_max: 44, gap_max: 2 },
          moderate: { fit_min: 45, fit_max: 59, gap_min: 2, gap_max: 4 },
          high: { fit_min: 60, gap_min: 5 }
        },
        top_gap_logic: configMap.top_gap_logic ?? {
          top_gap_field: 'gap_to_second',
          top_gap_enabled: true,
          fallback_if_null: 0.01
        },
        conf_raw_params: configMap.conf_raw_params ?? { a: 0.25, b: 0.35, c: 0.20 },
        conf_band_cuts: configMap.conf_band_cuts ?? { high: 0.75, moderate: 0.55 },
        calibration: configMap.calibration ?? {
          method: 'isotonic',
          enabled: true,
          cohort_days: 90
        },
        system_status: configMap.system_status ?? {
          status: 'green',
          message: 'System operational',
          updated_by: 'system',
          last_updated: new Date().toISOString()
        }
      };

      // Cache the config
      this.configCache = config;
      this.lastCacheTime = now;

      // Ensure any missing defaults are saved back to DB
      await this.ensureConfigDefaults(config, configMap);

      return config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return this.getFallbackConfig();
    }
  }

  /**
   * Get a single config value with caching
   */
  async getConfigValue<T>(key: keyof PrismConfig): Promise<T> {
    const config = await this.loadConfig();
    return config[key] as T;
  }

  /**
   * Update a config value and invalidate cache
   */
  async updateConfigValue(key: string, value: any): Promise<void> {
    const { error } = await this.supabase
      .from('scoring_config')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      throw new Error(`Failed to update config ${key}: ${error.message}`);
    }

    // Invalidate cache
    this.configCache = null;
    console.log(`Config updated: ${key}`);
  }

  /**
   * Get fallback configuration when database is unavailable
   */
  private getFallbackConfig(): PrismConfig {
    return {
      version: this.version,
      fc_expected_min: 16,
      dim_thresholds: { one: 2.1, two: 3.0, three: 3.8 },
      neuro_norms: { mean: 3, sd: 0.8 },
      required_question_tags: [
        'Ti_S', 'Te_S', 'Fi_S', 'Fe_S', 'Ni_S', 'Ne_S', 'Si_S', 'Se_S',
        'N', 'N_R', 'SD', 'INC_A', 'INC_B', 'AC_1'
      ],
      fc_block_map_default: { A: 'Core', B: 'Critic', C: 'Hidden', D: 'Instinct' },
      dashboard_email_qid: { id: 1 },
      dashboard_country_qid: { id: 4 },
      hash_salt: { value: 'PRISM_RETEST_SALT_2025_CHANGE_ME_IN_PRODUCTION' },
      state_qids: { stress: 217, time: 220, sleep: 219, focus: 221, mood: 218 },
      enforce_type_guard: { enabled: true },
      valid_type_combinations: {},
      fit_calibration: {
        enabled: true,
        cohort_days: 90,
        extreme_cap: { min: 20, max: 85 },
        target_range: { min: 35, max: 75 },
        z_score_threshold: 2
      },
      fc_weight_toggle: {},
      flag_duration_threshold_minutes: 60,
      min_fit_abs_for_typing: 60,
      min_top_gap_for_high_conf: 1.5,
      fit_bands: {
        low: { fit_max: 44, gap_max: 2 },
        moderate: { fit_min: 45, fit_max: 59, gap_min: 2, gap_max: 4 },
        high: { fit_min: 60, gap_min: 5 }
      },
      top_gap_logic: {
        top_gap_field: 'gap_to_second',
        top_gap_enabled: true,
        fallback_if_null: 0.01
      },
      conf_raw_params: { a: 0.25, b: 0.35, c: 0.20 },
      conf_band_cuts: { high: 0.75, moderate: 0.55 },
      calibration: { method: 'isotonic', enabled: true, cohort_days: 90 },
      system_status: {
        status: 'yellow',
        message: 'Using fallback configuration',
        updated_by: 'system',
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Ensure missing config defaults are saved to database
   */
  private async ensureConfigDefaults(config: PrismConfig, existing: Record<string, any>): Promise<void> {
    const updates = [];
    
    for (const [key, value] of Object.entries(config)) {
      if (key === 'version') continue; // Don't store version in config
      
      if (!(key in existing)) {
        updates.push({ key, value });
      }
    }

    if (updates.length > 0) {
      const { error } = await this.supabase
        .from('scoring_config')
        .upsert(updates, { onConflict: 'key' });
      
      if (error) {
        console.error('Failed to save config defaults:', error);
      } else {
        console.log(`Saved ${updates.length} missing config defaults`);
      }
    }
  }

  /**
   * Get current system version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Invalidate configuration cache
   */
  invalidateCache(): void {
    this.configCache = null;
  }
}