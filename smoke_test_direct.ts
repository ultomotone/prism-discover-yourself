import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

async function smokeTest() {
  console.log('🎯 Testing score_fc_session function...');
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  try {
    // Pre-test check
    const { data: preCheck } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId);
    console.log('Pre-test fc_scores count:', preCheck?.length || 0);
    
    // Call the function
    const { data: result, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions', 
        version: 'v1.2'
      }
    });
    
    if (error) {
      console.error('❌ Function error:', error);
      return;
    }
    
    console.log('✅ Function result:', result);
    
    // Post-test check
    const { data: postCheck } = await supabase
      .from('fc_scores') 
      .select('*')
      .eq('session_id', sessionId);
    console.log('Post-test fc_scores count:', postCheck?.length || 0);
    
    if (postCheck && postCheck.length > 0) {
      console.log('✅ FC Score created:', {
        version: postCheck[0].version,
        fc_kind: postCheck[0].fc_kind,
        blocks_answered: postCheck[0].blocks_answered,
        score_functions: Object.keys(postCheck[0].scores_json || {})
      });
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

smokeTest();