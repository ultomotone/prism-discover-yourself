import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MilestoneProgress } from "@/components/ui/milestone-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { Search, RefreshCw, Clock, Users, Globe, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { CountryDistributionChart } from "@/components/CountryDistributionChart";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { supabase } from "@/lib/supabase/client";

interface DashboardData {
  totalAssessments: number;
  todayCount: number;
  weeklyTrend: Array<{ day: string; count: number }>;
  overlayStats: Array<{ overlay: string; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedOverlay, setSelectedOverlay] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);

  const {
    typeDistribution,
    latestAssessments,
    loading: analyticsLoading,
    error: analyticsError,
    refreshData
  } = useDashboardAnalytics();

  // Show error state if analytics failed
  if (analyticsError) {
    console.error('Dashboard analytics error:', analyticsError);
  }

  // Fetch dashboard statistics for totals and progress
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get aggregated statistics
        const { data: stats } = await supabase
          .from('dashboard_statistics')
          .select('*')
          .eq('stat_date', new Date().toISOString().split('T')[0])
          .maybeSingle();

        // Get weekly trend
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

        // Get country distribution
        const { data: countryStats } = await supabase
          .rpc('get_dashboard_country_stats', { days_back: 30 });

        const countryDistribution = (countryStats || []).map(stat => ({
          country: stat.country_name,
          count: stat.session_count
        }));

        // Process overlay stats from aggregated data
        const overlayStats = [];
        if (stats) {
          if (stats.overlay_positive > 0) overlayStats.push({ overlay: 'N+', count: stats.overlay_positive });
          if (stats.overlay_negative > 0) overlayStats.push({ overlay: 'N–', count: stats.overlay_negative });
        }

        setData({
          totalAssessments: stats?.total_assessments || 0,
          todayCount: stats?.daily_assessments || 0,
          weeklyTrend,
          overlayStats,
          countryDistribution,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    };

    fetchDashboardStats();
  }, [toast]);

  // Filtered assessments for table with defensive null checks
  const filteredAssessments = (latestAssessments || []).filter(assessment => {
    const matchesSearch = !searchTerm || 
      assessment.type_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || 
      assessment.type_code?.substring(0, 3) === selectedType;
    const matchesOverlay = selectedOverlay === 'all' || 
      assessment.overlay === selectedOverlay;
    return matchesSearch && matchesType && matchesOverlay;
  });

  const exportCSV = () => {
    if (!filteredAssessments.length) return;
    
    const headers = ['Date', 'Type', 'Overlay', 'Country'];
    const rows = filteredAssessments.map(assessment => [
      new Date(assessment.created_at || assessment.finished_at).toLocaleString(),
      assessment.type_code,
      assessment.overlay,
      assessment.country || ''
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

  const loading = analyticsLoading || !data;

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
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.todayCount || 0}</div>
              <p className="text-xs text-muted-foreground">Since midnight</p>
            </CardContent>
          </Card>

          <Card className="prism-shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Countries Active</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.countryDistribution?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Type Distribution Chart - Full Width */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">PRISM Type Distribution</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
              </div>
            ) : typeDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : analyticsError ? (
              <div className="h-64 flex items-center justify-center text-destructive">
                Error loading data: {analyticsError}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No type distribution data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Assessments - Full Width */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Latest Assessments</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : filteredAssessments.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredAssessments.slice(page * 10, (page + 1) * 10).map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-xs">
                        {assessment.type_code || 'Unknown'}
                      </Badge>
                      {assessment.overlay && (
                        <Badge variant={assessment.overlay === '+' ? 'default' : 'secondary'} className="text-xs">
                          N{assessment.overlay}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {assessment.country || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {assessment.fit_band && (
                        <Badge 
                          variant={assessment.fit_band === 'Great' ? 'default' : 
                                 assessment.fit_band === 'Good' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {assessment.fit_band}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(assessment.finished_at || assessment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {filteredAssessments.length > 10 && (
                  <div className="flex justify-center space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <span className="py-2 px-3 text-sm">
                      Page {page + 1} of {Math.ceil(filteredAssessments.length / 10)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(Math.ceil(filteredAssessments.length / 10) - 1, page + 1))}
                      disabled={page >= Math.ceil(filteredAssessments.length / 10) - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : analyticsError ? (
              <div className="text-center py-8 text-destructive">
                Error loading assessments: {analyticsError}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent assessments found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Distribution */}
        {data?.countryDistribution && data.countryDistribution.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Global Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <CountryDistributionChart className="h-80" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;