// Browser-based FC smoke test
// Execute in browser console: window.runFcSmokeTest()

window.runFcSmokeTest = async function() {
  console.log('🚀 FC SMOKE TEST - Browser Execution');
  console.log('====================================');
  
  // Get supabase from window or create it
  const { createClient } = window.supabase || require('@supabase/supabase-js');
  const client = createClient(
    'https://gnkuikentdtnatazeriu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
  );
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  try {
    // Pre-test check
    console.log('📊 Checking pre-test fc_scores...');
    const { data: preScores } = await client
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');
      
    console.log(`   Pre-test fc_scores: ${preScores?.length || 0} rows`);
    
    // Call score_fc_session
    console.log('🎯 Invoking score_fc_session...');
    const { data: fnResult, error: fnError } = await client.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });
    
    if (fnError) {
      console.error('❌ Function error:', fnError);
      return { success: false, error: fnError };
    }
    
    console.log('✅ Function response:', fnResult);
    
    // Post-test check
    console.log('📊 Checking post-test fc_scores...');
    const { data: postScores } = await client
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');
      
    console.log(`   Post-test fc_scores: ${postScores?.length || 0} rows`);
    
    if (postScores && postScores.length > 0) {
      const score = postScores[0];
      console.log('🎯 Score details:', {
        version: score.version,
        fc_kind: score.fc_kind,
        blocks_answered: score.blocks_answered,
        score_functions: Object.keys(score.scores_json || {})
      });
      
      return {
        success: true,
        preCount: preScores?.length || 0,
        postCount: postScores?.length || 0,
        fnResult,
        scoreDetails: score
      };
    } else {
      console.log('⚠️ No fc_scores created');
      return { success: false, error: 'No fc_scores created', fnResult };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

console.log('FC smoke test loaded. Run: window.runFcSmokeTest()');