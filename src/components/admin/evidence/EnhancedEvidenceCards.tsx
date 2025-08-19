// Enhanced Evidence Cards for PRISM v1.1
import React from 'react';
import { EvidenceKPICard } from './EvidenceKPICard';
import { Badge } from '@/components/ui/badge';

// State-Trait Separation Card (placeholder)
export const StateTraitSeparationCard: React.FC<{
  data: any;
  onExportCSV: () => void;
  loading?: boolean;
}> = ({ data, onExportCSV, loading = false }) => {
  const definition = "Separation between state factors (stress, mood) and trait measurements. Higher R² indicates better separation of temporary vs. stable characteristics.";
  
  return (
    <EvidenceKPICard
      title="State-Trait Separation"
      definition={definition}
      value="Coming Soon"
      subtitle="R² Separation"
      badge="Development"
      badgeVariant="secondary"
      onExportCSV={onExportCSV}
      loading={loading}
    >
      <div className="text-sm text-muted-foreground p-4 text-center">
        Advanced psychometric analysis of state vs trait variance components.
      </div>
    </EvidenceKPICard>
  );
};

// Overlay Invariance Card (placeholder)
export const OverlayInvarianceCard: React.FC<{
  data: any;
  onExportCSV: () => void;
  loading?: boolean;
}> = ({ data, onExportCSV, loading = false }) => {
  const definition = "Consistency of type calls across positive (+) and negative (–) overlay states. Lower delta indicates overlay doesn't bias core type assessment.";
  
  return (
    <EvidenceKPICard
      title="Overlay Invariance"
      definition={definition}
      value="Coming Soon"
      subtitle="Δ Fit Stability"
      badge="Development"
      badgeVariant="secondary"
      onExportCSV={onExportCSV}
      loading={loading}
    >
      <div className="text-sm text-muted-foreground p-4 text-center">
        Analysis of type stability across neuroticism overlay conditions.
      </div>
    </EvidenceKPICard>
  );
};

// Dimensionality Reliability Card (placeholder)
export const DimensionalityReliabilityCard: React.FC<{
  data: any;
  onExportCSV: () => void;
  loading?: boolean;
}> = ({ data, onExportCSV, loading = false }) => {
  const definition = "Test-retest reliability of dimensional assessments (1-4D) using Cohen's kappa. Green ≥0.70, Yellow ≥0.60, Red <0.60.";
  
  return (
    <EvidenceKPICard
      title="Dimensionality Reliability"
      definition={definition}
      value="Coming Soon"
      subtitle="Mean κ (Kappa)"
      badge="Development"
      badgeVariant="secondary"
      onExportCSV={onExportCSV}
      loading={loading}
    >
      <div className="text-sm text-muted-foreground p-4 text-center">
        Inter-rater and test-retest reliability of dimensional classifications.
      </div>
    </EvidenceKPICard>
  );
};