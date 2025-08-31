import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SessionData {
  session_id: string;
  share_token?: string;
  existing_session: boolean;
  progress?: {
    completed: number;
    total: number;
  };
  recent_completion?: {
    has_recent_completion: boolean;
    days_since_completion: number;
  };
}

export function useEmailSessionManager() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startAssessmentSession = useCallback(async (
    email?: string, 
    userId?: string, 
    forceNew = false
  ): Promise<SessionData | null> => {
    setIsLoading(true);
    try {
      console.log('Starting assessment session:', { email, userId, forceNew });
      
      const { data, error } = await supabase.functions.invoke('start_assessment', {
        body: { 
          email, 
          user_id: userId, 
          force_new: forceNew 
        }
      });

      if (error) {
        console.error('Error starting assessment session:', error);
        toast({
          title: "Session Error",
          description: "Failed to start assessment session. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        console.error('Assessment session failed:', data);
        toast({
          title: "Session Error", 
          description: data.error || "Failed to start assessment session.",
          variant: "destructive",
        });
        return null;
      }

      console.log('Assessment session started successfully:', data);

      // Show appropriate message based on session type
      if (data.existing_session) {
        toast({
          title: "Resuming Assessment",
          description: `Continuing from question ${(data.progress?.completed || 0) + 1}`,
        });
      } else if (data.recent_completion?.has_recent_completion) {
        const days = Math.round(data.recent_completion.days_since_completion);
        toast({
          title: "Recent Assessment Detected",
          description: `You completed an assessment ${days} day${days !== 1 ? 's' : ''} ago. Starting fresh.`,
        });
      } else if (email) {
        toast({
          title: "Assessment Started",
          description: "Your progress will be automatically saved.",
        });
      }

      return data as SessionData;
    } catch (error) {
      console.error('Unexpected error starting assessment:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please refresh and try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const linkSessionToAccount = useCallback(async (
    sessionId: string,
    userId: string,
    email: string
  ): Promise<boolean> => {
    try {
      console.log('Linking session to account:', { sessionId, userId, email });
      
      const { error } = await supabase
        .from('assessment_sessions')
        .update({ 
          user_id: userId,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error linking session to account:', error);
        toast({
          title: "Link Error",
          description: "Failed to link session to your account.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Account Linked",
        description: "Your assessment progress is now saved to your account.",
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error linking session:', error);
      return false;
    }
  }, [toast]);

  return {
    startAssessmentSession,
    linkSessionToAccount,
    isLoading
  };
}