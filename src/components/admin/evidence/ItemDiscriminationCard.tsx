import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface ItemDiscriminationData {
  scale_code: string;
  low_disc_items: number;
  total_items: number;
}

interface ItemDiscriminationCardProps {
  data: ItemDiscriminationData[] | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const ItemDiscriminationCard: React.FC<ItemDiscriminationCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Formula:\n\nr_it = cor(item, scale_sum - item)\n\nFlag: < 0.20\n\nItem-total correlation measures how well each item discriminates between high and low scorers on the scale. Low values indicate the item may not measure the intended construct.";
  
  const formatValue = () => {
    if (!data || data.length === 0) return 'N/A';
    const totalLowDisc = data.reduce((sum, d) => sum + d.low_disc_items, 0);
    const totalItems = data.reduce((sum, d) => sum + d.total_items, 0);
    return `${totalLowDisc}/${totalItems}`;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.length === 0) return 'secondary';
    const totalLowDisc = data.reduce((sum, d) => sum + d.low_disc_items, 0);
    const totalItems = data.reduce((sum, d) => sum + d.total_items, 0);
    const rate = totalItems > 0 ? totalLowDisc / totalItems : 0;
    if (rate <= 0.05) return 'default';
    if (rate <= 0.10) return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (!data || data.length === 0) return 'Setup Required';
    const totalLowDisc = data.reduce((sum, d) => sum + d.low_disc_items, 0);
    const totalItems = data.reduce((sum, d) => sum + d.total_items, 0);
    const rate = totalItems > 0 ? totalLowDisc / totalItems : 0;
    if (rate <= 0.05) return 'Good';
    return 'Review';
  };

  return (
    <EvidenceKPICard
      title="📊 Item Discrimination"
      definition={definition}
      value={formatValue()}
      subtitle="items < 0.20"
      badge={getStatusLabel()}
      badgeVariant={getBadgeVariant()}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {(!data || data.length === 0) && (
        <div className="text-sm text-muted-foreground mt-2">
          Compute item-total correlations: cor(item, scale_sum - item). See README for script.
        </div>
      )}
      {data && data.length > 0 && (
        <div className="space-y-1 mt-2">
          {data.filter(d => d.low_disc_items > 0).slice(0, 3).map((scale) => (
            <div key={scale.scale_code} className="text-xs flex justify-between">
              <span className="text-muted-foreground">{scale.scale_code}</span>
              <span className="font-mono">{scale.low_disc_items}/{scale.total_items} flagged</span>
            </div>
          ))}
        </div>
      )}
    </EvidenceKPICard>
  );
};
