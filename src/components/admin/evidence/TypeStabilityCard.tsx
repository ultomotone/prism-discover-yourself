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
  const stabilityDefinition = "Formula:\n\nStability % = (# of pairs with same top type / total pairs) × 100\n\nSame type code (e.g., LIE) between the two assessments in a pair = stable.";
  
  const adjacentDefinition = "Formula:\n\nAdjacent % = (# of pairs that shifted to an adjacent type / total pairs) × 100\n\n\"Adjacent\" = shares one of base or creative function, but not both.";
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <EvidenceKPICard
        title="🔐 Type Stability"
        definition={stabilityDefinition}
        value={data ? formatPercent(data.stabilityPercent) : '...'}
        subtitle={data ? `n=${data.n} pairs` : undefined}
        badge="Primary"
        badgeVariant="default"
        onExportCSV={onExportCSV}
        loading={loading}
      />
      <EvidenceKPICard
        title="🔁 Adjacent Oscillation"
        definition={adjacentDefinition}
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