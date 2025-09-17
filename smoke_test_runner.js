// Direct function invocation test
const supabase = window.supabaseClient || (() => {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    'https://gnkuikentdtnatazeriu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
  );
})();

async function runFcSmokeTest() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('🎯 Invoking score_fc_session...');
  
  try {
    const { data, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });
    
    if (error) {
      console.error('❌ Function error:', error);
      return false;
    }
    
    console.log('✅ Function success:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Exception:', err);
    return false;
  }
}

// Execute
runFcSmokeTest();