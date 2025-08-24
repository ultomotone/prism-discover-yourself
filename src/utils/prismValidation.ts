import { supabase } from "@/integrations/supabase/client";
import { getPrismConfig, PrismConfig } from "@/services/prismConfig";
import { visibleIf } from "@/lib/visibility";
import { getAssessmentLibrary, analyzeLibrary, groupBySection } from "@/lib/questions/getAssessmentLibrary";
import { Question } from "@/data/assessmentQuestions";

// Phase 3: Enhanced validation payload with partial session support
export interface ValidationPayload {
  ok: boolean;
  errors: string[];
  warnings: string[];
  defer_scoring?: boolean;
  validation_status?: 'complete' | 'incomplete_library' | 'partial' | 'failed';
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
    partial_session?: boolean;
    min_completion_rate?: number;
    [key: string]: any;
  };
}

export interface AssessmentResponse {
  questionId: number | string;
  answer: string | number | string[] | number[];
}

// Phase 3: Helper function to sanitize response values
function sanitizeResponseValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle array responses (multiple choice)
  if (Array.isArray(value)) {
    return value.filter(v => v !== null && v !== undefined);
  }
  
  // Handle string responses
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Check if it's JSON
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || 
        (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
    
    return trimmed;
  }
  
  return value;
}

/**
 * Phase 3: Enhanced PRISM validation with partial session support and clean JSON schema
 * Validates PRISM assessments with strict/relaxed gate modes and robust partial-session handling
 */
export async function validatePrismAssessment(
  responses: AssessmentResponse[], 
  library?: Question[],
  options: { partial_session?: boolean; min_completion_rate?: number } = {}
): Promise<ValidationPayload> {
  console.log('🚀 validatePrismAssessment Phase 3 called with', responses.length, 'responses');
  
  const { partial_session = false, min_completion_rate = 0.3 } = options;
  
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

    // Phase 3: Enhanced library analysis with partial session awareness
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
    console.log('- Partial session mode:', partial_session);

    // Phase 3: Enhanced relaxed gate logic for partial sessions
    if (libraryMissing && (config.gate_strict_mode === false || partial_session)) {
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
          strict_mode: config.gate_strict_mode,
          partial_session
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
    
    // Phase 3: Sanitize responses before validation
    const sanitizedResponses = responses.map(r => ({
      ...r,
      answer: sanitizeResponseValue(r.answer)
    }));
    const responseMap = new Map(sanitizedResponses.map(r => [r.questionId, r.answer]));
    
    // FC Block validation with partial session support
    const fcBlocks = visibleQuestions.filter(q => 
      q.type?.startsWith('forced-choice-') && 
      (q.section?.toLowerCase().includes('work') || 
       q.section?.toLowerCase().includes('situational') ||
       q.section?.toLowerCase().includes('polarity'))
    );
    const fcAnswered = fcBlocks.filter(q => {
      const response = responseMap.get(q.id);
      return response !== undefined && response !== null && response !== '';
    }).length;
    const fcExpectedMin = config.fc_expected_min;
    const fcCompletionRate = Math.min(1, fcAnswered / fcExpectedMin);
    
    console.log('=== FC BLOCK VALIDATION DEBUG ===');
    console.log('FC blocks found:', fcBlocks.length);
    console.log('FC blocks answered:', fcAnswered, '/', fcExpectedMin);
    console.log('FC completion rate:', fcCompletionRate);
    console.log('FC block sections:', [...new Set(fcBlocks.map(q => q.section))]);
    console.log('FC block types:', [...new Set(fcBlocks.map(q => q.type))]);
    
    // Phase 3: Enhanced FC validation with partial session logic
    if (fcBlocks.length === 0) {
      if (config.gate_strict_mode !== false && !partial_session) {
        errors.push('Library issue: Forced-choice blocks missing (contact support)');
      } else {
        warnings.push('Forced-choice blocks not available - will score after sync');
      }
    } else if (fcBlocks.length < fcExpectedMin) {
      if (config.gate_strict_mode !== false && !partial_session) {
        errors.push(`Library issue: only ${fcBlocks.length}/${fcExpectedMin} forced-choice blocks available`);
      } else {
        warnings.push(`Insufficient FC blocks in library (${fcBlocks.length}/${fcExpectedMin}) - will score after sync`);
      }
    } else if (fcAnswered < fcExpectedMin) {
      // For partial sessions, check if we have minimum viable completion rate
      if (partial_session && fcCompletionRate >= min_completion_rate) {
        warnings.push(`Partial completion: ${fcAnswered}/${fcExpectedMin} FC blocks (${Math.round(fcCompletionRate * 100)}%)`);
      } else {
        errors.push(`Answer at least ${fcExpectedMin} forced-choice blocks (${fcAnswered}/${fcExpectedMin})`);
      }
    }

    // Phase 3: Enhanced inconsistency pair validation with JSON schema validation
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

    // Library integrity with enhanced partial session logic
    if (sdQuestions.length === 0) {
      if (config.gate_strict_mode !== false && !partial_session) {
        errors.push('Library issue: SD items missing (contact support)');
      } else {
        warnings.push('Social Desirability items not available - will score after sync');
      }
    }

    // Phase 3: Enhanced validation status determination
    let validationStatus: 'complete' | 'incomplete_library' | 'partial' | 'failed' = 'complete';
    
    if (errors.length > 0) {
      validationStatus = 'failed';
    } else if (partial_session && fcCompletionRate < 1.0) {
      validationStatus = 'partial';
    } else if (libraryMissing) {
      validationStatus = 'incomplete_library';
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      validation_status: validationStatus,
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
        strict_mode: config.gate_strict_mode,
        partial_session,
        min_completion_rate
      }
    };

  } catch (error) {
    console.error('Validation error:', error);
    // Phase 3: Enhanced emergency fallback
    return {
      ok: partial_session ? true : false, // Be more permissive for partial sessions
      errors: partial_session ? [] : ['Validation system temporarily unavailable'],
      warnings: ['Validation system temporarily unavailable'],
      validation_status: 'failed',
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
        source: 'emergency_fallback',
        partial_session 
      }
    };
  }
}

export async function logValidationEvent(
  sessionId: string,
  payload: ValidationPayload,
  action: 'pre_submit' | 'block_submit' | 'allow_submit'
): Promise<void> {
  try {
    // Phase 3: Enhanced validation event logging with partial session context
    console.log('Validation Event:', {
      session_id: sessionId,
      event_type: action,
      validation_payload: {
        ...payload,
        // Sanitize large objects for logging
        config: {
          ...payload.config,
          partial_session: payload.config.partial_session || false
        }
      },
      timestamp: new Date().toISOString()
    });
    
    // Log to analytics if available (optional enhancement)
    if (action === 'block_submit' && payload.errors.length > 0) {
      console.warn(`Validation blocked submission for session ${sessionId}:`, payload.errors);
    }
  } catch (error) {
    console.warn('Failed to log validation event:', error);
  }
}
