import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PostSurveyQuestion {
  item_code: string;
  item_text: string;
  response_type: string;
  position: number;
  reverse_scored: boolean;
  required: boolean;
}

export interface PostSurveyAnswer {
  item_code: string;
  value_numeric?: number;
  value_text?: string;
}

export function usePostSurvey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async (version: string = 'psv1.0'): Promise<PostSurveyQuestion[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('post-survey-questions', {
        body: {},
        method: 'GET',
      });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data.questions || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch questions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitSurvey = async (
    sessionId: string,
    answers: PostSurveyAnswer[],
    version: string = 'psv1.0'
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: submitError } = await supabase.functions.invoke('post-survey-submit', {
        body: {
          assessment_session_id: sessionId,
          version,
          answers,
        },
      });

      if (submitError) {
        throw new Error(submitError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit survey');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit survey';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const hasSeenSurvey = (sessionId: string): boolean => {
    return !!localStorage.getItem(`post_survey_shown_${sessionId}`);
  };

  const markSurveyShown = (sessionId: string): void => {
    localStorage.setItem(`post_survey_shown_${sessionId}`, Date.now().toString());
  };

  return {
    loading,
    error,
    fetchQuestions,
    submitSurvey,
    hasSeenSurvey,
    markSurveyShown,
  };
}
