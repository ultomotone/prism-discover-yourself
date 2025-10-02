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

type TimePeriod = 'all' | '7' | '30' | '60' | '90' | '365';

const AssessmentAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use new hook with period filter
  const { data, isLoading, error, refetch } = useAssessmentKpis({ 
    period: timePeriod,
    resultsVersion: "v1.2.1"
  });
  
  const engagementData = data?.engagement || [];
  const reliabilityData = data?.reliability || [];
  const retestData = data?.retest || [];
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

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(
        `https://gnkuikentdtnatazeriu.supabase.co/functions/v1/analytics-export?period=${timePeriod}&ver=v1.2.1`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to generate CSV");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prism_analytics_${timePeriod}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "CSV Downloaded",
        description: "Analytics data has been exported successfully",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
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
              variant={timePeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('all')}
            >
              All Time
            </Button>
            <Button
              variant={timePeriod === '7' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('7')}
            >
              7 Days
            </Button>
            <Button
              variant={timePeriod === '30' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('30')}
            >
              30 Days
            </Button>
            <Button
              variant={timePeriod === '60' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('60')}
            >
              60 Days
            </Button>
            <Button
              variant={timePeriod === '90' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('90')}
            >
              90 Days
            </Button>
            <Button
              variant={timePeriod === '365' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('365')}
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
                    {engagementData.length > 0 && engagementData[0]?.avg_completion_sec != null
                      ? `${(engagementData[0].avg_completion_sec / 60).toFixed(0)} min` 
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {engagementData.length > 0 && engagementData[0]?.avg_completion_sec != null
                      ? `Real-time estimate (excludes outliers)`
                      : 'Waiting for completed sessions'}
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reliability Metrics (Internal Consistency)</CardTitle>
                <CardDescription>
                  Cronbach's α and McDonald's ω (Target: ≥ .70)
                </CardDescription>
              </CardHeader>
               <CardContent>
                {reliabilityData.length === 0 || !reliabilityData[0]?.scale_id ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No reliability data available yet</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Run the batch computation script to populate α and ω values:
                    </p>
                    <code className="text-xs bg-muted px-3 py-2 rounded block mx-auto max-w-md">
                      python edge-jobs/psychometrics/compute_reliability.py
                    </code>
                    <p className="text-xs text-muted-foreground mt-3">
                      After running the script, click "Recompute Analytics" to refresh
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {reliabilityData.map((rel: any, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                        <span className="font-medium">{rel.scale_id}</span>
                        <div className="flex gap-4 text-sm">
                          {rel.cronbach_alpha && (
                            <span className={rel.cronbach_alpha >= 0.70 ? 'text-green-600' : 'text-orange-600'}>
                              α: {rel.cronbach_alpha.toFixed(3)}
                            </span>
                          )}
                          {rel.mcdonald_omega && (
                            <span className={rel.mcdonald_omega >= 0.70 ? 'text-green-600' : 'text-orange-600'}>
                              ω: {rel.mcdonald_omega.toFixed(3)}
                            </span>
                          )}
                          {rel.n_total && (
                            <span className="text-muted-foreground">
                              n={rel.n_total}
                            </span>
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
                <CardTitle>Test-Retest Reliability</CardTitle>
                <CardDescription>
                  Temporal stability over 2-6 week window (Target: r ≥ .70)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!retestData || retestData.length === 0 || retestData[0]?.n_pairs === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No retest data available yet</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Run the batch computation script to calculate correlations:
                    </p>
                    <code className="text-xs bg-muted px-3 py-2 rounded block mx-auto max-w-md">
                      python edge-jobs/psychometrics/compute_retest.py
                    </code>
                    <p className="text-xs text-muted-foreground mt-3">
                      Requires users to complete the assessment multiple times within 2-6 weeks
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After running the script, click "Recompute Analytics" to refresh
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {retestData.map((rt: any, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                        <span className="font-medium">{rt.scale_code}</span>
                        <div className="flex gap-4 text-sm">
                          {rt.r_mean !== null && (
                            <span className={rt.r_mean >= 0.70 ? 'text-green-600' : 'text-orange-600'}>
                              r: {rt.r_mean.toFixed(3)}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            pairs: {rt.n_pairs}
                          </span>
                          {rt.median_days_between && (
                            <span className="text-muted-foreground text-xs">
                              ~{Math.round(rt.median_days_between)}d
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
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
                  <p className="text-2xl font-bold">
                    {summary.difFlagRate != null ? `${summary.difFlagRate.toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Target: ≤10% items flagged</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calibration Error (ECE)</p>
                  <p className="text-2xl font-bold">
                    {summary.calibrationError != null ? summary.calibrationError.toFixed(3) : "—"}
                  </p>
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
                  <Button
                    onClick={handleRecomputeAnalytics}
                    variant="default"
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                    {isRefreshing ? "Refreshing..." : "Recompute Analytics"}
                  </Button>
                  {lastRefresh && (
                    <p className="text-xs text-muted-foreground">
                      Last manual refresh: {lastRefresh.toLocaleTimeString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Materialized views auto-refresh every 10 minutes
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">View Logs</h4>
                  <p className="text-sm text-muted-foreground">
                    Access system logs to troubleshoot data processing issues, scoring problems, or API errors.
                  </p>
                  <Button
                    onClick={handleViewLogs}
                    variant="outline"
                    disabled={loadingLogs}
                    className="gap-2"
                  >
                    {loadingLogs ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    View Troubleshooting Logs
                  </Button>
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
