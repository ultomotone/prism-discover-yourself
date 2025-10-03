import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface ItemDiscriminationData {
  scale_code: string;
  question_id: number;
  r_it: number | null;
  n_used: number;
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
  
  // Group by scale and count low discrimination items
  const scaleStats = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const byScale = new Map<string, { low: number; total: number }>();
    for (const item of data) {
      if (!byScale.has(item.scale_code)) {
        byScale.set(item.scale_code, { low: 0, total: 0 });
      }
      const stats = byScale.get(item.scale_code)!;
      stats.total++;
      if (item.r_it !== null && item.r_it < 0.20) {
        stats.low++;
      }
    }
    return Array.from(byScale.entries()).map(([scale_code, stats]) => ({
      scale_code,
      low_disc_items: stats.low,
      total_items: stats.total
    }));
  }, [data]);
  
  const formatValue = () => {
    if (scaleStats.length === 0) return 'N/A';
    const totalLowDisc = scaleStats.reduce((sum, d) => sum + d.low_disc_items, 0);
    const totalItems = scaleStats.reduce((sum, d) => sum + d.total_items, 0);
    return `${totalLowDisc}/${totalItems}`;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (scaleStats.length === 0) return 'secondary';
    const totalLowDisc = scaleStats.reduce((sum, d) => sum + d.low_disc_items, 0);
    const totalItems = scaleStats.reduce((sum, d) => sum + d.total_items, 0);
    const rate = totalItems > 0 ? totalLowDisc / totalItems : 0;
    if (rate <= 0.05) return 'default';
    if (rate <= 0.10) return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (scaleStats.length === 0) return 'Setup Required';
    const totalLowDisc = scaleStats.reduce((sum, d) => sum + d.low_disc_items, 0);
    const totalItems = scaleStats.reduce((sum, d) => sum + d.total_items, 0);
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
          Click "Recompute Analytics" to compute item-total correlations for all items.
        </div>
      )}
      {scaleStats.length > 0 && (
        <div className="space-y-1 mt-2">
          {scaleStats.filter(d => d.low_disc_items > 0).slice(0, 3).map((scale) => (
            <div key={scale.scale_code} className="text-xs flex justify-between">
              <span className="text-muted-foreground">{scale.scale_code}</span>
              <span className="font-mono">{scale.low_disc_items}/{scale.total_items} flagged</span>
            </div>
          ))}
          {scaleStats.filter(d => d.low_disc_items > 0).length === 0 && (
            <div className="text-xs text-muted-foreground">All items show good discrimination (r_it ≥ 0.20)</div>
          )}
        </div>
      )}
    </EvidenceKPICard>
  );
};
