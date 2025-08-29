import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, User, Target, ExternalLink, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user's assessment sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('assessment_sessions')
        .select(`
          id,
          status,
          started_at,
          completed_at,
          completed_questions,
          total_questions
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch profiles for completed sessions
      const sessionIds = sessions?.map(s => s.id) || [];
      
      let profiles: any[] = [];
      if (sessionIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('session_id, type_code, confidence, fit_band, overlay')
          .in('session_id', sessionIds);

        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }

      // Combine sessions with profiles
      const sessionsWithProfiles = sessions?.map(session => ({
        ...session,
        profile: profiles.find(p => p.session_id === session.id)
      })) || [];

      setUserSessions(sessionsWithProfiles);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    } finally {
      setIsLoading(false);
    }
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

          {/* Main Dashboard Content */}
          <div className="prism-container py-8">
            {/* User Assessment History */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Assessment History</h2>
                  <p className="text-muted-foreground">
                    Track your personality profile results and assessment progress
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {userSessions.length} assessment{userSessions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
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
                    <Button onClick={() => window.location.href = '/assessment'}>
                      Take Assessment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                                {session.status === 'completed' ? 'Completed' : 'In Progress'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(session.started_at), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            
                            {session.profile ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lg">
                                    {session.profile.type_code}
                                  </span>
                                  {session.profile.overlay && (
                                    <Badge variant="outline" className="text-xs">
                                      State: {session.profile.overlay}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Confidence: {session.profile.confidence}</span>
                                  <span>Fit: {session.profile.fit_band}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                Progress: {session.completed_questions}/{session.total_questions} questions
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {session.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `/results/${session.id}`}
                              >
                                View Results
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                            {session.status !== 'completed' && (
                              <Button 
                                size="sm"
                                onClick={() => window.location.href = '/assessment'}
                              >
                                Continue
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserDashboard;