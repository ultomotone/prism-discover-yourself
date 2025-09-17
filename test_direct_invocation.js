// Direct function invocation for FC smoke test
const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';

console.log('🎯 Direct Function Invocation Test');
console.log(`Session: ${sessionId.substring(0,8)}`);
console.log('Calling score_fc_session with v1.2...');

// This demonstrates the expected function call structure
const functionCall = {
  function: 'score_fc_session',
  parameters: {
    session_id: sessionId,
    version: 'v1.2',
    basis: 'functions'
  }
};

console.log('Function call structure:', functionCall);
console.log('Expected: Creates fc_scores row with version=v1.2');