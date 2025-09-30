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
          <TabsTrigger value="quality">Content Quality</TabsTrigger>
          <TabsTrigger value="psychometrics">Psychometrics</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
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
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Avg Confidence"
              value={`${(summary.avgConfidence * 100).toFixed(1)}%`}
              icon={Brain}
              description="Calibrated confidence margin"
            />
            <MetricCard
              title="NPS Score"
              value={summary.avgNPS.toFixed(1)}
              icon={Activity}
              description="Net Promoter Score (0-10)"
            />
            <MetricCard
              title="Clarity Rating"
              value={`${summary.avgClarity.toFixed(2)}/5`}
              icon={CheckCircle}
              description="User-reported question clarity"
            />
          </div>
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
              <CardTitle>Psychometric Standards</CardTitle>
              <CardDescription>
                Key metrics aligned with APA/AERA/NCME Standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Reliability Targets</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Cronbach's α ≥ .70 (adequate)</li>
                  <li>McDonald's ω ≥ .70 (adequate)</li>
                  <li>Test-retest r ≥ .70 over 2-6 weeks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Validity Evidence</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>CFA fit: CFI/TLI ≥ .90, RMSEA ≤ .08, SRMR ≤ .08</li>
                  <li>Item discrimination: r ≥ .20 (item-total correlation)</li>
                  <li>Measurement invariance: ΔCFI ≤ .01 across groups</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fairness & Bias</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>DIF detection: monitor flagged items</li>
                  <li>Adverse impact: 80% rule (selection rates)</li>
                  <li>Calibration: ECE &lt; .05</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Experience Metrics</CardTitle>
                <CardDescription>Post-assessment feedback (7 items, ~60s)</CardDescription>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response-Process Evidence</CardTitle>
                <CardDescription>Supports Standards validity framework</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Post-results survey captures:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Question clarity (1-5 scale)</li>
                  <li>Engagement & focus ease</li>
                  <li>Perceived accuracy</li>
                  <li>Actionable insights (Y/N)</li>
                  <li>Unclear items flagged</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentAnalytics;
