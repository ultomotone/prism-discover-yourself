// Direct execution of score_fc_session for smoke test
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

async function executeScoreFcSession() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('🎯 Executing score_fc_session for smoke test');
  console.log(`Session: ${sessionId.substring(0,8)}`);
  console.log('Parameters: version=v1.2, basis=functions');
  
  try {
    const { data, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        version: 'v1.2',
        basis: 'functions'
      }
    });
    
    if (error) {
      console.log('❌ Function error:', error);
      return;
    }
    
    console.log('✅ Function success:', data);
    
    // Check fc_scores table
    const { data: scores } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');
    
    console.log(`📊 FC Scores created: ${scores?.length || 0} rows`);
    if (scores?.[0]) {
      console.log(`📈 Version: ${scores[0].version}`);
      console.log(`🎯 Blocks answered: ${scores[0].blocks_answered}`);
      console.log(`📝 Score keys: ${Object.keys(scores[0].scores_json || {}).join(', ')}`);
    }
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

executeScoreFcSession();