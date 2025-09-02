import { admin as supabase } from "@/lib/supabase/admin";
import { TOTAL_PRISM_QUESTIONS } from "@/services/prismConfig";

/**
 * Finalize assessment sessions that answered all questions
 * but remain in an incomplete state due to earlier errors.
 *
 * For each qualifying session:
 * - Ensure the session has an email (pulled from Q1 response if missing)
 * - Call the finalizeAssessment edge function to score and mark complete
 */
export async function finalizeStuckSessions() {
  console.log("Searching for stuck sessions...");

  // Get sessions that are not completed
  const { data: sessions, error } = await supabase
    .from("assessment_sessions")
    .select("id, email, completed_questions, total_questions, status")
    .neq("status", "completed");

  if (error) {
    console.error("Failed to fetch sessions:", error);
    return { success: false, error };
  }

  let processed = 0;
  const failed: string[] = [];

  for (const session of sessions || []) {
    const total = session.total_questions || TOTAL_PRISM_QUESTIONS;

    // Count answered questions
    const { count: answered } = await supabase
      .from("assessment_responses")
      .select("question_id", { count: "exact", head: true })
      .eq("session_id", session.id);

    if ((answered || 0) < total) {
      continue; // Not finished yet
    }

    // Backfill email from Q1 response if missing
    if (!session.email) {
      const { data: emailResp } = await supabase
        .from("assessment_responses")
        .select("answer_value")
        .eq("session_id", session.id)
        .eq("question_id", 1)
        .maybeSingle();

      const email = emailResp?.answer_value?.toLowerCase();
      if (email) {
        await supabase
          .from("assessment_sessions")
          .update({ email })
          .eq("id", session.id);
      }
    }

    // Invoke finalizeAssessment to score and mark complete
    const { error: finalizeError } = await supabase.functions.invoke(
      "finalizeAssessment",
      { body: { session_id: session.id, responses: Array.from({ length: answered || 0 }) } }
    );

    if (finalizeError) {
      console.error(`Failed to finalize session ${session.id}:`, finalizeError);
      failed.push(session.id);
    } else {
      processed++;
      console.log(`Finalized session ${session.id} (${processed}/${sessions.length})`);
    }
  }

  console.log(`Finalize complete: ${processed} processed, ${failed.length} failed`);
  return { success: true, processed, failed };
}
