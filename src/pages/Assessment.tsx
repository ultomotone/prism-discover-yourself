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
      
      // Check for incomplete sessions with progress (email OR progress-based)
      const { data: sessions, error } = await supabase
        .from('assessment_sessions')
        .select('id, completed_questions, total_questions, created_at, email, user_id')
        .is('completed_at', null)
        .gt('completed_questions', 0)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('FILTERED incomplete sessions with email and progress:', sessions);
      console.log('Query error:', error);
      console.log('Sessions found:', sessions?.length || 0);

      if (!error && sessions && sessions.length > 0) {
        console.log('✅ Found', sessions.length, 'saved sessions, showing saved state');
        setCurrentState('saved');
      } else {
        // Local fallback: auto-resume last session if present
        try {
          const cachedRaw = localStorage.getItem('prism_last_session');
          const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
          console.log('🗄️ Local cached session:', cached);
          if (cached?.id && (cached?.completed_questions ?? 0) > 0) {
            console.log('🗄️ Auto-resuming local cached session:', cached.id);
            setResumeSessionId(cached.id);
            setCurrentState('form');
            return;
          }
        } catch (e) {
          console.warn('Failed to read local session cache', e);
        }
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
    // Check if there's a saved session with progress before starting new
    try {
      const cached = JSON.parse(localStorage.getItem('prism_last_session') || '{}');
      if (cached?.id && (cached?.completed_questions ?? 0) > 0) {
        console.log('🚫 Preventing new assessment - resuming existing session:', cached.id);
        setResumeSessionId(cached.id);
        setCurrentState('form');
        return;
      }
    } catch (e) {
      console.warn('Error checking cached session on start', e);
    }
    
    setResumeSessionId(undefined);
    setCurrentState('form');
  };

  const handleAssessmentComplete = (assessmentResponses: AssessmentResponse[], sessionId: string) => {
    console.log('🟢 handleAssessmentComplete called with:');
    console.log('🟢 Responses count:', assessmentResponses?.length || 0);
    console.log('🟢 Session ID:', sessionId);
    console.log('🟢 Current state before change:', currentState);
    
    if (!sessionId) {
      console.error('🔴 ERROR: No sessionId provided to handleAssessmentComplete');
      return;
    }
    
    if (!assessmentResponses || assessmentResponses.length === 0) {
      console.error('🔴 ERROR: No responses provided to handleAssessmentComplete');
      return;
    }
    
    // Set all state at once to avoid race conditions
    setTimeout(() => {
      setResponses(assessmentResponses);
      setSessionId(sessionId);
      setCurrentState('complete');
      console.log('🟢 State changed to complete with sessionId:', sessionId);
    }, 0);
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
      {(() => {
        console.log('🎯 ASSESSMENT PAGE STATE:', currentState);
        return null;
      })()}
      {currentState !== 'form' && <Header />}
      
      {currentState === 'saved' && (
        <div className="pt-24 pb-8">
          {(() => {
            console.log('🟦 SHOWING SAVED ASSESSMENTS VIEW');
            return null;
          })()}
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
          {(() => {
            console.log('🟥 SHOWING INTRO VIEW');
            return null;
          })()}
          <AssessmentIntro onStart={handleStartAssessment} />
        </div>
      )}
      
      {currentState === 'form' && (
        <AssessmentForm 
          onComplete={handleAssessmentComplete}
          onBack={handleReturnToIntro}
          onSaveAndExit={handleSaveAndExit}
          resumeSessionId={resumeSessionId}
        />
      )}
      
      {currentState === 'complete' && sessionId && responses.length > 0 ? (
        <AssessmentComplete 
          responses={responses}
          sessionId={sessionId}
          onReturnHome={handleReturnHome}
          onTakeAgain={handleTakeAgain}
        />
      ) : currentState === 'complete' ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p>Loading assessment results...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Session ID: {sessionId || 'Missing'} | Responses: {responses.length}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Assessment;