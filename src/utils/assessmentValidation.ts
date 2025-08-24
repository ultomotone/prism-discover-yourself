import { Question } from '@/data/assessmentQuestions';
import { AssessmentResponse } from '@/components/assessment/AssessmentForm';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AssessmentStructuralCheck {
  forcedChoiceCount: number;
  inconsistencyPairs: { [key: string]: { hasA: boolean; hasB: boolean } };
  socialDesirabilityCount: number;
  attentionCheckCount: number;
  requiredComponents: {
    hasCoreVNLikert: boolean;
    hasNeuroticismLikert: boolean;
    hasForcedChoice: boolean;
    hasValidityControl: boolean;
  };
}

// Configuration constants
export const VALIDATION_CONFIG = {
  FC_EXPECTED_MIN: 24,
  SD_EXPECTED_MIN: 1,
  AC_EXPECTED_MIN: 1,
  REQUIRED_SECTIONS: {
    CORE_PRISM: 'Core PRISM Functions',
    NEUROTICISM: 'Neuroticism Index', 
    FORCED_CHOICE: ['Situational Choices', 'Work Context & Style', 'Polarity Preferences'],
    VALIDITY: 'Validity & Quality Control'
  }
};

/**
 * Extract tag from question text (looks for patterns like (SD), (R), (AC_*), (INC_*_A/B))
 */
export function extractQuestionTag(question: Question): string | null {
  const tagMatch = question.text.match(/\(([^)]+)\)$/);
  return tagMatch ? tagMatch[1] : null;
}

/**
 * Extract pair group from tag (for inconsistency pairs like INC_1_A, INC_1_B)
 */
export function extractPairGroup(tag: string): string | null {
  const pairMatch = tag.match(/^INC_(\w+)_[AB]$/);
  return pairMatch ? `INC_${pairMatch[1]}` : null;
}

/**
 * Check if question is attention check (AC_*)
 */
export function isAttentionCheck(question: Question): boolean {
  const tag = extractQuestionTag(question);
  return tag ? tag.startsWith('AC_') : false;
}

/**
 * Check if question is social desirability (SD)
 */
export function isSocialDesirability(question: Question): boolean {
  const tag = extractQuestionTag(question);
  return tag === 'SD';
}

/**
 * Check if question is inconsistency pair (INC_*_A or INC_*_B)
 */
export function isInconsistencyPair(question: Question): boolean {
  const tag = extractQuestionTag(question);
  return tag ? /^INC_\w+_[AB]$/.test(tag) : false;
}

/**
 * Analyze assessment structural integrity
 */
export function analyzeAssessmentStructure(questions: Question[]): AssessmentStructuralCheck {
  const forcedChoiceTypes = ['forced-choice-2', 'forced-choice-4', 'forced-choice-5'];
  const forcedChoiceCount = questions.filter(q => forcedChoiceTypes.includes(q.type)).length;
  
  const inconsistencyPairs: { [key: string]: { hasA: boolean; hasB: boolean } } = {};
  let socialDesirabilityCount = 0;
  let attentionCheckCount = 0;
  
  // Analyze questions for validation components
  questions.forEach(question => {
    const tag = extractQuestionTag(question);
    if (!tag) return;
    
    // Check for inconsistency pairs
    if (isInconsistencyPair(question)) {
      const pairGroup = extractPairGroup(tag);
      if (pairGroup) {
        if (!inconsistencyPairs[pairGroup]) {
          inconsistencyPairs[pairGroup] = { hasA: false, hasB: false };
        }
        if (tag.endsWith('_A')) {
          inconsistencyPairs[pairGroup].hasA = true;
        } else if (tag.endsWith('_B')) {
          inconsistencyPairs[pairGroup].hasB = true;
        }
      }
    }
    
    // Count social desirability questions
    if (isSocialDesirability(question)) {
      socialDesirabilityCount++;
    }
    
    // Count attention check questions
    if (isAttentionCheck(question)) {
      attentionCheckCount++;
    }
  });
  
  // Check required components
  const hasCoreVNLikert = questions.some(q => 
    q.type === 'likert-1-5' && 
    (q.section.includes('Core PRISM Functions') || q.section.includes('PRISM'))
  );
  
  const hasNeuroticismLikert = questions.some(q => 
    q.type === 'likert-1-7' && 
    q.section.includes('Neuroticism')
  );
  
  const hasForcedChoice = forcedChoiceCount >= VALIDATION_CONFIG.FC_EXPECTED_MIN;
  
  const hasValidityControl = questions.some(q => 
    q.section.includes('Validity') || q.section.includes('Quality Control')
  );
  
  return {
    forcedChoiceCount,
    inconsistencyPairs,
    socialDesirabilityCount,
    attentionCheckCount,
    requiredComponents: {
      hasCoreVNLikert,
      hasNeuroticismLikert,
      hasForcedChoice,
      hasValidityControl
    }
  };
}

