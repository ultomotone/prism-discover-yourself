import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export interface ComponentKPIData {
  scale_tag: string;
  n_items: number;
  split_half_sb: number | null;
  omega_total: number | null;
  alpha: number | null;
  r_it_median: number | null;
  pct_items_low: number | null;
  convergent_r: number | null;
  max_non_target_r: number | null;
  retest_r: number | null;
  n_pairs: number | null;
  ave: number | null;
  cr: number | null;
  pass_reliability: boolean;
  pass_item_quality: boolean;
  pass_validity: boolean;
  pass_stability: boolean;
  release_ready: boolean;
}

interface ComponentKPICardProps {
  data: ComponentKPIData[] | null;
  loading?: boolean;
}

export const ComponentKPICard: React.FC<ComponentKPICardProps> = ({
  data,
  loading = false
}) => {
  const getReliabilityBadge = (sb: number | null, omega: number | null) => {
    if (sb === null && omega === null) return { variant: 'secondary' as const, label: 'N/A' };
    const value = omega ?? sb ?? 0;
    if (value >= 0.75) return { variant: 'default' as const, label: 'Excellent' };
    if (value >= 0.70) return { variant: 'secondary' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Review' };
  };

  const getItemQualityBadge = (median: number | null, pctLow: number | null) => {
    if (median === null) return { variant: 'secondary' as const, label: 'N/A' };
    if (median >= 0.30 && (pctLow ?? 0) <= 10) return { variant: 'default' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Review' };
  };

  const getValidityBadge = (conv: number | null, ave: number | null) => {
    if (conv === null && ave === null) return { variant: 'secondary' as const, label: 'N/A' };
    const convPass = (conv ?? 0) >= 0.60;
    const avePass = (ave ?? 0) >= 0.50;
    if (convPass || avePass) return { variant: 'default' as const, label: 'Pass' };
    return { variant: 'destructive' as const, label: 'Review' };
  };

  const getStabilityBadge = (r: number | null) => {
    if (r === null) return { variant: 'secondary' as const, label: 'Beta' };
    if (r >= 0.70) return { variant: 'default' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Review' };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">🧩 Components & Release Gates</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md">
                <p className="text-sm">
                  Per-scale KPIs for internal consistency, validity, stability, and release readiness.
                  Gates: Reliability (ω≥.75 OR SB≥.70), Item Quality (r_it≥.30, low≤10%), 
                  Validity (conv≥.60 OR AVE≥.50), Stability (retest≥.70).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No data available. Run refresh_psych_kpis() to populate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scale</th>
                  <th className="text-center p-2">Items</th>
                  <th className="text-center p-2">Reliability</th>
                  <th className="text-center p-2">Item Quality</th>
                  <th className="text-center p-2">Validity</th>
                  <th className="text-center p-2">Stability</th>
                  <th className="text-center p-2">Ready</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((scale) => scale.scale_tag != null) // Filter out NULL scale_tags
                  .map((scale) => {
                    const reliabilityBadge = getReliabilityBadge(scale.split_half_sb, scale.omega_total);
                    const itemQualityBadge = getItemQualityBadge(scale.r_it_median, scale.pct_items_low);
                    const validityBadge = getValidityBadge(scale.convergent_r, scale.ave);
                    const stabilityBadge = getStabilityBadge(scale.retest_r);
                    
                    return (
                      <tr key={scale.scale_tag} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{scale.scale_tag}</td>
                      <td className="p-2 text-center">{scale.n_items}</td>
                      <td className="p-2 text-center">
                        <Badge variant={reliabilityBadge.variant} className="text-xs">
                          {reliabilityBadge.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {scale.split_half_sb?.toFixed(2) ?? 'N/A'}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={itemQualityBadge.variant} className="text-xs">
                          {itemQualityBadge.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {scale.pct_items_low?.toFixed(1) ?? 'N/A'}%
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={validityBadge.variant} className="text-xs">
                          {validityBadge.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          AVE: {scale.ave?.toFixed(2) ?? 'N/A'}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={stabilityBadge.variant} className="text-xs">
                          {stabilityBadge.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {scale.retest_r?.toFixed(2) ?? 'N/A'}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {scale.release_ready ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
