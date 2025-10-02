import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface CalibrationData {
  ece: number | null;
  brier: number | null;
  bins: Array<{
    bin_index: number;
    p_pred: number;
    p_obs: number;
    n: number;
  }> | null;
}

interface CalibrationCardProps {
  data: CalibrationData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const CalibrationCard: React.FC<CalibrationCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Formula:\n\nECE (Expected Calibration Error) = Σ |p_pred - p_obs| × (n/N)\n\nTarget: < 0.05\n\nBrier Score = Σ (prediction - outcome)² / N (lower is better)\n\nMeasures how well predicted confidences match actual outcomes. Requires defining an outcome (gold standard, retest agreement, or FC agreement).";
  
  const formatValue = () => {
    if (!data || data.ece === null) return 'N/A';
    return data.ece.toFixed(3);
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.ece === null) return 'secondary';
    if (data.ece < 0.05) return 'default';
    if (data.ece < 0.10) return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (!data || data.ece === null) return 'Setup Required';
    if (data.ece < 0.05) return 'Excellent';
    if (data.ece < 0.10) return 'Good';
    return 'Review';
  };

  return (
    <EvidenceKPICard
      title="🎯 Calibration (ECE)"
      definition={definition}
      value={formatValue()}
      subtitle={data?.brier ? `Brier: ${data.brier.toFixed(3)}` : undefined}
      badge={getStatusLabel()}
      badgeVariant={getBadgeVariant()}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {(!data || data.ece === null) && (
        <div className="text-sm text-muted-foreground mt-2">
          Run compute_calibration.py to generate ECE and Brier scores. Choose outcome type: gold/retest/fc.
        </div>
      )}
      {data?.bins && data.bins.length > 0 && (
        <div className="text-xs text-muted-foreground mt-2">
          {data.bins.length} calibration bins computed
        </div>
      )}
    </EvidenceKPICard>
  );
};