/**
 * Validate assessment structural integrity before submission
 */
export function validateAssessmentStructure(
  questions: Question[],
  responses: AssessmentResponse[]
): ValidationResult {
  const structure = analyzeAssessmentStructure(questions);
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Critical validation errors that block submission
  if (structure.forcedChoiceCount < VALIDATION_CONFIG.FC_EXPECTED_MIN) {
    errors.push(`Insufficient forced-choice questions: ${structure.forcedChoiceCount} found, ${VALIDATION_CONFIG.FC_EXPECTED_MIN} required`);
  }
  
  // Check for incomplete inconsistency pairs
  Object.entries(structure.inconsistencyPairs).forEach(([pairGroup, pair]) => {
    if (!pair.hasA || !pair.hasB) {
      errors.push(`Incomplete inconsistency pair: ${pairGroup} missing ${!pair.hasA ? 'A' : 'B'} item`);
    }
  });
  
  // Check attention check questions
  if (structure.attentionCheckCount === 0) {
    errors.push('No attention check questions found');
  } else {
    // Validate AC responses are correct (this would need specific validation logic)
    const acQuestions = questions.filter(isAttentionCheck);
    for (const acQuestion of acQuestions) {
      const response = responses.find(r => r.questionId === acQuestion.id);
      if (!response) {
        errors.push(`Attention check question ${acQuestion.id} not answered`);
      }
      // Add specific AC validation logic here based on question content
    }
  }
  
  // Warnings (don't block submission but log for quality monitoring)
  if (structure.socialDesirabilityCount === 0) {
    warnings.push('No social desirability questions found');
  }
  
  // Check required components
  if (!structure.requiredComponents.hasCoreVNLikert) {
    warnings.push('Missing Core PRISM Functions likert-1-5 questions');
  }
  
  if (!structure.requiredComponents.hasNeuroticismLikert) {
    warnings.push('Missing Neuroticism Index likert-1-7 questions');
  }
  
  if (!structure.requiredComponents.hasValidityControl) {
    warnings.push('Missing Validity & Quality Control section');
  }
  
  // Check for missing state questions (optional but tracked)
  const stateQuestions = questions.filter(q => q.type === 'state-1-7');
  if (stateQuestions.length === 0) {
    warnings.push('No state check questions (Stress, Sleep, Mood) found');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate individual question response integrity
 */
export function validateQuestionResponse(
  question: Question, 
  response: AssessmentResponse
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if required question has valid response
  if (question.required) {
    const hasResponse = Array.isArray(response.answer) 
      ? response.answer.length > 0 
      : response.answer !== '' && response.answer !== null && response.answer !== undefined;
      
    if (!hasResponse) {
      errors.push(`Required question ${question.id} has no response`);
    }
  }
  
  // Validate forced-choice responses
  if (question.type.startsWith('forced-choice')) {
    if (typeof response.answer !== 'string' || !response.answer.trim()) {
      errors.push(`Forced-choice question ${question.id} requires a single selection`);
    }
  }
  
  // Validate likert responses
  if (question.type === 'likert-1-5' || question.type === 'likert-1-7') {
    const numResponse = Number(response.answer);
    if (isNaN(numResponse)) {
      errors.push(`Likert question ${question.id} requires a numeric response`);
    } else {
      const maxValue = question.type === 'likert-1-5' ? 5 : 7;
      if (numResponse < 1 || numResponse > maxValue) {
        errors.push(`Likert question ${question.id} response out of range (1-${maxValue})`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}