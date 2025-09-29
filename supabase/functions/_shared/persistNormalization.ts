// supabase/functions/_shared/persistNormalization.ts
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function persistNormalizedAnswers(
  db: SupabaseClient<any>,
  session_id: string,
  rows: { question_id: string; normalized_value: number | null; reverse_applied: boolean }[],
  normalize_version: string
) {
  if (!rows.length) return;
  
  // Upsert per response
  const updates = rows.map(r => ({
    session_id,
    question_id: r.question_id,
    normalized_value: r.normalized_value,
    reverse_applied: r.reverse_applied,
    normalize_version,
    normalized_at: new Date().toISOString()
  }));
  
  // Batch by chunks to avoid payload limits
  const CHUNK = 500;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const { error } = await db
      .from("assessment_responses")
      .upsert(updates.slice(i, i + CHUNK), {
        onConflict: "session_id,question_id"
      });
    if (error) throw error;
  }
}