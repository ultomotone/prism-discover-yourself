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
      _write_probe: {
        Row: {
          ts: string | null
        }
        Insert: {
          ts?: string | null
        }
        Update: {
          ts?: string | null
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          created_at: string
          fc_map: Json | null
          id: number
          meta: Json | null
          order_index: number | null
          pair_group: string | null
          required: boolean | null
          reverse_scored: boolean | null
          scale_type: string | null
          section: string
          tag: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fc_map?: Json | null
          id: number
          meta?: Json | null
          order_index?: number | null
          pair_group?: string | null
          required?: boolean | null
          reverse_scored?: boolean | null
          scale_type?: string | null
          section: string
          tag?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fc_map?: Json | null
          id?: number
          meta?: Json | null
          order_index?: number | null
          pair_group?: string | null
          required?: boolean | null
          reverse_scored?: boolean | null
          scale_type?: string | null
          section?: string
          tag?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
            referencedRelation: "v_incomplete_sessions"
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
          attempt_no: number | null
          completed_at: string | null
          completed_at_original: string | null
          completed_questions: number | null
          country_iso2: string | null
          created_at: string
          created_at_original: string | null
          email: string | null
          finalized_at: string | null
          id: string
          ip_hash: string | null
          metadata: Json | null
          paid_at: string | null
          parent_session: string | null
          payment_status: string | null
          session_type: string
          share_token: string
          share_token_expires_at: string | null
          started_at: string
          started_at_original: string | null
          status: string | null
          total_questions: number | null
          ua_hash: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempt_no?: number | null
          completed_at?: string | null
          completed_at_original?: string | null
          completed_questions?: number | null
          country_iso2?: string | null
          created_at?: string
          created_at_original?: string | null
          email?: string | null
          finalized_at?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          paid_at?: string | null
          parent_session?: string | null
          payment_status?: string | null
          session_type?: string
          share_token: string
          share_token_expires_at?: string | null
          started_at?: string
          started_at_original?: string | null
          status?: string | null
          total_questions?: number | null
          ua_hash?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempt_no?: number | null
          completed_at?: string | null
          completed_at_original?: string | null
          completed_questions?: number | null
          country_iso2?: string | null
          created_at?: string
          created_at_original?: string | null
          email?: string | null
          finalized_at?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          paid_at?: string | null
          parent_session?: string | null
          payment_status?: string | null
          session_type?: string
          share_token?: string
          share_token_expires_at?: string | null
          started_at?: string
          started_at_original?: string | null
          status?: string | null
          total_questions?: number | null
          ua_hash?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      calibration_model: {
        Row: {
          brier_score: number | null
          calibration_error: number | null
          id: number
          knots: Json
          method: string
          stratum: Json
          total_sample_size: number | null
          trained_at: string
          training_size: number | null
          validation_size: number | null
          version: string
        }
        Insert: {
          brier_score?: number | null
          calibration_error?: number | null
          id?: number
          knots: Json
          method?: string
          stratum: Json
          total_sample_size?: number | null
          trained_at?: string
          training_size?: number | null
          validation_size?: number | null
          version?: string
        }
        Update: {
          brier_score?: number | null
          calibration_error?: number | null
          id?: number
          knots?: Json
          method?: string
          stratum?: Json
          total_sample_size?: number | null
          trained_at?: string
          training_size?: number | null
          validation_size?: number | null
          version?: string
        }
        Relationships: []
      }
      change_requests: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          params: Json
          result: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          params: Json
          result?: Json | null
          status?: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          params?: Json
          result?: Json | null
          status?: string
        }
        Relationships: []
      }
      country_mapping: {
        Row: {
          country_name: string
          iso2_code: string
        }
        Insert: {
          country_name: string
          iso2_code: string
        }
        Update: {
          country_name?: string
          iso2_code?: string
        }
        Relationships: []
      }
      dashboard_statistics: {
        Row: {
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
      evidence_kpis: {
        Row: {
          id: number
          mai_overall: number | null
          median_days_apart: number | null
          pairs_n: number
          r_fe: number | null
          r_fi: number | null
          r_ne: number | null
          r_ni: number | null
          r_overall: number | null
          r_se: number | null
          r_si: number | null
          r_te: number | null
          r_ti: number | null
          type_stability_pct: number | null
          updated_at: string
        }
        Insert: {
          id?: number
          mai_overall?: number | null
          median_days_apart?: number | null
          pairs_n?: number
          r_fe?: number | null
          r_fi?: number | null
          r_ne?: number | null
          r_ni?: number | null
          r_overall?: number | null
          r_se?: number | null
          r_si?: number | null
          r_te?: number | null
          r_ti?: number | null
          type_stability_pct?: number | null
          updated_at?: string
        }
        Update: {
          id?: number
          mai_overall?: number | null
          median_days_apart?: number | null
          pairs_n?: number
          r_fe?: number | null
          r_fi?: number | null
          r_ne?: number | null
          r_ni?: number | null
          r_overall?: number | null
          r_se?: number | null
          r_si?: number | null
          r_te?: number | null
          r_ti?: number | null
          type_stability_pct?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fc_blocks: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          order_index: number
          title: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index: number
          title: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          version?: string
        }
        Relationships: []
      }
      fc_options: {
        Row: {
          block_id: string
          created_at: string
          id: string
          option_code: string
          order_index: number
          prompt: string
          weights_json: Json
        }
        Insert: {
          block_id: string
          created_at?: string
          id?: string
          option_code: string
          order_index: number
          prompt: string
          weights_json: Json
        }
        Update: {
          block_id?: string
          created_at?: string
          id?: string
          option_code?: string
          order_index?: number
          prompt?: string
          weights_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fc_options_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "fc_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      fc_responses: {
        Row: {
          answered_at: string
          block_id: string
          option_id: string
          session_id: string
        }
        Insert: {
          answered_at?: string
          block_id: string
          option_id: string
          session_id: string
        }
        Update: {
          answered_at?: string
          block_id?: string
          option_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fc_responses_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "fc_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fc_responses_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "fc_options"
            referencedColumns: ["id"]
          },
        ]
      }
      fc_scores: {
        Row: {
          blocks_answered: number
          created_at: string
          fc_kind: string
          scores_json: Json
          session_id: string
          version: string
        }
        Insert: {
          blocks_answered: number
          created_at?: string
          fc_kind: string
          scores_json: Json
          session_id: string
          version?: string
        }
        Update: {
          blocks_answered?: number
          created_at?: string
          fc_kind?: string
          scores_json?: Json
          session_id?: string
          version?: string
        }
        Relationships: []
      }
      fn_logs: {
        Row: {
          at: string | null
          evt: string
          id: number
          payload: Json | null
        }
        Insert: {
          at?: string | null
          evt: string
          id?: number
          payload?: Json | null
        }
        Update: {
          at?: string | null
          evt?: string
          id?: number
          payload?: Json | null
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
      newsletter_signups: {
        Row: {
          confirmation_token: string | null
          confirmed: boolean | null
          created_at: string
          email: string
          id: string
          interests: string[] | null
          signup_source: string | null
          updated_at: string
        }
        Insert: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          created_at?: string
          email: string
          id?: string
          interests?: string[] | null
          signup_source?: string | null
          updated_at?: string
        }
        Update: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          created_at?: string
          email?: string
          id?: string
          interests?: string[] | null
          signup_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          calibration_version: string | null
          close_call: boolean | null
          conf_band: string | null
          conf_calibrated: number | null
          conf_raw: number | null
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
          neuro_mean: number | null
          neuro_z: number | null
          neuroticism: Json | null
          overlay: string | null
          overlay_neuro: string | null
          overlay_state: string | null
          paid: boolean
          parent_session_id: string | null
          person_key: string | null
          prev_session_id: string | null
          recomputed_at: string | null
          responses_hash: string | null
          results_version: string | null
          run_index: number | null
          score_fit_calibrated: number | null
          score_fit_raw: number | null
          session_id: string
          session_kind: string | null
          share_token: string
          state_index: number | null
          strengths: Json | null
          submitted_at: string | null
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
          calibration_version?: string | null
          close_call?: boolean | null
          conf_band?: string | null
          conf_calibrated?: number | null
          conf_raw?: number | null
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
          neuro_mean?: number | null
          neuro_z?: number | null
          neuroticism?: Json | null
          overlay?: string | null
          overlay_neuro?: string | null
          overlay_state?: string | null
          paid?: boolean
          parent_session_id?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          recomputed_at?: string | null
          responses_hash?: string | null
          results_version?: string | null
          run_index?: number | null
          score_fit_calibrated?: number | null
          score_fit_raw?: number | null
          session_id: string
          session_kind?: string | null
          share_token?: string
          state_index?: number | null
          strengths?: Json | null
          submitted_at?: string | null
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
          calibration_version?: string | null
          close_call?: boolean | null
          conf_band?: string | null
          conf_calibrated?: number | null
          conf_raw?: number | null
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
          neuro_mean?: number | null
          neuro_z?: number | null
          neuroticism?: Json | null
          overlay?: string | null
          overlay_neuro?: string | null
          overlay_state?: string | null
          paid?: boolean
          parent_session_id?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          recomputed_at?: string | null
          responses_hash?: string | null
          results_version?: string | null
          run_index?: number | null
          score_fit_calibrated?: number | null
          score_fit_raw?: number | null
          session_id?: string
          session_kind?: string | null
          share_token?: string
          state_index?: number | null
          strengths?: Json | null
          submitted_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_ends_at: string
        }
        Insert: {
          count?: number
          key: string
          window_ends_at: string
        }
        Update: {
          count?: number
          key?: string
          window_ends_at?: string
        }
        Relationships: []
      }
      results_token_access_logs: {
        Row: {
          id: number
          ip: string | null
          profile_id: string | null
          session_id: string | null
          success: boolean
          token_hash: string
          ts: string
          ua: string | null
        }
        Insert: {
          id?: never
          ip?: string | null
          profile_id?: string | null
          session_id?: string | null
          success?: boolean
          token_hash: string
          ts?: string
          ua?: string | null
        }
        Update: {
          id?: never
          ip?: string | null
          profile_id?: string | null
          session_id?: string | null
          success?: boolean
          token_hash?: string
          ts?: string
          ua?: string | null
        }
        Relationships: []
      }
      results_token_events: {
        Row: {
          event: string
          id: number
          new_token_hash: string
          old_token_hash: string | null
          profile_id: string | null
          session_id: string
          ts: string
          user_id: string | null
        }
        Insert: {
          event: string
          id?: never
          new_token_hash: string
          old_token_hash?: string | null
          profile_id?: string | null
          session_id: string
          ts?: string
          user_id?: string | null
        }
        Update: {
          event?: string
          id?: never
          new_token_hash?: string
          old_token_hash?: string | null
          profile_id?: string | null
          session_id?: string
          ts?: string
          user_id?: string | null
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
      scoring_configs: {
        Row: {
          config: Json
          created_at: string | null
          version: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          version: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          version?: string
        }
        Relationships: []
      }
      scoring_results: {
        Row: {
          calibration_version: string | null
          computed_at: string | null
          confidence: number | null
          created_at: string | null
          dimensions: Json | null
          fit_band: string | null
          id: string
          overlay: string | null
          results_version: string | null
          score_fit_calibrated: number | null
          session_id: string
          top_types: Json | null
          type_code: string | null
          updated_at: string | null
          user_id: string | null
          validity_status: string | null
        }
        Insert: {
          calibration_version?: string | null
          computed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          dimensions?: Json | null
          fit_band?: string | null
          id?: string
          overlay?: string | null
          results_version?: string | null
          score_fit_calibrated?: number | null
          session_id: string
          top_types?: Json | null
          type_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          validity_status?: string | null
        }
        Update: {
          calibration_version?: string | null
          computed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          dimensions?: Json | null
          fit_band?: string | null
          id?: string
          overlay?: string | null
          results_version?: string | null
          score_fit_calibrated?: number | null
          session_id?: string
          top_types?: Json | null
          type_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          validity_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      scoring_results_functions: {
        Row: {
          created_at: string
          d_index_z: number | null
          dimension: number
          func: string
          results_version: string
          session_id: string
          strength_z: number
        }
        Insert: {
          created_at?: string
          d_index_z?: number | null
          dimension: number
          func: string
          results_version?: string
          session_id: string
          strength_z: number
        }
        Update: {
          created_at?: string
          d_index_z?: number | null
          dimension?: number
          func?: string
          results_version?: string
          session_id?: string
          strength_z?: number
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_functions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_functions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_functions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      scoring_results_state: {
        Row: {
          block_context: string
          block_core: number | null
          block_critic: number | null
          block_hidden: number | null
          block_instinct: number | null
          created_at: string
          effect_conf: number | null
          effect_fit: number | null
          overlay_band: string
          overlay_z: number | null
          results_version: string
          session_id: string
        }
        Insert: {
          block_context?: string
          block_core?: number | null
          block_critic?: number | null
          block_hidden?: number | null
          block_instinct?: number | null
          created_at?: string
          effect_conf?: number | null
          effect_fit?: number | null
          overlay_band: string
          overlay_z?: number | null
          results_version?: string
          session_id: string
        }
        Update: {
          block_context?: string
          block_core?: number | null
          block_critic?: number | null
          block_hidden?: number | null
          block_instinct?: number | null
          created_at?: string
          effect_conf?: number | null
          effect_fit?: number | null
          overlay_band?: string
          overlay_z?: number | null
          results_version?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      scoring_results_types: {
        Row: {
          calibration_version: string | null
          coherent_dims: number | null
          created_at: string
          distance: number
          fit: number
          fit_parts: Json
          results_version: string
          seat_coherence: number | null
          session_id: string
          share: number
          type_code: string
          unique_dims: number | null
        }
        Insert: {
          calibration_version?: string | null
          coherent_dims?: number | null
          created_at?: string
          distance: number
          fit: number
          fit_parts?: Json
          results_version?: string
          seat_coherence?: number | null
          session_id: string
          share: number
          type_code: string
          unique_dims?: number | null
        }
        Update: {
          calibration_version?: string | null
          coherent_dims?: number | null
          created_at?: string
          distance?: number
          fit?: number
          fit_parts?: Json
          results_version?: string
          seat_coherence?: number | null
          session_id?: string
          share?: number
          type_code?: string
          unique_dims?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_types_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_types_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_types_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      session_method_metrics: {
        Row: {
          created_at: string | null
          fc_z: Json
          likert_z: Json
          session_id: string
        }
        Insert: {
          created_at?: string | null
          fc_z: Json
          likert_z: Json
          session_id: string
        }
        Update: {
          created_at?: string | null
          fc_z?: Json
          likert_z?: Json
          session_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          created_at: string
          data: Json
          id: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      type_prototypes: {
        Row: {
          block: string
          created_at: string
          func: string
          type_code: string
          updated_at: string
        }
        Insert: {
          block: string
          created_at?: string
          func: string
          type_code: string
          updated_at?: string
        }
        Update: {
          block?: string
          created_at?: string
          func?: string
          type_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          id: string
          name: string
        }
        Insert: {
          email: string
          id?: string
          name: string
        }
        Update: {
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_confidence_dist_last_30d: {
        Row: {
          band: string | null
          ct: number | null
          pct: number | null
        }
        Relationships: []
      }
      admin_kpis_last_30d: {
        Row: {
          completion_rate_30d: number | null
          profiles_created_30d: number | null
          sessions_completed_30d: number | null
          sessions_started_30d: number | null
          unique_users_30d: number | null
        }
        Relationships: []
      }
      admin_overlay_dist_last_30d: {
        Row: {
          ct: number | null
          overlay: string | null
          pct: number | null
        }
        Relationships: []
      }
      admin_throughput_last_14d: {
        Row: {
          completions: number | null
          day: string | null
        }
        Relationships: []
      }
      admin_type_dist_last_30d: {
        Row: {
          n: number | null
          primary_type: string | null
        }
        Relationships: []
      }
      assessment_landscape: {
        Row: {
          assessment_id: string | null
          confidence: string | null
          confidence_band: string | null
          confidence_margin: number | null
          created_at: string | null
          duration_minutes: number | null
          fit_abs: number | null
          inconsistency_score: number | null
          overlay: string | null
          respondent_id: string | null
          sd_score: number | null
          session_id: string | null
          stalled: boolean | null
          state_focus: number | null
          state_mood: number | null
          state_sleep: number | null
          state_stress: number | null
          state_time_pressure: number | null
          submitted_at: string | null
          top_gap: number | null
          type_code: string | null
          validity_pass: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      assessment_questions_view: {
        Row: {
          created_at: string | null
          fc_map: Json | null
          id: number | null
          meta: Json | null
          order_index: number | null
          pair_group: string | null
          required: boolean | null
          reverse_scored: boolean | null
          scale_type: string | null
          section: string | null
          tag: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fc_map?: Json | null
          id?: number | null
          meta?: Json | null
          order_index?: number | null
          pair_group?: string | null
          required?: boolean | null
          reverse_scored?: boolean | null
          scale_type?: string | null
          section?: string | null
          tag?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fc_map?: Json | null
          id?: number | null
          meta?: Json | null
          order_index?: number | null
          pair_group?: string | null
          required?: boolean | null
          reverse_scored?: boolean | null
          scale_type?: string | null
          section?: string | null
          tag?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_profile_stats: {
        Row: {
          assessment_date: string | null
          confidence: string | null
          count: number | null
          fit_band: string | null
          overlay: string | null
          type_code: string | null
        }
        Relationships: []
      }
      dashboard_statistics_latest: {
        Row: {
          created_at: string | null
          daily_assessments: number | null
          id: string | null
          overlay_negative: number | null
          overlay_positive: number | null
          stat_date: string | null
          total_assessments: number | null
          type_distribution: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_assessments?: number | null
          id?: string | null
          overlay_negative?: number | null
          overlay_positive?: number | null
          stat_date?: string | null
          total_assessments?: number | null
          type_distribution?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_assessments?: number | null
          id?: string | null
          overlay_negative?: number | null
          overlay_positive?: number | null
          stat_date?: string | null
          total_assessments?: number | null
          type_distribution?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inferred_session_times: {
        Row: {
          completed_at_created_at: string | null
          completed_at_inferred_ms: string | null
          session_id: string | null
          started_at_created_at: string | null
          started_at_inferred_ms: string | null
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
            referencedRelation: "v_incomplete_sessions"
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
      scoring_version_status: {
        Row: {
          code_version: string | null
          db_version: string | null
          matches: boolean | null
        }
        Relationships: []
      }
      v_activity_country_30d: {
        Row: {
          country_name: string | null
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
      v_calibration_training: {
        Row: {
          created_at: string | null
          dim_band: string | null
          observed: number | null
          overlay: string | null
          raw_conf: number | null
          session_id_a: string | null
          session_id_b: string | null
          type_a: string | null
          type_b: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_a"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_b"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_a"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_b"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_a"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_b"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
            referencedRelation: "v_incomplete_sessions"
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_fc_coverage: {
        Row: {
          answered_count: number | null
          fc_count: number | null
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
            referencedRelation: "v_incomplete_sessions"
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_incomplete_sessions: {
        Row: {
          completed_at: string | null
          completed_questions: number | null
          created_at: string | null
          email: string | null
          id: string | null
          status: string | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          status?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          status?: string | null
          total_questions?: number | null
          user_id?: string | null
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
          results_version?: string | null
          session_id?: string | null
          type_code?: never
          type_share?: never
        }
        Update: {
          confidence?: string | null
          country?: never
          created_at?: string | null
          day?: never
          fit?: never
          fit_band?: string | null
          results_version?: string | null
          session_id?: string | null
          type_code?: never
          type_share?: never
        }
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
          score_fit_calibrated: number | null
          score_fit_raw: number | null
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
          score_fit_calibrated?: number | null
          score_fit_raw?: number | null
          session_id?: string | null
          share_pct?: never
          type_code?: string | null
          version?: string | null
        }
        Update: {
          confidence?: string | null
          country?: never
          finished_at?: string | null
          fit_band?: string | null
          fit_value?: never
          invalid_combo_flag?: boolean | null
          overlay?: string | null
          score_fit_calibrated?: number | null
          score_fit_raw?: number | null
          session_id?: string | null
          share_pct?: never
          type_code?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_live_assessments: {
        Row: {
          created_at: string | null
          fit_score: number | null
          overlay_label: string | null
          primary_type: string | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_method_agreement: {
        Row: {
          day: string | null
          mai: number | null
          n_sessions: number | null
          r_fe: number | null
          r_fi: number | null
          r_ne: number | null
          r_ni: number | null
          r_se: number | null
          r_si: number | null
          r_te: number | null
          r_ti: number | null
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
            referencedRelation: "v_incomplete_sessions"
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
      v_results_access_last_24h: {
        Row: {
          calls: number | null
          hour: string | null
          legacy_calls: number | null
          successes: number | null
        }
        Relationships: []
      }
      v_results_functions: {
        Row: {
          created_at: string | null
          d_index_z: number | null
          dimension: number | null
          func: string | null
          results_version: string | null
          session_id: string | null
          strength_z: number | null
        }
        Insert: {
          created_at?: string | null
          d_index_z?: number | null
          dimension?: number | null
          func?: string | null
          results_version?: string | null
          session_id?: string | null
          strength_z?: number | null
        }
        Update: {
          created_at?: string | null
          d_index_z?: number | null
          dimension?: number | null
          func?: string | null
          results_version?: string | null
          session_id?: string | null
          strength_z?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_functions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_functions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_functions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_results_state: {
        Row: {
          block_context: string | null
          block_core: number | null
          block_critic: number | null
          block_hidden: number | null
          block_instinct: number | null
          created_at: string | null
          effect_conf: number | null
          effect_fit: number | null
          overlay_band: string | null
          overlay_z: number | null
          results_version: string | null
          session_id: string | null
        }
        Insert: {
          block_context?: string | null
          block_core?: number | null
          block_critic?: number | null
          block_hidden?: number | null
          block_instinct?: number | null
          created_at?: string | null
          effect_conf?: number | null
          effect_fit?: number | null
          overlay_band?: string | null
          overlay_z?: number | null
          results_version?: string | null
          session_id?: string | null
        }
        Update: {
          block_context?: string | null
          block_core?: number | null
          block_critic?: number | null
          block_hidden?: number | null
          block_instinct?: number | null
          created_at?: string | null
          effect_conf?: number | null
          effect_fit?: number | null
          overlay_band?: string | null
          overlay_z?: number | null
          results_version?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_results_types: {
        Row: {
          coherent_dims: number | null
          created_at: string | null
          distance: number | null
          fit: number | null
          fit_parts: Json | null
          results_version: string | null
          seat_coherence: number | null
          session_id: string | null
          share: number | null
          type_code: string | null
          unique_dims: number | null
        }
        Insert: {
          coherent_dims?: number | null
          created_at?: string | null
          distance?: number | null
          fit?: number | null
          fit_parts?: Json | null
          results_version?: string | null
          seat_coherence?: number | null
          session_id?: string | null
          share?: number | null
          type_code?: string | null
          unique_dims?: number | null
        }
        Update: {
          coherent_dims?: number | null
          created_at?: string | null
          distance?: number | null
          fit?: number | null
          fit_parts?: Json | null
          results_version?: string | null
          seat_coherence?: number | null
          session_id?: string | null
          share?: number | null
          type_code?: string | null
          unique_dims?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_types_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_types_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_results_types_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
            referencedRelation: "v_incomplete_sessions"
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
            referencedRelation: "v_incomplete_sessions"
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_share_entropy: {
        Row: {
          session_id: string | null
          share_entropy: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
            referencedRelation: "v_incomplete_sessions"
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_2"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id_1"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_throughput: {
        Row: {
          d: string | null
          sessions: number | null
        }
        Relationships: []
      }
      v_token_access_last_24h: {
        Row: {
          hits: number | null
          hour: string | null
        }
        Relationships: []
      }
      v_token_rotations_last_30d: {
        Row: {
          day: string | null
          rotations: number | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
      v_type_distribution: {
        Row: {
          n: number | null
          type_code: string | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_incomplete_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_user_sessions_chrono"
            referencedColumns: ["session_id"]
          },
        ]
      }
    }
    Functions: {
      admin_get_confidence_dist_last_30d: {
        Args: Record<PropertyKey, never>
        Returns: {
          confidence_band: string
          n: number
        }[]
      }
      admin_get_kpis_last_30d: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          value: number
        }[]
      }
      admin_get_latest_assessments: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at_et: string
          confidence_margin: number
          overlay_label: string
          session_id: string
          top_gap: number
          top1_fit: number
          user_id: string
        }[]
      }
      admin_get_overlay_dist_last_30d: {
        Args: Record<PropertyKey, never>
        Returns: {
          n: number
          overlay_name: string
        }[]
      }
      admin_get_summary: {
        Args: { last_n_days?: number }
        Returns: Json
      }
      admin_get_throughput_last_14d: {
        Args: Record<PropertyKey, never>
        Returns: {
          completions: number
          day: string
        }[]
      }
      admin_get_type_dist_last_30d: {
        Args: Record<PropertyKey, never>
        Returns: {
          n: number
          primary_type: string
        }[]
      }
      admin_recompute_profile: {
        Args: { p_session_id: string; p_version: string }
        Returns: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          calibration_version: string | null
          close_call: boolean | null
          conf_band: string | null
          conf_calibrated: number | null
          conf_raw: number | null
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
          neuro_mean: number | null
          neuro_z: number | null
          neuroticism: Json | null
          overlay: string | null
          overlay_neuro: string | null
          overlay_state: string | null
          paid: boolean
          parent_session_id: string | null
          person_key: string | null
          prev_session_id: string | null
          recomputed_at: string | null
          responses_hash: string | null
          results_version: string | null
          run_index: number | null
          score_fit_calibrated: number | null
          score_fit_raw: number | null
          session_id: string
          session_kind: string | null
          share_token: string
          state_index: number | null
          strengths: Json | null
          submitted_at: string | null
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
        }[]
      }
      assert_results_version: {
        Args: { p_expected: string }
        Returns: boolean
      }
      calculate_scores: {
        Args: { p_session_id: string }
        Returns: Json
      }
      can_start_new_session: {
        Args: {
          p_email: string
          p_max_per_window?: number
          p_user: string
          p_window_days?: number
        }
        Returns: {
          allowed: boolean
          next_eligible_at: string
          recent_count: number
        }[]
      }
      check_question_library_integrity: {
        Args: { p_fc_expected_min?: number }
        Returns: {
          errors: string[]
          ok: boolean
          warnings: string[]
        }[]
      }
      check_recent_completion: {
        Args: { threshold_days?: number; user_email: string }
        Returns: {
          days_since_completion: number
          has_recent_completion: boolean
          last_completion_date: string
        }[]
      }
      check_scoring_qa: {
        Args: { p_results_version?: string; p_session_id: string }
        Returns: Json
      }
      compute_profile_from_responses: {
        Args: { p_session_id: string; p_version: string }
        Returns: Json
      }
      compute_session_responses_hash: {
        Args: { p_session: string }
        Returns: string
      }
      count_recent_attempts: {
        Args: { p_user: string; p_window_days: number }
        Returns: number
      }
      example_rate_limited_function: {
        Args: { client_ip: string }
        Returns: string
      }
      fetch_live_assessments: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          fit_score: number
          overlay_label: string
          primary_type: string
          session_id: string
        }[]
      }
      fix_v_recent_assessments_safe: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_continue_url: {
        Args: { session_id: string }
        Returns: string
      }
      get_config_number: {
        Args: { p_default: number; p_key: string }
        Returns: number
      }
      get_dashboard_country_stats: {
        Args: { days_back?: number }
        Returns: {
          country_name: string
          session_count: number
        }[]
      }
      get_dashboard_profile_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          confidence: string
          country: string
          created_at: string
          fit_band: string
          profile_overlay: string
          results_version: string
          type_code: string
        }[]
      }
      get_dashboard_results_by_email: {
        Args: { p_email: string }
        Returns: {
          conf_band: string
          results_url: string
          score_fit_calibrated: number
          session_id: string
          submitted_at: string
          type_code: string
        }[]
      }
      get_evidence_kpis: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          mai_overall: number | null
          median_days_apart: number | null
          pairs_n: number
          r_fe: number | null
          r_fi: number | null
          r_ne: number | null
          r_ni: number | null
          r_overall: number | null
          r_se: number | null
          r_si: number | null
          r_te: number | null
          r_ti: number | null
          type_stability_pct: number | null
          updated_at: string
        }
      }
      get_live_assessments: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          fit_score: number | null
          overlay_label: string | null
          primary_type: string | null
          session_id: string | null
        }[]
      }
      get_live_assessments_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          fit_score: number
          overlay_label: string
          primary_type: string
          session_id: string
        }[]
      }
      get_profile_by_session: {
        Args: { p_session: string; p_share_token: string }
        Returns: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          calibration_version: string | null
          close_call: boolean | null
          conf_band: string | null
          conf_calibrated: number | null
          conf_raw: number | null
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
          neuro_mean: number | null
          neuro_z: number | null
          neuroticism: Json | null
          overlay: string | null
          overlay_neuro: string | null
          overlay_state: string | null
          paid: boolean
          parent_session_id: string | null
          person_key: string | null
          prev_session_id: string | null
          recomputed_at: string | null
          responses_hash: string | null
          results_version: string | null
          run_index: number | null
          score_fit_calibrated: number | null
          score_fit_raw: number | null
          session_id: string
          session_kind: string | null
          share_token: string
          state_index: number | null
          strengths: Json | null
          submitted_at: string | null
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
      get_profile_by_session_token: {
        Args:
          | { p_client_ip: string; p_token: string }
          | { p_session_id: string; p_share_token: string }
          | { p_session_id: string; p_share_token: string }
        Returns: Json
      }
      get_recent_assessments: {
        Args: { _limit?: number; _offset?: number }
        Returns: {
          base_func: string
          completed_at: string
          completed_questions: number
          created_at: string
          creative_func: string
          email: string
          profile_id: string
          session_id: string
          session_type: string
          started_at: string
          status: string
          total_questions: number
          type_code: string
          user_id: string
          validity_status: string
        }[]
      }
      get_recent_assessments_safe: {
        Args: Record<PropertyKey, never> | { _limit?: number; _offset?: number }
        Returns: {
          base_func: string
          completed_at: string
          completed_questions: number
          created_at: string
          creative_func: string
          session_id: string
          session_type: string
          started_at: string
          status: string
          total_questions: number
          type_code: string
          validity_status: string
        }[]
      }
      get_recent_assessments_safe_cursor: {
        Args: { p_after?: string; p_limit?: number }
        Returns: {
          country_display: string
          created_at: string
          fit_indicator: string
          overlay: string
          time_period: string
          type_prefix: string
        }[]
      }
      get_recent_assessments_safe_v2: {
        Args:
          | Record<PropertyKey, never>
          | { client_ip: string; user_id: string }
        Returns: {
          country_display: string
          created_at: string
          fit_indicator: string
          overlay: string
          time_period: string
          type_prefix: string
        }[]
      }
      get_results_by_session: {
        Args: { session_id: string; t?: string }
        Returns: Json
      }
      get_results_url: {
        Args: { p_session: string }
        Returns: string
      }
      get_results_v2: {
        Args: { p_session_id: string; p_share_token?: string }
        Returns: {
          functions: Json
          profile: Json
          session: Json
          state: Json
          types: Json
        }[]
      }
      get_results_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_sessions_with_emails_for_finalize: {
        Args: { limit_count?: number; min_questions?: number }
        Returns: {
          email: string
          id: string
          share_token: string
        }[]
      }
      get_user_assessment_attempts: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_assessment_scores: {
        Args: { p_session_id: string }
        Returns: Json
      }
      get_user_sessions_with_profiles: {
        Args: { p_user_id: string }
        Returns: Json
      }
      health_probe: {
        Args: Record<PropertyKey, never>
        Returns: {
          db: string
          has_profiles: boolean
          rls_enabled: boolean
        }[]
      }
      kpi_country_activity_v11: {
        Args: { end_ts?: string; start_ts?: string }
        Returns: {
          country: string
          sessions: number
        }[]
      }
      link_session_to_user: {
        Args: { p_email?: string; p_session: string; p_user: string }
        Returns: Json
      }
      log_fn: {
        Args: { evt: string; payload: Json }
        Returns: undefined
      }
      make_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      pg_execute: {
        Args: { query: string }
        Returns: Json
      }
      purge_old_access_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rate_limit: {
        Args: { p_key: string; p_max: number; p_window: unknown }
        Returns: boolean
      }
      recompute_profile: {
        Args: { p_session_id: string; p_version: string }
        Returns: {
          base_func: string | null
          baseline_session_id: string | null
          blocks: Json | null
          blocks_norm: Json | null
          calibration_version: string | null
          close_call: boolean | null
          conf_band: string | null
          conf_calibrated: number | null
          conf_raw: number | null
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
          neuro_mean: number | null
          neuro_z: number | null
          neuroticism: Json | null
          overlay: string | null
          overlay_neuro: string | null
          overlay_state: string | null
          paid: boolean
          parent_session_id: string | null
          person_key: string | null
          prev_session_id: string | null
          recomputed_at: string | null
          responses_hash: string | null
          results_version: string | null
          run_index: number | null
          score_fit_calibrated: number | null
          score_fit_raw: number | null
          session_id: string
          session_kind: string | null
          share_token: string
          state_index: number | null
          strengths: Json | null
          submitted_at: string | null
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
      refresh_evidence_kpis: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rotate_results_share_token: {
        Args: { p_session_id: string }
        Returns: Json
      }
      save_assessment_response: {
        Args: {
          p_answer: Json
          p_question_id: number
          p_session_id: string
          p_source?: string
        }
        Returns: undefined
      }
      sessions_with_min_answers: {
        Args: { days_back?: number; min_answers?: number }
        Returns: {
          session_id: string
        }[]
      }
      update_dashboard_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_dashboard_statistics_for_date: {
        Args: { target_date: string }
        Returns: undefined
      }
      update_dashboard_statistics_range: {
        Args: { end_date: string; start_date: string }
        Returns: undefined
      }
      upsert_test_result: {
        Args: { p_payload: Json; p_session_id: string; p_user_id: string }
        Returns: {
          created_at: string
          data: Json
          id: string
          session_id: string
          updated_at: string
          user_id: string
        }
      }
      your_function_name: {
        Args: { client_ip: string; param1?: string; param2?: number }
        Returns: string
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
