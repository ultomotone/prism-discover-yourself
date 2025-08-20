export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assessment_responses: {
        Row: {
          answer_array: string[] | null
          answer_numeric: number | null
          answer_object: Json | null
          answer_value: string | null
          created_at: string
          id: string
          pair_group: string | null
          question_id: number
          question_section: string
          question_text: string
          question_type: string
          response_time_ms: number | null
          section_id: string | null
          session_id: string
          valid_bool: boolean | null
          value_coded: string | null
        }
        Insert: {
          answer_array?: string[] | null
          answer_numeric?: number | null
          answer_object?: Json | null
          answer_value?: string | null
          created_at?: string
          id?: string
          pair_group?: string | null
          question_id: number
          question_section: string
          question_text: string
          question_type: string
          response_time_ms?: number | null
          section_id?: string | null
          session_id: string
          valid_bool?: boolean | null
          value_coded?: string | null
        }
        Update: {
          answer_array?: string[] | null
          answer_numeric?: number | null
          answer_object?: Json | null
          answer_value?: string | null
          created_at?: string
          id?: string
          pair_group?: string | null
          question_id?: number
          question_section?: string
          question_text?: string
          question_type?: string
          response_time_ms?: number | null
          section_id?: string | null
          session_id?: string
          valid_bool?: boolean | null
          value_coded?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      assessment_scoring_key: {
        Row: {
          created_at: string
          fc_map: Json | null
          pair_group: string | null
          question_id: number
          question_type: string | null
          reverse_scored: boolean
          scale_type: Database["public"]["Enums"]["assessment_scale_type"]
          section: string | null
          social_desirability: boolean
          tag: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          fc_map?: Json | null
          pair_group?: string | null
          question_id: number
          question_type?: string | null
          reverse_scored?: boolean
          scale_type: Database["public"]["Enums"]["assessment_scale_type"]
          section?: string | null
          social_desirability?: boolean
          tag?: string | null
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          fc_map?: Json | null
          pair_group?: string | null
          question_id?: number
          question_type?: string | null
          reverse_scored?: boolean
          scale_type?: Database["public"]["Enums"]["assessment_scale_type"]
          section?: string | null
          social_desirability?: boolean
          tag?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      assessment_sessions: {
        Row: {
          completed_at: string | null
          completed_questions: number | null
          created_at: string
          email: string | null
          id: string
          ip_hash: string | null
          metadata: Json | null
          session_type: string
          share_token: string
          started_at: string
          status: string | null
          total_questions: number | null
          ua_hash: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          session_type?: string
          share_token: string
          started_at?: string
          status?: string | null
          total_questions?: number | null
          ua_hash?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          session_type?: string
          share_token?: string
          started_at?: string
          status?: string | null
          total_questions?: number | null
          ua_hash?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_statistics: {
        Row: {
          daily_assessments: number
          id: string
          overlay_negative: number
          overlay_positive: number
          stat_date: string
          total_assessments: number
          type_distribution: Json | null
          updated_at: string
        }
        Insert: {
          daily_assessments?: number
          id?: string
          overlay_negative?: number
          overlay_positive?: number
          stat_date?: string
          total_assessments?: number
          type_distribution?: Json | null
          updated_at?: string
        }
        Update: {
          daily_assessments?: number
          id?: string
          overlay_negative?: number
          overlay_positive?: number
          stat_date?: string
          total_assessments?: number
          type_distribution?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      kb_definitions: {
        Row: {
          content: Json
          key: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          key: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kb_types: {
        Row: {
          code: string
          overview: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          overview: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          overview?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          close_call: boolean | null
          confidence: string | null
          created_at: string | null
          creative_func: string | null
          deltas: Json | null
          dimensions: Json | null
          dims_highlights: Json | null
          email_mask: string | null
          fc_answered_ct: number | null
          fc_count: number | null
          fc_coverage_bucket: string | null
          fit_band: string | null
          fit_explainer: Json | null
          gap_minutes: number | null
          glossary_version: number | null
          id: string
          invalid_combo_flag: boolean | null
          ip_hash: string | null
          neuroticism: Json | null
          overlay: string | null
          parent_session_id: string | null
          person_key: string | null
          prev_session_id: string | null
          results_version: string | null
          run_index: number | null
          score_fit_calibrated: number | null
          score_fit_raw: number | null
          session_id: string
          session_kind: string | null
          strengths: Json | null
          top_3_fits: Json | null
          top_gap: number | null
          top_types: Json | null
          type_code: string | null
          type_scores: Json | null
          ua_hash: string | null
          updated_at: string | null
          user_id: string | null
          validity: Json | null
          validity_status: string | null
          version: string | null
        }
        Insert: {
          base_func?: string | null
          baseline_session_id?: string | null
          blocks?: Json | null
          blocks_norm?: Json | null
          close_call?: boolean | null
          confidence?: string | null
          created_at?: string | null
          creative_func?: string | null
          deltas?: Json | null
          dimensions?: Json | null
          dims_highlights?: Json | null
          email_mask?: string | null
          fc_answered_ct?: number | null
          fc_count?: number | null
          fc_coverage_bucket?: string | null
          fit_band?: string | null
          fit_explainer?: Json | null
          gap_minutes?: number | null
          glossary_version?: number | null
          id?: string
          invalid_combo_flag?: boolean | null
          ip_hash?: string | null
          neuroticism?: Json | null
          overlay?: string | null
          parent_session_id?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          results_version?: string | null
          run_index?: number | null
          score_fit_calibrated?: number | null
          score_fit_raw?: number | null
          session_id: string
          session_kind?: string | null
          strengths?: Json | null
          top_3_fits?: Json | null
          top_gap?: number | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          ua_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          validity?: Json | null
          validity_status?: string | null
          version?: string | null
        }
        Update: {
          base_func?: string | null
          baseline_session_id?: string | null
          blocks?: Json | null
          blocks_norm?: Json | null
          close_call?: boolean | null
          confidence?: string | null
          created_at?: string | null
          creative_func?: string | null
          deltas?: Json | null
          dimensions?: Json | null
          dims_highlights?: Json | null
          email_mask?: string | null
          fc_answered_ct?: number | null
          fc_count?: number | null
          fc_coverage_bucket?: string | null
          fit_band?: string | null
          fit_explainer?: Json | null
          gap_minutes?: number | null
          glossary_version?: number | null
          id?: string
          invalid_combo_flag?: boolean | null
          ip_hash?: string | null
          neuroticism?: Json | null
          overlay?: string | null
          parent_session_id?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          results_version?: string | null
          run_index?: number | null
          score_fit_calibrated?: number | null
          score_fit_raw?: number | null
          session_id?: string
          session_kind?: string | null
          strengths?: Json | null
          top_3_fits?: Json | null
          top_gap?: number | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          ua_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          validity?: Json | null
          validity_status?: string | null
          version?: string | null
        }
        Relationships: []
      }
      scoring_config: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      trading_candles: {
        Row: {
          candle_body_pct: number | null
          candle_pattern: string | null
          close: number | null
          day_of_week: string | null
          ema_13: number | null
          ema_21: number | null
          gap_open_pct: number | null
          high: number | null
          interval: string
          low: number | null
          lower_shadow_pct: number | null
          open: number | null
          pair: string
          price_vs_ema_13: number | null
          roc_10: number | null
          roc_5: number | null
          rsi: number | null
          timestamp: string
          upper_shadow_pct: number | null
          volume: number | null
          volume_percentile: number | null
        }
        Insert: {
          candle_body_pct?: number | null
          candle_pattern?: string | null
          close?: number | null
          day_of_week?: string | null
          ema_13?: number | null
          ema_21?: number | null
          gap_open_pct?: number | null
          high?: number | null
          interval: string
          low?: number | null
          lower_shadow_pct?: number | null
          open?: number | null
          pair: string
          price_vs_ema_13?: number | null
          roc_10?: number | null
          roc_5?: number | null
          rsi?: number | null
          timestamp: string
          upper_shadow_pct?: number | null
          volume?: number | null
          volume_percentile?: number | null
        }
        Update: {
          candle_body_pct?: number | null
          candle_pattern?: string | null
          close?: number | null
          day_of_week?: string | null
          ema_13?: number | null
          ema_21?: number | null
          gap_open_pct?: number | null
          high?: number | null
          interval?: string
          low?: number | null
          lower_shadow_pct?: number | null
          open?: number | null
          pair?: string
          price_vs_ema_13?: number | null
          roc_10?: number | null
          roc_5?: number | null
          rsi?: number | null
          timestamp?: string
          upper_shadow_pct?: number | null
          volume?: number | null
          volume_percentile?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      v_activity_country_30d: {
        Row: {
          country_label: string | null
          iso2: string | null
          sessions: number | null
        }
        Relationships: []
      }
      v_calibration_confidence: {
        Row: {
          conf_bin: string | null
          hit_rate: number | null
          n: number | null
        }
        Relationships: []
      }
      v_close_call_resolution: {
        Row: {
          session_id_1: string | null
          session_id_2: string | null
          t1: string | null
          t2: string | null
          top_gap_1: number | null
          top_gap_2: number | null
          user_id: string | null
          was_close_call: boolean | null
        }
        Relationships: []
      }
      v_conf_dist: {
        Row: {
          confidence: string | null
          n: number | null
        }
        Relationships: []
      }
      v_dashboard_stats: {
        Row: {
          assessment_date: string | null
          daily_count: number | null
          overlay_negative: number | null
          overlay_positive: number | null
          overlay_unknown: number | null
          type_eie: number | null
          type_eii: number | null
          type_ese: number | null
          type_esi: number | null
          type_iee: number | null
          type_iei: number | null
          type_ile: number | null
          type_ili: number | null
          type_lie: number | null
          type_lii: number | null
          type_lse: number | null
          type_lsi: number | null
          type_see: number | null
          type_sei: number | null
          type_sle: number | null
          type_sli: number | null
        }
        Relationships: []
      }
      v_dim_coverage: {
        Row: {
          d_items: number | null
          func: string | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_dim_reliability_prep: {
        Row: {
          fe_dim_1: number | null
          fe_dim_1_retest: number | null
          fi_dim_1: number | null
          fi_dim_1_retest: number | null
          ne_dim_1: number | null
          ne_dim_1_retest: number | null
          ni_dim_1: number | null
          ni_dim_1_retest: number | null
          se_dim_1: number | null
          se_dim_1_retest: number | null
          session_id_1: string | null
          session_id_2: string | null
          si_dim_1: number | null
          si_dim_1_retest: number | null
          t1: string | null
          t2: string | null
          te_dim_1: number | null
          te_dim_1_retest: number | null
          ti_dim_1: number | null
          ti_dim_1_retest: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_duplicates: {
        Row: {
          sessions_ct: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_fairness_demographics: {
        Row: {
          confidence: string | null
          country: string | null
          created_at: string | null
          fit_abs_top1: number | null
          is_low_confidence: number | null
          overlay: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          confidence?: string | null
          country?: never
          created_at?: string | null
          fit_abs_top1?: never
          is_low_confidence?: never
          overlay?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          confidence?: string | null
          country?: never
          created_at?: string | null
          fit_abs_top1?: never
          is_low_confidence?: never
          overlay?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_fc_analytics: {
        Row: {
          fc_coverage_bucket: string | null
          percentage: number | null
          session_count: number | null
        }
        Relationships: []
      }
      v_fc_coverage: {
        Row: {
          answered_count: number | null
          fc_count: number | null
          fc_coverage_bucket: string | null
          fc_total_questions: number | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_fit_histogram: {
        Row: {
          bin: number | null
          bin_max: number | null
          bin_min: number | null
          count: number | null
        }
        Relationships: []
      }
      v_fit_ranks: {
        Row: {
          session_id: string | null
          top_gap: number | null
          top1_code: string | null
          top1_fit: number | null
          top2_fit: number | null
        }
        Relationships: []
      }
      v_item_stats: {
        Row: {
          mean_val: number | null
          n: number | null
          question_id: number | null
          reverse_scored: boolean | null
          scale_type:
            | Database["public"]["Enums"]["assessment_scale_type"]
            | null
          sd_val: number | null
          section: string | null
          social_desirability: boolean | null
          tag: string | null
        }
        Relationships: []
      }
      v_item_total_te: {
        Row: {
          question_id: number | null
          r_item_total_te: number | null
        }
        Relationships: []
      }
      v_kpi_metrics_v11: {
        Row: {
          confidence: string | null
          country: string | null
          created_at: string | null
          day: string | null
          fit: number | null
          fit_band: string | null
          results_version: string | null
          session_id: string | null
          type_code: string | null
          type_share: number | null
        }
        Insert: {
          confidence?: string | null
          country?: never
          created_at?: string | null
          day?: never
          fit?: never
          fit_band?: string | null
          results_version?: never
          session_id?: string | null
          type_code?: string | null
          type_share?: never
        }
        Update: {
          confidence?: string | null
          country?: never
          created_at?: string | null
          day?: never
          fit?: never
          fit_band?: string | null
          results_version?: never
          session_id?: string | null
          type_code?: string | null
          type_share?: never
        }
        Relationships: []
      }
      v_kpi_overlay: {
        Row: {
          n: number | null
          overlay: string | null
        }
        Relationships: []
      }
      v_kpi_overview_30d_v11: {
        Row: {
          avg_fit_score: number | null
          completed_count: number | null
          completion_rate_pct: number | null
          hi_mod_conf_pct: number | null
          overlay_negative: number | null
          overlay_positive: number | null
          started_count: number | null
        }
        Relationships: []
      }
      v_kpi_quality: {
        Row: {
          close_calls_share: number | null
          conf_hi_mod_share: number | null
          conf_low_share: number | null
          fit_median: number | null
          gap_median: number | null
          incons_ge_1_5: number | null
          inconsistency_mean: number | null
          n: number | null
          sd_ge_4_6: number | null
          sd_index_mean: number | null
        }
        Relationships: []
      }
      v_kpi_throughput: {
        Row: {
          completions: number | null
          d: string | null
          median_minutes: number | null
        }
        Relationships: []
      }
      v_latest_assessments_v11: {
        Row: {
          confidence: string | null
          country: string | null
          finished_at: string | null
          fit_band: string | null
          fit_value: number | null
          invalid_combo_flag: boolean | null
          overlay: string | null
          session_id: string | null
          share_pct: number | null
          type_code: string | null
          version: string | null
        }
        Insert: {
          confidence?: string | null
          country?: never
          finished_at?: string | null
          fit_band?: string | null
          fit_value?: never
          invalid_combo_flag?: boolean | null
          overlay?: string | null
          session_id?: string | null
          share_pct?: never
          type_code?: never
          version?: never
        }
        Update: {
          confidence?: string | null
          country?: never
          finished_at?: string | null
          fit_band?: string | null
          fit_value?: never
          invalid_combo_flag?: boolean | null
          overlay?: string | null
          session_id?: string | null
          share_pct?: never
          type_code?: never
          version?: never
        }
        Relationships: []
      }
      v_method_agreement_prep: {
        Row: {
          answer_array: string[] | null
          answer_numeric: number | null
          function_name: string | null
          question_id: number | null
          scale_type:
            | Database["public"]["Enums"]["assessment_scale_type"]
            | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_overlay_conf: {
        Row: {
          confidence: string | null
          n: number | null
          overlay: string | null
        }
        Relationships: []
      }
      v_overlay_invariance: {
        Row: {
          confidence: string | null
          created_at: string | null
          fit_abs_top1: number | null
          overlay: string | null
          session_id: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          fit_abs_top1?: never
          overlay?: string | null
          session_id?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          fit_abs_top1?: never
          overlay?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      v_profiles_ext: {
        Row: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          confidence: string | null
          created_at: string | null
          creative_func: string | null
          deltas: Json | null
          dimensions: Json | null
          dims_highlights: Json | null
          email_mask: string | null
          fit_2: number | null
          fit_gap: number | null
          fit_top: number | null
          glossary_version: number | null
          id: string | null
          inconsistency: number | null
          neuroticism: Json | null
          overlay: string | null
          person_key: string | null
          prev_session_id: string | null
          run_index: number | null
          sd_index: number | null
          session_id: string | null
          strengths: Json | null
          top_types: Json | null
          type_code: string | null
          type_scores: Json | null
          type_top: string | null
          updated_at: string | null
          user_id: string | null
          validity: Json | null
          version: string | null
        }
        Insert: {
          base_func?: string | null
          baseline_session_id?: string | null
          blocks?: Json | null
          blocks_norm?: Json | null
          confidence?: string | null
          created_at?: string | null
          creative_func?: string | null
          deltas?: Json | null
          dimensions?: Json | null
          dims_highlights?: Json | null
          email_mask?: string | null
          fit_2?: never
          fit_gap?: never
          fit_top?: never
          glossary_version?: number | null
          id?: string | null
          inconsistency?: never
          neuroticism?: Json | null
          overlay?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          run_index?: number | null
          sd_index?: never
          session_id?: string | null
          strengths?: Json | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          type_top?: never
          updated_at?: string | null
          user_id?: string | null
          validity?: Json | null
          version?: string | null
        }
        Update: {
          base_func?: string | null
          baseline_session_id?: string | null
          blocks?: Json | null
          blocks_norm?: Json | null
          confidence?: string | null
          created_at?: string | null
          creative_func?: string | null
          deltas?: Json | null
          dimensions?: Json | null
          dims_highlights?: Json | null
          email_mask?: string | null
          fit_2?: never
          fit_gap?: never
          fit_top?: never
          glossary_version?: number | null
          id?: string | null
          inconsistency?: never
          neuroticism?: Json | null
          overlay?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          run_index?: number | null
          sd_index?: never
          session_id?: string | null
          strengths?: Json | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          type_top?: never
          updated_at?: string | null
          user_id?: string | null
          validity?: Json | null
          version?: string | null
        }
        Relationships: []
      }
      v_quality: {
        Row: {
          func_balance: number | null
          inconsistency: number | null
          sd_index: number | null
          session_id: string | null
          top_gap: number | null
          top1_fit: number | null
          top2_fit: number | null
        }
        Relationships: []
      }
      v_recent_assessments_safe: {
        Row: {
          country_display: string | null
          created_at: string | null
          fit_indicator: string | null
          overlay: string | null
          time_period: string | null
          type_prefix: string | null
        }
        Relationships: []
      }
      v_retest_deltas: {
        Row: {
          days_between: number | null
          dim_change_ct: number | null
          session_id_1: string | null
          session_id_2: string | null
          strength_delta: number | null
          t1: string | null
          t2: string | null
          type_same: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_retest_pairs: {
        Row: {
          blocks_1: Json | null
          blocks_2: Json | null
          dimensions_1: Json | null
          dimensions_2: Json | null
          overlay_1: string | null
          overlay_2: string | null
          session_id_1: string | null
          session_id_2: string | null
          strengths_1: Json | null
          strengths_2: Json | null
          t1: string | null
          t2: string | null
          type_1: string | null
          type_2: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_section_progress: {
        Row: {
          answered: number | null
          section: string | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_section_time: {
        Row: {
          median_seconds: number | null
          section: string | null
        }
        Relationships: []
      }
      v_section_times: {
        Row: {
          drop_rate: number | null
          median_sec: number | null
          section: string | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_sessions: {
        Row: {
          confidence: string | null
          created_at: string | null
          d: string | null
          dimensions: Json | null
          inconsistency: number | null
          overlay: string | null
          sd_index: number | null
          session_id: string | null
          strengths: Json | null
          top_types: Json | null
          type_code: string | null
          type_scores: Json | null
          type3: string | null
          user_id: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          d?: never
          dimensions?: Json | null
          inconsistency?: never
          overlay?: string | null
          sd_index?: never
          session_id?: string | null
          strengths?: Json | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          type3?: never
          user_id?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          d?: never
          dimensions?: Json | null
          inconsistency?: never
          overlay?: string | null
          sd_index?: never
          session_id?: string | null
          strengths?: Json | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          type3?: never
          user_id?: string | null
        }
        Relationships: []
      }
      v_sessions_plus: {
        Row: {
          completed_at: string | null
          confidence: string | null
          created_at: string | null
          d: string | null
          device: string | null
          dimensions: Json | null
          duration_sec: number | null
          inconsistency: number | null
          overlay: string | null
          sd_index: number | null
          session_id: string | null
          started_at: string | null
          strengths: Json | null
          top_types: Json | null
          type_code: string | null
          type_scores: Json | null
          type3: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_share_entropy: {
        Row: {
          session_id: string | null
          share_entropy: number | null
        }
        Relationships: []
      }
      v_state_index: {
        Row: {
          session_id: string | null
          state_items_count: number | null
          state_mean: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_state_trait_sep: {
        Row: {
          confidence: string | null
          created_at: string | null
          overlay: string | null
          session_id: string | null
          state_items_count: number | null
          state_mean: number | null
          strengths_mean: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_test_retest_strength_r: {
        Row: {
          adjacent_flip: boolean | null
          days_apart: number | null
          r_strengths: number | null
          session_id_1: string | null
          session_id_2: string | null
          stable: boolean | null
          t1: string | null
          t2: string | null
          top1_a: string | null
          top1_b: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_throughput: {
        Row: {
          d: string | null
          sessions: number | null
        }
        Relationships: []
      }
      v_type_distinctiveness_prep: {
        Row: {
          base_dim: number | null
          base_func: string | null
          base_strength: number | null
          confidence: string | null
          created_at: string | null
          creative_dim: number | null
          creative_func: string | null
          creative_strength: number | null
          overlay: string | null
          session_id: string | null
          type_code: string | null
        }
        Insert: {
          base_dim?: never
          base_func?: string | null
          base_strength?: never
          confidence?: string | null
          created_at?: string | null
          creative_dim?: never
          creative_func?: string | null
          creative_strength?: never
          overlay?: string | null
          session_id?: string | null
          type_code?: string | null
        }
        Update: {
          base_dim?: never
          base_func?: string | null
          base_strength?: never
          confidence?: string | null
          created_at?: string | null
          creative_dim?: never
          creative_func?: string | null
          creative_strength?: never
          overlay?: string | null
          session_id?: string | null
          type_code?: string | null
        }
        Relationships: []
      }
      v_user_sessions_chrono: {
        Row: {
          email: string | null
          gap_minutes: number | null
          prev_session_id: string | null
          session_id: string | null
          started_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_validity: {
        Row: {
          pass_validity: boolean | null
          session_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_recent_completion: {
        Args: { threshold_days?: number; user_email: string }
        Returns: {
          days_since_completion: number
          has_recent_completion: boolean
          last_completion_date: string
        }[]
      }
      get_dashboard_country_stats: {
        Args: { days_back?: number }
        Returns: {
          country_name: string
          session_count: number
        }[]
      }
      get_profile_by_session: {
        Args: { p_session_id: string; p_share_token: string }
        Returns: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          close_call: boolean | null
          confidence: string | null
          created_at: string | null
          creative_func: string | null
          deltas: Json | null
          dimensions: Json | null
          dims_highlights: Json | null
          email_mask: string | null
          fc_answered_ct: number | null
          fc_count: number | null
          fc_coverage_bucket: string | null
          fit_band: string | null
          fit_explainer: Json | null
          gap_minutes: number | null
          glossary_version: number | null
          id: string
          invalid_combo_flag: boolean | null
          ip_hash: string | null
          neuroticism: Json | null
          overlay: string | null
          parent_session_id: string | null
          person_key: string | null
          prev_session_id: string | null
          results_version: string | null
          run_index: number | null
          score_fit_calibrated: number | null
          score_fit_raw: number | null
          session_id: string
          session_kind: string | null
          strengths: Json | null
          top_3_fits: Json | null
          top_gap: number | null
          top_types: Json | null
          type_code: string | null
          type_scores: Json | null
          ua_hash: string | null
          updated_at: string | null
          user_id: string | null
          validity: Json | null
          validity_status: string | null
          version: string | null
        }
      }
      get_recent_assessments_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          confidence: string
          country_display: string
          created_at: string
          fit_band: string
          fit_score: number
          invalid_combo_flag: boolean
          results_version: string
          score_fit_calibrated: number
          score_fit_raw: number
          session_id: string
          share_pct: number
          top_gap: number
          type_display: string
          version: string
        }[]
      }
      kpi_country_activity_v11: {
        Args: { end_ts?: string; start_ts?: string }
        Returns: {
          country: string
          sessions: number
        }[]
      }
      update_dashboard_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      assessment_scale_type:
        | "LIKERT_1_5"
        | "LIKERT_1_7"
        | "STATE_1_7"
        | "FORCED_CHOICE_2"
        | "FORCED_CHOICE_4"
        | "FORCED_CHOICE_5"
        | "CATEGORICAL_5"
        | "FREQUENCY"
        | "matrix"
        | "select-all"
        | "ranking"
        | "META"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assessment_scale_type: [
        "LIKERT_1_5",
        "LIKERT_1_7",
        "STATE_1_7",
        "FORCED_CHOICE_2",
        "FORCED_CHOICE_4",
        "FORCED_CHOICE_5",
        "CATEGORICAL_5",
        "FREQUENCY",
        "matrix",
        "select-all",
        "ranking",
        "META",
      ],
    },
  },
} as const
