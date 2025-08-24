import React, { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { ValidationPayload } from '@/utils/prismValidation';

interface ErrorSummaryProps {
  validation: ValidationPayload;
  show: boolean;
  onDismiss?: () => void;
}

export function ErrorSummary({ validation, show, onDismiss }: ErrorSummaryProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && alertRef.current) {
      // Focus management for accessibility
      alertRef.current.focus();
      alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [show]);

  if (!show || (validation.errors.length === 0 && validation.warnings.length === 0)) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Critical Errors */}
      {validation.errors.length > 0 && (
        <Alert 
          variant="destructive" 
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="border-destructive"
        >
          <XCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Assessment Cannot Be Submitted
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-2 p-1 hover:bg-destructive/10 rounded"
                aria-label="Dismiss error summary"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-3">The following issues must be resolved before submission:</p>
            <ul className="list-disc pl-5 space-y-2" role="list">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            
            {/* Progress Summary */}
            <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
              <h4 className="font-medium mb-2">Current Progress:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  Forced-Choice: {validation.counts.fc_answered}/{validation.counts.fc_expected}
                </div>
                <div>
                  Inconsistency Pairs: {validation.counts.inc_pairs_complete}/{validation.counts.inc_pairs_present}
                </div>
                <div>
                  Attention Checks: {validation.counts.ac_correct}/{validation.counts.ac_present} correct
                </div>
                <div>
                  Social Desirability: {validation.counts.sd_present ? '✓' : '✗'} Present
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert variant="default" className="border-warning">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle>Optional Items Not Completed</AlertTitle>
          <AlertDescription>
            <p className="mb-2">You may submit the assessment, but consider completing these optional sections:</p>
            <ul className="list-disc pl-5 space-y-1" role="list">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}