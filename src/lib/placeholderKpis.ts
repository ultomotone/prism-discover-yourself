// Mock data generator for KPI widgets
// Returns placeholder data for users without sufficient retest history

export const getPlaceholderKpis = (actualSessions: number) => {
  return {
    coreAnchor: {
      typeCode: actualSessions > 0 ? 'LSE' : 'XXX',
      lastConfirmed: actualSessions > 0 ? '2 months ago' : 'Not set',
      reliability: actualSessions > 1 ? 'High' : 'Pending'
    },
    stabilityMeter: {
      // Sparkline mock data (Top-2 Gap over time)
      top2Gap: [7.2, 8.1, 8.8, 9.2],
      trend: 'improving' as const,
      median: 8.3
    },
    confidenceDial: {
      medianConfidence: 0.82,
      changePercent: '+5',
      sinceLast: 'last month'
    },
    stateBadges: {
      flow: 40,
      neutral: 45,
      stress: 15,
      period: 'last 30 days'
    }
  };
};
