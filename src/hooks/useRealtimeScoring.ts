import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { trackAssessmentScored } from '@/lib/ga4-analytics';

export interface ScoringResult {
  id: string;
  session_id: string;
  user_id: string;
  type_code: string;
  confidence: string;
  fit_band: string;
  overlay: string | null;
  score_fit_calibrated: number;
  top_types: any[];
  dimensions: any;
  validity_status: string;
  results_version: string;
  computed_at: string;
  created_at: string;
  updated_at: string;
}

interface RecomputeResponse {
  ok: boolean;
  updatedCount: number;
  sessionId?: string;
  error?: string;
}

export const useRealtimeScoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scoringResults, setScoringResults] = useState<ScoringResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Fetch initial scoring results
  const fetchScoringResults = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scoring_results')
        .select('*')
        .eq('user_id', user.id)
        .order('computed_at', { ascending: false });

      if (error) {
        console.error('Error fetching scoring results:', error);
        toast({
          title: "Error",
          description: "Failed to fetch scoring results",
          variant: "destructive",
        });
        return;
      }

      setScoringResults((data as any[]) || []);
    } catch (error) {
      console.error('Error in fetchScoringResults:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up realtime subscription for scoring results');

    const channel = supabase
      .channel('scoring-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scoring_results',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Realtime scoring update received:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          setScoringResults(current => {
            switch (eventType) {
              case 'INSERT':
                // Add new result if it doesn't exist
                if (newRecord && !current.find(r => r.id === newRecord.id)) {
                  toast({
                    title: "New Results Available",
                    description: `Assessment results for ${newRecord.type_code} are ready!`,
                  });

                  // Track GA4 event for new scoring result
                  trackAssessmentScored({
                    sessionId: newRecord.session_id,
                    score: newRecord.score_fit_calibrated || 0,
                    typeCode: newRecord.type_code || undefined,
                    confidence: newRecord.confidence || undefined,
                    fitBand: newRecord.fit_band || undefined,
                    overlay: newRecord.overlay || undefined
                  });

                  return [newRecord as ScoringResult, ...current];
                }
                return current;

              case 'UPDATE':
                // Update existing result
                if (newRecord) {
                  toast({
                    title: "Results Updated",
                    description: `Assessment results have been recomputed`,
                  });

                  // Track GA4 event for updated scoring result
                  trackAssessmentScored({
                    sessionId: newRecord.session_id,
                    score: newRecord.score_fit_calibrated || 0,
                    typeCode: newRecord.type_code || undefined,
                    confidence: newRecord.confidence || undefined,
                    fitBand: newRecord.fit_band || undefined,
                    overlay: newRecord.overlay || undefined
                  });

                  return current.map(r => 
                    r.id === newRecord.id ? newRecord as ScoringResult : r
                  );
                }
                return current;

              case 'DELETE':
                // Remove deleted result
                if (oldRecord) {
                  return current.filter(r => r.id !== oldRecord.id);
                }
                return current;

              default:
                return current;
            }
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to scoring updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Subscription error:', status);
          toast({
            title: "Connection Issue",
            description: "Real-time updates may be delayed. Refreshing...",
            variant: "destructive",
          });
          // Attempt to refetch data
          setTimeout(() => fetchScoringResults(), 2000);
        }
      });

    // Fetch initial data
    fetchScoringResults();

    // Cleanup subscription on unmount
    return () => {
      console.log('🔄 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, fetchScoringResults, toast]);

  // Trigger recomputation
  const recomputeScoring = useCallback(async (sessionId?: string) => {
    if (!user) return { ok: false, error: 'User not authenticated' };

    try {
      setIsRecomputing(true);
      console.log('🔄 Triggering score recomputation for session:', sessionId);

      const payload = sessionId ? { sessionId } : { userId: user.id };
      
      const { data, error } = await supabase.functions.invoke('recompute-scoring', {
        body: payload
      });

      if (error) {
        console.error('Recompute function error:', error);
        toast({
          title: "Recomputation Failed",
          description: error.message || "Failed to recompute scores",
          variant: "destructive",
        });
        return { ok: false, error: error.message };
      }

      const result = data as RecomputeResponse;
      
      if (!result.ok) {
        toast({
          title: "Recomputation Failed",
          description: result.error || "Failed to recompute scores",
          variant: "destructive",
        });
        return result;
      }

      toast({
        title: "Recomputation Started",
        description: `Processing ${result.updatedCount || 'your'} assessment(s). Results will update automatically.`,
      });

      return result;

    } catch (error) {
      console.error('Error in recomputeScoring:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Recomputation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { ok: false, error: errorMessage };
    } finally {
      setIsRecomputing(false);
    }
  }, [user, toast]);

  return {
    scoringResults,
    isLoading,
    isRecomputing,
    fetchScoringResults,
    recomputeScoring
  };
};