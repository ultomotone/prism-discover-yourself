import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AssessmentForm, AssessmentResponse } from '@/components/assessment/AssessmentForm';
import { SavedAssessments } from '@/components/assessment/SavedAssessments';
import { supabase } from '@/lib/supabase/client';
import { TOTAL_PRISM_QUESTIONS } from '@/services/prismConfig';

const Assessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resume = searchParams.get('resume');
  const start = searchParams.get('start');
  // show form whenever ?start is present (any truthy) or ?resume=:id exists
  const showForm = Boolean(resume || start !== null);

  const handleComplete = async (_responses: AssessmentResponse[], sessionId: string) => {
    try {
      await supabase.functions
        .invoke('score_prism', { body: { sessionId } })
        .catch(() => {});
      navigate(`/results/${sessionId}`, { replace: true });
    } catch (e) {
      console.error('post-completion redirect failed', e);
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
        navigate(`/results/${resume}`, { replace: true });
      }
    };

    verifyCompletion();
  }, [resume, navigate]);

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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-8">
        <div className="prism-container">
          <SavedAssessments onStartNew={() => navigate('/assessment?start=true')} />
        </div>
      </div>
    </div>
  );
};

export default Assessment;
