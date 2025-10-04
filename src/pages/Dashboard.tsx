import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { MilestoneProgress } from "@/components/ui/milestone-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { Search, RefreshCw, Clock, Users, Globe, ExternalLink, Eye, Zap, Lock, Bot, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlementsContext } from "@/contexts/EntitlementsContext";
import { MembershipGate } from "@/components/MembershipGate";
import { CreditCounter } from "@/components/CreditCounter";
import Header from "@/components/Header";
import { CountryDistributionChart } from "@/components/CountryDistributionChart";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  totalAssessments: number;
  todayCount: number;
  weeklyTrend: Array<{ day: string; count: number }>;
  overlayStats: Array<{ overlay: string; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMember } = useEntitlementsContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedOverlay, setSelectedOverlay] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

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

        const countryDistribution = (countryStats as any[] || []).map((stat: any) => ({
          country: String(stat.country_name || ''),
          count: Number(stat.session_count || 0)
        }));

        // Process overlay stats from aggregated data
        const overlayStats = [];
        if (stats) {
          if (Number(stats.overlay_positive || 0) > 0) overlayStats.push({ overlay: 'N+', count: Number(stats.overlay_positive) });
          if (Number(stats.overlay_negative || 0) > 0) overlayStats.push({ overlay: 'N–', count: Number(stats.overlay_negative) });
        }

        setData({
          totalAssessments: Number(stats?.total_assessments || 0),
          todayCount: Number(stats?.daily_assessments || 0),
          weeklyTrend: weeklyTrend.map((item: any) => ({
            day: String(item.day || ''),
            count: Number(item.count || 0)
          })),
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

  // Fetch user's own sessions
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!user) {
        setLoadingSessions(false);
        return;
      }
      
      setLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from('assessment_sessions')
          .select(`
            *,
            profiles (
              type_code,
              confidence,
              overlay,
              score_fit_calibrated
            )
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setUserSessions(data || []);
      } catch (error) {
        console.error('Error fetching user sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load your sessions",
          variant: "destructive",
        });
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchUserSessions();
  }, [user, toast]);

  const recomputeSession = async (sessionId: string) => {
    try {
      toast({
        title: "Recomputing Session",
        description: "Updating with enhanced scoring metrics...",
      });

      const { data, error } = await supabase.functions.invoke('recompute-new-metrics', {
        body: { session_ids: [sessionId] }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session recomputed with enhanced metrics!",
      });

      // Refresh user sessions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessions } = await supabase
          .rpc('get_user_sessions_with_scoring', { p_user_id: user.id });
        setUserSessions((sessions as any)?.sessions || []);
      }
    } catch (error) {
      console.error('Recompute error:', error);
      toast({
        title: "Error",
        description: "Failed to recompute session",
        variant: "destructive",
      });
    }
  };

  const viewResults = (sessionId: string) => {
    window.open(`/results/${sessionId}`, '_blank');
  };

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
        {/* Personal Stats Section (Only for logged-in users) */}
        {user && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
              
              {/* KPI Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Advanced Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <CreditCounter variant="compact" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Retakes This Year
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userSessions.filter(s => 
                        s.status === 'completed' && 
                        new Date(s.started_at).getFullYear() === new Date().getFullYear()
                      ).length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Cohorts Joined
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isMember ? '0' : <Lock className="h-6 w-6 text-muted-foreground" />}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button onClick={() => navigate('/assessment')} size="lg">
                  Start the Test
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/survey')}
                  size="lg"
                >
                  Take 2-Min Survey
                </Button>
              </div>

              {/* Complete Results */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Your Complete Results</CardTitle>
                  <CardDescription>
                    Your assessment history with detailed metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSessions ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : userSessions.filter(s => s.status === 'completed').length > 0 ? (
                    <div className="space-y-3">
                      {userSessions.filter(s => s.status === 'completed').slice(0, 5).map((session: any) => {
                        const profile = session.profiles?.[0] || session.profiles;
                        return (
                          <Card key={session.id} className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(session.completed_at || session.started_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Type:</span>{' '}
                                    <span className="font-medium">{profile?.type_code || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Fit:</span>{' '}
                                    <span className="font-medium">
                                      {profile?.score_fit_calibrated 
                                        ? `${(profile.score_fit_calibrated * 100).toFixed(0)}%` 
                                        : '—'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Overlay:</span>{' '}
                                    <span className="font-medium">{profile?.overlay || 'None'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Confidence:</span>{' '}
                                    <span className="font-medium">{profile?.confidence || '—'}</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/results/${session.id}`)}
                              >
                                View Results
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No completed assessments yet</p>
                      <Button onClick={() => navigate('/assessment')}>
                        Take Your First Assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Locked Features Teasers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">PRISM Coach AI</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Coming Soon — Beta members get early access
                  </p>
                  {!isMember && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/membership')}>
                      Join Beta
                    </Button>
                  )}
                </Card>
                <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <Users className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Cohorts</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Join exclusive cohorts for relational fit analysis
                  </p>
                  {!isMember && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/membership')}>
                      Join Beta
                    </Button>
                  )}
                </Card>
                <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">1:1 Coaching</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Beta members get priority booking
                  </p>
                  {!isMember && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/membership')}>
                      Join Beta
                    </Button>
                  )}
                </Card>
              </div>
            </div>

            <div className="border-t border-border my-8"></div>
          </>
        )}

        {/* Public Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">PRISM Progress</h2>
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

        {/* Tabbed Content Area */}
        <Tabs defaultValue="latest" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="latest">Latest Assessments</TabsTrigger>
            <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="latest" className="space-y-4">
            <Card>
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
          </TabsContent>

          <TabsContent value="my-sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">My Assessment Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSessions ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : userSessions.length > 0 ? (
                  <div className="space-y-4">
                    {userSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-xs">
                            {session.profile?.type_code || 'Processing'}
                          </Badge>
                          {session.profile?.overlay && session.profile.overlay !== '0' && (
                            <Badge variant={session.profile.overlay === '+' ? 'default' : 'secondary'} className="text-xs">
                              N{session.profile.overlay}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {session.profile?.fit_band || 'Unknown'}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <div>Completed: {new Date(session.completed_at).toLocaleDateString()}</div>
                            <div className="text-xs">
                              ID: {session.id.substring(0, 8)}... • 
                              Questions: {session.completed_questions}/{session.total_questions}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewResults(session.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => recomputeSession(session.id)}
                            title="Recompute with enhanced scoring metrics"
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Enhance
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No assessment sessions found.</p>
                    <p className="text-sm mt-2">
                      <Button 
                        variant="link" 
                        onClick={() => window.open('/assessment', '_blank')}
                        className="p-0 h-auto"
                      >
                        Take your first assessment
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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