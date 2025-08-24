import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from "@/components/Header";
import { AssessmentIntro } from "@/components/assessment/AssessmentIntro";
import { AssessmentForm, AssessmentResponse } from "@/components/assessment/AssessmentForm";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";
import { SavedAssessments } from "@/components/assessment/SavedAssessments";
import { supabase } from "@/integrations/supabase/client";

type AssessmentState = 'intro' | 'form' | 'complete' | 'saved';

const Assessment = () => {
  const [searchParams] = useSearchParams();
  const [currentState, setCurrentState] = useState<AssessmentState>('intro');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [resumeSessionId, setResumeSessionId] = useState<string | undefined>();

  // Check for URL resume parameter and saved assessments on load
  useEffect(() => {
    const resumeParam = searchParams.get('resume');
    if (resumeParam) {
      console.log('🔗 URL resume parameter found:', resumeParam);
      setResumeSessionId(resumeParam);
      setCurrentState('form');
    } else {
      checkForSavedAssessments();
    }
  }, [searchParams]);

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
    
    // Set state synchronously to avoid race conditions
    setResponses(assessmentResponses);
    setSessionId(sessionId);
    setCurrentState('complete');
    console.log('🟢 State changed to complete with sessionId:', sessionId);
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

  // Temporary maintenance mode - set to false to re-enable
  const MAINTENANCE_MODE = true;
  const isAdmin = window.location.search.includes('admin_bypass=true');

  if (MAINTENANCE_MODE && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-8">
          <div className="prism-container">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-card rounded-lg border p-8">
                <h1 className="text-2xl font-bold mb-4">Assessment Temporarily Unavailable</h1>
                <p className="text-muted-foreground mb-6">
                  We're currently performing maintenance on the assessment system. 
                  Please check back shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Admin: Add <code>?admin_bypass=true</code> to the URL to bypass this message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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