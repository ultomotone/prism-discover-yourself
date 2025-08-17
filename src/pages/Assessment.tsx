import React, { useState } from 'react';
import Header from "@/components/Header";
import { AssessmentIntro } from "@/components/assessment/AssessmentIntro";
import { AssessmentForm, AssessmentResponse } from "@/components/assessment/AssessmentForm";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";

type AssessmentState = 'intro' | 'form' | 'complete';

const Assessment = () => {
  const [currentState, setCurrentState] = useState<AssessmentState>('intro');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);

  const handleStartAssessment = () => {
    setCurrentState('form');
  };

  const handleAssessmentComplete = (assessmentResponses: AssessmentResponse[]) => {
    setResponses(assessmentResponses);
    setCurrentState('complete');
    
    // Here you could save to Supabase or send to your backend
    console.log('Assessment completed with responses:', assessmentResponses);
  };

  const handleReturnToIntro = () => {
    setCurrentState('intro');
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleTakeAgain = () => {
    setCurrentState('intro');
    setResponses([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentState !== 'form' && <Header />}
      
      {currentState === 'intro' && (
        <AssessmentIntro onStart={handleStartAssessment} />
      )}
      
      {currentState === 'form' && (
        <AssessmentForm 
          onComplete={handleAssessmentComplete}
          onBack={handleReturnToIntro}
        />
      )}
      
      {currentState === 'complete' && (
        <AssessmentComplete 
          responses={responses}
          onReturnHome={handleReturnHome}
          onTakeAgain={handleTakeAgain}
        />
      )}
    </div>
  );
};

export default Assessment;