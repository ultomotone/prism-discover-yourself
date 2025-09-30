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
      assessment_feedback: {
        Row: {
          actionability: boolean | null
          clarity_overall: number | null
          engagement: number | null
          focus_ease: number | null
          id: string
          meta: Json | null
          nps: number | null
          perceived_accuracy: number | null
          results_resonated: string | null
          session_id: string
          submitted_at: string | null
          unclear_any: boolean | null
          unclear_notes: string | null
        }
        Insert: {
          actionability?: boolean | null
          clarity_overall?: number | null
          engagement?: number | null
          focus_ease?: number | null
          id?: string
          meta?: Json | null
          nps?: number | null
          perceived_accuracy?: number | null
          results_resonated?: string | null
          session_id: string
          submitted_at?: string | null
          unclear_any?: boolean | null
          unclear_notes?: string | null
        }
        Update: {
          actionability?: boolean | null
          clarity_overall?: number | null
          engagement?: number | null
          focus_ease?: number | null
          id?: string
          meta?: Json | null
          nps?: number | null
          perceived_accuracy?: number | null
          results_resonated?: string | null
          session_id?: string
          submitted_at?: string | null
          unclear_any?: boolean | null
          unclear_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_feedback_context: {
        Row: {
          age_bucket: string | null
          feedback_id: string
          id: string
          industry_bucket: string | null
          prior_exposure: boolean | null
        }
        Insert: {
          age_bucket?: string | null
          feedback_id: string
          id?: string
          industry_bucket?: string | null
          prior_exposure?: boolean | null
        }
        Update: {
          age_bucket?: string | null
          feedback_id?: string
          id?: string
          industry_bucket?: string | null
          prior_exposure?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_feedback_context_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "assessment_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_item_flags: {
        Row: {
          created_at: string | null
          flag_type: string | null
          id: string
          note: string | null
          question_id: number | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          flag_type?: string | null
          id?: string
          note?: string | null
          question_id?: number | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          flag_type?: string | null
          id?: string
          note?: string | null
          question_id?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_item_flags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_item_flags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mv_kpi_item_flags"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "assessment_item_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          clarity_status: string | null
          construct_tag: string | null
          created_at: string
          fc_map: Json | null
          id: number
          meta: Json | null
          order_index: number | null
          pair_group: string | null
          question_version: number | null
          required: boolean | null
          reverse_scored: boolean | null
          scale_type: string | null
          section: string
          tag: string | null
          type: string
          updated_at: string
          variant_label: string | null
        }
        Insert: {
          clarity_status?: string | null
          construct_tag?: string | null
          created_at?: string
          fc_map?: Json | null
          id: number
          meta?: Json | null
          order_index?: number | null
          pair_group?: string | null
          question_version?: number | null
          required?: boolean | null
          reverse_scored?: boolean | null
          scale_type?: string | null
          section: string
          tag?: string | null
          type: string
          updated_at?: string
          variant_label?: string | null
        }
        Update: {
          clarity_status?: string | null
          construct_tag?: string | null
          created_at?: string
          fc_map?: Json | null
          id?: number
          meta?: Json | null
          order_index?: number | null
          pair_group?: string | null
          question_version?: number | null
          required?: boolean | null
          reverse_scored?: boolean | null
          scale_type?: string | null
          section?: string
          tag?: string | null
          type?: string
          updated_at?: string
          variant_label?: string | null
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
          normalize_version: string | null
          normalized_at: string | null
          normalized_value: number | null
          pair_group: string | null
          question_id: number
          question_section: string
          question_text: string
          question_type: string
          response_time_ms: number | null
          reverse_applied: boolean | null
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
          normalize_version?: string | null
          normalized_at?: string | null
          normalized_value?: number | null
          pair_group?: string | null
          question_id: number
          question_section: string
          question_text: string
          question_type: string
          response_time_ms?: number | null
          reverse_applied?: boolean | null
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
          normalize_version?: string | null
          normalized_at?: string | null
          normalized_value?: number | null
          pair_group?: string | null
          question_id?: number
          question_section?: string
          question_text?: string
          question_type?: string
          response_time_ms?: number | null
          reverse_applied?: boolean | null
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
      assessment_ui_events: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          meta: Json | null
          question_id: number | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          meta?: Json | null
          question_id?: number | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          meta?: Json | null
          question_id?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_ui_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      entitlements: {
        Row: {
          active: boolean | null
          granted_at: string | null
          product_code: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          granted_at?: string | null
          product_code: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          granted_at?: string | null
          product_code?: string
          user_id?: string
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
          {
            foreignKeyName: "fc_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      fc_scores: {
        Row: {
          blocks_answered: number | null
          created_at: string | null
          fc_kind: string
          scores_json: Json
          session_id: string
          updated_at: string | null
          version: string
        }
        Insert: {
          blocks_answered?: number | null
          created_at?: string | null
          fc_kind?: string
          scores_json?: Json
          session_id: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          blocks_answered?: number | null
          created_at?: string | null
          fc_kind?: string
          scores_json?: Json
          session_id?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      fn_logs: {
        Row: {
          at: string | null
          evt: string
          id: number
          level: string | null
          msg: string | null
          payload: Json | null
        }
        Insert: {
          at?: string | null
          evt: string
          id?: number
          level?: string | null
          msg?: string | null
          payload?: Json | null
        }
        Update: {
          at?: string | null
          evt?: string
          id?: number
          level?: string | null
          msg?: string | null
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
          computed_at: string
          conf_calibrated: number | null
          conf_raw: number | null
          confidence: number | null
          created_at: string | null
          fit_band: string | null
          id: string | null
          overlay: string | null
          payload: Json
          results_version: string | null
          score_fit_calibrated: number | null
          scoring_version: string
          session_id: string
          share_token: string | null
          top_gap: number | null
          top_types: Json | null
          type_code: string | null
          updated_at: string | null
          validity_status: string | null
          version: string | null
        }
        Insert: {
          computed_at?: string
          conf_calibrated?: number | null
          conf_raw?: number | null
          confidence?: number | null
          created_at?: string | null
          fit_band?: string | null
          id?: string | null
          overlay?: string | null
          payload: Json
          results_version?: string | null
          score_fit_calibrated?: number | null
          scoring_version: string
          session_id: string
          share_token?: string | null
          top_gap?: number | null
          top_types?: Json | null
          type_code?: string | null
          updated_at?: string | null
          validity_status?: string | null
          version?: string | null
        }
        Update: {
          computed_at?: string
          conf_calibrated?: number | null
          conf_raw?: number | null
          confidence?: number | null
          created_at?: string | null
          fit_band?: string | null
          id?: string | null
          overlay?: string | null
          payload?: Json
          results_version?: string | null
          score_fit_calibrated?: number | null
          scoring_version?: string
          session_id?: string
          share_token?: string | null
          top_gap?: number | null
          top_types?: Json | null
          type_code?: string | null
          updated_at?: string | null
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
          computed_at: string
          confidence: number | null
          payload: Json
          scoring_version: string
          session_id: string
          type_code: string | null
          user_id: string | null
        }
        Insert: {
          computed_at?: string
          confidence?: number | null
          payload: Json
          scoring_version?: string
          session_id: string
          type_code?: string | null
          user_id?: string | null
        }
        Update: {
          computed_at?: string
          confidence?: number | null
          payload?: Json
          scoring_version?: string
          session_id?: string
          type_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
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
      mv_kpi_feedback: {
        Row: {
          avg_accuracy: number | null
          avg_clarity: number | null
          avg_engagement: number | null
          avg_focus: number | null
          avg_nps: number | null
          day: string | null
          feedback_count: number | null
          pct_actionable: number | null
          pct_reported_unclear: number | null
        }
        Relationships: []
      }
      mv_kpi_item_discrimination: {
        Row: {
          item_total_corr: number | null
          question_id: number | null
        }
        Relationships: []
      }
      mv_kpi_item_flags: {
        Row: {
          answered: number | null
          flag_rate: number | null
          flags: number | null
          question_id: number | null
          section: string | null
        }
        Relationships: []
      }
      mv_kpi_item_timing: {
        Row: {
          p50_ms: number | null
          p90_ms: number | null
          question_id: number | null
        }
        Relationships: []
      }
      mv_kpi_scoring: {
        Row: {
          avg_conf_cal: number | null
          avg_top_gap: number | null
          day: string | null
          invalid_ct: number | null
          total_profiles: number | null
        }
        Relationships: []
      }
      mv_kpi_sessions: {
        Row: {
          avg_completion_minutes: number | null
          day: string | null
          sessions_completed: number | null
          sessions_started: number | null
        }
        Relationships: []
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
      assert_results_version: {
        Args: { p_expected: string }
        Returns: boolean
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
      cleanup_old_incomplete_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
          session_ids: string[]
        }[]
      }
      compute_session_responses_hash: {
        Args: { p_session: string }
        Returns: string
      }
      count_recent_attempts: {
        Args: { p_user: string; p_window_days: number }
        Returns: number
      }
      delete_specific_session: {
        Args: { p_session_id: string }
        Returns: Json
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
      get_assessment_kpis: {
        Args: { end_date?: string; start_date?: string }
        Returns: Json
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
          computed_at: string
          result_data: Json
          results_version: string
          session_id: string
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
        Args: { session_id: string }
        Returns: Json
      }
      get_results_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_scoring_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_sessions_missing_unified_results: {
        Args: { limit_count?: number }
        Returns: {
          completed_at: string
          has_profile: boolean
          has_types: boolean
          session_id: string
          status: string
        }[]
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
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_sessions_with_profiles: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_sessions_with_scoring: {
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
      kpi_alerts: {
        Args: Record<PropertyKey, never>
        Returns: {
          msg: string
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
      scoring_key_lint: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue: string
          number: number
          question_id: number
          question_type: string
          section: string
        }[]
      }
      sessions_with_min_answers: {
        Args: { days_back?: number; min_answers?: number }
        Returns: {
          session_id: string
        }[]
      }
      start_assessment_with_cleanup: {
        Args: { p_email: string; p_user_id?: string }
        Returns: Json
      }
      triage_confusing_items: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      trigger_session_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
