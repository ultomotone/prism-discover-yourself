import { admin as supabase } from '../supabase/admin';

export async function testFinalizeAssessment() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('Testing finalizeAssessment for session:', sessionId);
  
  try {
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('Error:', error);
      return { success: false, error };
    }

    console.log('Success! Response:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Exception:', err);
    return { success: false, error: err };
  }
}