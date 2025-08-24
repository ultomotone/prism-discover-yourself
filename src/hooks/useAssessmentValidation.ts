import { useState, useEffect } from 'react';
import { assessmentQuestions } from '@/data/assessmentQuestions';
import { 
  validateAssessmentStructure, 
  analyzeAssessmentStructure,
  ValidationResult,
  AssessmentStructuralCheck
} from '@/utils/assessmentValidation';
import { AssessmentResponse } from '@/components/assessment/AssessmentForm';

interface UseAssessmentValidationReturn {
  structure: AssessmentStructuralCheck;
  validationResult: ValidationResult | null;
  isStructurallyValid: boolean;
  validateResponses: (responses: AssessmentResponse[]) => ValidationResult;
}

/**
 * Hook for assessment structural validation and integrity checking
 */
export function useAssessmentValidation(): UseAssessmentValidationReturn {
  const [structure, setStructure] = useState<AssessmentStructuralCheck>();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Analyze assessment structure on mount
  useEffect(() => {
    const analysisResult = analyzeAssessmentStructure(assessmentQuestions);
    setStructure(analysisResult);
    
    // Initial validation without responses
    const initialValidation = validateAssessmentStructure(assessmentQuestions, []);
    setValidationResult(initialValidation);
  }, []);

  const validateResponses = (responses: AssessmentResponse[]): ValidationResult => {
    const validation = validateAssessmentStructure(assessmentQuestions, responses);
    setValidationResult(validation);
    return validation;
  };

  const isStructurallyValid = validationResult?.isValid ?? false;

  return {
    structure: structure!,
    validationResult,
    isStructurallyValid,
    validateResponses
  };
}