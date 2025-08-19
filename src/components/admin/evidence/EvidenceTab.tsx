import React, { useState } from 'react';
import { useEvidenceAnalytics, type EvidenceFilters } from '@/hooks/useEvidenceAnalytics';
import { TestRetestReliabilityCard } from './TestRetestReliabilityCard';
import { TypeStabilityCard } from './TypeStabilityCard';
import { ConfidenceCalibrationCard } from './ConfidenceCalibrationCard';
import { MethodAgreementCard } from './MethodAgreementCard';
import { AdminFilters } from '../AdminFilters';
import { useToast } from '@/hooks/use-toast';

export const EvidenceTab: React.FC = () => {
  const { toast } = useToast();
  const [adminFilters, setAdminFilters] = useState({
    dateRange: { preset: '30d' },
    overlay: 'all',
    confidence: 'all',
    primaryType: 'all',
    device: 'all'
  });

  // Convert admin filters to evidence filters
  const filters: EvidenceFilters = {
    dateRange: {
      from: (() => {
        const now = new Date();
        switch (adminFilters.dateRange.preset) {
          case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      })(),
      to: new Date()
    },
    overlay: adminFilters.overlay === 'all' ? undefined : adminFilters.overlay,
    confidence: adminFilters.confidence === 'all' ? undefined : adminFilters.confidence,
    type: adminFilters.primaryType === 'all' ? undefined : adminFilters.primaryType
  };

  const { data, loading, error, refetch } = useEvidenceAnalytics(filters);

  const handleFiltersChange = (newFilters: any) => {
    setAdminFilters(newFilters);
  };

  const exportToCSV = (dataArray: any[], filename: string) => {
    if (!dataArray || dataArray.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available for this metric.",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(dataArray[0]);
    const csvContent = [
      headers.join(','),
      ...dataArray.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exported",
      description: `${filename} data has been downloaded.`
    });
  };

  const handleTestRetestCSV = () => {
    if (data.testRetestReliability) {
      exportToCSV(
        data.testRetestReliability.sparklineData,
        'test-retest-reliability'
      );
    }
  };

  const handleTypeStabilityCSV = () => {
    if (data.typeStability) {
      exportToCSV(
        [
          { metric: 'stability_percent', value: data.typeStability.stabilityPercent, n: data.typeStability.n },
          { metric: 'adjacent_flip_percent', value: data.typeStability.adjacentFlipPercent, n: data.typeStability.n }
        ],
        'type-stability'
      );
    }
  };

  const handleConfidenceCalibrationCSV = () => {
    if (data.confidenceCalibration) {
      exportToCSV(
        [
          { confidence_bin: 'High', hit_rate: data.confidenceCalibration.high.hitRate, n: data.confidenceCalibration.high.n },
          { confidence_bin: 'Moderate', hit_rate: data.confidenceCalibration.moderate.hitRate, n: data.confidenceCalibration.moderate.n },
          { confidence_bin: 'Low', hit_rate: data.confidenceCalibration.low.hitRate, n: data.confidenceCalibration.low.n }
        ],
        'confidence-calibration'
      );
    }
  };

  const handleMethodAgreementCSV = () => {
    if (data.methodAgreement) {
      exportToCSV(
        Object.entries(data.methodAgreement.functions).map(([func, correlation]) => ({
          function: func,
          correlation
        })),
        'method-agreement'
      );
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading evidence data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Evidence Dashboard</h2>
        <p className="text-muted-foreground">
          KPIs designed to demonstrate PRISM's strengths vs other theories
        </p>
      </div>

      {/* Filters */}
      <AdminFilters 
        filters={adminFilters}
        onFiltersChange={handleFiltersChange}
        onRefresh={refetch}
        loading={loading}
      />

      {/* KPI Cards Layout */}
      <div className="space-y-6">
        
        {/* Row 1: Reliability & Type Stability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TestRetestReliabilityCard 
            data={data.testRetestReliability}
            onExportCSV={handleTestRetestCSV}
            loading={loading}
          />
          <TypeStabilityCard 
            data={data.typeStability}
            onExportCSV={handleTypeStabilityCSV}
            loading={loading}
          />
        </div>

        {/* Row 2: Confidence Calibration & Method Agreement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConfidenceCalibrationCard 
            data={data.confidenceCalibration}
            onExportCSV={handleConfidenceCalibrationCSV}
            loading={loading}
          />
          <MethodAgreementCard 
            data={data.methodAgreement}
            onExportCSV={handleMethodAgreementCSV}
            loading={loading}
          />
        </div>

        {/* Placeholder cards for remaining KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-muted/10 border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="text-muted-foreground">State-Trait Separation</div>
            <div className="text-sm text-muted-foreground mt-2">Coming soon</div>
          </div>
          <div className="bg-muted/10 border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="text-muted-foreground">Overlay Invariance</div>
            <div className="text-sm text-muted-foreground mt-2">Coming soon</div>
          </div>
          <div className="bg-muted/10 border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="text-muted-foreground">Dimensionality Reliability</div>
            <div className="text-sm text-muted-foreground mt-2">Coming soon</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-muted/10 border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="text-muted-foreground">Type Distinctiveness</div>
            <div className="text-sm text-muted-foreground mt-2">Coming soon</div>
          </div>
          <div className="bg-muted/10 border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="text-muted-foreground">Fairness Audit</div>
            <div className="text-sm text-muted-foreground mt-2">Coming soon</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-muted/10 border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="text-muted-foreground">Close-Call Resolution & Method Health</div>
            <div className="text-sm text-muted-foreground mt-2">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};