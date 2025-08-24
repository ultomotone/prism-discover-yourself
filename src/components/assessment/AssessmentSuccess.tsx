import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { ValidationPayload } from "@/utils/prismValidation";

interface AssessmentSuccessProps {
  validation: ValidationPayload;
  sessionId: string;
  onViewResults?: () => void;
  onReturnHome?: () => void;
}

export function AssessmentSuccess({ 
  validation, 
  sessionId, 
  onViewResults, 
  onReturnHome 
}: AssessmentSuccessProps) {
  const isDeferred = validation.defer_scoring === true;
  const isComplete = validation.validation_status === 'complete';
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isDeferred ? (
            <Clock className="h-16 w-16 text-blue-500" />
          ) : isComplete ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          )}
        </div>
        
        <CardTitle className="text-2xl">
          {isDeferred 
            ? "Assessment Submitted Successfully" 
            : "Assessment Complete!"
          }
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          {isDeferred ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Your responses have been saved successfully. Your PRISM profile will be generated once the assessment library is fully synchronized.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong> You'll receive your detailed PRISM results via email once scoring is complete. This typically takes 1-2 business days.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Thank you for completing the PRISM assessment! Your personality profile has been generated based on your responses.
              </p>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Your results are ready to view. You'll also receive a copy via email.
                </p>
              </div>
            </div>
          )}
        </div>

        {validation.warnings.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Notes:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              {validation.warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isDeferred && onViewResults && (
            <Button 
              onClick={onViewResults}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              View My Results
            </Button>
          )}
          
          {onReturnHome && (
            <Button 
              variant="outline" 
              onClick={onReturnHome}
              className="flex items-center gap-2"
            >
              Return to Home
            </Button>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Session ID: {sessionId.slice(0, 8)}...
          {isDeferred && (
            <div className="mt-2">
              Status: {validation.validation_status || 'processing'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}