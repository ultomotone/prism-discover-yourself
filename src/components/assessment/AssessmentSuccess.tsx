import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ValidationPayload } from "@/utils/prismValidation";

interface AssessmentSuccessProps {
  validation?: ValidationPayload;
  onViewResults?: () => void;
  onReturnHome?: () => void;
}

export function AssessmentSuccess({ validation, onViewResults, onReturnHome }: AssessmentSuccessProps) {
  const isDeferredScoring = validation?.defer_scoring === true;
  const hasWarnings = validation?.warnings && validation.warnings.length > 0;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className={`${isDeferredScoring ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isDeferredScoring ? (
              <Clock className="h-16 w-16 text-amber-600" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
          </div>
          <CardTitle className={`text-2xl ${isDeferredScoring ? 'text-amber-800' : 'text-green-800'}`}>
            {isDeferredScoring ? 'Submission Received' : 'Assessment Complete!'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isDeferredScoring ? (
            <div className="text-center space-y-3">
              <p className="text-amber-700">
                Your assessment has been successfully submitted and saved.
              </p>
              <p className="text-amber-700 font-medium">
                Scoring will run automatically after the assessment library is synced.
              </p>
              <p className="text-sm text-amber-600">
                You'll receive your results via email once processing is complete.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-green-700">
                Thank you for completing the PRISM assessment!
              </p>
              <p className="text-green-700">
                Your personalized results are now ready.
              </p>
            </div>
          )}

          {hasWarnings && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Additional Information:</p>
                  <ul className="mt-1 text-blue-700 list-disc list-inside">
                    {validation?.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4 pt-4">
            {!isDeferredScoring && onViewResults && (
              <Button onClick={onViewResults} className="px-6">
                View Results
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={onReturnHome}
              className="px-6"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isDeferredScoring && (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>What happens next?</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Your responses are securely stored</li>
                <li>Assessment library will be synchronized</li>
                <li>Scoring will run automatically</li>
                <li>Results will be emailed when ready</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}