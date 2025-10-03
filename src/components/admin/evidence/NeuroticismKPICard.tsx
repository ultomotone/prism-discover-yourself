import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import { Badge } from '@/components/ui/badge';

export interface NeuroticismData {
  results_version: string;
  n_sessions: number;
  mean_raw: number | null;
  sd_raw: number | null;
  cronbach_alpha: number | null;
  mcdonald_omega: number | null;
  split_half: number | null;
  split_half_n: number | null;
  mean_r_it: number | null;
  min_r_it: number | null;
  n_items: number;
  r_retest: number | null;
  retest_days: number | null;
  retest_n: number | null;
  ave: number | null;
  cr: number | null;
  pct_load_ge_40: number | null;
  pct_load_ge_60: number | null;
  pct_crossloading_gt_30: number | null;
  fornell_larcker_pass: boolean | null;
}

export interface NeuroticismCorrelation {
  other: string;
  r: number;
  n_pairs: number;
}

interface NeuroticismKPICardProps {
  data: NeuroticismData | null;
  topCorr: NeuroticismCorrelation[];
  onExportCSV: () => void;
  loading?: boolean;
}

export const NeuroticismKPICard: React.FC<NeuroticismKPICardProps> = ({
  data,
  topCorr,
  onExportCSV,
  loading = false
}) => {
  const definition = "Comprehensive Neuroticism (N) KPIs:\n\n• Distribution: Mean ± SD (1-5 scale), 0-100 index\n• Internal: ω, α, Split-Half (SB), item discrimination\n• Stability: Test-retest r (14-180 day window)\n• Discriminant: Max correlation with other scales, Fornell-Larcker test\n• Target: SB≥.70, ω≥.75, retest≥.70, FL pass (AVE > r²)";
  
  const formatValue = () => {
    if (!data || data.mean_raw === null || data.sd_raw === null) return 'N/A';
    return `${data.mean_raw.toFixed(2)} ± ${data.sd_raw.toFixed(2)}`;
  };

  const getReliabilityBadge = (): { variant: 'default' | 'secondary' | 'destructive', label: string } => {
    if (!data) return { variant: 'secondary', label: 'N/A' };
    const sb = data.split_half ?? 0;
    const omega = data.mcdonald_omega ?? 0;
    const best = Math.max(sb, omega);
    if (best >= 0.75) return { variant: 'default', label: 'Excellent' };
    if (best >= 0.70) return { variant: 'secondary', label: 'Good' };
    return { variant: 'destructive', label: 'Review' };
  };

  const reliability = getReliabilityBadge();

  return (
    <EvidenceKPICard
      title="🧠 Neuroticism (N) — Deep Dive"
      definition={definition}
      value={formatValue()}
      subtitle={data ? `n=${data.n_sessions}` : undefined}
      badge={reliability.label}
      badgeVariant={reliability.variant}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {data && (
        <div className="space-y-3 text-sm">
          {/* Internal Consistency */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Internal Consistency</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">SB:</span> {data.split_half?.toFixed(3) ?? 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">ω:</span> {data.mcdonald_omega?.toFixed(3) ?? 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">α:</span> {data.cronbach_alpha?.toFixed(3) ?? 'N/A'}
              </div>
            </div>
          </div>

          {/* Item Quality */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Item Quality</div>
            <div className="flex justify-between text-xs">
              <span>{data.n_items} items</span>
              <span>
                <span className="text-muted-foreground">Mean r_it:</span>{' '}
                <span className={data.mean_r_it && data.mean_r_it >= 0.30 ? 'text-green-600' : 'text-destructive'}>
                  {data.mean_r_it?.toFixed(3) ?? 'N/A'}
                </span>
              </span>
            </div>
          </div>

          {/* Stability */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Stability</div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Test-Retest:</span>
              <span>
                {data.r_retest?.toFixed(3) ?? 'N/A'}
                {data.retest_n && <span className="text-muted-foreground ml-1">(n={data.retest_n})</span>}
              </span>
            </div>
          </div>

          {/* Discriminant Validity */}
          {topCorr.length > 0 && (
            <div>
              <div className="font-medium text-xs text-muted-foreground mb-1">Discriminant Validity</div>
              <div className="space-y-1">
                {data.ave !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fornell-Larcker:</span>
                    <Badge variant={data.fornell_larcker_pass ? 'default' : 'destructive'} className="h-5">
                      {data.fornell_larcker_pass ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                )}
                {data.ave !== null && data.cr !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">AVE / CR:</span>
                    <span>{data.ave.toFixed(2)} / {data.cr.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Correlations */}
          {topCorr.length > 0 && (
            <div>
              <div className="font-medium text-xs text-muted-foreground mb-1">Top Correlations</div>
              <div className="space-y-1">
                {topCorr.map((c) => (
                  <div key={c.other} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{c.other}</span>
                    <span className="font-mono">{c.r.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!data && !loading && (
        <div className="text-sm text-muted-foreground">
          Click "Recompute Analytics" to generate Neuroticism KPIs.
        </div>
      )}
    </EvidenceKPICard>
  );
};
