// Direct smoke test execution
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

const TEST_SESSIONS = [
  '618c5ea6-aeda-4084-9156-0aac9643afd3',
  '070d9bf2-516f-44ee-87fc-017c7db9d29c'
];

async function runSmokeTest() {
  console.log('🚀 FC SMOKE TEST EXECUTION');
  console.log('===========================');
  
  for (const sessionId of TEST_SESSIONS) {
    console.log(`\n🧪 Testing ${sessionId.substring(0,8)}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          basis: 'functions',
          version: 'v1.2'
        }
      });
      
      if (error) {
        console.log(`  ❌ Error:`, error);
        continue;
      }
      
      console.log(`  ✅ Function result:`, data);
      
      // Check fc_scores
      const { data: scores } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');
        
      console.log(`  📊 FC Scores: ${scores?.length || 0} rows`);
      
    } catch (err) {
      console.log(`  ❌ Exception:`, err.message);
    }
  }
}

runSmokeTest();