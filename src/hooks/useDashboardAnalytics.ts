import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Simple dashboard analytics hook for public dashboard
export const useDashboardAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [typeDistribution, setTypeDistribution] = useState<Array<{ type: string; count: number }>>([]);
  const [latestAssessments, setLatestAssessments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get type distribution from profiles directly
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('type_code, overlay, created_at, confidence, fit_band, results_version, session_id')
        .not('type_code', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesError) {
        throw profilesError;
      }

      // Process type distribution
      const typeStats: Record<string, number> = {};
      (profiles || []).forEach(profile => {
        const displayType = profile.overlay ? `N${profile.overlay}` : profile.type_code?.substring(0, 3) || 'Unknown';
        typeStats[displayType] = (typeStats[displayType] || 0) + 1;
      });

      const typeDistData = Object.entries(typeStats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Process latest assessments with country lookup
      const assessmentsWithCountry = await Promise.all(
        (profiles || []).slice(0, 20).map(async (profile) => {
          let country = 'Unknown';
          try {
            // Get country from responses if available
            const { data: countryResponse } = await supabase
              .from('assessment_responses')
              .select('answer_value')
              .eq('session_id', profile.session_id)
              .eq('question_id', 4) // Assuming country question ID is 4
              .maybeSingle();
            
            country = countryResponse?.answer_value || 'Unknown';
          } catch (e) {
            // If country lookup fails, just use Unknown
          }

          return {
            ...profile,
            country,
            finished_at: profile.created_at
          };
        })
      );

      setTypeDistribution(typeDistData);
      setLatestAssessments(assessmentsWithCountry);

    } catch (err) {
      console.error('Dashboard analytics error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setTypeDistribution([]);
      setLatestAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Realtime subscriptions for dashboard
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        console.log('New profile added, refreshing dashboard...');
        fetchData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assessment_sessions' }, () => {
        console.log('New session started...');
        // Don't refresh immediately for session starts
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return {
    typeDistribution,
    latestAssessments,
    loading,
    error,
    refreshData
  };
};