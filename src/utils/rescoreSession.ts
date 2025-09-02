// Utility to trigger re-scoring for invalid UNK results
import { admin as supabase } from '../../supabase/admin';

export async function rescoreSession(sessionId: string) {
  try {
    // Clean up old UNK profile(s) with service-edge helper
    const { data: cleanupData, error: cleanupError } = await supabase.functions.invoke('cleanup_profiles', {
      body: { session_id: sessionId },
    });

    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    } else {
      console.log('Cleanup result:', cleanupData);
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