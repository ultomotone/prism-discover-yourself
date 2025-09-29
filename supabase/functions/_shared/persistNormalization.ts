// supabase/functions/_shared/persistNormalization.ts
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function persistNormalizedAnswers(
  db: SupabaseClient<any>,
  session_id: string,
  rows: { question_id: string; normalized_value: number | null; reverse_applied: boolean }[],
  normalize_version: string
) {
  if (!rows.length) return;
  
  // Update only the normalization fields, don't touch other required fields
  for (const row of rows) {
    const { error } = await db
      .from("assessment_responses")
      .update({
        normalized_value: row.normalized_value,
        reverse_applied: row.reverse_applied,
        normalize_version,
        normalized_at: new Date().toISOString()
      })
      .eq("session_id", session_id)
      .eq("question_id", row.question_id);
      
    if (error) throw error;
  }
}