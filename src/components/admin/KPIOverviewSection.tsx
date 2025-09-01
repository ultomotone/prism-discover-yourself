import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle } from "lucide-react";

interface KPIOverviewData {
  started_count: number;
  completed_count: number;
  completion_rate_pct: number;
  hi_mod_conf_pct: number;
  avg_fit_score: number;
  overlay_positive: number;
  overlay_negative: number;
}

interface DiagnosticsData {
  started_count: number;
  completed_count: number;
  completion_rate_pct: number;
  hi_mod_conf_pct: number;
  fit_spread: {
    n: number;
    min_val: number;
    max_val: number;
    sd: number;
  };
}

const formatValue = (value: any, suffix: string = ""): string => {
  if (value === null || value === undefined || !isFinite(value) || isNaN(value)) {
    return "—";
  }
  // Clamp percentages to reasonable bounds
  if (suffix === "%" && value > 100) {
    return "100%";
  }
  if (suffix === "%" && value < 0) {
    return "0%";
  }
  return `${Math.round(value)}${suffix}`;
};

const formatDecimal = (value: any, decimals: number = 1): string => {
  if (value === null || value === undefined || !isFinite(value) || isNaN(value)) {
    return "—";
  }
  return value.toFixed(decimals);
};

export const KPIOverviewSection = () => {
  const [kpiData, setKpiData] = useState<KPIOverviewData | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      
      // Get KPI overview data using the new v1.1 view - force no cache
      const resp = await fetch("/api/admin/v_kpi_overview_30d_v11", { headers: { "Cache-Control": "no-store" }});
      const kpiOverview = await resp.json();

      if (kpiOverview) {
        setKpiData(kpiOverview);

        // Get fit spread for diagnostics - use calibrated fits only
        const fitResp = await fetch("/api/admin/v_latest_assessments_v11", { headers: { "Cache-Control": "no-store" }});
        const fitSpread = await fitResp.json();

        if (fitSpread && fitSpread.length > 0) {
          const values = fitSpread.map((f:any) => f.fit_value).filter((v:any) => v !== null);
          const n = values.length;
          const min_val = Math.min(...values);
          const max_val = Math.max(...values);
          const mean = values.reduce((sum, v) => sum + v, 0) / n;
          const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
          const sd = Math.sqrt(variance);

          setDiagnostics({
            started_count: kpiOverview.started_count,
            completed_count: kpiOverview.completed_count,
            completion_rate_pct: 0, // Remove completion rate
            hi_mod_conf_pct: 0, // Remove hi/mod confidence
            fit_spread: { n, min_val, max_val, sd }
          });
        }

        // Verification log for v1.1 data source
        console.info('Admin v1.1 data source OK', {
          completedCount: kpiOverview.completed_count,
          avgFitScore: kpiOverview.avg_fit_score,
          fitSpread: fitSpread ? {
            count: fitSpread.length,
            sample: fitSpread.slice(0, 5).map(f => f.fit_value)
          } : 'no data'
        });

        // Warn about unexpected fit ranges
        if (fitSpread) {
          const outOfRange = fitSpread.filter(f => 
            f.fit_value && (f.fit_value > 95 || f.fit_value < 10)
          );
          if (outOfRange.length > 0) {
            console.warn('Unexpected range — check calibration or source', {
              outOfRangeCount: outOfRange.length,
              sample: outOfRange.slice(0, 3).map(f => f.fit_value)
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Unable to load KPI data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      {/* KPI Cards - Only show Total Assessments and Average Fit Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <KPICard
          title="Total Assessments"
          value={formatValue(kpiData.completed_count)}
          subtitle="ⓘ last 30 days"
          tooltip="Total number of completed assessments in the last 30 days"
        />

        <KPICard
          title="Average Fit Score"
          value={formatValue(kpiData.avg_fit_score, "%")}
          subtitle="ⓘ v1.1 calibrated"
          tooltip="Average calibrated fit score from v1.1 results only"
          status={
            kpiData.avg_fit_score >= 60 ? 'good' :
            kpiData.avg_fit_score >= 45 ? 'warning' : 'danger'
          }
        />
      </div>

      {/* Diagnostics Section */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Admin Diagnostics
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Started Count</p>
                  <p className="font-mono">{diagnostics?.started_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed Count</p>
                  <p className="font-mono">{diagnostics?.completed_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Started Count</p>
                  <p className="font-mono">{diagnostics?.started_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed Count</p>
                  <p className="font-mono">{diagnostics?.completed_count || 0}</p>
                </div>
              </div>
              
              {diagnostics?.fit_spread && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Fit Score Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Count</p>
                      <p className="font-mono">{diagnostics.fit_spread.n}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min</p>
                      <p className="font-mono">{formatDecimal(diagnostics.fit_spread.min_val)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max</p>
                      <p className="font-mono">{formatDecimal(diagnostics.fit_spread.max_val)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Std Dev</p>
                      <p className="font-mono">{formatDecimal(diagnostics.fit_spread.sd)}</p>
                      {diagnostics.fit_spread.sd < 3 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Low variance
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};