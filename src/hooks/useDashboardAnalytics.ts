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
      console.log('🔍 Dashboard: Starting data fetch...');

      // Try to get profiles data first - may fail due to RLS
      let profiles: any[] = [];
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('type_code, overlay, created_at, confidence, fit_band, results_version, session_id')
          .not('type_code', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100);

        console.log('🔍 Dashboard: Profiles query result:', { profiles: profilesData?.length, error: profilesError });

        if (profilesError) {
          console.error('🔍 Dashboard: Profiles RLS error:', profilesError);
          // Don't throw - try alternative approach
        } else {
          profiles = profilesData || [];
        }
      } catch (e) {
        console.log('🔍 Dashboard: Profiles query failed, trying alternative approach...');
      }

      // If profiles failed, try getting data from recent assessments function
      if (profiles.length === 0) {
        try {
          const { data: recentData, error: recentError } = await supabase
            .rpc('get_recent_assessments_safe');

          console.log('🔍 Dashboard: Recent assessments safe result:', { data: recentData?.length, error: recentError });

          if (!recentError && recentData) {
            // Transform the safe data into our expected format
            profiles = recentData.map((item: any) => ({
              type_code: item.type_display?.substring(0, 3) || 'Unknown',
              overlay: item.type_display?.includes('+') ? '+' : item.type_display?.includes('–') ? '–' : null,
              created_at: item.created_at,
              confidence: item.confidence,
              fit_band: item.fit_band,
              results_version: item.version,
              session_id: null, // Not available in safe view
              country: item.country_display
            }));
          }
        } catch (e) {
          console.error('🔍 Dashboard: Safe function also failed:', e);
        }
      }

      console.log('🔍 Dashboard: Final profiles count:', profiles.length);
      console.log('🔍 Dashboard: Sample profiles:', profiles.slice(0, 3));

      // Process type distribution - show all 16 PRISM type codes
      const allPrismTypes = [
        'ILE', 'LII', 'SEI', 'ESE', 'SLE', 'LSI', 'IEI', 'EIE',
        'LIE', 'ILI', 'SEE', 'ESI', 'LSE', 'SLI', 'IEE', 'EII'
      ];
      
      // Initialize all types with 0 count
      const typeStats: Record<string, number> = {};
      allPrismTypes.forEach(type => {
        typeStats[type] = 0;
      });
      
      // Count actual profiles
      profiles.forEach(profile => {
        const displayType = profile.type_code?.substring(0, 3);
        if (displayType && allPrismTypes.includes(displayType)) {
          typeStats[displayType] += 1;
        }
      });

      console.log('🔍 Dashboard: Type stats:', typeStats);

      // Create distribution data with all 16 types, sorted by count (highest first)
      const typeDistData = allPrismTypes
        .map(type => ({ type, count: typeStats[type] }))
        .sort((a, b) => b.count - a.count);

      console.log('🔍 Dashboard: Type distribution:', typeDistData);

      // For latest assessments, use the profiles we already have
      const latestData = profiles.slice(0, 20).map(profile => ({
        ...profile,
        country: profile.country || 'Unknown',
        finished_at: profile.created_at
      }));

      console.log('🔍 Dashboard: Latest assessments processed:', latestData.length);

      setTypeDistribution(typeDistData);
      setLatestAssessments(latestData);

    } catch (err) {
      console.error('🔍 Dashboard analytics error:', err);
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