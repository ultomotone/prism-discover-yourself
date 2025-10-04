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
import { CreditCard, Settings, User } from 'lucide-react';

export default function Account() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
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
              <TabsList className="grid grid-cols-3 gap-2 h-auto">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
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
