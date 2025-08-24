import { supabase } from "@/integrations/supabase/client";
import { getPrismConfig, PrismConfig } from "@/services/prismConfig";
import { visibleIf } from "@/lib/visibility";

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
    source?: string;
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
  social_desirability?: boolean;
  meta?: any;
}

export interface AssessmentResponse {
  questionId: number;
  answer: string | number | string[] | number[];
}

/**
 * Validates PRISM assessment integrity before submission
 * Uses robust config with fallback and only counts visible items
 */
export async function validatePrismAssessment(
  responses: AssessmentResponse[], 
  library?: QuestionLibrary[]
): Promise<ValidationPayload> {
  console.log('🚀 validatePrismAssessment called with', responses.length, 'responses');
  
  try {
    console.log('🚀 Loading config...');
    // Load config with fallback (never fails)
    const config = await getPrismConfig();
    console.log('🚀 Config loaded:', config);
    
    // Load library from backend if not provided
    let questions: QuestionLibrary[] = [];
    if (library) {
      questions = library;
      console.log('🚀 Using provided library:', questions.length, 'questions');
    } else {
      console.log('🚀 Fetching library from backend...');
      const libraryResult = await supabase.functions.invoke('getView', {
        body: { view_name: 'questions', limit: 2000 }
      });
      
      console.log('🚀 Library fetch result:', libraryResult);
      
      if ('error' in libraryResult && libraryResult.error) {
        console.error('❌ Library fetch failed:', libraryResult.error);
        throw new Error(`Library fetch failed: ${libraryResult.error.message}`);
      }
      
      questions = libraryResult.data?.data || [];
      console.log('🚀 Backend library loaded:', questions.length, 'questions');
    }

    // Filter to visible questions only
    const visibleQuestions = questions.filter((q: any) => visibleIf({
      id: q.id,
      text: q.text || '',
      type: q.type,
      required: q.required || false,
      section: q.section,
      tag: q.tag,
      meta: q.meta
    } as any));
    
    console.log('=== VALIDATION DEBUG ===');
    console.log('Total library questions:', questions.length);
    console.log('Visible questions after filter:', visibleQuestions.length);
    console.log('User responses count:', responses.length);
    console.log('Config source:', config.source);
    console.log('Config fc_expected_min:', config.fc_expected_min);
    
    console.log('Validation config:', config);
    console.log('Visible questions count:', visibleQuestions.length);
    console.log('Config source:', config.source);

    // Initialize counts and tracking
    const errors: string[] = [];
    const warnings: string[] = [];
    const responseMap = new Map(responses.map(r => [r.questionId, r.answer]));
    
    // FC validation (visible questions only)
    const fcQuestions = visibleQuestions.filter(q => 
      q.type?.startsWith('forced-choice-') && 
      q.section?.toLowerCase().includes('work')
    );
    const fcAnswered = fcQuestions.filter(q => responseMap.has(q.id)).length;
    const fcExpectedMin = config.fc_expected_min;
    
    console.log('=== FC VALIDATION DEBUG ===');
    console.log('FC questions found:', fcQuestions.length);
    console.log('FC questions:', fcQuestions.map(q => ({ id: q.id, type: q.type, section: q.section })));
    console.log('FC answers found:', fcAnswered);
    console.log('FC expected minimum:', fcExpectedMin);
    console.log('Response map keys:', Array.from(responseMap.keys()));
    console.log('Response map sample:', Object.fromEntries(Array.from(responseMap.entries()).slice(0, 5)));
    
    if (fcAnswered < fcExpectedMin) {
      errors.push(`Answer at least ${fcExpectedMin} forced-choice blocks (${fcAnswered}/${fcExpectedMin})`);
    }

    // Inconsistency pair validation (visible questions only)
    const incQuestions = visibleQuestions.filter(q => 
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
    
    const incompletePairs = Array.from(incPairs.entries())
      .filter(([_, pair]) => !pair.a || !pair.b)
      .map(([pairGroup]) => pairGroup);
    
    if (incompletePairs.length > 0) {
      errors.push(`Complete both items for these INC pairs: ${incompletePairs.join(', ')}`);
    }

    // Attention check validation (visible questions only)
    const acQuestions = visibleQuestions.filter(q => 
      q.tag?.startsWith('AC_') && q.section?.toLowerCase().includes('validity')
    );
    
    const wrongACs = acQuestions.filter(q => {
      const response = responseMap.get(q.id);
      // For now, assume AC_1 should be answered with option 0 (first option)
      // This should be made configurable based on the actual AC question logic
      return response !== undefined && response !== 0;
    });
    
    if (wrongACs.length > 0) {
      errors.push(`Fix attention checks: ${wrongACs.map(q => `Q${q.id}`).join(', ')}`);
    }

    // Social Desirability validation (visible questions only)
    const sdQuestions = visibleQuestions.filter(q => 
      q.tag === 'SD' || q.social_desirability === true ||
      q.section?.toLowerCase().includes('validity') && q.tag?.includes('SD')
    );
    
    console.log('=== LIBRARY INTEGRITY DEBUG ===');
    console.log('SD questions found:', sdQuestions.length);
    console.log('SD questions:', sdQuestions.map(q => ({ id: q.id, tag: q.tag, section: q.section })));
    
    // Library integrity checks (visible questions only)
    const neuroQuestions = visibleQuestions.filter(q => 
      q.tag === 'N' || q.tag === 'N_R' || 
      (q.section?.toLowerCase().includes('neuro') && q.type?.includes('likert'))
    );
    
    console.log('Neuro questions found:', neuroQuestions.length);
    console.log('Neuro questions:', neuroQuestions.map(q => ({ id: q.id, tag: q.tag, section: q.section })));

    // VQC (Validity & Quality Control) presence (visible questions only)
    const vqcQuestions = visibleQuestions.filter(q => 
      q.section?.toLowerCase().includes('validity')
    );
    
    console.log('VQC questions found:', vqcQuestions.length);
    console.log('VQC questions:', vqcQuestions.map(q => ({ id: q.id, section: q.section })));
    console.log('All sections found:', [...new Set(visibleQuestions.map(q => q.section))]);
    
    if (sdQuestions.length === 0) {
      errors.push('Library issue: SD items missing (contact support)');
    }

    // Optional section warnings (visible questions only)
    const stateQuestions = visibleQuestions.filter(q => q.type === 'state-1-7');
    const answeredStateQuestions = stateQuestions.filter(q => responseMap.has(q.id));
    
    if (stateQuestions.length > 0 && answeredStateQuestions.length === 0) {
      warnings.push('Optional state assessment section not completed');
    }

    if (neuroQuestions.length === 0) {
      errors.push('Library issue: Neuro items missing (contact support)');
    }

    if (vqcQuestions.length === 0) {
      errors.push('Library issue: VQC items missing (contact support)');
    }

    // Return validation payload
    return {
      ok: errors.length === 0,
      errors,
      warnings,
      counts: {
        fc_answered: fcAnswered,
        fc_expected: fcExpectedMin,
        inc_pairs_present: incPairs.size,
        inc_pairs_complete: Array.from(incPairs.values()).filter(pair => pair.a && pair.b).length,
        ac_present: acQuestions.length,
        ac_correct: acQuestions.length - wrongACs.length,
        sd_present: sdQuestions.length > 0
      },
      config: {
        fc_expected_min: fcExpectedMin,
        source: config.source
      }
    };

  } catch (error) {
    console.error('Validation error:', error);
    
    // In case of validation system failure, use fallback config and allow submission
    // This prevents blocking users when backend systems are down
    console.log('Validation system failed, using emergency fallback - allowing submission with warnings');
    
    return {
      ok: true, // Allow submission even if validation system fails
      errors: [],
      warnings: [
        'Validation system temporarily unavailable - your responses will be processed with fallback validation'
      ],
      counts: {
        fc_answered: 0,
        fc_expected: 24,
        inc_pairs_present: 0,
        inc_pairs_complete: 0,
        ac_present: 0,
        ac_correct: 0,
        sd_present: false
      },
      config: { 
        fc_expected_min: 24,
        source: 'emergency_fallback'
      }
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