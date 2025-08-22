import React, { useEffect, useState, useMemo } from "react";
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
import { CountryDistributionChart } from "@/components/CountryDistributionChart";
import DashboardPreview from "@/components/DashboardPreview";
import { LatestAssessmentsTable } from "@/components/admin/LatestAssessmentsTable";

interface DashboardData {
  totalAssessments: number;
  todayCount: number;
  weeklyTrend: Array<{ day: string; count: number }>;
  overlayStats: Array<{ overlay: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
  blocksAnalysis: Array<{ block: string; average: number; count: number }>;
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

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Force no-cache for all dashboard data fetches
const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Surrogate-Control': 'no-store'
};

// Revalidate admin KPIs cache tag
const revalidateAdminKPIs = () => {
  // This would be used with Next.js revalidateTag('admin-kpis')
  console.log('Cache revalidation triggered for admin KPIs');
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
      console.log("🔍 Starting Dashboard data fetch...");

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

      console.log("🔍 Config loaded:", { countryId, emailId });

      // Use secure aggregated statistics instead of direct profile access
      const { data: stats } = await supabase
        .from('dashboard_statistics')
        .select('*')
        .eq('stat_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      console.log("🔍 Dashboard stats:", stats);

      // Get weekly trend from aggregated view
      const { data: weeklyData } = await supabase
        .from('dashboard_statistics')
        .select('stat_date, daily_assessments')
        .gte('stat_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('stat_date', { ascending: true });

      console.log("🔍 Weekly data:", weeklyData);

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

      console.log("🔍 About to fetch recent assessments...");

      // Get recent assessments directly from profiles with proper scoring fields
      const { data: recentAssessments, error: assessmentsError } = await supabase
        .from('profiles')
        .select(`
          session_id,
          created_at,
          type_code,
          overlay,
          confidence,
          score_fit_calibrated,
          score_fit_raw,
          top_gap,
          fit_band,
          results_version,
          invalid_combo_flag,
          type_scores,
          top_types
        `)
        .eq('results_version', 'v1.1')
        .not('type_code', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (assessmentsError) {
        console.error("🔍 Error fetching assessments:", assessmentsError);
        throw assessmentsError;
      }

      console.log("🔍 Recent assessments fetched:", recentAssessments?.length || 0, "items");
      console.log("🔍 Sample assessment:", recentAssessments?.[0]);

      // Get country for each assessment 
      const assessmentsWithCountry = await Promise.all(
        (recentAssessments || []).map(async (assessment) => {
          let country = 'Unknown';
          if (countryId) {
            const { data: countryResponse } = await supabase
              .from('assessment_responses')
              .select('answer_value')
              .eq('session_id', assessment.session_id)
              .eq('question_id', countryId)
              .maybeSingle();
            country = countryResponse?.answer_value || 'Unknown';
          }
          return { ...assessment, country };
        })
      );

      console.log("🔍 Assessments with country:", assessmentsWithCountry.length);

      // Verification log for fit distribution
      console.log('Fit distribution check (direct from profiles):', assessmentsWithCountry.slice(0, 10).map(r => ({
        session: r.session_id?.toString().slice(0, 8) || 'unknown',
        fit_calibrated: r.score_fit_calibrated,
        fit_raw: r.score_fit_raw,
        top_gap: r.top_gap,
        band: r.fit_band,
        version: r.results_version,
        p1: r.type_scores && r.top_types ? r.type_scores[r.top_types[0]]?.share_pct : null,
        p2: r.type_scores && r.top_types ? r.type_scores[r.top_types[1]]?.share_pct : null
      })));

      console.log("🔍 Processing latest assessments...");

      const latestAssessments: AssessmentDetail[] = assessmentsWithCountry.map((assessment: any) => {
        console.log("🔍 Processing assessment:", assessment.session_id?.slice(0, 8), {
          type_scores: assessment.type_scores,
          top_types: assessment.top_types,
          blocks: (assessment as any).blocks // Check if blocks exists
        });

        const p1 = assessment.type_scores && assessment.top_types?.[0] 
          ? assessment.type_scores[assessment.top_types[0]]?.share_pct : null;
        const p2 = assessment.type_scores && assessment.top_types?.[1]
          ? assessment.type_scores[assessment.top_types[1]]?.share_pct : null;
        
        return {
          created_at: assessment.created_at,
          type_code: `${assessment.type_code}${assessment.overlay || ''}`,
          overlay: assessment.overlay || '',
          country: assessment.country,
          country_display: assessment.country,
          email: undefined, // Never show email for privacy
          top_types: assessment.top_types,
          type_scores: assessment.type_scores,
          fit_score: assessment.score_fit_calibrated,
          share_pct: p1,
          fit_band: assessment.fit_band,
          confidence: assessment.confidence,
          version: assessment.results_version || 'legacy',
          // Add new v1.1 fields 
          results_version: assessment.results_version,
          score_fit_calibrated: assessment.score_fit_calibrated,
          score_fit_raw: assessment.score_fit_raw,
          top_gap: assessment.top_gap,
          invalid_combo_flag: assessment.invalid_combo_flag
        };
      });

      console.log("🔍 Latest assessments processed:", latestAssessments.length);

      // Get country distribution using the secure dashboard function
      const { data: countryStats } = await supabase
        .rpc('get_dashboard_country_stats', { days_back: 30 });

      const countryDistribution = (countryStats || []).map(stat => ({
        country: stat.country_name,
        count: stat.session_count
      }));

      // Debug log to verify country data is being passed
      console.log('Country distribution for activity map:', countryDistribution);

      // Fetch blocks analysis data
      console.log("🔍 Fetching blocks analysis data...");
      const { data: blocksData, error: blocksError } = await supabase
        .from('profiles')
        .select('blocks_norm')
        .eq('results_version', 'v1.1')
        .not('blocks_norm', 'is', null);

      console.log("🔍 Blocks data fetched:", blocksData?.length || 0, "profiles with blocks");
      console.log("🔍 Blocks error:", blocksError);

      let blocksAnalysis: Array<{ block: string; average: number; count: number }> = [];
      
      if (blocksData && blocksData.length > 0) {
        console.log("🔍 Sample blocks data:", blocksData.slice(0, 2));
        
        const blockTotals = { Core: 0, Critic: 0, Hidden: 0, Instinct: 0 };
        const blockCounts = { Core: 0, Critic: 0, Hidden: 0, Instinct: 0 };

        blocksData.forEach((profile, index) => {
          const blocks = profile.blocks_norm as any;
          console.log(`🔍 Processing profile ${index}:`, blocks);
          
          if (blocks && typeof blocks === 'object') {
            Object.keys(blockTotals).forEach(blockKey => {
              if (blocks[blockKey] !== undefined && blocks[blockKey] !== null && typeof blocks[blockKey] === 'number') {
                blockTotals[blockKey as keyof typeof blockTotals] += blocks[blockKey];
                blockCounts[blockKey as keyof typeof blockCounts]++;
                console.log(`🔍 Added ${blockKey}: ${blocks[blockKey]}, running total: ${blockTotals[blockKey as keyof typeof blockTotals]}`);
              }
            });
          }
        });

        console.log("🔍 Final totals:", blockTotals);
        console.log("🔍 Final counts:", blockCounts);

        blocksAnalysis = Object.keys(blockTotals).map(blockKey => ({
          block: blockKey,
          average: blockCounts[blockKey as keyof typeof blockCounts] > 0 
            ? blockTotals[blockKey as keyof typeof blockTotals] / blockCounts[blockKey as keyof typeof blockCounts] 
            : 0,
          count: blockCounts[blockKey as keyof typeof blockCounts]
        })).sort((a, b) => b.average - a.average);

        console.log("🔍 Blocks analysis processed:", blocksAnalysis);
      } else {
        console.log("🔍 No blocks data available - blocksData:", blocksData, "error:", blocksError);
      }

      console.log("🔍 Setting final dashboard data...");

      setData({
        totalAssessments: stats?.total_assessments || 0,
        todayCount: stats?.daily_assessments || 0,
        weeklyTrend,
        overlayStats,
        typeDistribution,
        countryDistribution, // Now contains actual country data for heatmap
        blocksAnalysis, // Add blocks analysis
        latestAssessments // Now shows anonymized recent assessments
      });

      console.log("🔍 Dashboard data set successfully");

    } catch (error) {
      console.error('🔍 Dashboard data fetch error:', error);
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Type Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          {/* Blocks Analysis */}
          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Blocks (%)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground">
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average block percentages across all assessments</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.blocksAnalysis.length > 0 ? (
                <div className="space-y-4">
                  {data.blocksAnalysis.map((block, index) => (
                    <div key={block.block} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          block.block === 'Core' ? 'bg-primary' :
                          block.block === 'Critic' ? 'bg-secondary' :
                          block.block === 'Hidden' ? 'bg-accent' : 
                          'bg-muted-foreground'
                        }`} />
                        <span className="font-medium">{block.block}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{block.average.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {block.count} profiles
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Block analysis data not available
                </div>
              )}
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
              {React.createElement(() => {
                try {
                  console.log("🔍 Rendering CountryDistributionChart");
                  return <CountryDistributionChart />;
                } catch (error) {
                  console.error("🚨 Error in CountryDistributionChart:", error);
                  return <div className="text-center py-4 text-muted-foreground">Chart unavailable</div>;
                }
              })}
            </CardContent>
          </Card>
        </div>

        {/* Latest Assessments */}
        <div className="mb-8">
          {React.createElement(() => {
            try {
              console.log("🔍 Rendering LatestAssessmentsTable");
              return <LatestAssessmentsTable />;
            } catch (error) {
              console.error("🚨 Error in LatestAssessmentsTable:", error);
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Assessments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4 text-muted-foreground">
                      Assessment table unavailable - {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
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