import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { analyzeAssessmentStructure, ValidationResult, AssessmentStructuralCheck } from '@/utils/assessmentValidation';
import { Question } from '@/data/assessmentQuestions';

interface AssessmentStructuralValidationProps {
  questions: Question[];
  validationResult?: ValidationResult;
  showDetails?: boolean;
}

export function AssessmentStructuralValidation({ 
  questions, 
  validationResult, 
  showDetails = false 
}: AssessmentStructuralValidationProps) {
  const structure = analyzeAssessmentStructure(questions);

  const ValidationIcon = ({ isValid, hasWarning }: { isValid: boolean; hasWarning?: boolean }) => {
    if (isValid && !hasWarning) return <CheckCircle className="h-5 w-5 text-success" />;
    if (isValid && hasWarning) return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ValidationIcon 
            isValid={validationResult?.isValid ?? true} 
            hasWarning={validationResult?.warnings?.length > 0}
          />
          PRISM Assessment Structural Integrity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forced Choice Questions */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Forced Choice Questions</span>
          <div className="flex items-center gap-2">
            <Badge variant={structure.forcedChoiceCount >= 24 ? "default" : "destructive"}>
              {structure.forcedChoiceCount}/24
            </Badge>
            <ValidationIcon 
              isValid={structure.forcedChoiceCount >= 24}
            />
          </div>
        </div>

        {/* Inconsistency Pairs */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Inconsistency Pairs</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {Object.keys(structure.inconsistencyPairs).length} pairs
            </Badge>
            <ValidationIcon 
              isValid={Object.values(structure.inconsistencyPairs).every(
                pair => pair.hasA && pair.hasB
              )}
            />
          </div>
        </div>

        {/* Social Desirability Questions */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Social Desirability</span>
          <div className="flex items-center gap-2">
            <Badge variant={structure.socialDesirabilityCount > 0 ? "default" : "secondary"}>
              {structure.socialDesirabilityCount}
            </Badge>
            <ValidationIcon 
              isValid={true}
              hasWarning={structure.socialDesirabilityCount === 0}
            />
          </div>
        </div>

        {/* Attention Check Questions */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Attention Checks</span>
          <div className="flex items-center gap-2">
            <Badge variant={structure.attentionCheckCount > 0 ? "default" : "destructive"}>
              {structure.attentionCheckCount}
            </Badge>
            <ValidationIcon 
              isValid={structure.attentionCheckCount > 0}
            />
          </div>
        </div>

        {/* Required Components */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Required Components</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ValidationIcon isValid={structure.requiredComponents.hasCoreVNLikert} />
              <span>Core PRISM Functions</span>
            </div>
            <div className="flex items-center gap-2">
              <ValidationIcon isValid={structure.requiredComponents.hasNeuroticismLikert} />
              <span>Neuroticism Index</span>
            </div>
            <div className="flex items-center gap-2">
              <ValidationIcon isValid={structure.requiredComponents.hasForcedChoice} />
              <span>Forced Choice Items</span>
            </div>
            <div className="flex items-center gap-2">
              <ValidationIcon isValid={structure.requiredComponents.hasValidityControl} />
              <span>Validity Controls</span>
            </div>
          </div>
        </div>

        {/* Validation Details */}
        {showDetails && validationResult && (
          <div className="space-y-2 border-t pt-4">
            {validationResult.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-destructive mb-1">Errors (Block Submission)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {validationResult.errors.map((error, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-warning mb-1">Warnings (Allow Submission)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {validationResult.warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}