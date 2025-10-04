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
import { 
  CreditCard, 
  Settings, 
  User, 
  BarChart3, 
  Bot, 
  Users, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Share2,
  Sparkles,
  TrendingUp,
  Lock,
  Map,
  Grid3x3,
  MessageSquare,
  Play,
  Trash2,
  Bell,
  Heart
} from 'lucide-react';
import { FaReddit, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { Users2 } from 'lucide-react';
import { useMemo } from 'react';
import { getPlaceholderKpis } from '@/lib/placeholderKpis';
import {
  CoreAnchorWidget,
  StabilityMeterWidget,
  ConfidenceDialWidget,
  StateBadgesWidget
} from '@/components/account/TrendsWidgets';
import { BetaOptInModal } from '@/components/BetaOptInModal';
import { AICoachPreview } from '@/components/account/AICoachPreview';
import { CohortsPreview } from '@/components/account/CohortsPreview';
import { OneOnOnePreview } from '@/components/account/OneOnOnePreview';
import { WaitlistModal } from '@/components/WaitlistModal';

export default function Account() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'dashboard';
  const { user } = useAuth();
  const { isMember, membershipPlan, refetch, advancedCreditsRemaining } = useEntitlementsContext();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [surveySessions, setSurveySessions] = useState<any[]>([]);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistFeature, setWaitlistFeature] = useState<string>("");
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

  // Fetch user sessions and survey status
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch sessions separately
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('assessment_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(50);

        if (sessionsError) throw sessionsError;

        // Fetch profiles separately
        if (sessionsData && sessionsData.length > 0) {
          const sessionIds = sessionsData.map(s => s.id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('session_id', sessionIds);
          
          // Merge data
          const sessionsWithProfiles = sessionsData.map(session => ({
            ...session,
            profile: profilesData?.find(p => p.session_id === session.id)
          }));
          
          setSessions(sessionsWithProfiles);
        } else {
          setSessions(sessionsData || []);
        }

        // Fetch survey sessions
        const { data: surveyData } = await supabase
          .from('post_survey_sessions')
          .select('assessment_session_id, completed_at')
          .eq('user_id', user.id);
        
        setSurveySessions(surveyData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingSessions(false);
      }
    }

    fetchData();
  }, [user]);

  const openWaitlist = (feature: string) => {
    setWaitlistFeature(feature);
    setIsWaitlistOpen(true);
  };

  const closeWaitlist = () => {
    setIsWaitlistOpen(false);
    setWaitlistFeature("");
  };

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
  const inProgressSessions = sessions.filter(s => s.status === 'in_progress');
  const currentYear = new Date().getFullYear();
  const retakesThisYear = completedSessions.filter(s => 
    new Date(s.started_at).getFullYear() === currentYear
  ).length;

  // Calculate action items
  const hasCompletedSurvey = surveySessions.some(s => s.completed_at);
  const firstCompletedSession = completedSessions[0];
  const canRetake = firstCompletedSession ? 
    (Date.now() - new Date(firstCompletedSession.completed_at || firstCompletedSession.started_at).getTime()) > (30 * 24 * 60 * 60 * 1000) 
    : false;
  const daysUntilRetake = firstCompletedSession && !canRetake ?
    Math.ceil(30 - (Date.now() - new Date(firstCompletedSession.completed_at || firstCompletedSession.started_at).getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  // Helper to check if survey is completed for a specific session
  const getSurveyStatus = (sessionId: string) => {
    const survey = surveySessions.find(s => s.assessment_session_id === sessionId);
    return {
      exists: !!survey,
      completed: !!survey?.completed_at
    };
  };

  const placeholderKpis = useMemo(
    () => getPlaceholderKpis(completedSessions.length),
    [completedSessions.length]
  );

  const actionItems = [
    {
      icon: CheckCircle2,
      title: 'Complete Your First Assessment',
      description: 'Start your PRISM journey today',
      action: completedSessions.length > 0 ? null : () => navigate('/assessment'),
      variant: 'default' as const,
      completed: completedSessions.length > 0
    },
    {
      icon: CheckCircle2,
      title: 'Take the 2-Minute Survey',
      description: 'Help us improve by sharing your feedback',
      action: hasCompletedSurvey ? null : () => navigate('/post-survey'),
      variant: 'default' as const,
      completed: hasCompletedSurvey
    },
    ...(completedSessions.length > 0 && !canRetake ? [{
      icon: Clock,
      title: `Retake Available in ${daysUntilRetake} Days`,
      description: 'Track personality trends with 30-day retakes',
      action: null,
      variant: 'secondary' as const,
      completed: false
    }] : []),
    {
      icon: Users,
      title: 'Join Our Community',
      description: 'Connect with us on social media',
      socialLinks: [
        { name: 'LinkedIn', Icon: FaLinkedin, url: 'https://linkedin.com/company/prism-personality-regulation-information-system-mapping' },
        { name: 'Facebook', Icon: FaFacebook, url: 'https://www.facebook.com/profile.php?id=61579334970712' },
        { name: 'Skool', Icon: Users2, url: 'https://www.skool.com/prism-dynamics-5834/about?ref=931e57f033d34f3eb64db45f22b1389e' },
        { name: 'Reddit', Icon: FaReddit, url: 'https://www.reddit.com/r/PrismPersonality' }
      ],
      variant: 'default' as const,
      completed: false
    },
    {
      icon: Sparkles,
      title: 'Join Founding Beta',
      description: 'Unlock AI Coach, Cohorts, and premium features',
      action: isMember ? null : () => navigate('/membership'),
      variant: 'default' as const,
      completed: isMember
    }
  ];

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
              <TabsList className="grid grid-cols-7 gap-2 h-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends & KPIs
                  <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>
                </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cohorts
              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>
            </TabsTrigger>
            <TabsTrigger value="coaching" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              1:1s
              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>
            </TabsTrigger>
            <TabsTrigger value="ai-coach" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Coach
              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>
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
                {/* Action Items Checklist */}
                {actionItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Action Items</CardTitle>
                      <CardDescription>Complete these to enhance your PRISM experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {actionItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                            item.completed 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                              : 'bg-card hover:bg-accent/50'
                          }`}>
                            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              item.completed ? 'text-green-600 dark:text-green-400' : 'text-primary'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.title}</h4>
                                {item.completed && (
                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    ✓ Completed!
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            {'socialLinks' in item && item.socialLinks ? (
                              <div className="flex gap-2">
                                {item.socialLinks.map(social => (
                                  <Button
                                    key={social.name}
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(social.url, '_blank')}
                                    title={social.name}
                                  >
                                    <social.Icon className="h-4 w-4" />
                                  </Button>
                                ))}
                              </div>
                            ) : item.action && (
                              <Button 
                                onClick={item.action} 
                                variant={item.variant} 
                                size="sm" 
                                className="flex-shrink-0"
                                disabled={item.completed}
                              >
                                {item.completed ? 'Done' : 'Go'}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Completed Results History */}
            {inProgressSessions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    In Progress Assessments
                  </CardTitle>
                  <CardDescription>
                    {inProgressSessions.length} assessment{inProgressSessions.length !== 1 ? 's' : ''} in progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inProgressSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card border-orange-200 dark:border-orange-800">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {session.completed_questions || 0} / {session.total_questions || 0} questions
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Started {new Date(session.started_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/assessment?session=${session.id}`)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this in-progress assessment?')) {
                                const { error } = await supabase
                                  .from('assessment_sessions')
                                  .delete()
                                  .eq('id', session.id);
                                
                                if (error) {
                                  toast({ 
                                    title: 'Error',
                                    description: 'Failed to delete assessment',
                                    variant: 'destructive'
                                  });
                                } else {
                                  toast({ 
                                    title: 'Assessment deleted',
                                    description: 'Your in-progress assessment has been removed'
                                  });
                                  setSessions(sessions.filter(s => s.id !== session.id));
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Completed Results</CardTitle>
                    <CardDescription>
                      {completedSessions.length} assessment{completedSessions.length !== 1 ? 's' : ''} completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSessions ? (
                      <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : completedSessions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No completed assessments yet</p>
                        <Button onClick={() => navigate('/assessment')}>Start Assessment</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {completedSessions.map((session) => {
                          const profile = session.profile;
                          return (
                            <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-mono font-bold text-lg">
                                    {profile?.type_code || 'Processing...'}
                                  </span>
                                  {profile?.overlay && (
                                    <Badge variant="outline">{profile.overlay}</Badge>
                                  )}
                                  <Badge variant={profile?.fit_band === 'High' ? 'default' : 'secondary'}>
                                    {profile?.fit_band || 'Pending'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.completed_at || session.started_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/results/${session.id}?t=${session.share_token}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={advancedCreditsRemaining <= 0}
                                  onClick={() => toast({ title: 'Advanced purchase coming soon!' })}
                                >
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  Advanced
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/results/${session.id}?t=${session.share_token}`);
                                    toast({ 
                                      title: 'Link copied!',
                                      description: 'Share your results with others'
                                    });
                                  }}
                                >
                                  <Share2 className="h-4 w-4 mr-1" />
                                  Share
                                </Button>
                                {(() => {
                                  const surveyStatus = getSurveyStatus(session.id);
                                  
                                  if (surveyStatus.completed) {
                                    return (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Survey Complete
                                      </Badge>
                                    );
                                  }
                                  
                                  return (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/post-survey/${session.id}?t=${session.share_token}`)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Take Survey
                                    </Button>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Beta Membership CTA */}
                {!isMember && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Join Founding Beta
                      </CardTitle>
                      <CardDescription>Unlock premium features and support PRISM development</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          PRISM Coach AI - Personalized insights
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Join Cohorts - Connect with your type
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          1:1 Coaching Sessions - Expert guidance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Advanced Results - Deep personality analysis
                        </li>
                      </ul>
                      <Button onClick={() => navigate('/membership')} className="w-full">
                        View Membership Options
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* AI Coach Tab */}
          <TabsContent value="ai-coach" className="space-y-6">
            {!isMember ? (
              <AICoachPreview 
                isMember={isMember}
                onJoinBeta={() => setShowBetaModal(true)}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-6">
                  <div>
                    <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">AI Coach Coming Soon</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Your personalized AI coach will provide daily micro-plans tied to your 1D–4D profile 
                      and state-aware nudges for Flow vs Stress contexts.
                    </p>
                    <Badge variant="outline" className="px-3 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      In Development
                    </Badge>
                  </div>
                  
                  <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
                    <CardContent className="pt-6 text-center space-y-3">
                      <p className="text-sm font-medium">Get early access to AI Coach</p>
                      <Button onClick={() => openWaitlist('ai-coach')} variant="outline" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Join the Waitlist
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            {!isMember ? (
              <CohortsPreview 
                isMember={isMember}
                onJoinBeta={() => setShowBetaModal(true)}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-6">
                  <div>
                    <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Cohorts Coming Soon</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Your type-clustered cohorts and complementary mixes are being prepared. 
                      Weekly prompts, async discussions, and live calls launching soon.
                    </p>
                    <Badge variant="outline" className="px-3 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      In Development
                    </Badge>
                  </div>
                  
                  <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
                    <CardContent className="pt-6 text-center space-y-3">
                      <p className="text-sm font-medium">Get notified when Cohorts launch</p>
                      <Button onClick={() => openWaitlist('cohorts')} variant="outline" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Join the Waitlist
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 1:1s Tab */}
          <TabsContent value="coaching" className="space-y-6">
            {!isMember ? (
              <OneOnOnePreview 
                isMember={isMember}
                onJoinBeta={() => setShowBetaModal(true)}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-6">
                  <div>
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">1:1s — Relational Fit Coming Soon</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Analyze relational compatibility one-on-one using KPIs similar to Cohorts: 
                      core type alignment, drift patterns, supply/demand dynamics, and compatibility scoring.
                    </p>
                    <Badge variant="outline" className="px-3 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      In Development
                    </Badge>
                  </div>
                  
                  <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
                    <CardContent className="pt-6 text-center space-y-3">
                      <p className="text-sm font-medium">Be the first to book 1:1 sessions</p>
                      <Button onClick={() => openWaitlist('one-on-ones')} variant="outline" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Join the Waitlist
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

              {/* Trends & KPIs Tab */}
              <TabsContent value="profile" className="space-y-6">
                {/* Header with Beta CTA */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Trends & KPIs
                        </CardTitle>
                        <CardDescription>
                          Your personality dynamics over time
                        </CardDescription>
                      </div>
                      {!isMember && (
                        <Button onClick={() => setShowBetaModal(true)} variant="outline">
                          <Lock className="h-4 w-4 mr-2" />
                          Unlock Full Data
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Sneak-Peek Widgets Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <CoreAnchorWidget data={placeholderKpis.coreAnchor} isMember={isMember} />
                  <StabilityMeterWidget data={placeholderKpis.stabilityMeter} isMember={isMember} />
                  <ConfidenceDialWidget data={placeholderKpis.confidenceDial} isMember={isMember} />
                  <StateBadgesWidget data={placeholderKpis.stateBadges} isMember={isMember} />
                </div>

                {/* Beta Unlock Tease Section (Non-Members) */}
                {!isMember && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        What Beta Unlocks
                      </CardTitle>
                      <CardDescription>
                        See your real drift over time, not just a 4-letter snapshot
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {/* Feature previews */}
                        <div className="flex gap-3 p-3 rounded-lg border bg-card/50">
                          <Map className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm">Drift Map</h4>
                            <p className="text-xs text-muted-foreground">
                              Triangle plot showing core → 3 lookalikes with event pins from your notes
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg border bg-card/50">
                          <Grid3x3 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm">Dimensional Heatmap</h4>
                            <p className="text-xs text-muted-foreground">
                              1D–4D per function with workload guidance (Lead/Primary/Ops/Checklist)
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg border bg-card/50">
                          <BarChart3 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm">KPI Suite</h4>
                            <p className="text-xs text-muted-foreground">
                              Trend Top-2 Gap, Confidence, Method Agreement, and N-tilt monthly/quarterly
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => setShowBetaModal(true)} className="w-full" size="lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Join Beta to Unlock
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* For Members: Coming Soon Placeholder */}
                {isMember && (
                  <Card>
                    <CardContent className="py-12 text-center space-y-6">
                      <div>
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Drift Map & Full KPIs</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                          Your full dynamic profile is being prepared. Drift Map, Dimensional Heatmap, 
                          and trending KPIs will be available soon.
                        </p>
                        <Badge variant="outline" className="px-3 py-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Coming Soon
                        </Badge>
                      </div>
                      
                      <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
                        <CardContent className="pt-6 text-center space-y-3">
                          <p className="text-sm font-medium">Be among the first to access Trends & KPIs</p>
                          <Button onClick={() => openWaitlist('trends-kpis')} variant="outline" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Join the Waitlist
                          </Button>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                )}
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

                    {/* Support the Project */}
                    <div className="border-t pt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Support PRISM
                          </CardTitle>
                          <CardDescription>
                            Help us build better personality assessment tools
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Your donation helps us improve the assessment, add new features, and keep PRISM accessible to everyone.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => window.open('https://donate.stripe.com/3cI6oHdR3cLg4n0eUV', '_blank')}
                            >
                              <Heart className="mr-2 h-4 w-4" />
                              One-Time Gift
                            </Button>
                            <Button 
                              variant="default" 
                              className="w-full"
                              onClick={() => window.open('https://donate.stripe.com/3cI6oHdR3cLg4n0eUV', '_blank')}
                            >
                              <Heart className="mr-2 h-4 w-4" />
                              Monthly Support
                              <Badge variant="secondary" className="ml-2 text-xs">⭐</Badge>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

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

              {/* Membership Tiers & Benefits */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Membership Tiers & Benefits</h4>
                <div className="space-y-6">
                  {/* Monthly Tier */}
                  <div className={`p-4 rounded-lg border ${membershipPlan === 'monthly' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold">Monthly Beta</h5>
                      <Badge variant={membershipPlan === 'monthly' ? 'default' : 'outline'}>
                        {membershipPlan === 'monthly' ? 'Your Plan' : '$9.97/mo'}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Today Column */}
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Available Today
                        </h6>
                        <ul className="text-sm space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>2 Advanced Reports per retake</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Full assessment history</span>
                          </li>
                        </ul>
                      </div>
                      {/* Coming Soon Column */}
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Coming Soon
                        </h6>
                        <ul className="text-sm space-y-1.5 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>AI Coach access</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Cohort matching</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Full KPIs & Drift Map</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Annual Tier */}
                  <div className={`p-4 rounded-lg border ${membershipPlan === 'annual' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold">Annual Beta</h5>
                      <Badge variant={membershipPlan === 'annual' ? 'default' : 'outline'}>
                        {membershipPlan === 'annual' ? 'Your Plan' : '$79/yr'}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Today Column */}
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Available Today
                        </h6>
                        <ul className="text-sm space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Everything in Monthly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Save 34% vs monthly</span>
                          </li>
                        </ul>
                      </div>
                      {/* Coming Soon Column */}
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Coming Soon
                        </h6>
                        <ul className="text-sm space-y-1.5 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Early access to new features</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Priority support</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Lifetime Tier */}
                  <div className={`p-4 rounded-lg border ${membershipPlan === 'lifetime' ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold">Lifetime Beta</h5>
                      <Badge variant={membershipPlan === 'lifetime' ? 'default' : 'outline'}>
                        {membershipPlan === 'lifetime' ? 'Your Plan' : '$199 once'}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Today Column */}
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Available Today
                        </h6>
                        <ul className="text-sm space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>All features forever</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Unlimited Advanced Reports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Never pay again</span>
                          </li>
                        </ul>
                      </div>
                      {/* Coming Soon Column */}
                      <div>
                        <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Coming Soon
                        </h6>
                        <ul className="text-sm space-y-1.5 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Founding member badge</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Exclusive community access</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                            <span>Lifetime updates to all tools</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!isMember && (
                  <Button 
                    className="w-full mt-3" 
                    onClick={() => navigate('/membership')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    View All Plans
                  </Button>
                )}
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
        
        <BetaOptInModal 
          open={showBetaModal} 
          onOpenChange={setShowBetaModal} 
        />
        <WaitlistModal 
          isOpen={isWaitlistOpen}
          onClose={closeWaitlist}
          feature={waitlistFeature}
        />
      </div>
    </ProtectedRoute>
  );
}
