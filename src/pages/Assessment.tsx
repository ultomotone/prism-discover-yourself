import React, { useState } from 'react';
import Header from "@/components/Header";
import { AssessmentIntro } from "@/components/assessment/AssessmentIntro";
import { AssessmentForm, AssessmentResponse } from "@/components/assessment/AssessmentForm";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";
import { EmailSaveRetrieve } from "@/components/assessment/EmailSaveRetrieve";

type AssessmentState = 'email-entry' | 'intro' | 'form' | 'complete';

const Assessment = () => {
  const [currentState, setCurrentState] = useState<AssessmentState>('email-entry');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [resumeSessionId, setResumeSessionId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string>('');

  const handleEmailResumeFound = (sessionId: string, email: string) => {
    console.log('Resume found for email:', email, 'session:', sessionId);
    setResumeSessionId(sessionId);
    setUserEmail(email);
    setCurrentState('form');
  };

  const handleStartNew = () => {
    console.log('Starting new assessment');
    setResumeSessionId(undefined);
    setUserEmail(''); // Will be set when user wants to save
    setCurrentState('intro');
  };

  const handleStartAssessment = () => {
    setResumeSessionId(undefined);
    setCurrentState('form');
  };

  const handleAssessmentComplete = (assessmentResponses: AssessmentResponse[], sessionId: string) => {
    setResponses(assessmentResponses);
    setSessionId(sessionId);
    setCurrentState('complete');
  };

  const handleReturnToIntro = () => {
    setCurrentState('intro');
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleTakeAgain = () => {
    setCurrentState('email-entry');
    setResponses([]);
    setSessionId('');
    setUserEmail('');
  };

  const handleSaveAndExit = (email?: string) => {
    if (email) {
      setUserEmail(email);
    }
    setCurrentState('email-entry');
    setResumeSessionId(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentState === 'email-entry' && (
        <EmailSaveRetrieve 
          onResumeFound={handleEmailResumeFound}
          onStartNew={handleStartNew}
        />
      )}

      {currentState === 'intro' && (
        <>
          <Header />
          <AssessmentIntro onStart={handleStartAssessment} />
        </>
      )}
      
      {currentState === 'form' && (
        <AssessmentForm 
          onComplete={handleAssessmentComplete}
          onBack={handleReturnToIntro}
          onSaveAndExit={handleSaveAndExit}
          resumeSessionId={resumeSessionId}
          userEmail={userEmail}
        />
      )}
      
      {currentState === 'complete' && (
        <>
          <Header />
          <div className="pt-24">
            <AssessmentComplete 
              responses={responses}
              sessionId={sessionId}
              onReturnHome={handleReturnHome}
              onTakeAgain={handleTakeAgain}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Assessment;