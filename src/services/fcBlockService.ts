import { supabase } from '@/integrations/supabase/client';

export interface FCBlock {
  id: string;
  code: string;
  title: string;
  description?: string;
  order_index: number;
  is_active: boolean;
}

export interface FCOption {
  id: string;
  block_id: string;
  option_code: string;
  prompt: string;
  weights_json: any;
  order_index: number;
}

export interface FCResponse {
  session_id: string;
  block_id: string;
  option_id: string;
  answered_at: string;
}

/**
 * Check if the current question is a real FC block that should use the new system
 */
export function isRealFCBlock(question: any): boolean {
  return question?.type?.startsWith('forced-choice-') && 
         question?.section?.toLowerCase().includes('work style') &&
         question?.tag?.match(/^FC\d+$/); // Real FC blocks have tags like FC01, FC02, etc.
}

/**
 * Load all FC blocks from the database
 */
export async function loadFCBlocks(): Promise<{
  blocks: FCBlock[];
  options: Record<string, FCOption[]>;
}> {
  console.log('Loading FC blocks from database...');
  
  // Load FC blocks
  const { data: blocksData, error: blocksError } = await supabase
    .from('fc_blocks')
    .select('*')
    .eq('version', 'v1.2')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (blocksError) {
    console.error('Error loading FC blocks:', blocksError);
    throw blocksError;
  }

  // Load FC options
  const { data: optionsData, error: optionsError } = await supabase
    .from('fc_options')
    .select('*')
    .order('order_index', { ascending: true });

  if (optionsError) {
    console.error('Error loading FC options:', optionsError);
    throw optionsError;
  }

  // Group options by block_id
  const optionsByBlock: Record<string, FCOption[]> = {};
  optionsData?.forEach(option => {
    if (!optionsByBlock[option.block_id]) {
      optionsByBlock[option.block_id] = [];
    }
    optionsByBlock[option.block_id].push(option);
  });

  return {
    blocks: blocksData || [],
    options: optionsByBlock
  };
}

/**
 * Save FC response to the database
 */
export async function saveFCResponse(
  sessionId: string, 
  blockId: string, 
  optionId: string
): Promise<void> {
  console.log(`Saving FC response: session=${sessionId}, block=${blockId}, option=${optionId}`);

  const { error } = await supabase
    .from('fc_responses')
    .upsert({
      session_id: sessionId,
      block_id: blockId,
      option_id: optionId,
      answered_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving FC response:', error);
    throw error;
  }
}

/**
 * Load existing FC responses for a session
 */
export async function loadFCResponses(sessionId: string): Promise<FCResponse[]> {
  const { data, error } = await supabase
    .from('fc_responses')
    .select('*')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error loading FC responses:', error);
    throw error;
  }

  return data || [];
}

/**
 * Check if all FC blocks are completed for a session
 */
export async function checkFCCompletion(sessionId: string): Promise<{
  completed: boolean;
  completedBlocks: number;
  totalBlocks: number;
}> {
  const [responses, { blocks }] = await Promise.all([
    loadFCResponses(sessionId),
    loadFCBlocks()
  ]);

  const completedBlocks = responses.length;
  const totalBlocks = blocks.length;
  const completed = completedBlocks >= totalBlocks;

  console.log(`FC completion check: ${completedBlocks}/${totalBlocks} blocks completed`);

  return {
    completed,
    completedBlocks,
    totalBlocks
  };
}

/**
 * Score FC session by calling the edge function
 */
export async function scoreFCSession(sessionId: string): Promise<any> {
  console.log('Calling score_fc_session edge function...');

  const { data, error } = await supabase.functions.invoke('score_fc_session', {
    body: {
      session_id: sessionId,
      basis: 'functions',
      version: 'v1.2'
    }
  });

  if (error) {
    console.error('FC scoring error:', error);
    throw error;
  }

  console.log('FC scoring completed:', data);
  return data;
}

/**
 * Get FC coverage bucket based on completion rate
 */
export function getFCCoverageBucket(completedBlocks: number, totalBlocks: number): string {
  const completionRate = completedBlocks / totalBlocks;
  
  if (completionRate >= 1.0) return 'Complete';
  if (completionRate >= 0.75) return 'High';
  if (completionRate >= 0.5) return 'Medium';
  if (completionRate >= 0.25) return 'Low';
  return 'None';
}