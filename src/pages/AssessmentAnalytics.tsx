import { useState } from "react";
import { useAssessmentKpis } from "@/hooks/useAssessmentKpis";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ItemFlagsTable } from "@/components/analytics/ItemFlagsTable";
import { Activity, CheckCircle, TrendingUp, Users, Brain, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays } from "date-fns";

const AssessmentAnalytics = () => {
  const [dateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });

  const { data, isLoading, error } = useAssessmentKpis(dateRange);
  
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assessment Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Standards-aligned metrics (APA/AERA/NCME) - Last 7 days
        </p>
        {alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
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
                  <p className="text-sm text-muted-foreground mb-1">Avg Completion Time</p>
                  <p className="text-2xl font-bold">
                    {engagementData[0]?.avg_completion_sec 
                      ? `${(engagementData[0].avg_completion_sec / 60).toFixed(0)}m` 
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Expected: 15-25 min</p>
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
              {reliabilityData.length > 0 ? (
                <div className="space-y-3">
                  {reliabilityData.slice(0, 10).map((rel: any) => (
                    <div key={rel.scale_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{rel.scale_id}</span>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">α: </span>
                          <span className={rel.cronbach_alpha >= 0.7 ? "text-green-600" : "text-yellow-600"}>
                            {rel.cronbach_alpha?.toFixed(3) || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ω: </span>
                          <span className={rel.mcdonald_omega >= 0.7 ? "text-green-600" : "text-yellow-600"}>
                            {rel.mcdonald_omega?.toFixed(3) || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">r: </span>
                          <span>{rel.split_half_corr?.toFixed(3) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reliability data available yet. Scale data needed.</p>
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
      </Tabs>
    </div>
  );
};

export default AssessmentAnalytics;
