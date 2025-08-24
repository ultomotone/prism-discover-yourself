import { supabase } from "@/integrations/supabase/client";
import { getPrismConfig, PrismConfig } from "@/services/prismConfig";
import { visibleIf } from "@/lib/visibility";
import { getAssessmentLibrary, analyzeLibrary, groupBySection } from "@/lib/questions/getAssessmentLibrary";
import { Question } from "@/data/assessmentQuestions";

export interface ValidationPayload {
  ok: boolean;
  errors: string[];
  warnings: string[];
  defer_scoring?: boolean;
  validation_status?: 'complete' | 'incomplete_library' | 'failed';
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
    strict_mode?: boolean;
    [key: string]: any;
  };
}

export interface AssessmentResponse {
  questionId: number;
  answer: string | number | string[] | number[];
}

/**
 * Validates PRISM assessment with strict/relaxed gate modes
 * Uses reliable library hydration and allows submission when library incomplete
 */
export async function validatePrismAssessment(
  responses: AssessmentResponse[], 
  library?: Question[]
): Promise<ValidationPayload> {
  console.log('🚀 validatePrismAssessment called with', responses.length, 'responses');
  
  try {
    // Load config with fallback (never fails)
    const config = await getPrismConfig();
    console.log('🚀 Config loaded:', config);
    
    // Load library from reliable single source
    let questions: Question[] = [];
    if (library) {
      questions = library;
      console.log('🚀 Using provided library:', questions.length, 'questions');
    } else {
      console.log('🚀 Fetching library from reliable hydration...');
      questions = await getAssessmentLibrary();
      console.log('🚀 Reliable library loaded:', questions.length, 'questions');
    }

    // Analyze library structure
    const libraryAnalysis = analyzeLibrary(questions);
    console.log('📊 Library analysis:', libraryAnalysis);

    // Check for library completeness
    const bySection = groupBySection(questions);
    const requiredSections = ['Work Style', 'Validity', 'Core', 'Neuro'];
    const missingSections = requiredSections.filter(section => {
      const sectionKeys = Object.keys(bySection).filter(key => 
        key.toLowerCase().includes(section.toLowerCase())
      );
      return sectionKeys.length === 0 || 
             sectionKeys.every(key => (bySection[key]?.length ?? 0) === 0);
    });

    const libraryMissing = questions.length < 50 || 
                          missingSections.length >= 2 ||
                          libraryAnalysis.isOnlyDemographics;

    console.log('🔍 Library assessment:');
    console.log('- Missing sections:', missingSections);  
    console.log('- Library insufficient:', libraryMissing);
    console.log('- Strict mode:', config.gate_strict_mode);

    // Apply relaxed gate logic for incomplete libraries
    if (libraryMissing && config.gate_strict_mode === false) {
      console.log('🟨 Relaxed gate: Allowing submission with incomplete library');
      return {
        ok: true,
        errors: [],
        warnings: [`Library missing sections: ${missingSections.join(', ')}`],
        defer_scoring: true,
        validation_status: 'incomplete_library',
        counts: {
          fc_answered: 0,
          fc_expected: config.fc_expected_min,
          inc_pairs_present: 0,
          inc_pairs_complete: 0,
          ac_present: 0,
          ac_correct: 0,
          sd_present: false
        },
        config: {
          fc_expected_min: config.fc_expected_min,
          source: config.source,
          strict_mode: config.gate_strict_mode
        }
      };
    }

    // Standard validation with visible questions
    const visibleQuestions = questions.filter(q => visibleIf(q));
    
    console.log('=== VALIDATION DEBUG ===');
    console.log('Total library questions:', questions.length);
    console.log('Visible questions after filter:', visibleQuestions.length);
    console.log('User responses count:', responses.length);

    const errors: string[] = [];
    const warnings: string[] = [];
    const responseMap = new Map(responses.map(r => [r.questionId, r.answer]));
    
    // FC validation
    const fcQuestions = visibleQuestions.filter(q => 
      q.type?.startsWith('forced-choice-') && 
      q.section?.toLowerCase().includes('work')
    );
    const fcAnswered = fcQuestions.filter(q => responseMap.has(q.id)).length;
    const fcExpectedMin = config.fc_expected_min;
    
    console.log('=== FC VALIDATION DEBUG ===');
    console.log('FC questions found:', fcQuestions.length);
    console.log('FC answered:', fcAnswered, '/', fcExpectedMin);
    
    if (fcQuestions.length === 0) {
      if (config.gate_strict_mode !== false) {
        errors.push('Library issue: Forced-choice items missing (contact support)');
      } else {
        warnings.push('Forced-choice items not available - will score after sync');
      }
    } else if (fcAnswered < fcExpectedMin) {
      errors.push(`Answer at least ${fcExpectedMin} forced-choice blocks (${fcAnswered}/${fcExpectedMin})`);
    }

    // Other validation sections...
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

    const acQuestions = visibleQuestions.filter(q => 
      q.tag?.startsWith('AC_') && q.section?.toLowerCase().includes('validity')
    );

    const sdQuestions = visibleQuestions.filter(q => 
      q.tag === 'SD' || q.social_desirability === true ||
      q.section?.toLowerCase().includes('validity') && q.tag?.includes('SD')
    );

    // Library integrity with strict/non-strict logic
    if (sdQuestions.length === 0) {
      if (config.gate_strict_mode !== false) {
        errors.push('Library issue: SD items missing (contact support)');
      } else {
        warnings.push('Social Desirability items not available - will score after sync');
      }
    }

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
        ac_correct: acQuestions.length,
        sd_present: sdQuestions.length > 0
      },
      config: {
        fc_expected_min: fcExpectedMin,
        source: config.source,
        strict_mode: config.gate_strict_mode
      }
    };

  } catch (error) {
    console.error('Validation error:', error);
    return {
      ok: true, // Allow submission with emergency fallback
      errors: [],
      warnings: ['Validation system temporarily unavailable'],
      counts: {
        fc_answered: 0,
        fc_expected: 24,
        inc_pairs_present: 0,
        inc_pairs_complete: 0,
        ac_present: 0,
        ac_correct: 0,
        sd_present: false
      },
      config: { fc_expected_min: 24, source: 'emergency_fallback' }
    };
  }
}

export async function logValidationEvent(
  sessionId: string,
  payload: ValidationPayload,
  action: 'pre_submit' | 'block_submit' | 'allow_submit'
): Promise<void> {
  try {
    console.log('Validation Event:', {
      session_id: sessionId,
      event_type: action,
      validation_payload: payload,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to log validation event:', error);
  }
}
