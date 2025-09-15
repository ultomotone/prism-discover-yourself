import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface SaveResponseParams {
  sessionId: string;
  questionId: number | string;
  answer: string | number | string[] | number[];
  questionText: string;
  questionType: string;
  questionSection: string;
  responseTime?: number;
}

type SupabaseRpcClient = Pick<
  SupabaseClient<any, any, any>,
  "rpc" | "functions"
>;

type RpcPayload = {
  p_session_id: string;
  p_question_id: number;
  p_answer: Record<string, unknown>;
  p_source: string;
};

type EdgePayload = {
  session_id: string;
  question_id: number;
  question_text?: string;
  question_type?: string;
  question_section?: string;
  response_time_ms?: number;
  answer_value?: string;
  answer_numeric?: number;
  answer_array?: string[] | number[];
  answer_object?: Record<string, unknown>;
};

export type SaveResponseErrorKind = "rpc_error" | "edge_error";

export class SaveResponseException extends Error {
  readonly kind: SaveResponseErrorKind;
  readonly cause: unknown;

  constructor(kind: SaveResponseErrorKind, cause: unknown, message?: string) {
    super(
      message ??
        (cause instanceof Error
          ? cause.message
          : typeof cause === "string"
            ? cause
            : "Unknown response save failure")
    );
    this.name = "SaveResponseException";
    this.kind = kind;
    this.cause = cause;
  }
}

// Track in-flight saves to prevent duplicates
const inflightSaves = new Map<string, Promise<void>>();

/**
 * Idempotent response save using upsert to prevent 409 conflicts
 * Uses proper in-flight tracking and controlled state management
 */
export async function saveResponseIdempotent(
  params: SaveResponseParams,
  client: SupabaseRpcClient = supabase
): Promise<void> {
  const {
    sessionId,
    questionId,
    answer
  } = params;

  // Generate unique key for this save operation
  const saveKey = `${sessionId}-${questionId}`;
  
  // Check if this save is already in progress
  if (inflightSaves.has(saveKey)) {
    console.log('🔄 Save already in progress for:', saveKey);
    return inflightSaves.get(saveKey)!;
  }

  // Create the save promise
  const savePromise = performIdempotentSave(params, client);
  
  // Track the save
  inflightSaves.set(saveKey, savePromise);

  try {
    await savePromise;
  } finally {
    // Always clean up tracking
    inflightSaves.delete(saveKey);
  }
}

/**
 * Perform the actual idempotent save operation
 */
async function performIdempotentSave(
  params: SaveResponseParams,
  client: SupabaseRpcClient
): Promise<void> {
  const {
    sessionId,
    questionId,
    answer
  } = params;

  console.log('💾 Saving response (idempotent):', { 
    sessionId, 
    questionId, 
    answer: typeof answer === 'string' && answer.length > 50 ? 
      answer.substring(0, 50) + '...' : answer 
  });

  const rpcPayload = buildRpcPayload(params);
  const edgePayload = buildEdgePayload(params);

  try {
    const { error } = await client.rpc('save_assessment_response', rpcPayload);

    if (!error) {
      console.log('✅ Response saved successfully (upserted via RPC)');
      return;
    }

    if (isRpcMissingError(error)) {
      console.warn('⚠️ RPC save failed (missing function). Falling back to edge function.', error);
      await invokeEdgeFallback(client, edgePayload);
      console.log('✅ Response saved successfully via edge function fallback');
      return;
    }

    console.error('💥 Response save failed with non-recoverable RPC error:', error);
    throw new SaveResponseException('rpc_error', error);
  } catch (rpcException) {
    if (rpcException instanceof SaveResponseException) {
      throw rpcException;
    }
    console.error('💥 Unexpected RPC invocation failure. Attempting edge fallback.', rpcException);
    try {
      await invokeEdgeFallback(client, edgePayload);
      console.log('✅ Response saved successfully via edge function fallback');
      return;
    } catch (edgeError) {
      throw new SaveResponseException('rpc_error', rpcException, 'RPC request failed before reaching PostgREST');
    }
  }
}

function buildRpcPayload(params: SaveResponseParams): RpcPayload {
  const answerJson: Record<string, unknown> = {
    question_text: params.questionText,
    question_type: params.questionType,
    question_section: params.questionSection,
  };

  if (Array.isArray(params.answer)) {
    answerJson.answer_array = params.answer;
  } else if (typeof params.answer === 'number') {
    answerJson.answer_numeric = params.answer;
  } else if (params.answer != null) {
    answerJson.answer_value = String(params.answer);
  }

  return {
    p_session_id: params.sessionId,
    p_question_id: Number(params.questionId),
    p_answer: answerJson,
    p_source: 'web',
  };
}

