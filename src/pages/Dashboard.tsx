import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MilestoneProgress } from "@/components/ui/milestone-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Search, Download, ExternalLink, Calendar, Users, TrendingUp, Globe, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import CountryDistributionChart from "@/components/CountryDistributionChart";
import { rescoreSpecificSessions } from "@/utils/rescoreUNKSessions";

interface DashboardData {
  totalAssessments: number;
  todayCount: number;
  weeklyTrend: Array<{ day: string; count: number }>;
  overlayStats: Array<{ overlay: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
  latestAssessments: Array<{
    created_at: string;
    type_code: string;
    type_display?: string;
    top_types?: string[];
    type_scores?: Record<string, { fit_abs?: number; share_pct?: number }>;
    overlay: string;
    country?: string;
    country_display?: string;
    email?: string;
    fit_score?: number;
    share_pct?: number;
    fit_band?: string;
    confidence?: string;
    version?: string;
    // Add new v1.1 fields
    results_version?: string;
    score_fit_calibrated?: number;
    score_fit_raw?: number;
    top_gap?: number;
    invalid_combo_flag?: boolean;
  }>;
}

interface AssessmentDetail {
  created_at: string;
  type_code: string;
  type_display?: string;
  top_types?: string[];
  type_scores?: Record<string, { fit_abs?: number; share_pct?: number }>;
  overlay: string;
  country?: string;
  country_display?: string;
  email?: string;
  fit_score?: number;
  share_pct?: number;
  fit_band?: string;
  confidence?: string;
  version?: string;
  // Add new v1.1 fields
  results_version?: string;
  score_fit_calibrated?: number;
  score_fit_raw?: number;
  top_gap?: number;
  invalid_combo_flag?: boolean;
}

// Force no-cache for all dashboard data fetches
const CACHE_HEADERS = {
  'Cache-Control': 'no-store, must-revalidate',
  'Surrogate-Control': 'no-store'
};

const Dashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedOverlay, setSelectedOverlay] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentDetail | null>(null);
  const [page, setPage] = useState(0);
  const [countryQId, setCountryQId] = useState<number | null>(null);
  const [emailQId, setEmailQId] = useState<number | null>(null);

  const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email || '';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***@${domain}`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get config for country and email question IDs
      const { data: countryConfig } = await supabase
        .from('scoring_config')
        .select('value')
        .eq('key', 'dashboard_country_qid')
        .single();
      
      const { data: emailConfig } = await supabase
        .from('scoring_config')
        .select('value')
        .eq('key', 'dashboard_email_qid')
        .single();

      const countryId = (countryConfig?.value as any)?.id;
      const emailId = (emailConfig?.value as any)?.id;
      setCountryQId(countryId);
      setEmailQId(emailId);

      // Use secure aggregated statistics instead of direct profile access
      const { data: stats } = await supabase
        .from('dashboard_statistics')
        .select('*')
        .eq('stat_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      // Get weekly trend from aggregated view
      const { data: weeklyData } = await supabase
        .from('dashboard_statistics')
        .select('stat_date, daily_assessments')
        .gte('stat_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('stat_date', { ascending: true });

      // Process weekly trend
      const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayData = weeklyData?.find(d => d.stat_date === dateStr);
        return {
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          count: dayData?.daily_assessments || 0
        };
      });

      // Process overlay stats from aggregated data
      const overlayStats = [];
      if (stats) {
        if (stats.overlay_positive > 0) overlayStats.push({ overlay: 'N+', count: stats.overlay_positive });
        if (stats.overlay_negative > 0) overlayStats.push({ overlay: 'N–', count: stats.overlay_negative });
      }

      // Process type distribution from aggregated data
      const typeDistribution = stats?.type_distribution ? 
        Object.entries(stats.type_distribution).map(([type, count]) => ({ 
          type, 
          count: count as number 
        })).sort((a, b) => b.count - a.count) : [];

      // Get recent assessments using secure function with no-cache headers and versioning
      const versionParam = `?v=${Date.now()}`;
      const { data: recentAssessments } = await supabase
        .rpc('get_recent_assessments_safe');

      // Console log for debugging (temporary)
      console.table((recentAssessments || []).slice(0, 10).map((r: any) => ({
        session: r.session_id?.toString().slice(0, 8) || 'unknown',
        ver: r.results_version || r.version || 'legacy',
        fit_cal: r.score_fit_calibrated,
        fit_raw: r.score_fit_raw,
        fit_legacy: r.fit_score,
        band: r.fit_band,
        gap: r.top_gap
      })));

      const latestAssessments: AssessmentDetail[] = (recentAssessments || []).map((assessment: any) => {
        // Use calibrated fit first, then raw fit, then legacy fit as fallback
        const displayFit = assessment.score_fit_calibrated ?? assessment.score_fit_raw ?? assessment.fit_score;
        const fitBand = assessment.fit_band ?? (
          displayFit && displayFit <= 40 ? 'Low' :
          displayFit && displayFit <= 60 ? 'Moderate' : 
          displayFit ? 'High' : null
        );
        
        return {
          created_at: assessment.created_at,
          type_code: assessment.type_display,
          overlay: '', // Already included in type_display
          country: assessment.country_display,
          country_display: assessment.country_display,
          email: undefined, // Never show email for privacy
          top_types: undefined,
          type_scores: undefined,
          fit_score: displayFit, // Use calibrated fit
          share_pct: assessment.share_pct,
          fit_band: fitBand,
          confidence: assessment.confidence,
          version: assessment.results_version || assessment.version || 'legacy',
          // Add new v1.1 fields for proper backfill detection
          results_version: assessment.results_version,
          score_fit_calibrated: assessment.score_fit_calibrated,
          score_fit_raw: assessment.score_fit_raw,
          top_gap: assessment.top_gap,
          invalid_combo_flag: assessment.invalid_combo_flag
        };
      });

      // Extract country distribution from recent assessments for the heatmap
      const countryDistribution = (recentAssessments || []).reduce((acc: any[], assessment: any) => {
        if (assessment.country_display && assessment.country_display !== 'Unknown') {
          const existing = acc.find(item => item.country === assessment.country_display);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ country: assessment.country_display, count: 1 });
          }
        }
        return acc;
      }, []);

      setData({
        totalAssessments: stats?.total_assessments || 0,
        todayCount: stats?.daily_assessments || 0,
        weeklyTrend,
        overlayStats,
        typeDistribution,
        countryDistribution, // Now contains actual country data for heatmap
        latestAssessments // Now shows anonymized recent assessments
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchDashboardData();

    // One-time backfill to ensure all completed sessions have profiles
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('backfill_profiles', { body: {} });
        if (error) {
          console.error('Backfill error:', error);
        } else if (data && (data.created || 0) > 0) {
          // Refresh after backfill creates new profiles
          await fetchDashboardData();
        }
      } catch (e) {
        console.error('Backfill exception:', e);
      }
    })();

    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchDashboardData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dashboard_statistics' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  // Filtered assessments for table
  const filteredAssessments = useMemo(() => {
    if (!data) return [];
    return data.latestAssessments.filter(assessment => {
      const matchesSearch = !searchTerm || 
        assessment.type_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.type_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.country_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || 
        assessment.type_display?.substring(0, 3) === selectedType ||
        assessment.type_code?.substring(0, 3) === selectedType;
      const matchesOverlay = selectedOverlay === 'all' || 
        assessment.overlay === selectedOverlay ||
        (assessment.type_display && (assessment.type_display.includes('+') || assessment.type_display.includes('–')));
      return matchesSearch && matchesType && matchesOverlay;
    });
  }, [data, searchTerm, selectedType, selectedOverlay]);

  // Removed handleRescore - server-side only

  const exportCSV = () => {
    if (!filteredAssessments.length) return;
    
    const headers = ['Date', 'Type', 'Overlay', 'Country', 'Email'];
    const rows = filteredAssessments.map(assessment => [
      new Date(assessment.created_at).toLocaleString(),
      assessment.type_code,
      assessment.overlay,
      assessment.country || '',
      maskEmail(assessment.email || '')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prism-assessments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage = data ? Math.min(100, Math.round((data.totalAssessments / 1000) * 100)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="prism-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="prism-gradient-hero text-white py-16">
        <div className="prism-container text-center">
          <h1 className="prism-heading-lg mb-4">Road to 1,000 PRISM Assessments</h1>
          <p className="prism-body-lg mb-8 text-white/90">
            We're aiming for 1,000 assessments! Track our progress in real-time.
          </p>
          
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{data?.totalAssessments || 0}</span>
              <span>1000</span>
            </div>
            <MilestoneProgress 
              value={data?.totalAssessments || 0} 
              max={1000}
              milestones={[100, 500]}
              className="h-3 bg-white/20" 
            />
          </div>
          
          <p className="text-sm text-white/70 mb-6">
            This dashboard updates live • {Math.max(0, 1000 - (data?.totalAssessments || 0))} left to reach our goal
          </p>

          <Button 
            onClick={() => window.open('/assessment', '_blank')}
            className="bg-white text-primary hover:bg-white/90 mr-4"
          >
            Take the PRISM Assessment <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => window.open('/roadmap', '_blank')}
            variant="outline"
            className="border-white text-gray-800 hover:bg-white hover:text-primary"
          >
            Roadmap <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="prism-container py-8">
        {/* Fit Score Fix Banner */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-green-900">Fit Score Calculations Updated</h3>
                <p className="text-sm text-green-700">
                  All assessment fit scores have been recalculated with improved accuracy. 
                  Scores now properly reflect the full 0-100% range instead of being capped.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={fetchDashboardData} 
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="prism-shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalAssessments || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="prism-shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.todayCount || 0}</div>
              <p className="text-xs text-muted-foreground">Since midnight</p>
            </CardContent>
          </Card>

          <Card className="prism-shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">7-Day Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.weeklyTrend}>
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="prism-shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Fit Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.latestAssessments?.length ? 
                  Math.round(data.latestAssessments
                    .filter(a => a.fit_score && a.fit_score > 0)
                    .reduce((sum, a) => sum + (a.fit_score || 0), 0) / 
                    data.latestAssessments.filter(a => a.fit_score && a.fit_score > 0).length
                  ) || 0 : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Recent assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Type Distribution Chart */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle>Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.typeDistribution.filter(t => t.type !== 'UNK')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                     <ChartTooltip />
                     <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Assessment Heatmap - Full Width */}
        <div className="mb-8">
          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Assessment Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time visualization of where people are taking PRISM assessments worldwide
              </p>
            </CardHeader>
            <CardContent>
              <CountryDistributionChart data={data?.countryDistribution || []} />
            </CardContent>
          </Card>
        </div>

        {/* Latest Assessments Table */}
        <Card className="prism-shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Assessments</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-48"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {data?.typeDistribution.map((type) => (
                      <SelectItem key={type.type} value={type.type}>{type.type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedOverlay} onValueChange={setSelectedOverlay}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Overlay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="+">N+</SelectItem>
                    <SelectItem value="–">N–</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Fit</TableHead>
                  <TableHead>Share</TableHead>
                  <TableHead>Band</TableHead>
                  <TableHead>Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.slice(page * 10, (page + 1) * 10).map((assessment, index) => (
                  <TableRow 
                    key={`${assessment.created_at}-${index}`} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(assessment.created_at).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{assessment.type_code}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{assessment.country_display || assessment.country || 'Unknown'}</TableCell>
                    <TableCell>
                      {assessment.fit_score ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`text-sm font-medium cursor-help ${
                                assessment.score_fit_calibrated ? 'text-foreground' : 'text-orange-600'
                              }`}>
                                {Math.round(assessment.fit_score)}%
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Calibrated PRISM Fit. ~35=weak, ~55=solid, ~75=strong</p>
                              {!assessment.score_fit_calibrated && (
                                <p className="text-orange-600 text-xs mt-1">Using raw/legacy fit - needs v1.1 update</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.share_pct ? (
                        <span className="text-sm">{Math.round(assessment.share_pct)}%</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.fit_band ? (
                        <Badge 
                          variant="outline"
                          className={
                            assessment.fit_band === 'High' ? "border-green-500 text-green-700" :
                            assessment.fit_band === 'Moderate' ? "border-yellow-500 text-yellow-700" :
                            "border-red-500 text-red-700"
                          }
                        >
                          {assessment.fit_band}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          assessment.results_version === 'v1.1' ? 'text-green-600' : 
                          assessment.results_version ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {assessment.results_version || assessment.version || 'legacy'}
                        </span>
                         {/* Show "needs backfill" only when truly not on v1.1 */}
                         {!(assessment.results_version === 'v1.1' && assessment.score_fit_calibrated != null) && (
                           assessment.results_version !== 'v1.1' ? (
                             <Badge variant="destructive" className="text-xs">
                               needs backfill
                             </Badge>
                           ) : (
                             <Badge variant="secondary" className="text-xs">
                               legacy
                             </Badge>
                           )
                         )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredAssessments.length > 10 && (
              <div className="flex justify-center mt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * 10 >= filteredAssessments.length}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assessment Detail Drawer */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assessment Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAssessment(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className="mt-1">{selectedAssessment.type_code}</Badge>
                </div>
                
                {selectedAssessment.top_types && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Top 3 Types</p>
                    <div className="space-y-2">
                      {selectedAssessment.top_types.slice(0, 3).map((type: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{type.code || type}</span>
                          {type.fit_abs && (
                            <span className="text-muted-foreground">{type.fit_abs}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 {selectedAssessment.fit_score && (
                   <div>
                     <p className="text-sm text-muted-foreground">Fit Score</p>
                     <Badge 
                       className={`mt-1 ${
                         selectedAssessment.fit_score >= 70 ? "bg-green-100 text-green-800" :
                         selectedAssessment.fit_score >= 40 ? "bg-yellow-100 text-yellow-800" :
                         "bg-red-100 text-red-800"
                       }`}
                     >
                       {Math.round(selectedAssessment.fit_score)}%
                     </Badge>
                   </div>
                 )}

                 <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm">{new Date(selectedAssessment.created_at).toLocaleString()}</p>
                </div>

                {selectedAssessment.country && (
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="text-sm">{selectedAssessment.country}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;