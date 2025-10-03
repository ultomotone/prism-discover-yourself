import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface SplitHalfData {
  scale_code: string;
  split_half_sb: number | null;
  split_half_n: number;
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
  const definition = "Formula:\n\nSpearman-Brown Corrected Split-Half Reliability\n\nTarget: ≥ 0.80 (Good), ≥ 0.70 (Acceptable)\n\nMeasures internal consistency by randomly splitting items into two halves (200 iterations, median correlation). Shows how well items within a scale measure the same construct.";
  
  const formatValue = () => {
    if (!data || data.length === 0) return 'N/A';
    const avgSB = data.reduce((sum, d) => sum + (d.split_half_sb ?? 0), 0) / data.length;
    return avgSB.toFixed(3);
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.length === 0) return 'secondary';
    const avgSB = data.reduce((sum, d) => sum + (d.split_half_sb ?? 0), 0) / data.length;
    if (avgSB >= 0.80) return 'default';
    if (avgSB >= 0.70) return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (!data || data.length === 0) return 'Setup Required';
    const avgSB = data.reduce((sum, d) => sum + (d.split_half_sb ?? 0), 0) / data.length;
    if (avgSB >= 0.80) return 'Good';
    if (avgSB >= 0.70) return 'Acceptable';
    return 'Review';
  };

  return (
    <EvidenceKPICard
      title="🔀 Split-Half Reliability (SB)"
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
          Click "Recompute Analytics" to compute split-half reliability for all scales.
        </div>
      )}
      {data && data.length > 0 && (
        <div className="space-y-1 mt-2">
          {data.slice(0, 3).map((scale) => (
            <div key={scale.scale_code} className="text-xs flex justify-between">
              <span className="text-muted-foreground">{scale.scale_code}</span>
              <span className="font-mono">
                {scale.split_half_sb?.toFixed(3) ?? 'N/A'} 
                <span className="text-muted-foreground ml-1">(n={scale.split_half_n})</span>
              </span>
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
