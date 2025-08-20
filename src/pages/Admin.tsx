import React from "react";
import { useAdvancedAdminAnalytics } from "@/hooks/useAdvancedAdminAnalytics";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { KPICard } from "@/components/admin/KPICard";
import { QualityPanel } from "@/components/admin/QualityPanel";
import { ChartsSection } from "@/components/admin/ChartsSection";
import { MethodHealthSection } from "@/components/admin/MethodHealthSection";
import { EvidenceTab } from "@/components/admin/evidence/EvidenceTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, AlertTriangle, Users, Clock, RefreshCw, Percent, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { manualRescoreLatest } from "@/utils/manualRescore";

const Admin: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    kpiData, 
    qualityData,
    chartData, 
    methodHealthData,
    loading, 
    refreshData,
    exportToCSV
  } = useAdvancedAdminAnalytics();

  const { toast } = useToast();

  const getCompletionRateStatus = (value: number) => {
    if (value >= 85) return 'good';
    if (value >= 70) return 'warning';
    return 'danger';
  };

  const getValidityStatus = (value: number) => {
    if (value >= 85) return 'good';
    if (value >= 70) return 'warning';
    return 'danger';
  };

  const getDuplicatesStatus = (value: number) => {
    if (value <= 5) return 'good';
    if (value <= 15) return 'warning';
    return 'danger';
  };

  const handleExportAll = async () => {
    toast({
      title: "Export Started",
      description: "Exporting all data views. This may take a moment...",
    });

    try {
      await Promise.all([
        exportToCSV('v_sessions'),
        exportToCSV('v_quality'),
        exportToCSV('v_fit_ranks'),
        exportToCSV('v_conf_dist'),
        exportToCSV('v_overlay_conf'),
        exportToCSV('v_throughput'),
        exportToCSV('v_fc_coverage'),
        exportToCSV('v_share_entropy'),
        exportToCSV('v_dim_coverage'),
        exportToCSV('v_section_times')
      ]);

      toast({
        title: "Export Complete",
        description: "All data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Some exports may have failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRescoreLatest = async () => {
    toast({
      title: "Rescoring Started",
      description: "Updating latest fit scores (v1.1)...",
    });

    const result = await manualRescoreLatest(50);
    if ('error' in result && result.error) {
      toast({ title: "Rescore Failed", description: `${result.error}`, variant: "destructive" });
      return;
    }

    toast({ title: "Rescore Complete", description: 'Refreshing analytics...' });
    await refreshData();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Assessment analytics, health monitoring, and evidence metrics</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="health" className="space-y-6">
          {/* Health Monitor Content */}
          <div className="flex justify-end gap-2">
            <Button onClick={handleExportAll} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button onClick={refreshData} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleRescoreLatest} variant="secondary" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Rescore Latest
            </Button>
          </div>

          {/* Filters */}
          <AdminFilters
            filters={filters}
            onFiltersChange={setFilters}
            onRefresh={refreshData}
            loading={loading}
          />

          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
              tooltip="Percentage of started sessions that were completed. Target: >85% ✅, 70-84% ⚠️, <70% ❌"
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            
            <KPICard
              title="Median Duration"
              value={`${kpiData.medianDuration.toFixed(1)}m`}
              tooltip="Median time to complete assessment. Excludes paused/abandoned sessions"
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            
            <KPICard
              title="Speeders"
              value={`${kpiData.speedersPercent.toFixed(1)}%`}
              subtitle="< 12 min"
              tooltip="Percentage of sessions completed in under 12 minutes (potential rushed responses)"
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            
            <KPICard
              title="Stallers"
              value={`${kpiData.stallersPercent.toFixed(1)}%`}
              subtitle="> 60 min"
              tooltip="Percentage of sessions taking over 60 minutes (potential distraction/multi-tasking)"
              onExport={() => exportToCSV('v_sessions_plus')}
            />
            
            <KPICard
              title="Duplicates"
              value={`${kpiData.duplicatesPercent.toFixed(1)}%`}
              status={getDuplicatesStatus(kpiData.duplicatesPercent)}
              tooltip="Percentage of users with multiple sessions. Target: <5% ✅, 5-15% ⚠️, >15% ❌"
              onExport={() => exportToCSV('v_duplicates')}
            />
            
            <KPICard
              title="Validity Pass"
              value={`${kpiData.validityPassRate.toFixed(1)}%`}
              status={getValidityStatus(kpiData.validityPassRate)}
              tooltip="Sessions passing validity checks (inconsistency <1.0 AND SD index <4.3). Target: >85% ✅"
              onExport={() => exportToCSV('v_validity')}
            />
          </div>

          {/* Quality Panel */}
          <QualityPanel 
            data={qualityData} 
            onExport={exportToCSV}
          />

          {/* Charts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartsSection 
                data={chartData} 
                onExport={exportToCSV}
              />
            </CardContent>
          </Card>

          {/* Method Health */}
          <Card>
            <CardHeader>
              <CardTitle>Method Health</CardTitle>
            </CardHeader>
            <CardContent>
              <MethodHealthSection 
                data={methodHealthData} 
                onExport={exportToCSV}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <EvidenceTab />
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {loading && (
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
    </div>
  );
};

export default Admin;