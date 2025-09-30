import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { AssessmentForm, AssessmentResponse } from '@/components/assessment/AssessmentForm';
import { SavedAssessments } from '@/components/assessment/SavedAssessments';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { supabase } from '@/integrations/supabase/client';
import { trackAssessmentComplete, trackLead } from '@/lib/analytics';
import { TOTAL_PRISM_QUESTIONS } from '@/services/prismConfig';
import { useQueryClient } from '@tanstack/react-query';
import { resultsQueryKeys } from '@/features/results/queryKeys';

const Assessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Read from localStorage first, then fall back to URL params and state
  const getNavData = () => {
    try {
      const stored = localStorage.getItem('prism_nav_data');
      if (stored) {
        localStorage.removeItem('prism_nav_data'); // Clear after reading
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read nav data from localStorage:', e);
    }
    return null;
  };

  const navData = getNavData();
  const resume = navData?.resume || location.state?.resume || searchParams.get('resume');
  const start = navData?.start || location.state?.start || searchParams.get('start');
  const session = navData?.session || location.state?.session || searchParams.get('session');
  
  // show form whenever start is present (any truthy) or resume exists
  const showForm = Boolean(resume || start !== null);

  console.log('🎯 Assessment page render:', { 
    resume, 
    start, 
    session,
    showForm,
    fullURL: window.location.href,
    locationState: location.state,
    navData
  });

  const [finalizing, setFinalizing] = useState(false);

  // Finalize assessment and navigate to results with share token
  const handleComplete = async (
    responses: AssessmentResponse[],
    sessionId: string,
  ) => {
    setFinalizing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'finalizeAssessment',
        { body: { session_id: sessionId, responses } },
      );
      if (error) throw error;
      const payload = data as { ok?: boolean; results_url?: string } | null;
      if (!payload?.ok || !payload.results_url) {
        throw new Error('Finalize response missing results URL');
      }
      const target = new URL(payload.results_url);
      trackAssessmentComplete(sessionId, responses.length);
      trackLead(undefined, { source: 'assessment_complete' });
      queryClient.removeQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId) });
      navigate(`${target.pathname}${target.search}`, { replace: true });
    } catch (e) {
      console.error('post-completion redirect failed', e);
    } finally {
      setFinalizing(false);
    }
  };

  useEffect(() => {
    if (!resume) return;

    const verifyCompletion = async () => {
      const { count } = await supabase
        .from('assessment_responses')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', resume);

      if ((count ?? 0) >= TOTAL_PRISM_QUESTIONS) {
        try {
          const { data, error } = await supabase.functions.invoke(
            'finalizeAssessment',
            { body: { session_id: resume } },
          );
          if (error) throw error;
          const payload = data as { ok?: boolean; results_url?: string } | null;
          if (!payload?.ok || !payload.results_url) {
            throw new Error('Finalize response missing results URL');
          }
          const target = new URL(payload.results_url);
          navigate(`${target.pathname}${target.search}`, { replace: true });
        } catch (err) {
          console.error('resume finalize failed', err);
        }
      }
    };

    verifyCompletion();
  }, [resume, navigate]);

  if (finalizing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Scoring your PRISM profile…</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <AssessmentForm
          onComplete={handleComplete}
          onBack={() => navigate('/assessment')}
          onSaveAndExit={() => navigate('/assessment')}
          resumeSessionId={resume || undefined}
        />
      </div>
    );
  }

  return (
    <AssessmentIntro onStart={() => {
      localStorage.setItem('prism_nav_data', JSON.stringify({ start: true }));
      navigate('/assessment');
    }} />
  );
};

export default Assessment;
