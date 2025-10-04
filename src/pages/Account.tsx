import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEntitlementsContext } from '@/contexts/EntitlementsContext';
import { MembershipGate } from '@/components/MembershipGate';
import { CreditCounter } from '@/components/CreditCounter';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Lock, CreditCard, Settings, User, Users, Calendar, Bot, BarChart3 } from 'lucide-react';

export default function Account() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'dashboard';
  const { user } = useAuth();
  const { isMember, membershipPlan, refetch } = useEntitlementsContext();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const navigate = useNavigate();

  // Check for success redirects
  useEffect(() => {
    const purchase = searchParams.get('purchase');
    const plan = searchParams.get('plan');
    
    if (purchase === 'success' && plan) {
      toast({
        title: "Welcome to Founding Beta!",
        description: `Your ${plan} membership is active.`,
      });
      refetch();
    }
  }, [searchParams, refetch]);

  // Fetch user sessions
  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;
      
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
        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    }

    fetchSessions();
  }, [user]);

  const handleOpenPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal');
      
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error('No portal URL returned');
    } catch (err) {
      console.error('Portal error:', err);
      toast({
        title: "Billing Portal Unavailable",
        description: "Couldn't open billing portal. Contact support@prismpersonality.com.",
        variant: "destructive"
      });
    }
  };

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const currentYear = new Date().getFullYear();
  const retakesThisYear = completedSessions.filter(s => 
    new Date(s.started_at).getFullYear() === currentYear
  ).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="prism-container px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Account</h1>
              <p className="text-muted-foreground">
                Manage your assessments, membership, and settings
              </p>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-6">
              <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-2 h-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="coach" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Coach
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Groups
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  1:1s
                </TabsTrigger>
                <TabsTrigger value="purchases" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Purchases
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* KPI Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="text-2xl font-bold">{retakesThisYear}</div>
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
                <div className="flex gap-3">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Results</CardTitle>
                    <CardDescription>
                      Your assessment history with detailed metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSessions ? (
                      <p className="text-muted-foreground">Loading...</p>
                    ) : completedSessions.length > 0 ? (
                      <div className="space-y-3">
                        {completedSessions.map((session: any) => {
                          const profile = session.profiles?.[0] || session.profiles;
                          return (
                            <Card key={session.id} className="p-4">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                      Session {session.id.slice(0, 6)} · {new Date(session.completed_at || session.started_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Core Type:</span>{' '}
                                      <span className="font-medium">{profile?.type_code || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Fit Score:</span>{' '}
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
                                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/results/${session.id}`)}
                                  >
                                    View Results
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/assessment?retake=${session.id}`)}
                                  >
                                    Retake
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/survey/${session.id}`)}
                                  >
                                    Post-Survey
                                  </Button>
                                </div>
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

                {/* Upsell for non-members */}
                {!isMember && (
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle>Unlock Trends & Cohorts</CardTitle>
                      <CardDescription>
                        Join the Founding Beta to access trend syncing, cohorts, and early features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => navigate('/membership')}>
                        Join Beta
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trends Chart</CardTitle>
                    <CardDescription>Track your personality trends across retakes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MembershipGate feature="Trend Syncing">
                      <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Trends chart will appear here</p>
                      </div>
                    </MembershipGate>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PRISM Coach AI Tab */}
              <TabsContent value="coach" className="space-y-6">
                <MembershipGate 
                  feature="PRISM Coach AI" 
                  blurWhenLocked={false}
                  fallback={
                    <Card className="text-center p-12">
                      <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <CardTitle className="mb-2">PRISM Coach AI</CardTitle>
                      <CardDescription className="mb-4">
                        Coming Soon — Beta members get early access & discount
                      </CardDescription>
                      <Button onClick={() => navigate('/membership')}>
                        Join Beta
                      </Button>
                    </Card>
                  }
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>PRISM Coach AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>AI Coach features will appear here</p>
                    </CardContent>
                  </Card>
                </MembershipGate>
              </TabsContent>

              {/* Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                <MembershipGate 
                  feature="Your Groups" 
                  blurWhenLocked={false}
                  fallback={
                    <Card className="text-center p-12">
                      <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <CardTitle className="mb-2">Invite-Only Cohorts</CardTitle>
                      <CardDescription className="mb-4">
                        Join exclusive cohorts to explore relational fit and team dynamics
                      </CardDescription>
                      <Button onClick={() => navigate('/membership')}>
                        Join Beta
                      </Button>
                    </Card>
                  }
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">No cohorts yet</p>
                      <Button variant="outline">Invite friend/team</Button>
                    </CardContent>
                  </Card>
                </MembershipGate>
              </TabsContent>

              {/* 1:1 Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                <MembershipGate 
                  feature="Your 1:1s" 
                  blurWhenLocked={false}
                  fallback={
                    <Card className="text-center p-12">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <CardTitle className="mb-2">1:1 Coaching Sessions</CardTitle>
                      <CardDescription className="mb-4">
                        Beta members get priority booking for personalized coaching
                      </CardDescription>
                      <Button onClick={() => navigate('/membership')}>
                        Join Beta
                      </Button>
                    </Card>
                  }
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Your 1:1 Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Scheduling link will appear here</p>
                    </CardContent>
                  </Card>
                </MembershipGate>
              </TabsContent>

              {/* Purchases Tab */}
              <TabsContent value="purchases" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Purchases</CardTitle>
                    <CardDescription>
                      View your purchase history and manage your subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleOpenPortal} className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription & Billing
                    </Button>

                    {membershipPlan && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Active Membership</h4>
                        <Badge variant="default" className="capitalize">{membershipPlan}</Badge>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Advanced Credits</h4>
                      <CreditCounter variant="detailed" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline">Update Email</Button>
                    <Button variant="outline">Change Password</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
