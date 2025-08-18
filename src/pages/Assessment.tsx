import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { AssessmentIntro } from "@/components/assessment/AssessmentIntro";
import { AssessmentForm, AssessmentResponse } from "@/components/assessment/AssessmentForm";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";
import { SavedAssessments } from "@/components/assessment/SavedAssessments";
import { supabase } from "@/integrations/supabase/client";

type AssessmentState = 'intro' | 'form' | 'complete' | 'saved';

const Assessment = () => {
  const [currentState, setCurrentState] = useState<AssessmentState>('intro');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [resumeSessionId, setResumeSessionId] = useState<string | undefined>();

  // Check for saved assessments on load
  useEffect(() => {
    checkForSavedAssessments();
  }, []);

  const checkForSavedAssessments = async () => {
    try {
      console.log('Checking for saved assessments...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id || 'anonymous');
      
      // Check for both user-based and email-based saved sessions
      let query = supabase
        .from('assessment_sessions')
        .select('id, completed_questions, total_questions, created_at, email')
        .is('completed_at', null)
        .gt('completed_questions', 0)
        .limit(10);

      // If user is logged in, also check their user-based sessions
      if (user?.id) {
        query = query.or(`user_id.eq.${user.id},email.is.not.null`);
      } else {
        // For anonymous users, only check email-based sessions
        query = query.not('email', 'is', null);
      }

      const { data: sessions, error } = await query;

      console.log('Found sessions:', sessions);
      console.log('Query error:', error);

      if (!error && sessions && sessions.length > 0) {
        console.log('Found', sessions.length, 'saved sessions, showing saved state');
        setCurrentState('saved');
      } else {
        console.log('No saved sessions found, showing intro');
        setCurrentState('intro');
      }
    } catch (error) {
      console.error('Error checking for saved assessments:', error);
      setCurrentState('intro');
    }
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
    setCurrentState('intro');
    setResponses([]);
    setSessionId('');
  };

  const handleResumeAssessment = (savedSessionId: string) => {
    console.log('Resuming assessment with session ID:', savedSessionId);
    setResumeSessionId(savedSessionId);
    setCurrentState('form');
  };

  const handleSaveAndExit = () => {
    setCurrentState('intro');
    setResumeSessionId(undefined);
  };

  const handleStartNewAssessment = () => {
    setResumeSessionId(undefined);
    setCurrentState('intro');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentState !== 'form' && <Header />}
      
      {currentState === 'saved' && (
        <div className="pt-24 pb-8">
          <div className="prism-container">
            <SavedAssessments 
              onResumeAssessment={handleResumeAssessment}
              onStartNew={handleStartNewAssessment}
            />
          </div>
        </div>
      )}

      {currentState === 'intro' && (
        <AssessmentIntro onStart={handleStartAssessment} />
      )}
      
      {currentState === 'form' && (
        <AssessmentForm 
          onComplete={handleAssessmentComplete}
          onBack={handleReturnToIntro}
          onSaveAndExit={handleSaveAndExit}
          resumeSessionId={resumeSessionId}
        />
      )}
      
      {currentState === 'complete' && (
        <AssessmentComplete 
          responses={responses}
          sessionId={sessionId}
          onReturnHome={handleReturnHome}
          onTakeAgain={handleTakeAgain}
        />
      )}
    </div>
  );
};

export default Assessment;