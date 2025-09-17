import { admin as supabase } from './supabase/admin';

export async function testFinalizeEvidence() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('GATE-EVIDENCE: Invoking finalizeAssessment for session:', sessionId);
  
  try {
    // Call finalizeAssessment function
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('finalizeAssessment error:', error);
      return { success: false, error };
    }

    console.log('finalizeAssessment response:', JSON.stringify(data, null, 2));

    // Check fc_scores table
    const { data: fcScores, error: fcError } = await supabase
      .from('fc_scores')
      .select('version, scores_json, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('FC Scores check:', fcScores);

    // Check profiles table  
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('results_version, created_at, updated_at')
      .eq('session_id', sessionId);

    console.log('Profiles check:', profiles);

    // Test results URL access
    const resultsUrl = data?.results_url;
    console.log('Results URL:', resultsUrl);

    return { 
      success: true, 
      data,
      fcScores,
      profiles,
      resultsUrl
    };
  } catch (err) {
    console.error('Exception:', err);
    return { success: false, error: err };
  }
}

// Run if called directly
if (import.meta.main) {
  testFinalizeEvidence().then(result => {
    console.log('Final result:', result);
  });
}