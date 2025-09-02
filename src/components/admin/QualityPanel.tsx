import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";

interface QualityData {
  top1FitMedian: number;
  topGapMedian: number;
  closeCallsPercent: number;
  inconsistencyMean: number;
  sdIndexMean: number;
  confidenceMarginMedian: number;
  validityPassRate: number;
}

interface QualityPanelProps {
  data: QualityData;
  onExport: (viewName: string) => void;
}

export const QualityPanel: React.FC<QualityPanelProps> = ({ data, onExport }) => {
  const getTopGapStatus = (value: number) => {
    if (value >= 5) return 'good';
    if (value >= 3) return 'warning';
    return 'danger';
  };

  const getCloseCallsStatus = (value: number) => {
    if (value < 25) return 'good';
    if (value <= 40) return 'warning';
    return 'danger';
  };

  const getValidityStatus = (value: number, threshold: number) => {
    return value < threshold ? 'good' : 'warning';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Top-1 Fit Median"
            value={data.top1FitMedian.toFixed(1)}
            tooltip="Median absolute fit (0–100) of best-matching type across all sessions"
            onExport={() => onExport('v_fit_ranks')}
          />
          
          <KPICard
            title="Top-Gap Median"
            value={data.topGapMedian.toFixed(1)}
            status={getTopGapStatus(data.topGapMedian)}
            tooltip="Median difference between Top-1 and Top-2 fit scores. Higher gap = clearer type determination"
            onExport={() => onExport('v_fit_ranks')}
          />
          
          <KPICard
            title="Confidence Margin"
            value={`${data.confidenceMarginMedian.toFixed(1)}%`}
            tooltip="Median P1-P2 probability difference. Higher values indicate more confident type assignments"
            onExport={() => onExport('v_quality')}
          />
          
          <KPICard
            title="Close Calls %"
            value={`${data.closeCallsPercent.toFixed(1)}%`}
            status={getCloseCallsStatus(data.closeCallsPercent)}
            tooltip="Percentage of sessions with Top-Gap < 3. Lower is better for type clarity"
            onExport={() => onExport('v_quality')}
          />
          
          <KPICard
            title="Inconsistency Mean"
            value={data.inconsistencyMean.toFixed(2)}
            status={getValidityStatus(data.inconsistencyMean, 1.0)}
            tooltip="Average inconsistency score. Target: < 1.0 for good response consistency"
            onExport={() => onExport('v_quality')}
          />
          
          <KPICard
            title="SD Index Mean"
            value={data.sdIndexMean.toFixed(2)}
            status={getValidityStatus(data.sdIndexMean, 4.3)}
            tooltip="Average social desirability index. Target: < 4.3 to minimize bias"
            onExport={() => onExport('v_quality')}
          />
          
          <KPICard
            title="Validity Pass Rate"
            value={`${data.validityPassRate.toFixed(1)}%`}
            status={data.validityPassRate >= 85 ? 'good' : data.validityPassRate >= 70 ? 'warning' : 'danger'}
            tooltip="Percentage of sessions passing v1.1 validity checks. Target: >85%"
            onExport={() => onExport('v_validity')}
          />
        </div>
      </CardContent>
    </Card>
  );
};