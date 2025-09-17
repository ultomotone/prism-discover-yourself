import { supabase } from "@/integrations/supabase/client";

export async function testFcScoring(sessionId: string) {
  console.log(`Testing score_fc_session for session: ${sessionId}`);

  try {
    // First, check if session has any responses
    const { data: responses, error: responseError } = await supabase
      .from('assessment_responses')
      .select('id')
      .eq('session_id', sessionId);

    if (responseError) {
      throw new Error(`Response check failed: ${responseError.message}`);
    }

    console.log(`Session ${sessionId} has ${responses?.length || 0} responses`);

    // For testing purposes, create mock FC responses if none exist
    if (!responses || responses.length === 0) {
      await createMockFcResponses(sessionId);
    }

    // Call score_fc_session edge function
    const { data, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });

    if (error) {
      throw new Error(`score_fc_session failed: ${error.message}`);
    }

    console.log(`score_fc_session result for ${sessionId}:`, data);

    // Verify fc_scores was created
    const { data: fcScores, error: scoresError } = await supabase
      .from('fc_scores')
      .select('*')
      .eq('session_id', sessionId)
      .eq('version', 'v1.2');

    if (scoresError) {
      throw new Error(`FC scores check failed: ${scoresError.message}`);
    }

    return {
      success: true,
      sessionId,
      functionResult: data,
      fcScoresCount: fcScores?.length || 0,
      fcScores: fcScores?.[0] || null
    };

  } catch (error) {
    return {
      success: false,
      sessionId,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function createMockFcResponses(sessionId: string) {
  console.log(`Creating mock FC responses for session: ${sessionId}`);
  
  // Get available fc_blocks and fc_options for v1.2
  const { data: blocks } = await supabase
    .from('fc_blocks')
    .select('id')
    .eq('version', 'v1.2')
    .eq('is_active', true)
    .order('order_index');

  const { data: options } = await supabase
    .from('fc_options')
    .select('id, block_id, option_code')
    .order('order_index');

  if (!blocks || !options) {
    throw new Error('No FC blocks/options found for v1.2');
  }

  // Create one response per block (selecting first option of each)
  const responses = blocks.map(block => {
    const blockOptions = options.filter(opt => opt.block_id === block.id);
    const selectedOption = blockOptions[0]; // Select first option for testing
    
    return {
      session_id: sessionId,
      block_id: block.id,
      option_id: selectedOption.id
    };
  });

  // Insert mock responses
  const { error } = await supabase
    .from('fc_responses')
    .insert(responses);

  if (error) {
    throw new Error(`Mock response creation failed: ${error.message}`);
  }

  console.log(`Created ${responses.length} mock FC responses`);
}

export async function runFcSmokeTests() {
  const testSessions = [
    '618c5ea6-aeda-4084-9156-0aac9643afd3',
    '070d9bf2-516f-44ee-87fc-017c7db9d29c'
  ];

  const results = [];
  
  for (const sessionId of testSessions) {
    const result = await testFcScoring(sessionId);
    results.push(result);
    console.log(`Test result for ${sessionId}:`, result.success ? 'PASS' : 'FAIL');
  }

  return results;
}