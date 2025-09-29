import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Bug, Wrench, Database, RotateCcw, ExternalLink, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Access control - only for admin users
const ADMIN_EMAILS = ['daniel.joseph.speiss@gmail.com'];

interface Session {
  id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  completed_questions: number;
  total_questions: number;
  email?: string;
  user_id?: string;
  type_code?: string;
  confidence?: number;
  results_version?: string;
}

const Troubleshoot: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState('');
  const [searchedSession, setSearchedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [recomputeLoading, setRecomputeLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [duplicateResults, setDuplicateResults] = useState<any>(null);

  // Check admin access
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const searchSession = async () => {
    if (!sessionId.trim()) {
      toast({ title: "Please enter a session ID", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Search in both assessment_sessions and profiles
      const { data: sessionData, error: sessionError } = await supabase
        .from('assessment_sessions')
        .select('*')
        .eq('id', sessionId.trim())
        .single();

      if (sessionError) {
        toast({ title: "Session not found", variant: "destructive" });
        setSearchedSession(null);
        return;
      }

      // Get profile data if available
      const { data: profileData } = await supabase
        .from('profiles')
        .select('type_code, confidence, results_version')
        .eq('session_id', sessionId.trim())
        .maybeSingle();

      const session: Session = {
        id: sessionData.id as string,
        status: sessionData.status as string,
        started_at: sessionData.started_at as string,
        completed_at: sessionData.completed_at as string | undefined,
        completed_questions: sessionData.completed_questions as number,
        total_questions: sessionData.total_questions as number,
        email: sessionData.email as string | undefined,
        user_id: sessionData.user_id as string | undefined,
        type_code: (profileData?.type_code as string) || undefined,
        confidence: (profileData?.confidence as number) || undefined,
        results_version: (profileData?.results_version as string) || undefined
      };

      setSearchedSession(session);
    } catch (error) {
      toast({ title: "Error searching session", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSessions = async () => {
    setLoading(true);
    try {
      // Get sessions first
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('assessment_sessions')
        .select(`
          id, status, started_at, completed_at, completed_questions, 
          total_questions, email, user_id
        `)
        .order('started_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      // Get profile data for these sessions
      const sessionIds = sessionsData?.map(s => s.id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('session_id, type_code, confidence, results_version')
        .in('session_id', sessionIds);

      // Merge the data
      const formattedSessions: Session[] = (sessionsData || []).map(session => {
        const profile = profilesData?.find(p => p.session_id === session.id);
        return {
          id: session.id as string,
          status: session.status as string,
          started_at: session.started_at as string,
          completed_at: session.completed_at as string | undefined,
          completed_questions: session.completed_questions as number,
          total_questions: session.total_questions as number,
          email: session.email as string | undefined,
          user_id: session.user_id as string | undefined,
          type_code: (profile?.type_code as string) || undefined,
          confidence: (profile?.confidence as number) || undefined,
          results_version: (profile?.results_version as string) || undefined
        };
      });

      setSessions(formattedSessions);
    } catch (error) {
      toast({ title: "Error loading sessions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const recomputeSession = async (sessionId: string) => {
    setRecomputeLoading(true);
    try {
      const response = await fetch(`https://gnkuikentdtnatazeriu.supabase.co/functions/v1/force-recompute-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U`
        },
        body: JSON.stringify({ session_id: sessionId, dry_run: false })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({ title: "Session recomputed successfully!" });
        // Refresh the session data
        if (searchedSession?.id === sessionId) {
          searchSession();
        }
        loadRecentSessions();
      } else {
        toast({ title: "Error recomputing session", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setRecomputeLoading(false);
    }
  };

  const completeNearFinished = async () => {
    setRecomputeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

      const response = await fetch(`https://gnkuikentdtnatazeriu.supabase.co/functions/v1/complete-near-finished-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ min_questions: 247, dry_run: false })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: "Near-finished sessions completed!", 
          description: `Found: ${result.found}, Completed: ${result.completed}, Recomputed: ${result.recomputed}` 
        });
        loadRecentSessions();
      } else {
        toast({ title: "Error completing sessions", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setRecomputeLoading(false);
    }
  };

  const recomputeBatch = async (limit: number = 100, sinceDate?: string) => {
    setRecomputeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

      const payload: any = { limit, dry_run: false };
      if (sinceDate) payload.since = sinceDate;

      const response = await fetch(`https://gnkuikentdtnatazeriu.supabase.co/functions/v1/admin-batch-recompute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: "Batch recompute completed!", 
          description: `Processed: ${result.scanned}, Success: ${result.ok}, Failed: ${result.fail}` 
        });
        loadRecentSessions();
      } else {
        toast({ title: "Error in batch recompute", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setRecomputeLoading(false);
    }
  };

  const cleanupDuplicates = async (dryRun: boolean = true, targetUserId?: string, targetEmail?: string) => {
    setCleanupLoading(true);
    setDuplicateResults(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

      const payload: any = { dry_run: dryRun };
      if (targetUserId) payload.user_id = targetUserId;
      if (targetEmail) payload.email = targetEmail;

      const response = await fetch(`https://gnkuikentdtnatazeriu.supabase.co/functions/v1/cleanup-duplicate-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        setDuplicateResults(result);
        toast({ 
          title: dryRun ? "Duplicate scan completed!" : "Duplicate cleanup completed!", 
          description: `Found: ${result.duplicates_found} users with duplicates, ${dryRun ? 'Would clean' : 'Cleaned'}: ${result.sessions_cleaned} sessions` 
        });
        
        if (!dryRun) {
          loadRecentSessions(); // Refresh session list
        }
      } else {
        toast({ title: "Error in duplicate cleanup", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setCleanupLoading(false);
    }

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const SessionCard: React.FC<{ session: Session }> = ({ session }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="font-mono text-sm text-muted-foreground">{session.id}</div>
            <div className="flex gap-2">
              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                {session.status}
              </Badge>
              {session.type_code && (
                <Badge variant="outline">{session.type_code}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {session.status === 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/results/${session.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => recomputeSession(session.id)}
              disabled={recomputeLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Recompute
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div>Started: {new Date(session.started_at).toLocaleDateString()}</div>
          {session.completed_at && (
            <div>Completed: {new Date(session.completed_at).toLocaleDateString()}</div>
          )}
          <div>
            Questions: {session.completed_questions || 0}/{session.total_questions || 'N/A'}
            {session.completed_questions === 0 && session.status === 'in_progress' && (
              <span className="text-red-600 ml-2">⚠️ No responses</span>
            )}
            {session.completed_questions === 0 && session.status === 'completed' && (
              <span className="text-yellow-600 ml-2">⚠️ Completed but no data</span>
            )}
          </div>
          {session.confidence && (
            <div>Confidence: {session.confidence.toFixed(4)}</div>
          )}
        </div>
        {session.email && (
          <div className="mt-2 text-xs text-muted-foreground">
            Email: {session.email}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Troubleshooting Dashboard</h1>
        <p className="text-muted-foreground">Debug and manage assessment sessions</p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Session Search
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Database className="h-4 w-4 mr-2" />
            Recent Sessions
          </TabsTrigger>
          <TabsTrigger value="duplicates">
            <Users className="h-4 w-4 mr-2" />
            Duplicate Cleanup
          </TabsTrigger>
          <TabsTrigger value="recompute">
            <RotateCcw className="h-4 w-4 mr-2" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Session by ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter session ID..."
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSession()}
                />
                <Button onClick={searchSession} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {searchedSession && (
                <SessionCard session={searchedSession} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Sessions (Last 100)
                <Button onClick={loadRecentSessions} disabled={loading} size="sm">
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">🔍 Scan for Duplicates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Find users with multiple in-progress sessions and see which ones would be cleaned up.
                </p>
                <Button
                  onClick={() => cleanupDuplicates(true)}
                  disabled={cleanupLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {cleanupLoading ? "Scanning..." : "Scan for Duplicates (Dry Run)"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">⚡ Clean Up Duplicates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Remove duplicate sessions, keeping the one with the most progress for each user.
                </p>
                <Button
                  onClick={() => cleanupDuplicates(false)}
                  disabled={cleanupLoading || !duplicateResults}
                  variant="secondary"
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {cleanupLoading ? "Cleaning..." : "Clean Up Duplicates"}
                </Button>
                {!duplicateResults && (
                  <p className="text-xs text-muted-foreground">
                    Run a scan first to see what would be cleaned up
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {duplicateResults && (
            <Card>
              <CardHeader>
                <CardTitle>Duplicate Cleanup Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded">
                      <div className="font-semibold">Users with Duplicates</div>
                      <div className="text-2xl font-bold text-blue-600">{duplicateResults.duplicates_found}</div>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <div className="font-semibold">Sessions to Clean</div>
                      <div className="text-2xl font-bold text-orange-600">{duplicateResults.sessions_cleaned}</div>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <div className="font-semibold">Mode</div>
                      <div className="text-sm font-bold text-green-600">
                        {duplicateResults.dry_run ? 'DRY RUN' : 'EXECUTED'}
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <div className="font-semibold">Status</div>
                      <div className="text-sm font-bold text-green-600">SUCCESS</div>
                    </div>
                  </div>

                  {duplicateResults.cleanup_details && duplicateResults.cleanup_details.length > 0 && (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      <h4 className="font-semibold">Cleanup Details:</h4>
                      {duplicateResults.cleanup_details.map((detail: any, index: number) => (
                        <div key={index} className="border p-3 rounded text-xs">
                          <div className="font-semibold mb-2">User: {detail.user_identifier}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-green-600 font-medium">✓ Kept Session:</div>
                              <div>ID: {detail.kept_session.id.slice(0, 8)}...</div>
                              <div>Questions: {detail.kept_session.completed_questions}</div>
                              <div>Started: {new Date(detail.kept_session.started_at).toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-red-600 font-medium">✗ Removed Sessions:</div>
                              {detail.removed_sessions.map((removed: any, i: number) => (
                                <div key={i} className="mb-1">
                                  <div>ID: {removed.id.slice(0, 8)}... ({removed.completed_questions} questions)</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recompute" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">⚡ Complete Near-Finished Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete and recompute sessions with 247+ questions that are stuck.
                </p>
                <Button
                  onClick={() => completeNearFinished()}
                  disabled={recomputeLoading}
                  variant="secondary"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {recomputeLoading ? "Processing..." : "Complete 247+ Sessions"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">⚠️ Recompute ALL Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Recompute ALL sessions in the database (no time limit). Use with caution.
                </p>
                <Button
                  onClick={() => recomputeBatch(50000)}
                  disabled={recomputeLoading}
                  variant="destructive"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {recomputeLoading ? "Processing..." : "Recompute ALL Sessions"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recompute Last 90 Days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Recompute all sessions from the last 90 days to add advanced metrics.
                </p>
                <Button
                  onClick={() => {
                    const date90DaysAgo = new Date();
                    date90DaysAgo.setDate(date90DaysAgo.getDate() - 90);
                    recomputeBatch(2000, date90DaysAgo.toISOString().split('T')[0]);
                  }}
                  disabled={recomputeLoading}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {recomputeLoading ? "Processing..." : "Recompute Last 90 Days"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Quick batch recompute options.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => recomputeBatch(100)}
                    disabled={recomputeLoading}
                    variant="outline"
                    size="sm"
                  >
                    Last 100
                  </Button>
                  <Button
                    onClick={() => recomputeBatch(500)}
                    disabled={recomputeLoading}
                    variant="outline"
                    size="sm"
                  >
                    Last 500
                  </Button>
                  <Button
                    onClick={() => recomputeBatch(1000)}
                    disabled={recomputeLoading}
                    variant="outline"
                    size="sm"
                  >
                    Last 1000
                  </Button>
                  <Button
                    onClick={() => recomputeBatch(5000, "2024-01-01")}
                    disabled={recomputeLoading}
                    variant="outline"
                    size="sm"
                  >
                    Since 2024
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>External Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('/trigger-recompute-fixed.html', '_blank')}
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Fixed Recompute Tool
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('/trigger-batch-recompute.html', '_blank')}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Batch Recompute Tool
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Total Sessions: {sessions.length}</p>
                  <p>Completed: {sessions.filter(s => s.status === 'completed').length}</p>
                  <p>In Progress: {sessions.filter(s => s.status === 'in_progress').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Troubleshoot;