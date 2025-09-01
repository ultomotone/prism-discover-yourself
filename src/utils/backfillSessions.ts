
import { supabase } from "@/integrations/supabase/client";

export async function backfillSessionTotalQuestions() {
  console.log('Starting session total_questions backfill...');
  
  try {
    // Get the current active question count
    const { count: activeQuestionCount, error: countError } = await supabase
      .from('assessment_questions')
      .select('*', { count: 'exact', head: true });

    if (countError || !activeQuestionCount) {
      console.error('Failed to get active question count:', countError);
      return { success: false, error: countError };
    }

    console.log(`Found ${activeQuestionCount} active questions`);

    // Find sessions with null or 0 total_questions
    const { data: sessionsToUpdate, error: fetchError } = await supabase
      .from('assessment_sessions')
      .select('id, total_questions')
      .or('total_questions.is.null,total_questions.eq.0');

    if (fetchError) {
      console.error('Error fetching sessions to update:', fetchError);
      return { success: false, error: fetchError };
    }

    console.log(`Found ${sessionsToUpdate?.length || 0} sessions to backfill`);

    if (!sessionsToUpdate || sessionsToUpdate.length === 0) {
      return { success: true, updated: 0, message: 'No sessions need updating' };
    }

    // Update sessions in batches
    const batchSize = 100;
    let totalUpdated = 0;

    for (let i = 0; i < sessionsToUpdate.length; i += batchSize) {
      const batch = sessionsToUpdate.slice(i, i + batchSize);
      const ids = batch.map(s => s.id);

      const { error: updateError } = await supabase
        .from('assessment_sessions')
        .update({ total_questions: activeQuestionCount })
        .in('id', ids);

      if (updateError) {
        console.error(`Error updating batch ${i / batchSize + 1}:`, updateError);
        continue;
      }

      totalUpdated += batch.length;
      console.log(`Updated batch ${i / batchSize + 1}: ${batch.length} sessions`);
    }

    console.log(`Backfill complete: ${totalUpdated} sessions updated`);
    return { success: true, updated: totalUpdated };
  } catch (error) {
    console.error('Backfill error:', error);
    return { success: false, error };
  }
}
