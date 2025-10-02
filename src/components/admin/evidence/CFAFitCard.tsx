import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';

export interface CFAFitData {
  model_name: string;
  cfi: number | null;
  tli: number | null;
  rmsea: number | null;
  srmr: number | null;
  n: number;
}

interface CFAFitCardProps {
  data: CFAFitData[] | null;
  onExportCSV: () => void;
  loading?: boolean;
}

export const CFAFitCard: React.FC<CFAFitCardProps> = ({
  data,
  onExportCSV,
  loading = false
}) => {
  const definition = "Targets:\n\nCFI/TLI ≥ 0.90 (good fit)\nRMSEA ≤ 0.08 (acceptable)\nSRMR ≤ 0.08 (good fit)\n\nConfirmatory Factor Analysis (CFA) tests whether the theoretical factor structure fits the observed data. Computed using R lavaan.";
  
  const formatValue = () => {
    if (!data || data.length === 0) return 'N/A';
    const model = data[0]; // Show primary model
    if (!model.cfi) return 'N/A';
    return `CFI: ${model.cfi.toFixed(3)}`;
  };

  const evaluateFit = (model: CFAFitData): boolean => {
    if (!model.cfi || !model.tli || !model.rmsea || !model.srmr) return false;
    return model.cfi >= 0.90 && model.tli >= 0.90 && model.rmsea <= 0.08 && model.srmr <= 0.08;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!data || data.length === 0) return 'secondary';
    const model = data[0];
    if (evaluateFit(model)) return 'default';
    return 'secondary';
  };

  const getStatusLabel = () => {
    if (!data || data.length === 0) return 'Setup Required';
    const model = data[0];
    if (evaluateFit(model)) return 'Good Fit';
    return 'Acceptable';
  };

  return (
    <EvidenceKPICard
      title="🏗️ CFA Fit Indices"
      definition={definition}
      value={formatValue()}
      subtitle={data && data.length > 0 ? `${data[0].model_name} (n=${data[0].n})` : undefined}
      badge={getStatusLabel()}
      badgeVariant={getBadgeVariant()}
      onExportCSV={onExportCSV}
      loading={loading}
    >
      {(!data || data.length === 0) && (
        <div className="text-sm text-muted-foreground mt-2">
          Run CFA using R lavaan::cfa(). Insert results into cfa_fit table. See README.
        </div>
      )}
      {data && data.length > 0 && data[0].cfi !== null && (
        <div className="space-y-1 mt-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">TLI</span>
            <span className="font-mono">{data[0].tli?.toFixed(3) ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">RMSEA</span>
            <span className="font-mono">{data[0].rmsea?.toFixed(3) ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SRMR</span>
            <span className="font-mono">{data[0].srmr?.toFixed(3) ?? 'N/A'}</span>
          </div>
        </div>
      )}
    </EvidenceKPICard>
  );
};
