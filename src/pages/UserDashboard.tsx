import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Target, ExternalLink, ChevronRight, RefreshCw, Zap, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { fetchDashboardResults, DashboardResult } from "@/lib/dashboardResults";
import { useRealtimeScoring } from "@/hooks/useRealtimeScoring";
import {
  useEmailSessionManager,
  type RetakeBlock,
} from "@/hooks/useEmailSessionManager";
import { RetakeLimitNotice } from "@/components/assessment/RetakeLimitNotice";
import { CleanupSessionsButton } from "@/components/CleanupSessionsButton";

interface UserSession {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  completed_questions: number;
  total_questions: number;
  profile?: {
    type_code: string;
    confidence: string;
    fit_band: string;
    overlay: string;
  };
}

interface AssessmentAttempt {
  session_id: string;
  started_at: string;
  completed_at: string | null;
  attempt_no: number;
  type_code?: string | null;
  conf_band?: string | null;
  overlay?: string | null;
  payment_status?: string | null;
}

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [dashboardResults, setDashboardResults] = useState<DashboardResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [retakeBlock, setRetakeBlock] = useState<RetakeBlock | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  // Real-time scoring hook
  const {
    scoringResults,
    isRecomputing,
    recomputeScoring
  } = useRealtimeScoring();

  const {
    startAssessmentSession: triggerRetake,
    isLoading: isStartingSession,
  } = useEmailSessionManager();

  useEffect(() => {
    if (user?.email) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);

      // Fetch dashboard results (248+ question sessions with results URLs)
      try {
        const results = await fetchDashboardResults(user.email);
        setDashboardResults(results);
      } catch (resultsError) {
        console.error('Error fetching dashboard results:', resultsError);
        setDashboardResults([]);
      }

      // Fetch user's regular assessment sessions with profiles using secure RPC
      const { data: sessionsResult, error: sessionsError } = await supabase
        .rpc('get_user_sessions_with_scoring', { p_user_id: user.id });

      if (sessionsError) {
        console.error('Error fetching user sessions:', sessionsError);
        setUserSessions([]);
      } else if ((sessionsResult as any)?.error) {
        console.error('RPC error:', (sessionsResult as any).error);
        setUserSessions([]);
      } else {
        const sessionsWithProfiles = (sessionsResult as any)?.sessions || [];
        setUserSessions(sessionsWithProfiles);
      }

      // Fetch attempt history for retake tracking
      try {
        const { data: attemptResult, error: attemptError } = await supabase
          .rpc('get_user_assessment_attempts', { p_user_id: user.id });

        if (attemptError) {
          console.error('Error fetching assessment attempts:', attemptError);
          setAttempts([]);
        } else {
          const rowsRaw = (attemptResult as any)?.attempts ?? attemptResult;
          const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
          setAttempts(
            rows.map((row: any) => ({
              session_id: String(row.session_id ?? row.id ?? ''),
              started_at: String(row.started_at ?? row.created_at ?? ''),
              completed_at: row.completed_at ?? null,
              attempt_no: Number(row.attempt_no ?? row.attempt_number ?? 0),
              type_code: row.type_code ?? row.profile_type ?? null,
              conf_band: row.conf_band ?? row.confidence ?? null,
              overlay: row.overlay ?? row.profile_overlay ?? null,
              payment_status: row.payment_status ?? row.billing_status ?? null,
            }))
          );
        }
      } catch (attemptError) {
        console.error('Unexpected attempt history failure:', attemptError);
        setAttempts([]);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to migrate all sessions to current scoring
  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      console.log('🚀 Starting migration to current scoring...');
      const { data, error } = await supabase.functions.invoke('migrate-all-scoring', {
        body: {}
      });

      if (error) {
        console.error('❌ Migration failed:', error);
        alert(`Migration failed: ${error.message}`);
      } else {
        console.log('✅ Migration completed successfully:', data);
        alert(`Migration completed! ${data.summary?.successful_migrations || 0} sessions migrated to current scoring.`);
        // Refresh the dashboard data
        fetchUserData();
      }
    } catch (err) {
      console.error('💥 Migration error:', err);
      alert('Migration failed - check console for details');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRetake = async () => {
    if (!user) {
      return;
    }
    setRetakeBlock(null);

    const result = await triggerRetake(user.email ?? undefined, user.id, true);
    if (!result) {
      return;
    }

    if (result.status === 'blocked') {
      setRetakeBlock(result.block);
      return;
    }

    navigate(`/assessment?start=true&session=${result.session.session_id}`);
  };

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

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Recompute error:', error);
      toast({
        title: "Error",
        description: "Failed to recompute session",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (value: string | null) => {
    if (!value) {
      return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }
    return format(parsed, 'MMM dd, yyyy HH:mm');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          {/* User Dashboard Header */}
          <div className="prism-gradient-hero text-white">
            <div className="prism-container py-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>
                  <p className="text-xl text-white/90">
                    Welcome back, {user?.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {isMigrating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {isMigrating ? 'Migrating...' : 'Migrate Scoring'}
                  </Button>
                  <CleanupSessionsButton />
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="prism-container py-4 md:py-8">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="attempts">Attempts</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* PRISM Results Tab */}
              <TabsContent value="results" className="space-y-6">
            {dashboardResults.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Your PRISM Results</h2>
                    <p className="text-muted-foreground">
                      Complete personality profiles from your 248-question assessments
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {dashboardResults.length} complete result{dashboardResults.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboardResults.map((result) => (
                    <Card key={result.session_id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="default" className="bg-primary text-xs">
                                Complete Profile
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(result.submitted_at)}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-lg md:text-xl text-primary">
                                  {result.type_code}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {result.session_id.slice(0, 8)}...
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                                <span>Confidence: {result.conf_band}</span>
                                <span>Fit: {result.score_fit_calibrated?.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => window.open(result.results_url, '_blank')}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                          >
                            View Results
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Complete Results Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete 248-question assessments will appear here
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Real-time Scoring Results */}
            {scoringResults.length > 0 && (
              <div className="mb-8">
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Latest Assessment Results
                      <Badge variant="secondary" className="ml-auto">
                        Live Updates
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scoringResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-sm">
                              {result.type_code}
                            </Badge>
                            <Badge 
                              variant={result.confidence === 'High' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {result.confidence} Confidence
                            </Badge>
                            <Badge 
                              variant={result.fit_band === 'High' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {result.fit_band} Fit
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Score: {result.score_fit_calibrated?.toFixed(1)} • 
                            Updated: {formatTimestamp(result.computed_at)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => recomputeScoring(result.session_id)}
                          disabled={isRecomputing}
                          className="ml-4"
                        >
                          {isRecomputing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                    
                    {scoringResults.length > 3 && (
                      <div className="text-center text-sm text-gray-500 pt-2">
                        Showing 3 of {scoringResults.length} results
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>
            )}
              </TabsContent>

              {/* Assessment Attempts Tab */}
              <TabsContent value="attempts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Assessment Attempts</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetake}
                    disabled={isStartingSession}
                    className="flex items-center gap-2"
                  >
                    {isStartingSession ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                    Retake
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchUserData}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {retakeBlock ? (
                  <RetakeLimitNotice block={retakeBlock} />
                ) : null}
                {attempts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attempt</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Overlay</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.session_id}>
                          <TableCell>#{attempt.attempt_no}</TableCell>
                          <TableCell>{formatTimestamp(attempt.started_at)}</TableCell>
                          <TableCell>{formatTimestamp(attempt.completed_at)}</TableCell>
                          <TableCell>{attempt.type_code ?? '—'}</TableCell>
                          <TableCell>{attempt.conf_band ?? '—'}</TableCell>
                          <TableCell>{attempt.overlay ?? '—'}</TableCell>
                          <TableCell>{attempt.payment_status ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No assessment attempts recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
              </TabsContent>

              {/* User Assessment History Tab */}
              <TabsContent value="history" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Assessment History</h2>
                  <p className="text-muted-foreground">
                    Track your assessment progress and session details
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {userSessions.length} session{userSessions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Take your first PRISM assessment to discover your personality profile
                    </p>
                    <Button onClick={() => navigate('/assessment')}>
                      Take Assessment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {userSessions.map((session) => {
                    const normalized = (session.status || '').toLowerCase();
                    const doneStatuses = new Set(['completed', 'complete', 'finalized', 'scored']);
                    const isDone = doneStatuses.has(normalized);
                    return (
                      <Card key={session.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={isDone ? 'default' : 'secondary'} className="text-xs">
                                  {isDone ? 'Completed' : 'In Progress'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(session.started_at)}
                                </span>
                              </div>

                              {session.profile ? (
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-lg md:text-xl text-primary">
                                      {session.profile.type_code}
                                    </span>
                                    {(session.profile.overlay ?? '') && (
                                      <Badge variant="outline" className="text-xs bg-secondary">
                                        State: {session.profile.overlay ?? ''}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Type:</span>
                                      <span className="text-primary font-semibold">{session.profile.type_code}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Fit:</span>
                                      <span className="text-primary font-semibold">{session.profile.fit_band || 'N/A'}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm text-muted-foreground">
                                    Confidence: {typeof session.profile.confidence === 'number' 
                                      ? `${Math.round(session.profile.confidence * 100)}%` 
                                      : session.profile.confidence || 'N/A'}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span className="text-muted-foreground">
                                      Progress: {session.completed_questions}/{session.total_questions}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {Math.round((session.completed_questions / Math.max(session.total_questions, 1)) * 100)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-secondary rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                                      style={{ 
                                        width: `${Math.min((session.completed_questions / Math.max(session.total_questions, 1)) * 100, 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                              {isDone ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/results/${session.id}`)}
                                    className="flex-1 md:flex-none"
                                  >
                                    <Eye className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">View</span>
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => recomputeSession(session.id)}
                                    title="Recompute with enhanced scoring metrics"
                                    className="flex-1 md:flex-none"
                                  >
                                    <Zap className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Enhance</span>
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/assessment?resume=${session.id}`)}
                                  className="w-full"
                                >
                                  Continue
                                  <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserDashboard;