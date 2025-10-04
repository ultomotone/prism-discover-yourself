import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PostSurveyModal } from '@/components/assessment/PostSurveyModal';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SurveyPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shareToken = searchParams.get('t');
  
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId || !shareToken) {
        setError('Invalid survey link. Missing session ID or token.');
        setValidating(false);
        return;
      }

      try {
        // Verify the session exists and the share token is valid
        const { data, error: fetchError } = await supabase
          .from('assessment_sessions')
          .select('id, status, share_token')
          .eq('id', sessionId)
          .single();

        if (fetchError || !data) {
          setError('Session not found. The link may be invalid or expired.');
          setValidating(false);
          return;
        }

        if (data.share_token !== shareToken) {
          setError('Invalid access token. Please use the link from your email.');
          setValidating(false);
          return;
        }

        if (data.status !== 'completed') {
          setError('This assessment has not been completed yet.');
          setValidating(false);
          return;
        }

        // Check if survey already completed
        const { data: surveyData } = await supabase
          .from('post_survey_sessions')
          .select('completed_at')
          .eq('assessment_session_id', sessionId)
          .maybeSingle();

        if (surveyData?.completed_at) {
          setSurveyCompleted(true);
        }

        setIsValid(true);
        setValidating(false);
      } catch (err) {
        console.error('Validation error:', err);
        setError('Failed to validate session. Please try again.');
        setValidating(false);
      }
    };

    validateSession();
  }, [sessionId, shareToken]);

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Validating survey link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (surveyCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Survey Already Completed</h2>
            <p className="text-muted-foreground mb-6">
              Thank you! You've already submitted feedback for this assessment.
            </p>
            <Button 
              onClick={() => navigate(`/results/${sessionId}?t=${shareToken}`)} 
              className="w-full"
            >
              View Your Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || !sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">PRISM Assessment Feedback</h1>
            <p className="text-muted-foreground">
              Your input helps us improve the PRISM experience for everyone
            </p>
          </CardContent>
        </Card>
        
        <PostSurveyModal
          sessionId={sessionId}
          isOpen={true}
          onClose={() => {
            navigate(`/results/${sessionId}?t=${shareToken}`);
          }}
          onComplete={() => {
            setSurveyCompleted(true);
          }}
        />
      </div>
    </div>
  );
}
