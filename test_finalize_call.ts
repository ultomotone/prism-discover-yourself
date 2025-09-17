import { createClient } from '@supabase/supabase-js';

const url = "https://gnkuikentdtnatazeriu.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U";

const supabase = createClient(url, anonKey);

async function testFinalizeCall() {
  console.log('=== Testing finalizeAssessment Call ===');
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  console.log(`Session ID: ${sessionId}`);
  
  console.log('\nCalling finalizeAssessment...');
  const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
    body: { session_id: sessionId }
  });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Success:', JSON.stringify(data, null, 2));
  
  // Now check the results
  console.log('\nChecking fc_scores...');
  const { data: fcScores, error: fcError } = await supabase
    .from('fc_scores')
    .select('version, scores_json, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (fcError) {
    console.error('FC Error:', fcError);
  } else {
    console.log('FC Scores:', fcScores);
  }
  
  console.log('\nChecking profiles...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('results_version, type_code, overlay, created_at')
    .eq('session_id', sessionId);
    
  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profiles:', profiles);
  }
}

testFinalizeCall().catch(console.error);