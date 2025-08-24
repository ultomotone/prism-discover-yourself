import { supabase } from "@/integrations/supabase/client";

interface SaveResponseParams {
  sessionId: string;
  questionId: number | string;
  answer: string | number | string[] | number[];
  questionText: string;
  questionType: string;
  questionSection: string;
  responseTime?: number;
}

// Track in-flight saves to prevent duplicates
const inflightSaves = new Map<string, Promise<void>>();

/**
 * Idempotent response save using upsert to prevent 409 conflicts
 * Uses proper in-flight tracking and controlled state management
 */
export async function saveResponseIdempotent(params: SaveResponseParams): Promise<void> {
  const {
    sessionId,
    questionId,
    answer,
    questionText,
    questionType,
    questionSection,
    responseTime
  } = params;

  // Generate unique key for this save operation
  const saveKey = `${sessionId}-${questionId}`;
  
  // Check if this save is already in progress
  if (inflightSaves.has(saveKey)) {
    console.log('🔄 Save already in progress for:', saveKey);
    return inflightSaves.get(saveKey)!;
  }

  // Create the save promise
  const savePromise = performIdempotentSave(params);
  
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
async function performIdempotentSave(params: SaveResponseParams): Promise<void> {
  const {
    sessionId,
    questionId,
    answer,
    questionText,
    questionType,
    questionSection,
    responseTime
  } = params;

  console.log('💾 Saving response (idempotent):', { 
    sessionId, 
    questionId, 
    answer: typeof answer === 'string' && answer.length > 50 ? 
      answer.substring(0, 50) + '...' : answer 
  });

  // Prepare the response data (no updated_at to avoid PGRST204)
  const responseData: any = {
    session_id: sessionId,
    question_id: questionId,
    question_text: questionText,
    question_type: questionType,
    question_section: questionSection
  };

  // Handle different answer types properly
  if (Array.isArray(answer)) {
    responseData.answer_array = answer;
    responseData.answer_value = JSON.stringify(answer);
  } else if (typeof answer === 'number') {
    responseData.answer_numeric = answer;
    responseData.answer_value = answer.toString();
  } else {
    responseData.answer_value = String(answer);
  }

  if (responseTime !== undefined) {
    responseData.response_time_ms = responseTime;
  }

  // Call Edge Function to bypass RLS safely with service role
  const { data, error } = await supabase.functions.invoke('save_response', {
    body: responseData,
  });

  if (error) {
    console.error('💥 Response save failed:', error);
    throw error;
  }

  console.log('✅ Response saved successfully (upserted)');
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
