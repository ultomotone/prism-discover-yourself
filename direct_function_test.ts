import { supabase } from "@/integrations/supabase/client";

// Test direct function invocation
const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';

console.log('Testing score_fc_session function...');
console.log(`Session: ${sessionId.substring(0,8)}`);

async function testFunction() {
  try {
    const result = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        version: 'v1.2', 
        basis: 'functions'
      }
    });
    
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.log('Error:', error);
    return { error };
  }
}

// Execute test
testFunction();