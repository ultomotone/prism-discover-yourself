// Stub for backward compatibility with existing Evidence tab components
// New dashboard uses useAssessmentKpis instead

export interface EvidenceFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  overlay?: string;
  confidence?: string;
  type?: string;
}

export interface TestRetestReliabilityData {
  overallR: number;
  n: number;
  medianDaysApart: number;
  sparklineData: Array<{ date: string; r: number }>;
}

export interface TypeStabilityData {
  stabilityPercent: number;
  adjacentFlipPercent: number;
  n: number;
}

export interface ConfidenceCalibrationData {
  high: {
    hitRate: number;
    n: number;
  };
  moderate: {
    hitRate: number;
    n: number;
  };
  low: {
    hitRate: number;
    n: number;
  };
}

export interface MethodAgreementData {
  overall: number;
  n: number;
  functions: {
    [key: string]: number;
  };
}

export const useEvidenceAnalytics = (filters: EvidenceFilters) => {
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};
