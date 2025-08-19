// Utility to trigger re-scoring for invalid UNK results
import { supabase } from '@/integrations/supabase/client';

export async function rescoreSession(sessionId: string) {
  try {
    // Delete existing invalid profile first
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('session_id', sessionId);
      
    if (deleteError) {
      console.error('Error deleting profile:', deleteError);
    }

    // Trigger re-scoring with the updated edge function
    const { data, error } = await supabase.functions.invoke('score_prism', {
      body: { session_id: sessionId },
    });

    if (error) {
      console.error('Re-scoring error:', error);
      return { success: false, error };
    }

    console.log('Re-scoring successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Re-scoring failed:', err);
    return { success: false, error: err };
  }
}