import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import type { TypeStabilityData } from '@/hooks/useEvidenceAnalytics';

interface TypeStabilityCardProps {
  data: TypeStabilityData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const TypeStabilityCard: React.FC<TypeStabilityCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "% of retest pairs where Top-1 type (from profiles.top_types[0]) is unchanged.";
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <EvidenceKPICard
        title="Type Stability"
        definition={definition}
        value={data ? formatPercent(data.stabilityPercent) : '...'}
        subtitle={data ? `n=${data.n} pairs` : undefined}
        badge="Primary"
        badgeVariant="default"
        onExportCSV={onExportCSV}
        loading={loading}
      />
      <EvidenceKPICard
        title="Adjacent Oscillation"
        definition="% where Top-1 flips but Top-2 set is identical (same two types, order swapped)."
        value={data ? formatPercent(data.adjacentFlipPercent) : '...'}
        subtitle={data ? `n=${data.n} pairs` : undefined}
        badge="Secondary"
        badgeVariant="secondary"
        onExportCSV={onExportCSV}
        loading={loading}
      />
    </div>
  );
};