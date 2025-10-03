import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface MeasurementInvarianceData {
  delta_cfi: number | null;
  model_comparison: string | null;
  n: number;
}

interface MeasurementInvarianceCardProps {
  data: MeasurementInvarianceData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const MeasurementInvarianceCard: React.FC<MeasurementInvarianceCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Formula:\n\nΔCFI = CFI(constrained) - CFI(unconstrained)\n\nTarget: ΔCFI ≤ .01\n\nMeasurement invariance tests whether the assessment measures the same construct in the same way across different groups (e.g., gender, ethnicity, age). ΔCFI compares model fit when factor loadings are constrained to be equal vs. freely estimated.";
  
  const formatValue = () => {
    if (!data || data.n === 0) return 'N/A';
    if (data.delta_cfi === null) return 'N/A';
    return `ΔCFI = ${data.delta_cfi.toFixed(3)}`;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.n === 0) return 'secondary';
    if (data.delta_cfi === null) return 'secondary';
    if (data.delta_cfi <= 0.01) return 'default';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (!data || data.n === 0) return 'No Data';
    if (data.delta_cfi === null) return 'No Data';
    if (data.delta_cfi <= 0.01) return 'Pass';
    return 'Review';
  };

  return (
    <EvidenceKPICard
      title="📊 Measurement Invariance"
      definition={definition}
      value={formatValue()}
      subtitle={data && data.n > 0 ? `${data.model_comparison || 'Multi-group comparison'} (n=${data.n})` : undefined}
      badge={getStatusLabel()}
      badgeVariant={getBadgeVariant()}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {(!data || data.n === 0) && (
        <div className="text-sm text-muted-foreground mt-2">
          Run multi-group CFA to test measurement invariance across demographic groups. See README for setup.
        </div>
      )}
    </EvidenceKPICard>
  );
};
