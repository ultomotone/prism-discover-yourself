import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { AssessmentIntro } from "@/components/assessment/AssessmentIntro";
import { AssessmentForm, AssessmentResponse } from "@/components/assessment/AssessmentForm";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";
import { SavedAssessments } from "@/components/assessment/SavedAssessments";
import { supabase } from "@/integrations/supabase/client";

type AssessmentState = 'intro' | 'form' | 'complete' | 'saved';

const Assessment = () => {
  console.log('Assessment component is mounting');
  const [currentState, setCurrentState] = useState<AssessmentState>('intro');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [resumeSessionId, setResumeSessionId] = useState<string | undefined>();
  
  console.log('Assessment component state:', { currentState, sessionId, resumeSessionId });

  // Check for saved assessments on load
  useEffect(() => {
    console.log('Assessment page mounted, checking for saved assessments...');
    checkForSavedAssessments();
  }, []);

  const checkForSavedAssessments = async () => {
    try {
      console.log('=== DEBUGGING SAVED SESSIONS ===');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user ID:', user?.id || 'anonymous');
      
      // First, let's check all sessions for this user to see what exists
      const { data: allSessions, error: allError } = await supabase
        .from('assessment_sessions')
        .select('id, completed_questions, total_questions, created_at, completed_at, user_id')
        .eq('user_id', user?.id || null);
        
      console.log('ALL sessions for user:', allSessions);
      console.log('All sessions error:', allError);
      
      // Now the filtered query
      const { data: sessions, error } = await supabase
        .from('assessment_sessions')
        .select('id, completed_questions, total_questions, created_at')
        .is('completed_at', null)
        .gt('completed_questions', 0)
        .eq('user_id', user?.id || null)
        .limit(10);

      console.log('FILTERED sessions (incomplete with progress):', sessions);
      console.log('Filtered query error:', error);
      console.log('Sessions length:', sessions?.length || 0);
      console.log('Sessions truthy check:', !!sessions);
      console.log('Overall condition check:', !error && sessions && sessions.length > 0);

      if (!error && sessions && sessions.length > 0) {
        console.log('✅ Found', sessions.length, 'saved sessions, setting state to saved');
        setCurrentState('saved');
      } else {
        console.log('❌ No saved sessions found, staying on intro. Reasons:');
        console.log('  - Error:', !!error);
        console.log('  - Sessions null/undefined:', !sessions);
        console.log('  - Sessions empty:', sessions?.length === 0);
      }
      console.log('=== END DEBUGGING ===');
    } catch (error) {
      console.error('Error checking for saved assessments:', error);
      // Continue to intro if there's an error
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
    
    // Here you could also trigger additional analytics or notifications
    console.log('Assessment completed with session ID:', sessionId, 'responses:', assessmentResponses);
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
    console.log('handleResumeAssessment called with session ID:', savedSessionId);
    console.log('Current state before resume:', currentState);
    setResumeSessionId(savedSessionId);
    console.log('Set resumeSessionId to:', savedSessionId);
    setCurrentState('form');
    console.log('Set currentState to form');
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