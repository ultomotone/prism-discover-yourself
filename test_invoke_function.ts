import { supabase } from "@/integrations/supabase/client";

export async function testInvokeScoreFc() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('Testing score_fc_session invocation...');
  
  try {
    const response = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });
    
    console.log('Function response:', response);
    return response;
  } catch (error) {
    console.error('Function error:', error);
    throw error;
  }
}

// Expose to window for testing
if (typeof window !== 'undefined') {
  (window as any).testInvokeScoreFc = testInvokeScoreFc;
}