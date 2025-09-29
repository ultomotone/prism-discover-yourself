import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackLead } from '@/lib/analytics';
import { ensureSessionLinked } from '@/services/sessionLinking';
import { IS_PREVIEW } from '@/lib/env';
import {
  checkRetakeAllowance,
  RetakeAllowanceError,
  type RetakeAllowanceResult,
} from '@/services/retake';

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
  attempt_no?: number;
}

export interface RetakeBlock {
  nextEligibleDate: string | null;
  attemptNo?: number;
  maxPerWindow: number;
  windowDays: number;
}

export type StartAssessmentSessionResult =
  | { status: 'blocked'; block: RetakeBlock }
  | { status: 'existing' | 'new'; session: SessionData };

const RETAKE_WINDOW = { maxPerWindow: 1, windowDays: 30 } as const;

function readCachedEmail(): string | undefined {
  if (typeof window === 'undefined' || !window.localStorage) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem('prism_last_session');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { email?: unknown };
    if (typeof parsed.email === 'string' && parsed.email.includes('@')) {
      return parsed.email;
    }
  } catch (error) {
    console.warn('Failed to read cached session email', error);
  }

  return undefined;
}

export function useEmailSessionManager() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startAssessmentSession = useCallback(async (
    email?: string, 
    userId?: string, 
    forceNew = false
  ): Promise<StartAssessmentSessionResult | null> => {
    console.log('=== START ASSESSMENT SESSION CALLED ===');
    console.log('Parameters:', { email, userId, forceNew });

    setIsLoading(true);
    try {
      console.log('Starting assessment session:', { email, userId, forceNew });
      
      let allowance: RetakeAllowanceResult | null = null;
      try {
        allowance = await checkRetakeAllowance({
          userId,
          email: email ?? readCachedEmail(),
          maxPerWindow: RETAKE_WINDOW.maxPerWindow,
          windowDays: RETAKE_WINDOW.windowDays,
        });
      } catch (error) {
        if (error instanceof RetakeAllowanceError) {
          console.error('Retake allowance check failed:', error.message);
        } else {
          console.error('Unexpected allowance failure:', error);
        }
        toast({
          title: 'Session Error',
          description: 'Unable to verify retake allowance. Please try again.',
          variant: 'destructive',
        });
        return null;
      }

      if (!allowance?.allowed) {
        return {
          status: 'blocked',
          block: {
            nextEligibleDate: allowance?.nextEligibleDate ?? null,
            attemptNo: allowance?.attemptNo,
            maxPerWindow: RETAKE_WINDOW.maxPerWindow,
            windowDays: RETAKE_WINDOW.windowDays,
          },
        } satisfies StartAssessmentSessionResult;
      }

      console.log('Calling start_assessment edge function...');
      const { data, error } = await supabase.functions.invoke('start_assessment', {
        body: {
          email: email,
          user_id: userId,
          force_new: forceNew
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Error starting assessment session:', error);
        toast({
          title: "Session Error", 
          description: "Failed to start assessment session. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const payload = data as {
        success?: boolean;
        session_id?: string;
        share_token?: string;
        existing_session?: boolean;
        recent_completion?: any;
      } | null;

      if (!payload || !payload.success) {
        console.error('Assessment session failed:', payload);
        toast({
          title: "Session Error",
          description: "Failed to start assessment session.",
          variant: "destructive", 
        });
        return null;
      }

      const session: SessionData = {
        session_id: payload.session_id!,
        share_token: payload.share_token,
        existing_session: payload.existing_session || false,
        attempt_no: allowance.attemptNo,
        recent_completion: payload.recent_completion,
      };

      console.log('Assessment session started successfully:', session);

      // Show appropriate message based on session type 
        toast({
          title: "Assessment Started",
          description: "You can take one assessment every 30 days. Your progress will be saved.",
        });
      
      if (email) {
        trackLead(email);
      }

      return {
        status: 'new',
        session,
      } satisfies StartAssessmentSessionResult;
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

      if (IS_PREVIEW) {
        toast({
          title: "Preview Mode",
          description: "Session linking is disabled in preview environments.",
        });
        return true;
      }

      const linked = await ensureSessionLinked({
        sessionId,
        userId,
        email,
      });

      if (!linked) {
        console.error('Error linking session to account');
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