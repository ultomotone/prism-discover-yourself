import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AssessmentForm, AssessmentResponse } from '@/components/assessment/AssessmentForm';
import { SavedAssessments } from '@/components/assessment/SavedAssessments';
import { AssessmentComplete } from '@/components/assessment/AssessmentComplete';
import { supabase } from '@/lib/supabase/client';
import { TOTAL_PRISM_QUESTIONS } from '@/services/prismConfig';

const Assessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [completedAssessment, setCompletedAssessment] = useState<{
    responses: AssessmentResponse[];
    sessionId: string;
  } | null>(null);

  const resume = searchParams.get('resume');
  const start = searchParams.get('start');
  // show form whenever ?start is present (any truthy) or ?resume=:id exists
  const showForm = Boolean(resume || start !== null);

  const handleComplete = (responses: AssessmentResponse[], sessionId: string) => {
    console.log('Assessment completed, showing completion screen');
    setCompletedAssessment({ responses, sessionId });
  };

  useEffect(() => {
    if (!resume) return;

    const verifyCompletion = async () => {
      const { count } = await supabase
        .from('assessment_responses')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', resume);

      if ((count ?? 0) >= TOTAL_PRISM_QUESTIONS) {
        navigate(`/results/${resume}`);
      }
    };

    verifyCompletion();
  }, [resume, navigate]);

  // Show completion screen after assessment is finished
  if (completedAssessment) {
    return (
      <div className="min-h-screen bg-background">
        <AssessmentComplete
          responses={completedAssessment.responses}
          sessionId={completedAssessment.sessionId}
          onReturnHome={() => navigate('/')}
          onTakeAgain={() => {
            setCompletedAssessment(null);
            navigate('/assessment?start=true');
          }}
        />
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
