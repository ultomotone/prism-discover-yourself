import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { EvidenceKPICard } from './EvidenceKPICard';
import type { ConfidenceCalibrationData } from '@/hooks/useEvidenceAnalytics';

interface ConfidenceCalibrationCardProps {
  data: ConfidenceCalibrationData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const ConfidenceCalibrationCard: React.FC<ConfidenceCalibrationCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Compares expected accuracy for High/Moderate/Low bands (e.g., 90%/70%/50%) vs. actual match rate.\n\nDeviation: Absolute difference in percentage points (e.g., ±29.5pp = very poorly calibrated).";
  
  const chartData = data ? [
    {
      bin: 'High',
      hitRate: data.high.hitRate,
      n: data.high.n,
      expected: 85 // Expected high confidence hit rate
    },
    {
      bin: 'Moderate',
      hitRate: data.moderate.hitRate,
      n: data.moderate.n,
      expected: 65 // Expected moderate confidence hit rate
    },
    {
      bin: 'Low',
      hitRate: data.low.hitRate,
      n: data.low.n,
      expected: 45 // Expected low confidence hit rate
    }
  ] : [];

  const overallCalibration = data ? 
    Math.abs(data.high.hitRate - 85) + Math.abs(data.moderate.hitRate - 65) + Math.abs(data.low.hitRate - 45) : null;

  return (
    <EvidenceKPICard
      title="🎯 Calibration of Confidence"
      definition={definition}
      value={overallCalibration ? `±${overallCalibration.toFixed(1)}pp` : '...'}
      subtitle="Deviation from expected"
      badge={overallCalibration && overallCalibration < 10 ? 'Good' : 'Poor'}
      badgeVariant={overallCalibration && overallCalibration < 10 ? 'default' : 'destructive'}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {data && (
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="bin" 
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                fontSize={10}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`, 
                  name === 'hitRate' ? 'Observed' : 'Expected'
                ]}
              />
              <Bar 
                dataKey="hitRate" 
                fill="hsl(var(--primary))" 
                opacity={0.8}
              />
              <Bar 
                dataKey="expected" 
                fill="hsl(var(--muted-foreground))" 
                opacity={0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </EvidenceKPICard>
  );
};