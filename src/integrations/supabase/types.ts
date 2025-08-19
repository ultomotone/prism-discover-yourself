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
          question_id: number
          question_section: string
          question_text: string
          question_type: string
          response_time_ms: number | null
          session_id: string
        }
        Insert: {
          answer_array?: string[] | null
          answer_numeric?: number | null
          answer_object?: Json | null
          answer_value?: string | null
          created_at?: string
          id?: string
          question_id: number
          question_section: string
          question_text: string
          question_type: string
          response_time_ms?: number | null
          session_id: string
        }
        Update: {
          answer_array?: string[] | null
          answer_numeric?: number | null
          answer_object?: Json | null
          answer_value?: string | null
          created_at?: string
          id?: string
          question_id?: number
          question_section?: string
          question_text?: string
          question_type?: string
          response_time_ms?: number | null
          session_id?: string
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
          completed_at: string | null
          completed_questions: number | null
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          session_type: string
          started_at: string
          total_questions: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          session_type?: string
          started_at?: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          session_type?: string
          started_at?: string
          total_questions?: number | null
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
          confidence: string | null
          created_at: string | null
          creative_func: string | null
          deltas: Json | null
          dimensions: Json | null
          dims_highlights: Json | null
          email_mask: string | null
          glossary_version: number | null
          id: string
          neuroticism: Json | null
          overlay: string | null
          person_key: string | null
          prev_session_id: string | null
          run_index: number | null
          session_id: string
          strengths: Json | null
          top_types: Json | null
          type_code: string | null
          type_scores: Json | null
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
          glossary_version?: number | null
          id?: string
          neuroticism?: Json | null
          overlay?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          run_index?: number | null
          session_id: string
          strengths?: Json | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
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
          glossary_version?: number | null
          id?: string
          neuroticism?: Json | null
          overlay?: string | null
          person_key?: string | null
          prev_session_id?: string | null
          run_index?: number | null
          session_id?: string
          strengths?: Json | null
          top_types?: Json | null
          type_code?: string | null
          type_scores?: Json | null
          updated_at?: string | null
          user_id?: string | null
          validity?: Json | null
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
          type_changed: boolean | null
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
        ]
      }
      v_sessions: {
        Row: {
          completed: boolean | null
          duration_sec: number | null
          last_event_at: string | null
          session_id: string | null
          started_at: string | null
          user_id: string | null
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
    }
    Functions: {
      get_recent_assessments_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          country_display: string
          created_at: string
          fit_score: number
          session_id: string
          type_display: string
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
