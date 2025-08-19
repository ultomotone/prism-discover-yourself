import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarIcon, RefreshCw, Download, TrendingUp, AlertTriangle, Users, Clock, Target, BarChart3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from "recharts";
import Header from "@/components/Header";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const Admin = () => {
  const {
    filters,
    setFilters,
    kpiData,
    chartData,
    sessionData,
    retestData,
    loading,
    alerts,
    refreshData
  } = useAdminAnalytics();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setLastUpdated(new Date());
  }, [kpiData, chartData]);

  const getThresholdColor = (value: number, thresholds: { green: [number, number]; amber: [number, number]; red: number[] }) => {
    if (value >= thresholds.green[0] && value <= thresholds.green[1]) return "text-green-600";
    if ((value >= thresholds.amber[0] && value <= thresholds.amber[1])) return "text-amber-600";
    return "text-red-600";
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    refreshData();
    setLastUpdated(new Date());
  };

  return (
    <>
      <Helmet
        title="PRISM Admin Dashboard v1.1"
        meta={[
          { name: "robots", content: "noindex, nofollow" }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="pt-16">
          {/* Header */}
          <div className="border-b border-border bg-card">
            <div className="prism-container py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Admin KPI Dashboard v1.1</h1>
                  <p className="text-muted-foreground mt-1">PRISM Assessment Analytics & Performance Monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Last updated: {format(lastUpdated, "HH:mm:ss")}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Global Controls */}
          <div className="prism-container py-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Filters & Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select
                      value={filters.dateRange.preset}
                      onValueChange={(preset) => setFilters({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          preset
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Overlay Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Overlay</label>
                    <Select
                      value={filters.overlay}
                      onValueChange={(overlay) => setFilters({ ...filters, overlay })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Overlays</SelectItem>
                        <SelectItem value="+">Positive (+)</SelectItem>
                        <SelectItem value="–">Negative (–)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Confidence Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confidence</label>
                    <Select
                      value={filters.confidence}
                      onValueChange={(confidence) => setFilters({ ...filters, confidence })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Confidence</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Type</label>
                    <Select
                      value={filters.primaryType}
                      onValueChange={(primaryType) => setFilters({ ...filters, primaryType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="LIE">LIE</SelectItem>
                        <SelectItem value="ILI">ILI</SelectItem>
                        <SelectItem value="ESE">ESE</SelectItem>
                        <SelectItem value="SEI">SEI</SelectItem>
                        <SelectItem value="LII">LII</SelectItem>
                        <SelectItem value="ILE">ILE</SelectItem>
                        <SelectItem value="ESI">ESI</SelectItem>
                        <SelectItem value="SEE">SEE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="prism-container space-y-8 pb-8">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-red-700 dark:text-red-300">{alert}</span>
                  </div>
                ))}
              </div>
            )}

            {/* KPI Cards Row 1 - Throughput/Experience */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.completions.toLocaleString()}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV([{ metric: 'completions', value: kpiData.completions }], 'completions.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold", getThresholdColor(kpiData.completionRate, {
                    green: [70, 100],
                    amber: [60, 69],
                    red: [0, 59]
                  }))}>
                    {kpiData.completionRate.toFixed(1)}%
                  </div>
                  <Progress value={kpiData.completionRate} className="mt-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'completion_rate', value: kpiData.completionRate }], 'completion-rate.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Median Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.medianDuration.toFixed(1)}m</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'median_duration', value: kpiData.medianDuration }], 'median-duration.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Speeders {'<12m'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{kpiData.speedersPercent.toFixed(1)}%</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'speeders_percent', value: kpiData.speedersPercent }], 'speeders.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Stallers {'>60m'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{kpiData.stallersPercent.toFixed(1)}%</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'stallers_percent', value: kpiData.stallersPercent }], 'stallers.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* KPI Cards Row 2 - Quality/Psychometrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quality Metrics</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV([{
                        metric: 'quality',
                        fit_median: kpiData.fitMedian,
                        gap_median: kpiData.gapMedian,
                        close_calls_pct: kpiData.closeCallsPercent,
                        inconsistency_mean: kpiData.inconsistencyMean,
                        sd_index_mean: kpiData.sdIndexMean
                      }], 'quality-metrics.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top-1 Fit Median</span>
                    <span className={cn("font-semibold", getThresholdColor(kpiData.fitMedian, {
                      green: [55, 75],
                      amber: [45, 54],
                      red: [0, 44]
                    }))}>
                      {kpiData.fitMedian.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top-Gap Median</span>
                    <span className="font-semibold">{kpiData.gapMedian.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Close Calls %</span>
                    <span className={cn("font-semibold", getThresholdColor(kpiData.closeCallsPercent, {
                      green: [20, 35],
                      amber: [10, 19],
                      red: [0, 9]
                    }))}>
                      {kpiData.closeCallsPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Inconsistency Mean</span>
                    <span className={cn("font-semibold", getThresholdColor(kpiData.inconsistencyMean, {
                      green: [0, 0.99],
                      amber: [1.0, 1.5],
                      red: [1.51, 10]
                    }))}>
                      {kpiData.inconsistencyMean.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SD Index Mean</span>
                    <span className="font-semibold">{kpiData.sdIndexMean.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Confidence Distribution</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(chartData.confidenceDistribution, 'confidence-distribution.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData.confidenceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="confidence" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2">
                    <span className={cn("text-sm", getThresholdColor(kpiData.lowConfidencePercent, {
                      green: [0, 9],
                      amber: [10, 15],
                      red: [16, 100]
                    }))}>
                      Low Confidence: {kpiData.lowConfidencePercent.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overlay Distribution</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(chartData.overlayDistribution, 'overlay-distribution.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData.overlayDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ overlay, count }) => `${overlay}: ${count}`}
                      >
                        {chartData.overlayDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Overlay balance threshold check */}
                  <div className="mt-2 text-sm">
                    {chartData.overlayDistribution.map(item => {
                      const percentage = (item.count / chartData.overlayDistribution.reduce((a, b) => a + b.count, 0)) * 100;
                      const color = percentage >= 35 && percentage <= 65 ? "text-green-600" : "text-red-600";
                      return (
                        <div key={item.overlay} className={color}>
                          {item.overlay}: {percentage.toFixed(1)}%
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Retest Cards Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Test-Retest Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold", getThresholdColor(retestData.strengthCorrelation, {
                    green: [0.80, 1.0],
                    amber: [0.70, 0.79],
                    red: [0, 0.69]
                  }))}>
                    {retestData.strengthCorrelation.toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'strength_correlation', value: retestData.strengthCorrelation }], 'retest-correlation.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Type Stability %</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold", getThresholdColor(retestData.typeStability, {
                    green: [75, 100],
                    amber: [65, 74],
                    red: [0, 64]
                  }))}>
                    {retestData.typeStability.toFixed(1)}%
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'type_stability', value: retestData.typeStability }], 'type-stability.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Containment %</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retestData.containment.toFixed(1)}%</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'containment', value: retestData.containment }], 'containment.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Median Stability Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retestData.medianStabilityScore.toFixed(0)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToCSV([{ metric: 'median_stability', value: retestData.medianStabilityScore }], 'stability-score.csv')}
                    className="mt-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Type Distribution Heatmap</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(chartData.typeDistribution, 'type-distribution.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.typeDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="type" type="category" width={50} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Throughput Trend (14 days)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(chartData.throughputTrend, 'throughput-trend.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.throughputTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Slow Sections</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(sessionData.slowSections, 'slow-sections.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Median Seconds</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionData.slowSections.slice(0, 5).map((section, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{section.section}</TableCell>
                          <TableCell>{section.median_seconds?.toFixed(1) || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Session Analytics</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV([{
                        avg_duration: sessionData.avgDuration,
                        completion_rate: sessionData.completionRate,
                        total_sessions: sessionData.totalSessions
                      }], 'session-analytics.csv')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Sessions</span>
                    <span className="font-semibold">{sessionData.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Duration</span>
                    <span className="font-semibold">{sessionData.avgDuration.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className={cn("font-semibold", getThresholdColor(sessionData.completionRate, {
                      green: [70, 100],
                      amber: [60, 69],
                      red: [0, 59]
                    }))}>
                      {sessionData.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export All */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  // Export all data as ZIP would require additional library
                  // For now, just export key metrics
                  const allData = {
                    kpi: kpiData,
                    chart: chartData,
                    session: sessionData,
                    retest: retestData
                  };
                  exportToCSV([allData], 'prism-admin-dashboard-export.csv');
                }}
                className="px-8"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;