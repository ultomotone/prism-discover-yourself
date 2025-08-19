import React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { EvidenceKPICard } from './EvidenceKPICard';
import type { TestRetestReliabilityData } from '@/hooks/useEvidenceAnalytics';

interface TestRetestReliabilityCardProps {
  data: TestRetestReliabilityData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const TestRetestReliabilityCard: React.FC<TestRetestReliabilityCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Pearson r between session-pair vectors of profiles.strengths (Ti…Se) for the same user across nearest two sessions.";
  
  const formatValue = (value: number) => {
    return value.toFixed(3);
  };

  return (
    <EvidenceKPICard
      title="Test–Retest Reliability (Strengths r)"
      definition={definition}
      value={data ? formatValue(data.overallR) : '...'}
      subtitle={data ? `n=${data.n} pairs` : undefined}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Median days apart: {data ? data.medianDaysApart : '...'}
        </div>
        {data && data.sparklineData && data.sparklineData.length > 0 && (
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sparklineData}>
                <XAxis 
                  dataKey="days" 
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 1]}
                />
                <Line 
                  type="monotone" 
                  dataKey="r" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </EvidenceKPICard>
  );
};