function buildEdgePayload(params: SaveResponseParams): EdgePayload {
  const payload: EdgePayload = {
    session_id: params.sessionId,
    question_id: Number(params.questionId),
    question_text: params.questionText,
    question_type: params.questionType,
    question_section: params.questionSection,
  };

  if (params.responseTime !== undefined) {
    payload.response_time_ms = params.responseTime;
  }

  if (Array.isArray(params.answer)) {
    payload.answer_array = params.answer;
  } else if (typeof params.answer === 'number') {
    payload.answer_numeric = params.answer;
    payload.answer_value = params.answer.toString();
  } else if (params.answer != null) {
    payload.answer_value = String(params.answer);
  }

  return payload;
}

function isRpcMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
  if (code === '404' || code === 'PGRST404') {
    return true;
  }

  const message = 'message' in error ? String((error as { message?: unknown }).message ?? '') : '';
  return message.toLowerCase().includes('not found') || message.toLowerCase().includes('does not exist');
}

async function invokeEdgeFallback(client: SupabaseRpcClient, payload: EdgePayload): Promise<void> {
  const { data, error } = await client.functions.invoke('save_response', {
    body: payload,
  });

  if (error) {
    console.error('💥 Edge function save_response failed:', error);
    throw new SaveResponseException('edge_error', error);
  }

  if (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) {
    console.error('💥 Edge function save_response returned error payload:', data);
    throw new SaveResponseException('edge_error', (data as { error?: unknown }).error);
  }
}

/**
 * Load existing responses for a session using edge function
 */
export async function loadSessionResponses(sessionId: string): Promise<Array<{
  questionId: number | string;
  answer: string | number | string[] | number[];
}>> {
  console.log('📥 Loading session responses via edge function:', sessionId);

  try {
    // Use edge function to get progress and responses
    const { data, error } = await supabase.functions.invoke('get_progress', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('💥 Failed to load responses via edge function:', error);
      throw error;
    }

    if (data?.status !== 'success') {
      throw new Error(data?.error || 'Failed to load progress');
    }

    const responses = (data.responses || []).map((r: any) => {
      let answer: string | number | string[] | number[];

      // Reconstruct answer from stored fields
      if (r.answer_array && Array.isArray(r.answer_array)) {
        answer = r.answer_array;
      } else if (r.answer_numeric !== null) {
        answer = r.answer_numeric;
      } else {
        answer = r.answer_value || '';
        
        // Try to parse JSON arrays stored as strings
        if (typeof answer === 'string' && answer.startsWith('[')) {
          try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) {
              answer = parsed;
            }
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      }

      return {
        questionId: r.question_id,
        answer
      };
    });

    console.log('📊 Loaded responses via edge function:', responses.length);
    return responses;
  } catch (error) {
    console.error('💥 Edge function call failed, falling back to direct query');
    // Fallback to direct query in case of edge function issues
    const { data: responses, error: directError } = await supabase
      .from('assessment_responses')
      .select('question_id, answer_value, answer_numeric, answer_array')
      .eq('session_id', sessionId)
      .order('question_id');

    if (directError) {
      console.error('💥 Direct query also failed:', directError);
      throw directError;
    }

    return (responses || []).map(r => ({
      questionId: r.question_id,
      answer: r.answer_array || r.answer_numeric || r.answer_value || ''
    }));
  }
}

/**
 * Calculate first unanswered question index using library order
 */
export function firstUnansweredIndex(
  library: Array<{ id: string | number }>,
  responsesMap: Record<string | number, any>
): number {
  for (let i = 0; i < library.length; i++) {
    const question = library[i];
    const response = responsesMap[question.id];
    
    // Check if question is unanswered
    if (response == null || 
        (Array.isArray(response) && response.length === 0) ||
        (typeof response === 'string' && response.trim() === '')) {
      return i;
    }
  }
  
  // All questions answered - return last index for final submit UI
  return Math.max(0, library.length - 1);
}

/**
 * Convert response array to map by question ID
 */
export function responsesToMap(responses: Array<{ questionId: string | number; answer: any }>): Record<string | number, any> {
  const map: Record<string | number, any> = {};
  responses.forEach(r => {
    map[r.questionId] = r.answer;
  });
  return map;
}
