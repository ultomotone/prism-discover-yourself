import { supabase } from "@/integrations/supabase/client";

export interface ValidationPayload {
  ok: boolean;
  errors: string[];
  warnings: string[];
  counts: {
    fc_answered: number;
    fc_expected: number;
    inc_pairs_present: number;
    inc_pairs_complete: number;
    ac_present: number;
    ac_correct: number;
    sd_present: boolean;
  };
  config: {
    fc_expected_min: number;
    [key: string]: any;
  };
}

export interface QuestionLibrary {
  id: number;
  type: string;
  tag?: string;
  pair_group?: string;
  section: string;
  required: boolean;
  fc_map?: any;
  reverse_scored?: boolean;
  meta?: any;
}

export interface AssessmentResponse {
  questionId: number;
  answer: string | number | string[] | number[];
}

/**
 * Validates PRISM assessment integrity before submission
 * Interfaces with backend /getConfig and /getView endpoints
 */
export async function validatePrismAssessment(
  responses: AssessmentResponse[], 
  library?: QuestionLibrary[]
): Promise<ValidationPayload> {
  try {
    // Load config and library from backend if not provided
    const [configResult, libraryResult] = await Promise.all([
      supabase.functions.invoke('getConfig'),
      library ? Promise.resolve({ data: { data: library } }) : supabase.functions.invoke('getView', {
        body: { view_name: 'questions', limit: 2000 }
      })
    ]);

    if ('error' in configResult && configResult.error) {
      throw new Error(`Config fetch failed: ${configResult.error.message}`);
    }
    
    if ('error' in libraryResult && libraryResult.error) {
      throw new Error(`Library fetch failed: ${libraryResult.error.message}`);
    }

    const config = configResult.data?.config || {};
    const questions = library || libraryResult.data?.data || [];
    
    console.log('Validation config:', config);
    console.log('Questions library count:', questions.length);

    // Initialize counts and tracking
    const errors: string[] = [];
    const warnings: string[] = [];
    const responseMap = new Map(responses.map(r => [r.questionId, r.answer]));
    
    // FC validation
    const fcQuestions = questions.filter(q => 
      q.type?.startsWith('forced-choice-') && 
      q.section?.toLowerCase().includes('work')
    );
    const fcAnswered = fcQuestions.filter(q => responseMap.has(q.id)).length;
    const fcExpectedMin = config.fc_expected_min || 24;
    
    if (fcAnswered < fcExpectedMin) {
      errors.push(`Insufficient forced-choice responses: ${fcAnswered}/${fcExpectedMin} completed`);
    }

    // Inconsistency pair validation
    const incQuestions = questions.filter(q => 
      q.tag?.startsWith('INC_') && q.pair_group
    );
    const incPairs = new Map<string, { a: boolean; b: boolean }>();
    
    incQuestions.forEach(q => {
      if (!q.pair_group) return;
      const isA = q.tag?.endsWith('_A');
      const isB = q.tag?.endsWith('_B');
      const hasResponse = responseMap.has(q.id);
      
      if (!incPairs.has(q.pair_group)) {
        incPairs.set(q.pair_group, { a: false, b: false });
      }
      const pair = incPairs.get(q.pair_group)!;
      if (isA && hasResponse) pair.a = true;
      if (isB && hasResponse) pair.b = true;
    });

    const incPairsPresent = incPairs.size;
    const incPairsComplete = Array.from(incPairs.values()).filter(p => p.a && p.b).length;
    const incompletePairs = incPairsPresent - incPairsComplete;
    
    if (incompletePairs > 0) {
      errors.push(`${incompletePairs} inconsistency pair(s) incomplete (missing A or B responses)`);
    }

    // Attention check validation
    const acQuestions = questions.filter(q => q.tag?.startsWith('AC_'));
    let acCorrect = 0;
    
    acQuestions.forEach(q => {
      const response = responseMap.get(q.id);
      if (response !== undefined) {
        // Simple correctness check - could be enhanced based on q.meta.correct_answer
        const expectedAnswer = q.meta?.correct_answer || q.meta?.correctAnswer;
        if (expectedAnswer && response === expectedAnswer) {
          acCorrect++;
        } else if (!expectedAnswer) {
          // If no expected answer defined, assume correct for now
          acCorrect++;
        }
      }
    });

    const acIncorrect = acQuestions.filter(q => {
      const response = responseMap.get(q.id);
      const expectedAnswer = q.meta?.correct_answer || q.meta?.correctAnswer;
      return response !== undefined && expectedAnswer && response !== expectedAnswer;
    }).length;

    if (acIncorrect > 0) {
      errors.push(`${acIncorrect} attention check(s) answered incorrectly`);
    }

    // Social desirability check
    const sdQuestions = questions.filter(q => 
      (q.tag === 'SD' || q.tag?.startsWith('SD_')) && 
      q.section?.toLowerCase().includes('validity')
    );
    const sdPresent = sdQuestions.length > 0;
    
    if (!sdPresent) {
      errors.push('No social desirability items found in assessment');
    }

    // Library integrity checks
    const coreNeuroQuestions = questions.filter(q => 
      q.section?.toLowerCase().includes('neuroticism') || 
      (q.tag?.startsWith('N') && q.type === 'likert-1-7')
    );
    const coreVQCQuestions = questions.filter(q => 
      q.section?.toLowerCase().includes('validity')
    );
    
    if (coreNeuroQuestions.length === 0) {
      errors.push('System error: No neuroticism index items found. Please retry later.');
    }
    
    if (coreVQCQuestions.length === 0) {
      errors.push('System error: No validity control items found. Please retry later.');
    }

    // Optional warnings
    const stateQuestions = questions.filter(q => q.type === 'state-1-7');
    const stateAnswered = stateQuestions.filter(q => responseMap.has(q.id)).length;
    
    if (stateQuestions.length > 0 && stateAnswered === 0) {
      warnings.push('Optional state assessment items were not completed');
    }

    const demographicQuestions = questions.filter(q => 
      q.section?.toLowerCase().includes('demographic')
    );
    const demographicAnswered = demographicQuestions.filter(q => responseMap.has(q.id)).length;
    
    if (demographicQuestions.length > 0 && demographicAnswered < demographicQuestions.length) {
      warnings.push('Some optional demographic items were not completed');
    }

    const payload: ValidationPayload = {
      ok: errors.length === 0,
      errors,
      warnings,
      counts: {
        fc_answered: fcAnswered,
        fc_expected: fcExpectedMin,
        inc_pairs_present: incPairsPresent,
        inc_pairs_complete: incPairsComplete,
        ac_present: acQuestions.length,
        ac_correct: acCorrect,
        sd_present: sdPresent
      },
      config: {
        fc_expected_min: fcExpectedMin,
        ...config
      }
    };

    console.log('Validation result:', payload);
    return payload;

  } catch (error) {
    console.error('Validation error:', error);
    return {
      ok: false,
      errors: [`Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      counts: {
        fc_answered: 0,
        fc_expected: 24,
        inc_pairs_present: 0,
        inc_pairs_complete: 0,
        ac_present: 0,
        ac_correct: 0,
        sd_present: false
      },
      config: { fc_expected_min: 24 }
    };
  }
}

/**
 * Log validation event to Supabase for auditing
 */
export async function logValidationEvent(
  sessionId: string,
  payload: ValidationPayload,
  action: 'pre_submit' | 'block_submit' | 'allow_submit'
): Promise<void> {
  try {
    // Log to console in development, could be enhanced with proper logging table
    console.log('Validation Event:', {
      session_id: sessionId,
      event_type: action,
      validation_payload: payload,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Create validation_events table for production logging
    // await supabase.from('validation_events').insert({...});
  } catch (error) {
    console.warn('Failed to log validation event:', error);
    // Don't throw - logging failures shouldn't block the main flow
  }
}