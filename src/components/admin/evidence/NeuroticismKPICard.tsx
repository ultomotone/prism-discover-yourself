import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import { Badge } from '@/components/ui/badge';

export interface NeuroticismData {
  results_version: string;
  scale_tag: string;
  n_resp: number;
  mean_raw_1_5: number;
  sd_raw_1_5: number;
  mean_idx_0_100: number;
  alpha: number | null;
  omega_total: number | null;
  split_half_sb: number | null;
  pct_items_low: number | null;
  n_items: number;
  retest_r: number | null;
  n_pairs: number | null;
  max_abs_corr: number | null;
  max_corr_with: string | null;
  ave: number | null;
  cr: number | null;
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
    if (!data) return 'N/A';
    return `${data.mean_raw_1_5.toFixed(2)} ± ${data.sd_raw_1_5.toFixed(2)}`;
  };

  const getReliabilityBadge = (): { variant: 'default' | 'secondary' | 'destructive', label: string } => {
    if (!data) return { variant: 'secondary', label: 'N/A' };
    const sb = data.split_half_sb ?? 0;
    const omega = data.omega_total ?? 0;
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
      subtitle={data ? `n=${data.n_resp} | Index: ${data.mean_idx_0_100.toFixed(1)}` : undefined}
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
                <span className="text-muted-foreground">SB:</span> {data.split_half_sb?.toFixed(3) ?? 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">ω:</span> {data.omega_total?.toFixed(3) ?? 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">α:</span> {data.alpha?.toFixed(3) ?? 'N/A'}
              </div>
            </div>
          </div>

          {/* Item Quality */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Item Quality</div>
            <div className="flex justify-between text-xs">
              <span>{data.n_items} items</span>
              <span>
                <span className="text-muted-foreground">Low r_it:</span>{' '}
                <span className={data.pct_items_low && data.pct_items_low <= 10 ? 'text-green-600' : 'text-destructive'}>
                  {data.pct_items_low?.toFixed(1) ?? 'N/A'}%
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
                {data.retest_r?.toFixed(3) ?? 'N/A'}
                {data.n_pairs && <span className="text-muted-foreground ml-1">(n={data.n_pairs})</span>}
              </span>
            </div>
          </div>

          {/* Discriminant Validity */}
          <div>
            <div className="font-medium text-xs text-muted-foreground mb-1">Discriminant Validity</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Max |r| with:</span>
                <span>{data.max_corr_with ?? 'N/A'} ({data.max_abs_corr?.toFixed(2) ?? 'N/A'})</span>
              </div>
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
