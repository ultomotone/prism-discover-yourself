import { useState } from "react";
import { useAssessmentKpis } from "@/hooks/useAssessmentKpis";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ItemFlagsTable } from "@/components/analytics/ItemFlagsTable";
import { Activity, CheckCircle, TrendingUp, Users, Brain, Target, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subYears, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

type TimePeriod = 'lifetime' | '7d' | '30d' | '60d' | '90d' | '1y';

const AssessmentAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('lifetime');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '60d':
        startDate = subDays(endDate, 60);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      case '1y':
        startDate = subYears(endDate, 1);
        break;
      case 'lifetime':
      default:
        startDate = new Date('2020-01-01'); // Far back date for lifetime
        break;
    }
    
    return { startDate, endDate };
  };
  
  const { data, isLoading, error, refetch } = useAssessmentKpis(getDateRange());
  
  const engagementData = data?.engagement || [];
  const reliabilityData = data?.reliability || [];
  const userExperienceData = data?.userExperience || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading analytics</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalStarted: 0,
    totalCompleted: 0,
    completionRate: 0,
    avgTopGap: 0,
    avgConfidence: 0,
    avgNPS: 0,
    avgClarity: 0,
    avgDropOffRate: 0,
    avgEngagementRating: 0,
    constructCoverageIndex: 0,
    difFlagRate: 0,
    calibrationError: 0,
    classificationStabilityRate: 0,
    freeToPaidRate: 0,
  };

  const alerts = data?.alerts || [];

  const handleRecomputeAnalytics = async () => {
    setIsRefreshing(true);
    try {
      toast({
        title: "Refreshing Analytics",
        description: "Recomputing all materialized views...",
      });

      const { data: result, error } = await supabase.rpc("refresh_all_materialized_views");

      if (error) throw error;

      // Invalidate React Query cache and force refetch
      await queryClient.invalidateQueries({ queryKey: ["assessment-kpis"] });
      await refetch();

      setLastRefresh(new Date());

      const refreshResult = result as any;
      toast({
        title: "Analytics Refreshed",
        description: `Successfully refreshed ${refreshResult?.refreshed_count || 0} views in ${refreshResult?.duration_ms?.toFixed(0) || 0}ms`,
      });
    } catch (error: any) {
      console.error("Refresh error:", error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh analytics",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewLogs = async () => {
    setLoadingLogs(true);
    setLogsOpen(true);
    try {
      const { data: logData, error } = await supabase.rpc("get_recent_database_logs", {
        log_level: "error",
        limit_count: 50,
      });

      if (error) throw error;

      setLogs((logData as any[]) || []);
    } catch (error: any) {
      console.error("Logs error:", error);
      toast({
        title: "Failed to Load Logs",
        description: error.message,
        variant: "destructive",
      });
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;

    const csvRows = [];
    
    // Header
    csvRows.push(['Assessment Analytics Report']);
    csvRows.push([`Period: ${timePeriod === 'lifetime' ? 'All Time' : timePeriod}`]);
    csvRows.push([`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`]);
    csvRows.push([]);
    
    // Summary metrics
    csvRows.push(['Summary Metrics']);
    csvRows.push(['Metric', 'Value']);
    csvRows.push(['Total Sessions Started', summary.totalStarted]);
    csvRows.push(['Total Sessions Completed', summary.totalCompleted]);
    csvRows.push(['Completion Rate', `${summary.completionRate.toFixed(1)}%`]);
    csvRows.push(['Average Top Gap', summary.avgTopGap.toFixed(2)]);
    csvRows.push(['Average Confidence', summary.avgConfidence.toFixed(2)]);
    csvRows.push(['Average NPS', summary.avgNPS.toFixed(1)]);
    csvRows.push(['Average Clarity', summary.avgClarity.toFixed(1)]);
    csvRows.push(['Average Drop-off Rate', `${summary.avgDropOffRate.toFixed(1)}%`]);
    csvRows.push(['Average Engagement Rating', summary.avgEngagementRating.toFixed(1)]);
    csvRows.push([]);
    
    // Session metrics by day
    if (data.sessions && data.sessions.length > 0) {
      csvRows.push(['Daily Session Metrics']);
      csvRows.push(['Date', 'Sessions Started', 'Sessions Completed', 'Completion Rate %']);
      data.sessions.forEach((s: any) => {
        csvRows.push([
          format(new Date(s.day), 'yyyy-MM-dd'),
          s.sessions_started || 0,
          s.sessions_completed || 0,
          s.completion_rate_pct || 0
        ]);
      });
      csvRows.push([]);
    }
    
    // Item flags
    if (data.itemFlags && data.itemFlags.length > 0) {
      csvRows.push(['Top Flagged Items']);
      csvRows.push(['Question ID', 'Flag Count', 'Session Count', 'Flag Rate']);
      data.itemFlags.slice(0, 20).forEach((item: any) => {
        csvRows.push([
          item.question_id,
          item.flag_count,
          item.session_count,
          (item.flag_rate * 100).toFixed(2) + '%'
        ]);
      });
      csvRows.push([]);
    }
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `assessment-analytics-${timePeriod}-${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Downloaded",
      description: "Analytics data has been exported successfully",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {isRefreshing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Refreshing Analytics...</p>
            <p className="text-sm text-muted-foreground">This may take a few seconds</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assessment Analytics Dashboard</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <p>Standards-aligned metrics (APA/AERA/NCME)</p>
              <span className="text-xs">• Updated: {new Date().toLocaleTimeString()}</span>
              {lastRefresh && (
                <span className="text-xs">• Last refresh: {lastRefresh.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            disabled={isLoading || !data}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
        
        {/* Time Period Filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-muted-foreground">Period:</span>
          <div className="flex gap-1">
            <Button
              variant={timePeriod === 'lifetime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('lifetime')}
            >
              All Time
            </Button>
            <Button
              variant={timePeriod === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={timePeriod === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('30d')}
            >
              30 Days
            </Button>
            <Button
              variant={timePeriod === '60d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('60d')}
            >
              60 Days
            </Button>
            <Button
              variant={timePeriod === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('90d')}
            >
              90 Days
            </Button>
            <Button
              variant={timePeriod === '1y' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('1y')}
            >
              1 Year
            </Button>
          </div>
        </div>
        
        {alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <div key={alert} className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                {alert}
              </div>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement & Flow</TabsTrigger>
          <TabsTrigger value="quality">Content Quality</TabsTrigger>
          <TabsTrigger value="psychometrics">Psychometrics</TabsTrigger>
          <TabsTrigger value="fairness">Fairness & Calibration</TabsTrigger>
          <TabsTrigger value="feedback">User Experience</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Header KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Sessions Started"
              value={summary.totalStarted}
              icon={Users}
              description="Assessment sessions initiated"
            />
            <MetricCard
              title="Sessions Completed"
              value={summary.totalCompleted}
              icon={CheckCircle}
              description="Successfully finished assessments"
            />
            <MetricCard
              title="Completion Rate"
              value={`${summary.completionRate.toFixed(1)}%`}
              icon={TrendingUp}
              description="Percentage of started sessions completed"
            />
            <MetricCard
              title="Avg Top Gap"
              value={summary.avgTopGap.toFixed(2)}
              icon={Target}
              description="Type differentiation strength"
            />
          </div>

          {/* Scoring Health */}
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Avg Confidence"
              value={`${(summary.avgConfidence * 100).toFixed(1)}%`}
              icon={Brain}
              description="Calibrated confidence margin"
            />
            <MetricCard
              title="Drop-off Rate"
              value={`${summary.avgDropOffRate.toFixed(1)}%`}
              icon={Activity}
              description="% who started but didn't complete"
            />
            <MetricCard
              title="Construct Coverage"
              value={`${(summary.constructCoverageIndex * 100).toFixed(0)}%`}
              icon={Target}
              description="Scales with α ≥ .70"
            />
            <MetricCard
              title="Classification Stability"
              value={`${summary.classificationStabilityRate.toFixed(0)}%`}
              icon={CheckCircle}
              description="Retest type consistency"
            />
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement & Flow Metrics</CardTitle>
              <CardDescription>Track user completion patterns and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Drop-off Rate</p>
                  <p className="text-2xl font-bold">{summary.avgDropOffRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Target: ≤25%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Median Completion Time</p>
                  <p className="text-2xl font-bold">
                    {engagementData.length > 0 && engagementData[0]?.avg_completion_sec 
                      ? `${(engagementData[0].avg_completion_sec / 60).toFixed(0)} min` 
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {engagementData.length > 0 && engagementData[0]?.avg_completion_sec 
                      ? `Real-time estimate (excludes outliers)`
                      : 'Expected: 15-25 min'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Engagement Rating</p>
                  <p className="text-2xl font-bold">{summary.avgEngagementRating.toFixed(1)}/5</p>
                  <p className="text-xs text-muted-foreground">Ease of focus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <ItemFlagsTable items={data?.itemFlags || []} />
          
          <Card>
            <CardHeader>
              <CardTitle>Item Analysis Guidelines</CardTitle>
              <CardDescription>
                Standards-based thresholds for item quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="font-medium">High Risk (&gt;10%):</span>
                <span className="text-muted-foreground">Immediate review required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="font-medium">Moderate Risk (5-10%):</span>
                <span className="text-muted-foreground">Monitor and consider revision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="font-medium">Acceptable (&lt;5%):</span>
                <span className="text-muted-foreground">Within normal range</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="psychometrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reliability Metrics</CardTitle>
              <CardDescription>
                Internal consistency across scales (Target: α ≥ .70, ω ≥ .70)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reliabilityData.length === 0 || !reliabilityData[0]?.scale_id ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No reliability data available yet</p>
                  <p className="text-sm text-muted-foreground">
                    Test-retest data requires users to complete the assessment multiple times
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reliabilityData.map((rel: any, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{rel.scale_id || 'Test-Retest'}</span>
                      <div className="flex gap-4 text-sm">
                        {rel.cronbach_alpha && (
                          <span>α: {rel.cronbach_alpha.toFixed(3)}</span>
                        )}
                        {rel.mcdonald_omega && (
                          <span>ω: {rel.mcdonald_omega.toFixed(3)}</span>
                        )}
                        {rel.split_half_corr && (
                          <span>r: {rel.split_half_corr.toFixed(3)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Psychometric Standards Reference</CardTitle>
              <CardDescription>APA/AERA/NCME Standards alignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Reliability Targets</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Cronbach's α ≥ .70 (adequate), ≥ .80 (good)</li>
                  <li>McDonald's ω ≥ .70 (model-based reliability)</li>
                  <li>Test-retest r ≥ .70 over 2-6 weeks</li>
                  <li>Split-half reliability ≥ .70</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Validity Evidence</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>CFA fit: CFI/TLI ≥ .90, RMSEA ≤ .08, SRMR ≤ .08</li>
                  <li>Item discrimination (rpb): r ≥ .20</li>
                  <li>Factor loadings: ≥ .40</li>
                  <li>Measurement invariance: ΔCFI ≤ .01</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fairness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fairness & Calibration</CardTitle>
              <CardDescription>Bias detection and prediction calibration metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">DIF Flag Rate</p>
                  <p className="text-2xl font-bold">{summary.difFlagRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Target: ≤10% items flagged</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calibration Error (ECE)</p>
                  <p className="text-2xl font-bold">{summary.calibrationError.toFixed(3)}</p>
                  <p className="text-xs text-muted-foreground">Target: &lt;0.05</p>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2">Fairness Standards</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>DIF detection: Mantel-Haenszel χ² or IRT-based</li>
                  <li>Adverse impact: 80% rule (selection rate ratios)</li>
                  <li>Calibration: Expected Calibration Error (ECE) &lt; .05</li>
                  <li>Confidence intervals: Well-calibrated across groups</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Experience Metrics</CardTitle>
                <CardDescription>Post-assessment feedback scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Question Clarity</span>
                  <span className="font-medium">{summary.avgClarity.toFixed(2)}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Net Promoter Score</span>
                  <span className="font-medium">{summary.avgNPS.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engagement Rating</span>
                  <span className="font-medium">{summary.avgEngagementRating.toFixed(1)}/5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response-Process Evidence</CardTitle>
                <CardDescription>Validity framework support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Post-results survey captures:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Question clarity (1-5)</li>
                  <li>Engagement & focus ease</li>
                  <li>Perceived accuracy (1-5)</li>
                  <li>Actionable insights (Y/N)</li>
                  <li>Unclear items flagged</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavioral Impact</CardTitle>
                <CardDescription>Follow-up surveys & longitudinal tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Collects evidence of:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Follow-up completion rate</li>
                  <li>Reported behavioral change</li>
                  <li>Trajectory alignment (correlation)</li>
                  <li>6-week retest stability</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business & Conversion Metrics</CardTitle>
              <CardDescription>User monetization and engagement tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Free-to-Paid Rate</p>
                  <p className="text-2xl font-bold">{summary.freeToPaidRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Users purchasing insights</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold">{summary.completionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Started → Completed</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Classification Stability</p>
                  <p className="text-2xl font-bold">{summary.classificationStabilityRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Same type on retest</p>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2">Tracking Infrastructure</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Paywall views and conversion tracking</li>
                  <li>ARPU (Average Revenue Per User)</li>
                  <li>Churn/abandon rate at paywall</li>
                  <li>6-week retest invitations (test-retest reliability)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database & Analytics Troubleshooting</CardTitle>
              <CardDescription>Tools to diagnose and fix data issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Materialized View Refresh</h4>
                  <p className="text-sm text-muted-foreground">
                    Manually trigger a refresh of all analytics materialized views. This updates the dashboard with the latest data from the database.
                  </p>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                    onClick={handleRecomputeAnalytics}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Activity className="mr-2 h-4 w-4" />
                    )}
                    {isRefreshing ? "Refreshing..." : "Recompute Analytics"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Last auto-refresh: Every 10 minutes
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">View Logs</h4>
                  <p className="text-sm text-muted-foreground">
                    Access system logs to troubleshoot data processing issues, scoring problems, or API errors.
                  </p>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                    onClick={handleViewLogs}
                    disabled={loadingLogs}
                  >
                    {loadingLogs ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    View Troubleshooting Logs
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Includes DB queries, edge function calls, and errors
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Current System Status</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dashboard Data Source:</span>
                    <span className="font-mono">get_assessment_kpis RPC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Materialized Views:</span>
                    <span className="font-mono">21 views (auto-refresh: 10m)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Data Freshness:</span>
                    <span className="font-mono">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cache TTL:</span>
                    <span className="font-mono">1 minute</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Quick Diagnostics</h4>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>If metrics show 0: Check if sessions exist in last 7 days</li>
                  <li>If data seems stale: Use "Recompute Analytics" button</li>
                  <li>If errors persist: Check troubleshooting logs for SQL errors</li>
                  <li>Security warnings are expected and documented</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Database Troubleshooting Logs</DialogTitle>
            <DialogDescription>
              Recent database errors and session issues from the last 7 days
            </DialogDescription>
          </DialogHeader>
          
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent errors or issues found
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${
                    log.level === "error"
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-yellow-500/50 bg-yellow-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(log.log_timestamp).toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      log.level === "error" ? "bg-destructive text-destructive-foreground" : "bg-yellow-500 text-yellow-950"
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2">{log.message}</p>
                  {log.context && (
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentAnalytics;
