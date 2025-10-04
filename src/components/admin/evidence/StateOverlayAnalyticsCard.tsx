import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import type { StateOverlayData } from '@/hooks/useStateOverlayKpis';

interface StateOverlayAnalyticsCardProps {
  data: StateOverlayData | null;
  series?: any[];
  onExportCSV: () => void;
  loading?: boolean;
}

export const StateOverlayAnalyticsCard: React.FC<StateOverlayAnalyticsCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "STATE Overlay Analytics — Contextual single-item measures:\n\n• Distribution: % in N+ (dysregulated), N0 (neutral), N- (calm)\n• Components: Mean scores (1-7) for Stress, Mood, Sleep, Focus, Time\n• State-Trait Separation: r(state_index, Neuroticism) — target |r| < .30\n• Impact on Results: Confidence and Top Gap by overlay state\n\nNote: STATE scales are not included in α/ω/CFA (single-item measures)";

  const pct = (x: any) => (x == null ? '—' : `${Number(x).toFixed(1)}%`);
  const num = (x: any) => (x == null ? '—' : Number(x).toFixed(2));
  
  const formatValue = () => {
    if (!data) return 'N/A';
    return `${pct(data.pct_n_plus)} / ${pct(data.pct_n0)} / ${pct(data.pct_n_minus)}`;
  };

  const getSeparationBadge = (): { variant: 'default' | 'secondary' | 'destructive'; label: string } => {
    if (!data || data.r_state_traitn == null) return { variant: 'secondary', label: 'N/A' };
    const sep = Math.abs(Number(data.r_state_traitn));
    if (sep < 0.30) return { variant: 'default', label: 'Good Separation' };
    if (sep <= 0.40) return { variant: 'secondary', label: 'Moderate' };
    return { variant: 'destructive', label: 'High Overlap' };
  };

  const separation = getSeparationBadge();

  return (
    <EvidenceKPICard
      title="🎭 STATE Overlay Analytics"
      definition={definition}
      value={formatValue()}
      subtitle="N+ / N0 / N-"
      badge={separation.label}
      badgeVariant={separation.variant}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {data && (
        <div className="space-y-3 text-sm">
          {/* Distribution */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Distribution</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-red-600 dark:text-red-400">N+:</span> {pct(data.pct_n_plus)}
              </div>
              <div>
                <span className="text-muted-foreground">N0:</span> {pct(data.pct_n0)}
              </div>
              <div>
                <span className="text-green-600 dark:text-green-400">N-:</span> {pct(data.pct_n_minus)}
              </div>
            </div>
          </div>

          {/* Component Means */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Component Means (1–7)</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stress:</span>
                <span className="font-mono">{num(data.mean_stress)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mood:</span>
                <span className="font-mono">{num(data.mean_mood)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sleep:</span>
                <span className="font-mono">{num(data.mean_sleep)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus:</span>
                <span className="font-mono">{num(data.mean_focus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-mono">{num(data.mean_time)}</span>
              </div>
            </div>
          </div>

          {/* State-Trait Separation */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">State-Trait Separation</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">r(state, N):</span>
              <span className={`font-mono ${
                Math.abs(Number(data.r_state_traitn)) < 0.30 
                  ? 'text-green-600 dark:text-green-400' 
                  : Math.abs(Number(data.r_state_traitn)) <= 0.40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-destructive'
              }`}>
                {Number(data.r_state_traitn).toFixed(3)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Target: |r| &lt; .30 (validates contextual, not trait)
            </div>
          </div>

          {/* Impact on Results */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Impact on Results</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-mono">
                  {num(data.conf_mean_nplus)} / {num(data.conf_mean_n0)} / {num(data.conf_mean_nminus)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top Gap:</span>
                <span className="font-mono">
                  {num(data.topgap_mean_nplus)} / {num(data.topgap_mean_n0)} / {num(data.topgap_mean_nminus)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Expected: N+ → lower confidence, higher gap
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="text-sm text-muted-foreground">
          Click "Recompute Analytics" to generate STATE overlay KPIs.
        </div>
      )}
    </EvidenceKPICard>
  );
};
