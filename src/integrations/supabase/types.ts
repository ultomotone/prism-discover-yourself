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
          behavioral_change: boolean | null
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
          behavioral_change?: boolean | null
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
          behavioral_change?: boolean | null
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
          {
            foreignKeyName: "assessment_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
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
            referencedRelation: "mv_kpi_item_flow"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "assessment_item_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_item_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_item_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
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
          skipped: boolean | null
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
          skipped?: boolean | null
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
          skipped?: boolean | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
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
          {
            foreignKeyName: "assessment_ui_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_ui_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      calibration_bins: {
        Row: {
          bin_index: number
          computed_at: string | null
          id: string
          n: number
          p_obs: number
          p_pred: number
          results_version: string
        }
        Insert: {
          bin_index: number
          computed_at?: string | null
          id?: string
          n: number
          p_obs: number
          p_pred: number
          results_version: string
        }
        Update: {
          bin_index?: number
          computed_at?: string | null
          id?: string
          n?: number
          p_obs?: number
          p_pred?: number
          results_version?: string
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
      calibration_summary: {
        Row: {
          brier: number | null
          computed_at: string | null
          ece: number | null
          results_version: string
        }
        Insert: {
          brier?: number | null
          computed_at?: string | null
          ece?: number | null
          results_version: string
        }
        Update: {
          brier?: number | null
          computed_at?: string | null
          ece?: number | null
          results_version?: string
        }
        Relationships: []
      }
      cfa_fit: {
        Row: {
          cfi: number | null
          created_at: string | null
          id: string
          model_name: string
          n: number | null
          results_version: string
          rmsea: number | null
          srmr: number | null
          tli: number | null
        }
        Insert: {
          cfi?: number | null
          created_at?: string | null
          id?: string
          model_name: string
          n?: number | null
          results_version: string
          rmsea?: number | null
          srmr?: number | null
          tli?: number | null
        }
        Update: {
          cfi?: number | null
          created_at?: string | null
          id?: string
          model_name?: string
          n?: number | null
          results_version?: string
          rmsea?: number | null
          srmr?: number | null
          tli?: number | null
        }
        Relationships: []
      }
      cfa_loadings: {
        Row: {
          lambda_std: number | null
          question_id: number
          results_version: string
          scale_tag: string
          theta: number | null
        }
        Insert: {
          lambda_std?: number | null
          question_id: number
          results_version: string
          scale_tag: string
          theta?: number | null
        }
        Update: {
          lambda_std?: number | null
          question_id?: number
          results_version?: string
          scale_tag?: string
          theta?: number | null
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
      dif_results: {
        Row: {
          created_at: string | null
          effect_size: number | null
          flag: boolean
          focal_group: string
          id: string
          method: string
          p_value: number | null
          question_id: number
          reference_group: string
          scale_id: string | null
        }
        Insert: {
          created_at?: string | null
          effect_size?: number | null
          flag: boolean
          focal_group: string
          id?: string
          method: string
          p_value?: number | null
          question_id: number
          reference_group: string
          scale_id?: string | null
        }
        Update: {
          created_at?: string | null
          effect_size?: number | null
          flag?: boolean
          focal_group?: string
          id?: string
          method?: string
          p_value?: number | null
          question_id?: number
          reference_group?: string
          scale_id?: string | null
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
      external_anchor_scores: {
        Row: {
          anchor_code: string
          scale_tag: string
          session_id: string
          value_numeric: number | null
        }
        Insert: {
          anchor_code: string
          scale_tag: string
          session_id: string
          value_numeric?: number | null
        }
        Update: {
          anchor_code?: string
          scale_tag?: string
          session_id?: string
          value_numeric?: number | null
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
          {
            foreignKeyName: "fc_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "fc_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
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
      invariance_results: {
        Row: {
          delta_cfi: number | null
          delta_rmsea: number | null
          level: string
          pass: boolean | null
          results_version: string
        }
        Insert: {
          delta_cfi?: number | null
          delta_rmsea?: number | null
          level: string
          pass?: boolean | null
          results_version: string
        }
        Update: {
          delta_cfi?: number | null
          delta_rmsea?: number | null
          level?: string
          pass?: boolean | null
          results_version?: string
        }
        Relationships: []
      }
      item_catalog: {
        Row: {
          created_at: string | null
          keyed: number | null
          question_id: number
          scale_id: string | null
        }
        Insert: {
          created_at?: string | null
          keyed?: number | null
          question_id: number
          scale_id?: string | null
        }
        Update: {
          created_at?: string | null
          keyed?: number | null
          question_id?: number
          scale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_catalog_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_catalog_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "mv_kpi_item_flow"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "item_catalog_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "scale_catalog"
            referencedColumns: ["scale_id"]
          },
        ]
      }
      item_discrimination: {
        Row: {
          created_at: string | null
          id: string
          n: number | null
          question_id: number
          r_it: number | null
          results_version: string | null
          scale_code: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          n?: number | null
          question_id: number
          r_it?: number | null
          results_version?: string | null
          scale_code?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          n?: number | null
          question_id?: number
          r_it?: number | null
          results_version?: string | null
          scale_code?: string | null
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
      measurement_invariance: {
        Row: {
          created_at: string | null
          delta_cfi: number | null
          id: string
          model_comparison: string | null
          model_name: string
          n: number | null
          results_version: string
        }
        Insert: {
          created_at?: string | null
          delta_cfi?: number | null
          id?: string
          model_comparison?: string | null
          model_name: string
          n?: number | null
          results_version: string
        }
        Update: {
          created_at?: string | null
          delta_cfi?: number | null
          id?: string
          model_comparison?: string | null
          model_name?: string
          n?: number | null
          results_version?: string
        }
        Relationships: []
      }
      mv_refresh_log: {
        Row: {
          refreshed_at: string
          view_name: string
        }
        Insert: {
          refreshed_at?: string
          view_name: string
        }
        Update: {
          refreshed_at?: string
          view_name?: string
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
      post_survey_questions: {
        Row: {
          id: number
          item_code: string
          item_text: string
          position: number
          required: boolean | null
          response_type: string
          reverse_scored: boolean | null
          version: string
        }
        Insert: {
          id?: number
          item_code: string
          item_text: string
          position: number
          required?: boolean | null
          response_type: string
          reverse_scored?: boolean | null
          version: string
        }
        Update: {
          id?: number
          item_code?: string
          item_text?: string
          position?: number
          required?: boolean | null
          response_type?: string
          reverse_scored?: boolean | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_survey_questions_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "post_survey_versions"
            referencedColumns: ["version"]
          },
        ]
      }
      post_survey_responses: {
        Row: {
          created_at: string | null
          id: number
          item_code: string
          session_id: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          item_code: string
          session_id: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          item_code?: string
          session_id?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_survey_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "post_survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      post_survey_scale_items: {
        Row: {
          id: number
          item_code: string
          scale_code: string
          version: string
        }
        Insert: {
          id?: number
          item_code: string
          scale_code: string
          version: string
        }
        Update: {
          id?: number
          item_code?: string
          scale_code?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_survey_scale_items_version_item_code_fkey"
            columns: ["version", "item_code"]
            isOneToOne: false
            referencedRelation: "post_survey_questions"
            referencedColumns: ["version", "item_code"]
          },
          {
            foreignKeyName: "post_survey_scale_items_version_scale_code_fkey"
            columns: ["version", "scale_code"]
            isOneToOne: false
            referencedRelation: "post_survey_scales"
            referencedColumns: ["version", "scale_code"]
          },
        ]
      }
      post_survey_scales: {
        Row: {
          description: string | null
          id: number
          scale_code: string
          scale_name: string
          target_good: number | null
          target_min: number | null
          version: string
        }
        Insert: {
          description?: string | null
          id?: number
          scale_code: string
          scale_name: string
          target_good?: number | null
          target_min?: number | null
          version: string
        }
        Update: {
          description?: string | null
          id?: number
          scale_code?: string
          scale_name?: string
          target_good?: number | null
          target_min?: number | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_survey_scales_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "post_survey_versions"
            referencedColumns: ["version"]
          },
        ]
      }
      post_survey_scores: {
        Row: {
          accuracy_idx: number | null
          clarity_idx: number | null
          computed_at: string | null
          engagement_idx: number | null
          id: number
          insight_idx: number | null
          nps_score: number | null
          session_id: string
          trust_idx: number | null
          wtp_idx: number | null
        }
        Insert: {
          accuracy_idx?: number | null
          clarity_idx?: number | null
          computed_at?: string | null
          engagement_idx?: number | null
          id?: number
          insight_idx?: number | null
          nps_score?: number | null
          session_id: string
          trust_idx?: number | null
          wtp_idx?: number | null
        }
        Update: {
          accuracy_idx?: number | null
          clarity_idx?: number | null
          computed_at?: string | null
          engagement_idx?: number | null
          id?: number
          insight_idx?: number | null
          nps_score?: number | null
          session_id?: string
          trust_idx?: number | null
          wtp_idx?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_survey_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "post_survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      post_survey_sessions: {
        Row: {
          assessment_session_id: string
          completed_at: string | null
          id: string
          started_at: string | null
          user_id: string | null
          version: string
        }
        Insert: {
          assessment_session_id: string
          completed_at?: string | null
          id?: string
          started_at?: string | null
          user_id?: string | null
          version: string
        }
        Update: {
          assessment_session_id?: string
          completed_at?: string | null
          id?: string
          started_at?: string | null
          user_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_survey_sessions_assessment_session_id_fkey"
            columns: ["assessment_session_id"]
            isOneToOne: true
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_survey_sessions_assessment_session_id_fkey"
            columns: ["assessment_session_id"]
            isOneToOne: true
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "post_survey_sessions_assessment_session_id_fkey"
            columns: ["assessment_session_id"]
            isOneToOne: true
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
          {
            foreignKeyName: "post_survey_sessions_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "post_survey_versions"
            referencedColumns: ["version"]
          },
        ]
      }
      post_survey_versions: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          version: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          version: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          version?: string
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
      psychometrics_external: {
        Row: {
          alpha: number | null
          cohort_end: string
          cohort_start: string
          created_at: string | null
          cronbach_alpha: number | null
          id: string
          mcdonald_omega: number | null
          n_respondents: number
          notes: string | null
          omega_total: number | null
          results_version: string
          scale_code: string
          sem: number | null
          split_half_n: number | null
          split_half_sb: number | null
        }
        Insert: {
          alpha?: number | null
          cohort_end: string
          cohort_start: string
          created_at?: string | null
          cronbach_alpha?: number | null
          id?: string
          mcdonald_omega?: number | null
          n_respondents: number
          notes?: string | null
          omega_total?: number | null
          results_version: string
          scale_code: string
          sem?: number | null
          split_half_n?: number | null
          split_half_sb?: number | null
        }
        Update: {
          alpha?: number | null
          cohort_end?: string
          cohort_start?: string
          created_at?: string | null
          cronbach_alpha?: number | null
          id?: string
          mcdonald_omega?: number | null
          n_respondents?: number
          notes?: string | null
          omega_total?: number | null
          results_version?: string
          scale_code?: string
          sem?: number | null
          split_half_n?: number | null
          split_half_sb?: number | null
        }
        Relationships: []
      }
      psychometrics_item_stats: {
        Row: {
          computed_at: string | null
          id: number
          n_used: number | null
          question_id: number
          r_it: number | null
          results_version: string
          scale_code: string
        }
        Insert: {
          computed_at?: string | null
          id?: number
          n_used?: number | null
          question_id: number
          r_it?: number | null
          results_version: string
          scale_code: string
        }
        Update: {
          computed_at?: string | null
          id?: number
          n_used?: number | null
          question_id?: number
          r_it?: number | null
          results_version?: string
          scale_code?: string
        }
        Relationships: []
      }
      psychometrics_retest_pairs: {
        Row: {
          created_at: string | null
          days_between: number
          first_session_id: string
          id: string
          n_items: number | null
          r_pearson: number | null
          results_version: string
          scale_code: string
          second_session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_between: number
          first_session_id: string
          id?: string
          n_items?: number | null
          r_pearson?: number | null
          results_version: string
          scale_code: string
          second_session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_between?: number
          first_session_id?: string
          id?: string
          n_items?: number | null
          r_pearson?: number | null
          results_version?: string
          scale_code?: string
          second_session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      retest_invites: {
        Row: {
          completed_at: string | null
          invited_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          invited_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          invited_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retest_invites_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retest_invites_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "retest_invites_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      scale_catalog: {
        Row: {
          created_at: string | null
          result_version: string
          scale_id: string
          scale_name: string | null
        }
        Insert: {
          created_at?: string | null
          result_version?: string
          scale_id: string
          scale_name?: string | null
        }
        Update: {
          created_at?: string | null
          result_version?: string
          scale_id?: string
          scale_name?: string | null
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
          {
            foreignKeyName: "scoring_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "scoring_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      split_half_results: {
        Row: {
          cohort_end: string
          cohort_start: string
          created_at: string | null
          id: string
          lambda2: number | null
          n_respondents: number | null
          results_version: string
          scale_code: string
        }
        Insert: {
          cohort_end: string
          cohort_start: string
          created_at?: string | null
          id?: string
          lambda2?: number | null
          n_respondents?: number | null
          results_version: string
          scale_code: string
        }
        Update: {
          cohort_end?: string
          cohort_start?: string
          created_at?: string | null
          id?: string
          lambda2?: number | null
          n_respondents?: number | null
          results_version?: string
          scale_code?: string
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
      mv_kpi_ave_cr: {
        Row: {
          ave: number | null
          cr: number | null
          k: number | null
          pct_crossloading_gt_30: number | null
          pct_load_ge_40: number | null
          pct_load_ge_60: number | null
          results_version: string | null
          scale_tag: string | null
        }
        Relationships: []
      }
      mv_kpi_behavioral_impact: {
        Row: {
          impact_rate: number | null
          responses: number | null
          row_id: number | null
        }
        Relationships: []
      }
      mv_kpi_business: {
        Row: {
          row_id: number | null
          total_completions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      mv_kpi_calibration: {
        Row: {
          avg_confidence: number | null
          avg_top_gap: number | null
          bins: Json | null
          brier: number | null
          ece: number | null
          results_version: string | null
        }
        Relationships: []
      }
      mv_kpi_cfa: {
        Row: {
          cfi: number | null
          model_name: string | null
          n: number | null
          results_version: string | null
          rmsea: number | null
          srmr: number | null
          tli: number | null
        }
        Relationships: []
      }
      mv_kpi_classification_stability: {
        Row: {
          n_pairs: number | null
          stability_rate: number | null
        }
        Relationships: []
      }
      mv_kpi_confidence_spread: {
        Row: {
          max_confidence: number | null
          mean_confidence: number | null
          min_confidence: number | null
          row_id: number | null
          stddev_confidence: number | null
        }
        Relationships: []
      }
      mv_kpi_construct_coverage: {
        Row: {
          coverage_pct: number | null
          keyed_items: number | null
          scale_code: string | null
          scale_id: string | null
          scale_name: string | null
          total_items: number | null
        }
        Relationships: []
      }
      mv_kpi_engagement: {
        Row: {
          completion_rate_pct: number | null
          day: string | null
          drop_off_rate_pct: number | null
          median_completion_sec: number | null
          sessions_completed: number | null
          sessions_started: number | null
        }
        Relationships: []
      }
      mv_kpi_external: {
        Row: {
          convergent_r: number | null
          max_non_target_r: number | null
          n_anchors: number | null
          scale_tag: string | null
        }
        Relationships: []
      }
      mv_kpi_fairness_air: {
        Row: {
          adverse_impact_ratio: number | null
        }
        Relationships: []
      }
      mv_kpi_fairness_dif: {
        Row: {
          dif_flag_rate_pct: number | null
          flagged_items: number | null
          total_items: number | null
        }
        Relationships: []
      }
      mv_kpi_feedback: {
        Row: {
          avg_nps: number | null
          day: string | null
          feedback_count: number | null
        }
        Relationships: []
      }
      mv_kpi_followup: {
        Row: {
          followup_count: number | null
          row_id: number | null
          total_completions: number | null
        }
        Relationships: []
      }
      mv_kpi_internal: {
        Row: {
          alpha: number | null
          n_items: number | null
          omega_total: number | null
          pct_items_low: number | null
          r_it_median: number | null
          scale_tag: string | null
          split_half_sb: number | null
        }
        Relationships: []
      }
      mv_kpi_invariance: {
        Row: {
          pass_configural: boolean | null
          pass_metric: boolean | null
          pass_scalar: boolean | null
          results_version: string | null
        }
        Relationships: []
      }
      mv_kpi_item_clarity: {
        Row: {
          clarity_flag_count: number | null
          clarity_flag_rate_pct: number | null
          question_id: number | null
          response_count: number | null
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
            referencedRelation: "mv_kpi_item_flow"
            referencedColumns: ["question_id"]
          },
        ]
      }
      mv_kpi_item_flow: {
        Row: {
          question_id: number | null
          skip_count: number | null
          skip_rate: number | null
          total_responses: number | null
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
      mv_kpi_items_discrimination: {
        Row: {
          low_disc_items: number | null
          scale_code: string | null
          total_items: number | null
        }
        Relationships: []
      }
      mv_kpi_neuroticism: {
        Row: {
          ave: number | null
          cr: number | null
          cronbach_alpha: number | null
          fornell_larcker_pass: boolean | null
          mcdonald_omega: number | null
          mean_r_it: number | null
          mean_raw: number | null
          min_r_it: number | null
          n_items: number | null
          n_sessions: number | null
          pct_crossloading_gt_30: number | null
          pct_load_ge_40: number | null
          pct_load_ge_60: number | null
          r_retest: number | null
          results_version: string | null
          retest_days: number | null
          retest_n: number | null
          sd_raw: number | null
          split_half: number | null
          split_half_n: number | null
        }
        Relationships: []
      }
      mv_kpi_post_survey: {
        Row: {
          accuracy_idx: number | null
          clarity_idx: number | null
          day: string | null
          engagement_idx: number | null
          insight_idx: number | null
          n_surveys: number | null
          nps_score: number | null
          trust_idx: number | null
          wtp_idx: number | null
        }
        Relationships: []
      }
      mv_kpi_release_gates: {
        Row: {
          alpha: number | null
          ave: number | null
          convergent_r: number | null
          cr: number | null
          max_non_target_r: number | null
          n_items: number | null
          omega_total: number | null
          pass_item_quality: boolean | null
          pass_reliability: boolean | null
          pass_stability: boolean | null
          pass_validity: boolean | null
          pct_items_low: number | null
          r_it_median: number | null
          release_ready: boolean | null
          retest_n_pairs: number | null
          retest_r: number | null
          scale_tag: string | null
          split_half_sb: number | null
        }
        Relationships: []
      }
      mv_kpi_reliability: {
        Row: {
          alpha_mean: number | null
          last_updated: string | null
          n_total: number | null
          omega_mean: number | null
          results_version: string | null
          scale_code: string | null
          sem_mean: number | null
        }
        Relationships: []
      }
      mv_kpi_reliability_alpha: {
        Row: {
          cronbach_alpha: number | null
          k: number | null
          scale_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_catalog_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "scale_catalog"
            referencedColumns: ["scale_id"]
          },
        ]
      }
      mv_kpi_reliability_split_half: {
        Row: {
          scale_id: string | null
          split_half_corr: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_catalog_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "scale_catalog"
            referencedColumns: ["scale_id"]
          },
        ]
      }
      mv_kpi_response_process: {
        Row: {
          avg_response_time_ms: number | null
          day: string | null
          median_response_time_ms: number | null
        }
        Relationships: []
      }
      mv_kpi_retest: {
        Row: {
          n_pairs: number | null
          r_mean: number | null
          results_version: string | null
          scale_code: string | null
        }
        Relationships: []
      }
      mv_kpi_scale_corr: {
        Row: {
          n_pairs: number | null
          r: number | null
          scale_a: string | null
          scale_b: string | null
        }
        Relationships: []
      }
      mv_kpi_scale_norms: {
        Row: {
          n_scores: number | null
          p05: number | null
          p10: number | null
          p25: number | null
          p50: number | null
          p75: number | null
          p90: number | null
          p95: number | null
          scale_tag: string | null
        }
        Relationships: []
      }
      mv_kpi_scoring: {
        Row: {
          avg_conf_calibrated: number | null
          day: string | null
          invalid_ct: number | null
          total_ct: number | null
        }
        Relationships: []
      }
      mv_kpi_sessions: {
        Row: {
          completion_rate_pct: number | null
          day: string | null
          sessions_completed: number | null
          sessions_started: number | null
        }
        Relationships: []
      }
      mv_kpi_split_half: {
        Row: {
          lambda2_mean: number | null
          n_total: number | null
          results_version: string | null
          scale_code: string | null
        }
        Relationships: []
      }
      mv_kpi_stability: {
        Row: {
          n_pairs: number | null
          retest_r: number | null
          scale_tag: string | null
        }
        Relationships: []
      }
      mv_kpi_state_overlay: {
        Row: {
          conf_mean_n0: number | null
          conf_mean_nminus: number | null
          conf_mean_nplus: number | null
          mean_focus: number | null
          mean_mood: number | null
          mean_sleep: number | null
          mean_stress: number | null
          mean_time: number | null
          pct_n_minus: number | null
          pct_n_plus: number | null
          pct_n0: number | null
          r_state_traitn: number | null
          topgap_mean_n0: number | null
          topgap_mean_nminus: number | null
          topgap_mean_nplus: number | null
        }
        Relationships: []
      }
      mv_kpi_trajectory_alignment: {
        Row: {
          alignment_score: number | null
          n_users: number | null
          row_id: number | null
        }
        Relationships: []
      }
      mv_kpi_user_experience: {
        Row: {
          avg_engagement: number | null
          avg_nps: number | null
          day: string | null
          feedback_count: number | null
        }
        Relationships: []
      }
      mv_state_overlay_daily: {
        Row: {
          conf_mean_n0: number | null
          conf_mean_nminus: number | null
          conf_mean_nplus: number | null
          day: string | null
          mean_focus: number | null
          mean_mood: number | null
          mean_sleep: number | null
          mean_stress: number | null
          mean_time: number | null
          n_sessions: number | null
          pct_n_minus: number | null
          pct_n_plus: number | null
          pct_n0: number | null
          r_state_traitn: number | null
          topgap_mean_n0: number | null
          topgap_mean_nminus: number | null
          topgap_mean_nplus: number | null
        }
        Relationships: []
      }
      v_active_scale_items: {
        Row: {
          question_id: number | null
          question_type: string | null
          reverse_scored: boolean | null
          scale_code: string | null
          weight: number | null
        }
        Relationships: []
      }
      v_kpi_live_today: {
        Row: {
          completion_rate_pct: number | null
          drop_off_rate_pct: number | null
          median_completion_sec: number | null
          sessions_completed: number | null
          sessions_started: number | null
        }
        Relationships: []
      }
      v_neuro_per_session: {
        Row: {
          neuro_1_5: number | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      v_retest_pairs: {
        Row: {
          days_between: number | null
          first_session_id: string | null
          results_version: string | null
          second_session_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_scale_items_by_tag: {
        Row: {
          question_id: number | null
          scale_tag: string | null
          weight: number | null
        }
        Relationships: []
      }
      v_scale_scores: {
        Row: {
          completeness: number | null
          idx_0_100: number | null
          k_total: number | null
          k_used: number | null
          mean_raw_1_5: number | null
          scale_tag: string | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      v_state_index: {
        Row: {
          session_id: string | null
          state_index_1_7: number | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      v_state_items: {
        Row: {
          is_active: boolean | null
          question_id: number | null
          state_tag: string | null
        }
        Relationships: []
      }
      v_state_overlay: {
        Row: {
          overlay_state: string | null
          session_id: string | null
          state_index_1_7: number | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      v_state_responses: {
        Row: {
          created_at: string | null
          session_id: string | null
          state_tag: string | null
          x_1_7: number | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
      v_state_session: {
        Row: {
          focus_1_7: number | null
          mood_1_7: number | null
          session_id: string | null
          sleep_1_7: number | null
          stress_1_7: number | null
          time_1_7: number | null
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
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["first_session_id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_retest_pairs"
            referencedColumns: ["second_session_id"]
          },
        ]
      }
    }
    Functions: {
      _bump_mv_heartbeat: {
        Args: { p_view: string }
        Returns: undefined
      }
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
      compute_post_survey_score: {
        Args: { p_session: string }
        Returns: undefined
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
      exec_sql: {
        Args: { q: string }
        Returns: Json
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
      get_recent_database_logs: {
        Args: { limit_count?: number; log_level?: string }
        Returns: {
          context: Json
          level: string
          log_timestamp: string
          message: string
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
      refresh_all_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      refresh_evidence_kpis: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_psych_kpis: {
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
