import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Download, AlertTriangle, Users, Clock, RefreshCw, Percent, CheckCircle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

  const [recomputeOpen, setRecomputeOpen] = useState(false);
  const [forceAll, setForceAll] = useState(true);
  const [daysBack, setDaysBack] = useState<number | ''>(30);
  const [limit, setLimit] = useState<number | ''>('');
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

  const handleBackfillV11 = async () => {
    toast({
      title: "Backfill Started",
      description: "Running v1.1 backfill for all profiles...",
    });

    try {
      const { data, error } = await supabase.functions.invoke('backfill_rescore_v11');
      
      if (error) {
        toast({
          title: "Backfill Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Backfill Complete",
        description: `Updated ${data.updated}/${data.processed} profiles. Refreshing...`
      });
      
      await refreshData();
      
    } catch (err) {
      toast({
        title: "Backfill Error", 
        description: "Unexpected error during backfill",
        variant: "destructive"
      });
    }
  };

  const handleRecomputeSubmit = async () => {
    toast({
      title: "Recompute Started",
      description: `Running v1.1 recompute ${forceAll ? `(last ${daysBack || 'all'} days)` : '(only missing)'}...`,
    });
    try {
      const body: any = {};
      if (forceAll) body.force_all = true;
      if (daysBack !== '' && Number(daysBack) > 0) body.days_back = Number(daysBack);
      if (limit !== '' && Number(limit) > 0) body.limit = Number(limit);

      const { data, error } = await supabase.functions.invoke('recompute_profiles_v11', { body });
      if (error) {
        toast({ title: "Recompute Failed", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Recompute Complete", description: `Updated ${data.updated}/${data.processed} profiles` });
      setRecomputeOpen(false);
      await refreshData();
    } catch (err) {
      toast({ title: "Recompute Error", description: "Unexpected error during recompute", variant: "destructive" });
    }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="system">System Control</TabsTrigger>
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
            <Button onClick={handleBackfillV11} variant="destructive" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Run v1.1 Backfill
            </Button>
            <Dialog open={recomputeOpen} onOpenChange={setRecomputeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Recompute v1.1
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recompute v1.1 Profiles</DialogTitle>
                  <DialogDescription>Run bulk recompute using the new calibration. Use force-all with days back to target a window.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="force-all">Force all (ignore default filter)</Label>
                    <Switch id="force-all" checked={forceAll} onCheckedChange={setForceAll} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="days-back">Days back</Label>
                      <Input
                        id="days-back"
                        type="number"
                        min={1}
                        placeholder="e.g., 30"
                        value={daysBack}
                        onChange={(e) => setDaysBack(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="limit">Limit (optional)</Label>
                      <Input
                        id="limit"
                        type="number"
                        min={1}
                        placeholder="e.g., 200"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRecomputeOpen(false)}>Cancel</Button>
                  <Button onClick={handleRecomputeSubmit}>Run</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              tooltip="Percentage of assessments with top gap < 3 points (borderline cases requiring careful interpretation)"
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

          {/* Quality Metrics Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Top-1 Fit Median"
                  value={`${qualityData.top1FitMedian.toFixed(1)}`}
                  tooltip="Median fit score for the top type prediction. Higher values indicate better type matches."
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="Top-Gap Median"  
                  value={`${qualityData.topGapMedian.toFixed(1)}`}
                  status={qualityData.topGapMedian < 2.0 ? 'danger' : qualityData.topGapMedian < 3.0 ? 'warning' : 'good'}
                  tooltip="Median gap between top 2 type scores. Target: >3.0 ✅, 2.0-3.0 ⚠️, <2.0 ❌"
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="Confidence Margin"
                  value={`${qualityData.confidenceMarginMedian.toFixed(1)}%`}
                  tooltip="Median confidence margin between top predictions. Higher values indicate more decisive results."
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="Close Calls %"
                  value={`${qualityData.closeCallsPercent.toFixed(1)}%`}
                  status={qualityData.closeCallsPercent > 20 ? 'danger' : qualityData.closeCallsPercent > 10 ? 'warning' : 'good'}
                  tooltip="Percentage of close calls (gap < 3). Target: <10% ✅, 10-20% ⚠️, >20% ❌"
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="Inconsistency Mean"
                  value={`${qualityData.inconsistencyMean.toFixed(2)}`}
                  status={qualityData.inconsistencyMean > 1.5 ? 'danger' : qualityData.inconsistencyMean > 1.0 ? 'warning' : 'good'}
                  tooltip="Mean inconsistency score. Target: <1.0 ✅, 1.0-1.5 ⚠️, >1.5 ❌"
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="SD Index Mean"
                  value={`${qualityData.sdIndexMean.toFixed(2)}`}
                  status={qualityData.sdIndexMean > 4.3 ? 'danger' : qualityData.sdIndexMean > 3.8 ? 'warning' : 'good'}
                  tooltip="Mean social desirability index. Target: <3.8 ✅, 3.8-4.3 ⚠️, >4.3 ❌"
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="Function Balance"
                  value={`${qualityData.funcBalanceMedian.toFixed(1)}`}
                  tooltip="Median function balance across assessments. Higher values indicate more balanced cognitive function usage."
                  onExport={() => exportToCSV('v_quality')}
                />
                
                <KPICard
                  title="Validity Pass Rate"
                  value={`${kpiData.validityPassRate.toFixed(1)}%`}
                  status={getValidityStatus(kpiData.validityPassRate)}
                  tooltip="Percentage passing validity checks. Target: >85% ✅, 70-84% ⚠️, <70% ❌"
                  onExport={() => exportToCSV('v_validity')}
                />
              </div>
            </CardContent>
          </Card>

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

          {/* Latest Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <LatestAssessmentsTable />
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

        <TabsContent value="system" className="space-y-6">
          {/* System Control Content */}
          <SystemStatusControl />
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