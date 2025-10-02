import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface SplitHalfData {
  scale_code: string;
  lambda2_mean: number | null;
  n_total: number;
}

interface SplitHalfCardProps {
  data: SplitHalfData[] | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const SplitHalfCard: React.FC<SplitHalfCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Formula:\n\nGuttman's λ₂ (Split-Half Reliability)\n\nTarget: ≥ 0.70\n\nMeasures internal consistency by splitting items into two halves and correlating scores. More robust than Cronbach's α for heterogeneous scales.";
  
  const formatValue = () => {
    if (!data || data.length === 0) return 'N/A';
    const avgLambda = data.reduce((sum, d) => sum + (d.lambda2_mean ?? 0), 0) / data.length;
    return avgLambda.toFixed(3);
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.length === 0) return 'secondary';
    const avgLambda = data.reduce((sum, d) => sum + (d.lambda2_mean ?? 0), 0) / data.length;
    if (avgLambda >= 0.70) return 'default';
    if (avgLambda >= 0.60) return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (!data || data.length === 0) return 'Setup Required';
    const avgLambda = data.reduce((sum, d) => sum + (d.lambda2_mean ?? 0), 0) / data.length;
    if (avgLambda >= 0.70) return 'Pass';
    return 'Review';
  };

  return (
    <EvidenceKPICard
      title="🔀 Split-Half Reliability (λ₂)"
      definition={definition}
      value={formatValue()}
      subtitle={data && data.length > 0 ? `${data.length} scales` : undefined}
      badge={getStatusLabel()}
      badgeVariant={getBadgeVariant()}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {(!data || data.length === 0) && (
        <div className="text-sm text-muted-foreground mt-2">
          Compute split-half reliability using Python (pingouin) or R (psych). See README for details.
        </div>
      )}
      {data && data.length > 0 && (
        <div className="space-y-1 mt-2">
          {data.slice(0, 3).map((scale) => (
            <div key={scale.scale_code} className="text-xs flex justify-between">
              <span className="text-muted-foreground">{scale.scale_code}</span>
              <span className="font-mono">{scale.lambda2_mean?.toFixed(3) ?? 'N/A'}</span>
            </div>
          ))}
          {data.length > 3 && (
            <div className="text-xs text-muted-foreground">+ {data.length - 3} more</div>
          )}
        </div>
      )}
    </EvidenceKPICard>
  );
};
