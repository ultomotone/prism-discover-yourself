import React, { useEffect, useState } from "react";
import { useAdvancedAdminAnalytics } from "@/hooks/useAdvancedAdminAnalytics";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { KPICard } from "@/components/admin/KPICard";
import { QualityPanel } from "@/components/admin/QualityPanel";
import { ChartsSection } from "@/components/admin/ChartsSection";
import { MethodHealthSection } from "@/components/admin/MethodHealthSection";
import { EvidenceTab } from "@/components/admin/evidence/EvidenceTab";
import { SystemStatusControl } from "@/components/admin/SystemStatusControl";
import { LatestAssessmentsTable } from "@/components/admin/LatestAssessmentsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import AdminControls from "@/components/admin/AdminControls";
import {
  fetchEvidenceKpis,
  fetchDashboardSnapshot,
  refreshDashboardStats,
  refreshEvidenceKpis,
} from "@/lib/api/admin";

const Admin: React.FC = () => {
  const {
    filters,
    setFilters,
    kpiData,
    qualityData,
    chartData,
    methodHealthData,
    latestAssessments,
    loading,
    refreshData,
    exportToCSV,
    error,
  } = useAdvancedAdminAnalytics();

  const { toast } = useToast();

  // Evidence + snapshot state (for the top tiles & buttons)
  const [kpis, setKpis] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    setBusy(true);
    setErr(null);
    try {
      const [k, s] = await Promise.all([
        fetchEvidenceKpis(),
        fetchDashboardSnapshot(),
      ]);
      setKpis(k);
      setSnapshot(s);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onRefreshSnapshotClick() {
    setBusy(true);
    setErr(null);
    try {
      await refreshDashboardStats();
      await loadAll();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onRefreshKpisClick() {
    setBusy(true);
    setErr(null);
    try {
      await refreshEvidenceKpis();
      await loadAll();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const getCompletionRateStatus = (value: number) => {
    if (value >= 85) return "good";
    if (value >= 70) return "warning";
    return "danger";
  };

  const getValidityStatus = (value: number) => {
    if (value >= 85) return "good";
    if (value >= 70) return "warning";
    return "danger";
  };

  const getDuplicatesStatus = (value: number) => {
    if (value <= 5) return "good";
    if (value <= 15) return "warning";
    return "danger";
  };

  const handleExportAll = async () => {
    toast({
      title: "Export Started",
      description: "Exporting all data views. This may take a moment...",
    });

    try {
      await Promise.all([
        exportToCSV("v_sessions"),
        exportToCSV("v_quality"),
        exportToCSV("v_fit_ranks"),
        exportToCSV("v_conf_dist"),
        exportToCSV("v_overlay_conf"),
        exportToCSV("v_kpi_throughput"),
        exportToCSV("v_fc_coverage"),
        exportToCSV("v_share_entropy"),
        exportToCSV("v_dim_coverage"),
        exportToCSV("v_section_times"),
      ]);

      toast({
        title: "Export Complete",
        description: "All data has been exported successfully.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Some exports may have failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Assessment analytics, health monitoring, and evidence metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefreshSnapshotClick} disabled={busy}>
            Refresh Snapshot
          </Button>
          <Button onClick={onRefreshKpisClick} disabled={busy}>
            Refresh KPIs
          </Button>
        </div>
      </div>

      {(error || err) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load analytics</AlertTitle>
          <AlertDescription>{error || err}</AlertDescription>
        </Alert>
      )}

      {/* Top quick tiles (snapshot + evidence) */}
      {snapshot && kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot?.total_assessments ?? 0}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test–Retest Reliability (r)</CardTitle>
            </CardHeader>
            <CardContent>
              {kpis?.r_overall != null ? Number(kpis.r_overall).toFixed(3) : "—"}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="system">System Control</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        {/* Health Monitor */}
        <TabsContent value="health" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button onClick={handleExportAll} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <AdminControls />
          </div>

          <AdminFilters
            filters={filters}
            onFiltersChange={setFilters}
            onRefresh={refreshData}
            loading={loading}
          />

          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <KPICard
              title="Top Gap Median"
              value={`${qualityData.topGapMedian.toFixed(1)}`}
              tooltip="Median gap between top 2 type scores (fit difference). Higher values indicate clearer type distinctions."
              onExport={() => exportToCSV('v_quality')}
            />
            <KPICard
              title="Confidence Margin"
              value={`${qualityData.confidenceMarginMedian.toFixed(1)}%`}
              tooltip="Median P1-P2 probability difference (confidence margin). Higher values indicate more confident type assignments."
              onExport={() => exportToCSV('v_quality')}
            />
            <KPICard
              title="Close Calls"
              value={`${qualityData.closeCallsPercent.toFixed(1)}%`}
              subtitle="Gap < 3"
              tooltip="Percentage of assessments with top gap < 3 points (borderline cases)"
              onExport={() => exportToCSV('v_quality')}
            />
            <KPICard
              title="Completions"
              value={kpiData.completions.toLocaleString()}
              tooltip="Total number of completed assessments in the selected time period"
              onExport={() => exportToCSV('v_sessions')}
            />
            <KPICard
              title="Completion Rate"
              value={`${kpiData.completionRate.toFixed(1)}%`}
              status={getCompletionRateStatus(kpiData.completionRate)}
              tooltip="Percentage of started sessions that were completed."
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            <KPICard
              title="Median Duration"
              value={`${kpiData.medianDuration.toFixed(1)}m`}
              tooltip="Median time to complete assessment."
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            <KPICard
              title="Speeders"
              value={`${kpiData.speedersPercent.toFixed(1)}%`}
              subtitle="< 12 min"
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            <KPICard
              title="Stallers"
              value={`${kpiData.stallersPercent.toFixed(1)}%`}
              subtitle="> 60 min"
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            <KPICard
              title="Duplicates"
              value={`${kpiData.duplicatesPercent.toFixed(1)}%`}
              status={getDuplicatesStatus(kpiData.duplicatesPercent)}
              onExport={() => exportToCSV('v_duplicates')}
            />
            <KPICard
              title="Validity Pass"
              value={`${kpiData.validityPassRate.toFixed(1)}%`}
              status={getValidityStatus(kpiData.validityPassRate)}
              onExport={() => exportToCSV('v_validity')}
            />
          </div>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <QualityPanel qualityData={qualityData} exportToCSV={exportToCSV} />
            </CardContent>
          </Card>

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartsSection data={chartData} onExport={exportToCSV} />
            </CardContent>
          </Card>

          {/* Latest Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <LatestAssessmentsTable data={latestAssessments} />
            </CardContent>
          </Card>

          {/* Method Health */}
          <Card>
            <CardHeader>
              <CardTitle>Method Health</CardTitle>
            </CardHeader>
            <CardContent>
              <MethodHealthSection data={methodHealthData} onExport={exportToCSV} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Control */}
        <TabsContent value="system" className="space-y-6">
          <SystemStatusControl />
        </TabsContent>

        {/* Evidence */}
        <TabsContent value="evidence">
          <EvidenceTab />
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {(loading || busy) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <div>
                <h3 className="font-medium">Loading Analytics</h3>
                <p className="text-sm text-muted-foreground">Fetching assessment health data...</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hidden debug to avoid unused warnings */}
      <pre className="hidden">{JSON.stringify({ kpis, snapshot })}</pre>
    </div>
  );
};

export default Admin;
