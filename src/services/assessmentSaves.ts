import { supabase } from "@/integrations/supabase/client";

interface SaveResponseParams {
  sessionId: string;
  questionId: number;
  answer: string | number | string[] | number[];
  questionText: string;
  questionType: string;
  questionSection: string;
  responseTime?: number;
}

// Track in-flight saves to prevent duplicates
const inflightSaves = new Set<string>();

/**
 * Idempotent response save using upsert to prevent 409 conflicts
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
    return;
  }

  // Mark as in-flight
  inflightSaves.add(saveKey);

  try {
    console.log('💾 Saving response (idempotent):', { sessionId, questionId, answer });

    // Prepare the response data
    const responseData: any = {
      session_id: sessionId,
      question_id: questionId,
      question_text: questionText,
      question_type: questionType,
      question_section: questionSection,
      updated_at: new Date().toISOString()
    };

    // Handle different answer types
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

    // Use upsert to avoid conflicts
    const { error } = await supabase
      .from('assessment_responses')
      .upsert(responseData, {
        onConflict: 'session_id,question_id'
      });

    if (error) {
      console.error('💥 Response save failed:', error);
      throw error;
    }

    console.log('✅ Response saved successfully');
  } finally {
    // Always remove from in-flight tracking
    inflightSaves.delete(saveKey);
  }
}

/**
 * Load existing responses for a session
 */
export async function loadSessionResponses(sessionId: string): Promise<Array<{
  questionId: number;
  answer: string | number | string[] | number[];
}>> {
  console.log('📥 Loading session responses:', sessionId);

  const { data: responses, error } = await supabase
    .from('assessment_responses')
    .select('question_id, answer_value, answer_numeric, answer_array')
    .eq('session_id', sessionId)
    .order('question_id');

  if (error) {
    console.error('💥 Failed to load responses:', error);
    throw error;
  }

  const mappedResponses = (responses || []).map(r => {
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

  console.log('📊 Loaded responses:', mappedResponses.length);
  return mappedResponses;
}

/**
 * Calculate next question index based on actual responses
 */
export function calculateNextQuestionIndex(
  totalQuestions: number,
  responses: Array<{ questionId: number }>
): number {
  const answeredQuestionIds = new Set(responses.map(r => r.questionId));
  
  // Find first unanswered question (1-indexed questions)
  for (let i = 1; i <= totalQuestions; i++) {
    if (!answeredQuestionIds.has(i)) {
      return i - 1; // Convert to 0-indexed for array
    }
  }
  
  // All questions answered
  return totalQuestions - 1;
}
