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
      console.log('=== CHECKING FOR SAVED ASSESSMENTS ===');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id || 'anonymous');
      
      // First, let's see ALL email-based sessions to debug
      const { data: allEmailSessions, error: allError } = await supabase
        .from('assessment_sessions')
        .select('id, completed_questions, total_questions, created_at, completed_at, email, user_id')
        .not('email', 'is', null);
        
      console.log('ALL email-based sessions in database:', allEmailSessions);
      console.log('All email sessions error:', allError);
      
      // Now check for incomplete sessions with progress
      const { data: sessions, error } = await supabase
        .from('assessment_sessions')
        .select('id, completed_questions, total_questions, created_at, email, user_id')
        .is('completed_at', null)
        .gt('completed_questions', 0)
        .not('email', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('FILTERED incomplete sessions with email and progress:', sessions);
      console.log('Query error:', error);
      console.log('Sessions found:', sessions?.length || 0);

      if (!error && sessions && sessions.length > 0) {
        console.log('✅ Found', sessions.length, 'saved sessions, showing saved state');
        setCurrentState('saved');
      } else {
        console.log('❌ No saved sessions found, showing intro');
        console.log('Error:', !!error);
        console.log('Sessions null:', !sessions);
        console.log('Sessions empty:', sessions?.length === 0);
        setCurrentState('intro');
      }
      console.log('=== END CHECKING SAVED ASSESSMENTS ===');
    } catch (error) {
      console.error('❌ Error checking for saved assessments:', error);
      setCurrentState('intro');
    }
  };

  const handleStartAssessment = () => {
    console.log('🟢 handleStartAssessment called');
    setResumeSessionId(undefined);
    console.log('🟢 Setting state to form');
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
        <div>
          <div style={{background: 'red', color: 'white', padding: '10px', position: 'fixed', top: 0, left: 0, zIndex: 9999}}>
            DEBUG: Showing intro state
          </div>
          <AssessmentIntro onStart={handleStartAssessment} />
        </div>
      )}
      
      {currentState === 'form' && (
        <div>
          <div style={{background: 'green', color: 'white', padding: '10px', position: 'fixed', top: 0, left: 0, zIndex: 9999}}>
            DEBUG: Showing form state
          </div>
          <AssessmentForm 
            onComplete={handleAssessmentComplete}
            onBack={handleReturnToIntro}
            onSaveAndExit={handleSaveAndExit}
            resumeSessionId={resumeSessionId}
          />
        </div>
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