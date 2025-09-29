// supabase/functions/_shared/normalizeResponses.ts
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type NormalizedAnswer = {
  session_id: string;
  question_id: string;
  normalized_value: number | null;
  reverse_applied: boolean;
};

export async function getNormalizedAnswers(
  db: SupabaseClient<any>,
  session_id: string
): Promise<NormalizedAnswer[]> {
  // Fetch responses and scoring keys separately, then join in code
  const [responsesRes, scoringKeysRes] = await Promise.all([
    db.from("assessment_responses")
      .select("question_id, answer_value, answer_numeric, session_id")
      .eq("session_id", session_id),
    db.from("assessment_scoring_key")
      .select("question_id, reverse_scored, scale_type")
  ]);

  if (responsesRes.error) throw responsesRes.error;
  if (scoringKeysRes.error) throw scoringKeysRes.error;

  // Create a lookup map for scoring keys
  const scoringKeyMap = (scoringKeysRes.data ?? []).reduce((acc, key) => {
    acc[key.question_id] = key;
    return acc;
  }, {} as Record<number, any>);

  return (responsesRes.data ?? []).map(row => {
    const raw = row.answer_numeric ?? Number(row.answer_value);
    const key = scoringKeyMap[row.question_id];
    const scale = key?.scale_type ?? "LIKERT_1_5";
    const reverse = !!key?.reverse_scored;

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    let n: number | null = null;
    if (Number.isFinite(raw)) {
      if (scale === "LIKERT_1_5") n = reverse ? 6 - raw : raw;
      else if (scale === "LIKERT_1_7") n = reverse ? 8 - raw : raw;
      else n = raw; // fallback
      
      if (n !== null) {
        n = clamp(n, 1, scale === "LIKERT_1_7" ? 7 : 5);
      }
    }

    return {
      session_id,
      question_id: row.question_id,
      normalized_value: n,
      reverse_applied: reverse
    };
  });
}