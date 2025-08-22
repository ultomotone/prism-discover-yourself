import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import { Badge } from '@/components/ui/badge';
import type { MethodAgreementData } from '@/hooks/useEvidenceAnalytics';

interface MethodAgreementCardProps {
  data: MethodAgreementData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const MethodAgreementCard: React.FC<MethodAgreementCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Per Function:\n\nr = Pearson correlation between Likert-based and FC-based scores\n\nMAI = mean of 8 function r values";
  
  const getCorrelationColor = (r: number) => {
    if (r >= 0.7) return 'bg-green-500';
    if (r >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const functions = ['Ti', 'Te', 'Fi', 'Fe', 'Ni', 'Ne', 'Si', 'Se'];

  return (
    <EvidenceKPICard
      title="📏 Method Agreement Index (MAI)"
      definition={definition}
      value={data ? data.overall.toFixed(3) : '...'}
      subtitle="Overall MAI"
      badge={data && data.overall >= 0.7 ? 'Good' : 'Poor'}
      badgeVariant={data && data.overall >= 0.7 ? 'default' : 'destructive'}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {data && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Function Correlations</div>
          <div className="grid grid-cols-4 gap-2">
            {functions.map((func) => {
              const correlation = data.functions[func] || 0;
              return (
                <div key={func} className="flex flex-col items-center space-y-1">
                  <div className="text-xs font-medium">{func}</div>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${getCorrelationColor(correlation)}`}
                  >
                    {correlation.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Green: r≥0.70, Yellow: r≥0.60, Red: r&lt;0.60
          </div>
        </div>
      )}
    </EvidenceKPICard>
  );
};