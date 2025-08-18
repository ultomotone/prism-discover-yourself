import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Search, Download, ExternalLink, Calendar, Users, TrendingUp, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

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
    top_types?: any;
    overlay: string;
    country?: string;
    email?: string;
  }>;
}

interface AssessmentDetail {
  created_at: string;
  type_code: string;
  top_types?: Array<{ code: string; fit_abs?: number; share_pct?: number }>;
  overlay: string;
  country?: string;
  email?: string;
}

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

      // Calculate date range
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Fetch all data in parallel
      const [
        totalResult,
        todayResult,
        weeklyResult,
        overlayResult,
        typeResult,
        countryResult,
        latestResult
      ] = await Promise.all([
        // Total assessments
        supabase.from('profiles').select('id', { count: 'exact' }),

        // Today's assessments
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .gte('created_at', todayStart.toISOString()),

        // Weekly trend
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true }),

        // Overlay distribution
        supabase
          .from('profiles')
          .select('overlay')
          .gte('created_at', startDate.toISOString()),

        // Type distribution
        supabase
          .from('profiles')
          .select('type_code')
          .gte('created_at', startDate.toISOString()),

        // Country distribution (if config exists) - simplified approach
        Promise.resolve({ data: [], error: null }),

        // Latest assessments with details
        supabase
          .from('profiles')
          .select('created_at, type_code, top_types, overlay, session_id')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      // Process weekly trend
      const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          count: 0
        };
      });

      weeklyResult.data?.forEach((profile: any) => {
        const createdDate = new Date(profile.created_at);
        const dayIndex = Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 7) {
          weeklyTrend[6 - dayIndex].count++;
        }
      });

      // Process overlay stats
      const overlayCount = overlayResult.data?.reduce((acc: any, profile: any) => {
        const overlay = profile.overlay || 'Unknown';
        acc[overlay] = (acc[overlay] || 0) + 1;
        return acc;
      }, {});
      const overlayStats = Object.entries(overlayCount || {}).map(([overlay, count]) => ({
        overlay: overlay === '+' ? 'N+' : overlay === '–' ? 'N–' : overlay,
        count: count as number
      }));

      // Process type distribution
      const typeCount = typeResult.data?.reduce((acc: any, profile: any) => {
        const type = profile.type_code?.substring(0, 3) || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      const typeDistribution = Object.entries(typeCount || {})
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Process country distribution - fetch separately
      let countryDistribution: Array<{ country: string; count: number }> = [];
      if (countryId && latestResult.data) {
        const sessionIds = latestResult.data.map((p: any) => p.session_id).slice(0, 50);
        if (sessionIds.length > 0) {
          const { data: countryResponses } = await supabase
            .from('assessment_responses')
            .select('answer_value')
            .eq('question_id', countryId)
            .in('session_id', sessionIds);

          const countryCount = (countryResponses || []).reduce((acc: any, resp: any) => {
            const country = resp.answer_value || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
          }, {});

          countryDistribution = Object.entries(countryCount)
            .map(([country, count]) => ({ country, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        }
      }

      // Get additional details for latest assessments
      const latestWithDetails = await Promise.all(
        (latestResult.data || []).map(async (profile: any) => {
          const details: AssessmentDetail = {
            created_at: profile.created_at,
            type_code: profile.type_code,
            top_types: profile.top_types,
            overlay: profile.overlay
          };

          if (countryId && emailId) {
            const { data: responses } = await supabase
              .from('assessment_responses')
              .select('question_id, answer_value')
              .eq('session_id', profile.session_id)
              .in('question_id', [countryId, emailId]);

            responses?.forEach((resp: any) => {
              if (resp.question_id === countryId) {
                details.country = resp.answer_value;
              }
              if (resp.question_id === emailId) {
                details.email = resp.answer_value;
              }
            });
          }

          return details;
        })
      );

      setData({
        totalAssessments: totalResult.count || 0,
        todayCount: todayResult.count || 0,
        weeklyTrend,
        overlayStats,
        typeDistribution,
        countryDistribution,
        latestAssessments: latestWithDetails
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

    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
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
        assessment.type_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || assessment.type_code?.substring(0, 3) === selectedType;
      const matchesOverlay = selectedOverlay === 'all' || assessment.overlay === selectedOverlay;
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
              <span>{data?.totalAssessments || 0} / 1000</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
          </div>
          
          <p className="text-sm text-white/70 mb-6">
            This dashboard updates live • {1000 - (data?.totalAssessments || 0)} left to reach our goal
          </p>

          <Button 
            onClick={() => window.open('/assessment', '_blank')}
            className="bg-white text-primary hover:bg-white/90"
          >
            Take the PRISM Assessment <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="prism-container py-8">
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
                <CardTitle className="text-sm font-medium text-muted-foreground">N+ vs N–</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {data?.overlayStats.map((stat) => (
                  <Badge key={stat.overlay} variant="secondary" className="text-xs">
                    {stat.overlay}: {stat.count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle>Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.countryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                  <TableHead>Person</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.slice(page * 10, (page + 1) * 10).map((assessment, index) => (
                  <TableRow 
                    key={index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <TableCell>
                      {new Date(assessment.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {assessment.type_code?.substring(0, 3)}{assessment.overlay}
                      </Badge>
                    </TableCell>
                    <TableCell>{assessment.country || 'Unknown'}</TableCell>
                    <TableCell>{maskEmail(assessment.email || 'Anonymous')}</TableCell>
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