import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subYears, format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Users, Heart, Target, DollarSign, Activity, Loader2, RefreshCw } from "lucide-react";

type TimePeriod = 'all' | '7' | '30' | '60' | '90' | '365';

interface PostSurveyMetrics {
  clarity_idx: number;
  engagement_idx: number;
  accuracy_idx: number;
  insight_idx: number;
  trust_idx: number;
  nps_score: number;
  wtp_idx: number;
  n_surveys: number;
}

interface TimeSeriesData {
  day: string;
  clarity_idx: number;
  engagement_idx: number;
  accuracy_idx: number;
  insight_idx: number;
  trust_idx: number;
  nps_score: number;
  wtp_idx: number;
  n_surveys: number;
}

const PostSurveyKPIs = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<PostSurveyMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const { toast } = useToast();

  const fetchPostSurveyData = async () => {
    try {
      setIsLoading(true);
      let startDate, endDate;
      const now = new Date();
      
      if (timePeriod === 'all') {
        startDate = subYears(now, 10);
        endDate = now;
      } else {
        const days = parseInt(timePeriod);
        startDate = subDays(now, days);
        endDate = now;
      }

      const { data: mvData, error } = await supabase
        .from('mv_kpi_post_survey')
        .select('*')
        .gte('day', format(startDate, 'yyyy-MM-dd'))
        .lte('day', format(endDate, 'yyyy-MM-dd'))
        .order('day', { ascending: true });

      if (error) {
        console.error('Error fetching post-survey data:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: error.message
        });
        return;
      }

      if (mvData && mvData.length > 0) {
        // Store time series data for charts
        setTimeSeriesData(mvData.map((d: any) => ({
          day: format(new Date(d.day), 'MMM d'),
          clarity_idx: Number(d.clarity_idx) || 0,
          engagement_idx: Number(d.engagement_idx) || 0,
          accuracy_idx: Number(d.accuracy_idx) || 0,
          insight_idx: Number(d.insight_idx) || 0,
          trust_idx: Number(d.trust_idx) || 0,
          nps_score: Number(d.nps_score) || 0,
          wtp_idx: Number(d.wtp_idx) || 0,
          n_surveys: Number(d.n_surveys) || 0,
        })));

        // Aggregate for summary metrics
        const aggregated: PostSurveyMetrics = {
          clarity_idx: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.clarity_idx) || 0), 0) / mvData.length),
          engagement_idx: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.engagement_idx) || 0), 0) / mvData.length),
          accuracy_idx: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.accuracy_idx) || 0), 0) / mvData.length),
          insight_idx: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.insight_idx) || 0), 0) / mvData.length),
          trust_idx: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.trust_idx) || 0), 0) / mvData.length),
          nps_score: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.nps_score) || 0), 0) / mvData.length),
          wtp_idx: Math.round(mvData.reduce((sum: number, d: any) => sum + (Number(d.wtp_idx) || 0), 0) / mvData.length),
          n_surveys: mvData.reduce((sum: number, d: any) => sum + (Number(d.n_surveys) || 0), 0),
        };
        setMetrics(aggregated);
      } else {
        setMetrics(null);
        setTimeSeriesData([]);
      }
    } catch (err) {
      console.error('Error in fetchPostSurveyData:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load post-survey data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostSurveyData();
  }, [timePeriod]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('refresh-analytics');
      if (error) throw error;
      
      toast({
        title: "Data refreshed",
        description: "Materialized views updated successfully"
      });
      
      await fetchPostSurveyData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description: error.message
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading post-survey metrics...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number, isNPS: boolean = false) => {
    if (isNPS) {
      if (score >= 50) return "hsl(var(--chart-2))"; // Green
      if (score >= 0) return "hsl(var(--chart-3))"; // Yellow
      return "hsl(var(--destructive))"; // Red
    }
    if (score >= 70) return "hsl(var(--chart-2))"; // Green
    if (score >= 50) return "hsl(var(--chart-3))"; // Yellow
    return "hsl(var(--chart-4))"; // Orange
  };

  const indexChartData = metrics ? [
    { name: 'Clarity', value: metrics.clarity_idx, color: getScoreColor(metrics.clarity_idx) },
    { name: 'Engagement', value: metrics.engagement_idx, color: getScoreColor(metrics.engagement_idx) },
    { name: 'Accuracy', value: metrics.accuracy_idx, color: getScoreColor(metrics.accuracy_idx) },
    { name: 'Insight', value: metrics.insight_idx, color: getScoreColor(metrics.insight_idx) },
    { name: 'Trust', value: metrics.trust_idx, color: getScoreColor(metrics.trust_idx) },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Post-Survey KPI Dashboard</h1>
            <p className="text-muted-foreground">
              User feedback metrics and satisfaction indices
            </p>
          </div>
          <Button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        {/* Time Period Selector */}
        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)} className="mb-6">
          <TabsList>
            <TabsTrigger value="7">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30">Last 30 Days</TabsTrigger>
            <TabsTrigger value="60">Last 60 Days</TabsTrigger>
            <TabsTrigger value="90">Last 90 Days</TabsTrigger>
            <TabsTrigger value="365">Last Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        {!metrics || metrics.n_surveys === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Survey Data Available</h3>
              <p className="text-muted-foreground">
                Post-survey responses will appear here once users complete feedback surveys.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Surveys</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-2xl font-bold">{metrics.n_surveys}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: getScoreColor(metrics.nps_score, true) }} />
                    <div className="text-2xl font-bold">{metrics.nps_score}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.nps_score >= 50 ? "Excellent" : metrics.nps_score >= 0 ? "Good" : "Needs improvement"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clarity Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" style={{ color: getScoreColor(metrics.clarity_idx) }} />
                    <div className="text-2xl font-bold">{metrics.clarity_idx}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Assessment clarity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">WTP Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" style={{ color: getScoreColor(metrics.wtp_idx) }} />
                    <div className="text-2xl font-bold">{metrics.wtp_idx}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Willingness to pay</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* Experience Indices Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Experience Indices</CardTitle>
                  <CardDescription>
                    Average scores across all survey dimensions (0-100 scale)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={indexChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {indexChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* NPS Score Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>NPS Trend</CardTitle>
                  <CardDescription>
                    Net Promoter Score over time (-100 to +100)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis domain={[-100, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="nps_score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="NPS Score"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Time Series */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Experience Indices Over Time</CardTitle>
                <CardDescription>
                  Track how different quality dimensions evolve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="clarity_idx" stroke="hsl(var(--chart-1))" name="Clarity" />
                    <Line type="monotone" dataKey="engagement_idx" stroke="hsl(var(--chart-2))" name="Engagement" />
                    <Line type="monotone" dataKey="accuracy_idx" stroke="hsl(var(--chart-3))" name="Accuracy" />
                    <Line type="monotone" dataKey="insight_idx" stroke="hsl(var(--chart-4))" name="Insight" />
                    <Line type="monotone" dataKey="trust_idx" stroke="hsl(var(--chart-5))" name="Trust" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Survey Volume Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Response Volume</CardTitle>
                <CardDescription>
                  Number of completed surveys per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="n_surveys" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Surveys" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PostSurveyKPIs;
