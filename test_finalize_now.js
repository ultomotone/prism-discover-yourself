// Direct production test of finalizeAssessment
import { admin as supabase } from './supabase/admin.js';

async function testFinalizeAssessment() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('🔄 TESTING finalizeAssessment in Production');
  console.log('Session:', sessionId);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Call finalizeAssessment function
    console.log('\n📞 Invoking finalizeAssessment...');
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId, fc_version: 'v1.2' }
    });

    if (error) {
      console.error('❌ Function Error:', error);
      return { success: false, error };
    }

    console.log('✅ Function Response:', JSON.stringify(data, null, 2));

    // Check results immediately
    console.log('\n🔍 Checking FC Scores...');
    const { data: fcScores } = await supabase
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);
    console.log('FC Scores:', fcScores);

    console.log('\n👤 Checking Profiles...');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);
    console.log('Profiles:', profiles);

    return { 
      success: true, 
      response: data,
      fcScores,
      profiles,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('❌ Test failed:', err);
    return { success: false, error: err };
  }
}

testFinalizeAssessment().then(result => {
  console.log('\n📊 RESULT:', result.success ? 'SUCCESS' : 'FAILED');
});

export { testFinalizeAssessment };