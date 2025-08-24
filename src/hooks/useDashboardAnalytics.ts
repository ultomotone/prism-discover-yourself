import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import useSWR, { mutate } from 'swr';

// Simple dashboard analytics hook for public dashboard
const getView = async (viewName: string) => {
  const { data, error } = await supabase.functions.invoke('getView', {
    body: { view_name: viewName, limit: 1000 },
    headers: { 'cache-control': 'no-cache' }
  });
  if (error) throw error;
  return data?.data || [];
};

export const useDashboardAnalytics = () => {
  const [loading, setLoading] = useState(false);

  // Fetch type distribution data
  const { data: overlayDistData, error: overlayError } = useSWR(
    'dashboard-overlay-dist',
    () => getView('v_overlay_conf'),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // Fetch latest assessments
  const { data: latestAssessments, error: assessmentsError } = useSWR(
    'dashboard-latest-assessments',
    () => getView('v_latest_assessments_v11'),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // Transform overlay data for type distribution chart
  const typeDistribution = overlayDistData?.map((item: any) => ({
    type: item.overlay || 'Unknown',
    count: item.n || 0
  })) || [];

  // Realtime subscriptions for dashboard
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assessment_responses' }, () => {
        mutate('dashboard-latest-assessments');
        mutate('dashboard-overlay-dist');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        mutate('dashboard-latest-assessments');
        mutate('dashboard-overlay-dist');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assessment_sessions' }, () => {
        mutate('dashboard-latest-assessments');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        mutate('dashboard-overlay-dist'),
        mutate('dashboard-latest-assessments')
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    typeDistribution,
    latestAssessments: latestAssessments || [],
    loading: loading || !overlayDistData || !latestAssessments,
    error: overlayError || assessmentsError,
    refreshData
  };
};