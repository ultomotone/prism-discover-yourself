import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import { Badge } from '@/components/ui/badge';

export interface FairnessData {
  flagged_items: number;
  total_items: number;
  dif_flag_rate_pct: number | null;
}

interface FairnessCardProps {
  data: FairnessData | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const FairnessCard: React.FC<FairnessCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Formula:\n\nDIF Flag Rate = (flagged_items ÷ total_items) × 100\n\nTarget: ≤ 10%\n\nDifferential Item Functioning (DIF) measures whether items perform differently across demographic groups (e.g., gender, ethnicity). Flagged items may exhibit bias and should be reviewed.";
  
  const formatValue = () => {
    if (!data || data.total_items === 0) return 'N/A';
    return `${data.dif_flag_rate_pct?.toFixed(1) ?? '0.0'}%`;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.total_items === 0) return 'secondary';
    const rate = data.dif_flag_rate_pct ?? 0;
    if (rate <= 10) return 'default';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (!data || data.total_items === 0) return 'No Data';
    const rate = data.dif_flag_rate_pct ?? 0;
    if (rate <= 10) return 'Pass';
    return 'Review';
  };

  return (
    <EvidenceKPICard
      title="⚖️ Fairness (DIF)"
      definition={definition}
      value={formatValue()}
      subtitle={data ? `${data.flagged_items}/${data.total_items} items flagged` : undefined}
      badge={getStatusLabel()}
      badgeVariant={getBadgeVariant()}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {data && data.total_items === 0 && (
        <div className="text-sm text-muted-foreground mt-2">
          Run DIF analysis to populate this metric. See README for compute_dif.py setup.
        </div>
      )}
    </EvidenceKPICard>
  );
};
