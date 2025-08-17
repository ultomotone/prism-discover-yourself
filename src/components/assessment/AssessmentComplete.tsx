import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, RotateCcw } from "lucide-react";
import { AssessmentResponse } from "./AssessmentForm";

interface AssessmentCompleteProps {
  responses: AssessmentResponse[];
  sessionId: string;
  onReturnHome: () => void;
  onTakeAgain?: () => void;
}

export function AssessmentComplete({ responses, sessionId, onReturnHome, onTakeAgain }: AssessmentCompleteProps) {
  const handleDownloadResults = () => {
    // Create a comprehensive results object with session info
    const results = {
      sessionId,
      completedAt: new Date().toISOString(),
      totalQuestions: responses.length,
      responses: responses.map(r => ({
        questionId: r.questionId,
        answer: r.answer
      }))
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `prism-assessment-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-4">
              Assessment Complete!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for completing the PRISM assessment.
            </p>
          </div>

          {/* Results Summary */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Your Responses</h2>
              <p className="text-muted-foreground mb-6">
                You have successfully completed <strong>{responses.length}</strong> questions across multiple sections of the PRISM assessment. Your responses have been saved with session ID: <code className="bg-muted px-2 py-1 rounded text-sm">{sessionId}</code>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">{responses.length}</div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="text-2xl font-bold text-secondary">~30</div>
                  <div className="text-sm text-muted-foreground">Minutes Invested</div>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="text-2xl font-bold text-accent">100%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">What's Next?</h2>
              <div className="text-left space-y-4 max-w-md mx-auto">
                <div className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Your responses have been recorded and will be used to generate your PRISM profile.</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Results will be analyzed using the PRISM framework to determine your cognitive preferences.</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">For research purposes, consider retaking the assessment in 2-4 weeks for improved accuracy.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDownloadResults}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Responses
            </Button>
            
            {onTakeAgain && (
              <Button
                variant="outline"
                size="lg"
                onClick={onTakeAgain}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Take Again
              </Button>
            )}
            
            <Button
              variant="hero"
              size="lg"
              onClick={onReturnHome}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}