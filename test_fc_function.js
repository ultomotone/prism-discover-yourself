// Test score_fc_session function directly
const testSession = '618c5ea6-aeda-4084-9156-0aac9643afd3';

console.log('Testing score_fc_session for session:', testSession);

// This would be the function call in a real environment:
// const result = await supabase.functions.invoke('score_fc_session', {
//   body: { session_id: testSession, basis: 'functions', version: 'v1.2' }
// });

console.log('Expected call parameters:');
console.log({
  session_id: testSession,
  basis: 'functions', 
  version: 'v1.2'
});

console.log('Function should create fc_scores row with version=v1.2');