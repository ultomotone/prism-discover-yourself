import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, TestTube, Mail, Activity, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmailLog {
  session_id: string;
  email_type: string;
  sent_at: string;
  status: string;
  error?: string;
}

const EmailManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [reminderType, setReminderType] = useState<"day3" | "day7">("day3");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [cronLogs, setCronLogs] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter a test email address"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call edge function to send test completion email
      const { error } = await supabase.functions.invoke('send-completion-email', {
        body: {
          sessionId: 'test-session-' + Date.now(),
          testMode: true,
          testEmail: testEmail
        }
      });

      if (error) throw error;

      toast({
        title: "Test email sent",
        description: `Completion email sent to ${testEmail}`
      });
      setTestEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send test email",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCompletion = async () => {
    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Session ID required",
        description: "Please enter a session ID"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-completion-email', {
        body: { sessionId }
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: `Completion email sent for session ${sessionId.substring(0, 8)}...`
      });
      setSessionId("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualReminder = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-feedback-reminders', {
        body: {
          testMode: true,
          reminderType
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder sent",
        description: `${reminderType === 'day3' ? 'Day 3' : 'Day 7'} reminder emails queued`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send reminders",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCronLogs = async () => {
    setIsLoading(true);
    try {
      // Query cron job execution logs
      const { data, error } = await supabase.rpc('exec_sql', {
        q: `
          SELECT 
            jobid,
            jobname,
            status,
            return_message,
            start_time,
            end_time
          FROM cron.job_run_details
          WHERE jobname IN ('daily-feedback-reminders', 'refresh-mv-*)
          ORDER BY start_time DESC
          LIMIT 50
        `
      });

      if (error) throw error;
      setCronLogs((data as any[]) || []);
    } catch (error: any) {
      console.error('Error fetching cron logs:', error);
      toast({
        variant: "destructive",
        title: "Failed to load cron logs",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEdgeFunctionLogs = async () => {
    setIsLoading(true);
    try {
      // Fetch recent edge function invocations
      const { data, error } = await supabase
        .from('fn_logs')
        .select('*')
        .in('evt', ['send-completion-email', 'send-feedback-reminders'])
        .order('at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmailLogs((data as any[]) || []);
    } catch (error: any) {
      console.error('Error fetching edge function logs:', error);
      toast({
        variant: "destructive",
        title: "Failed to load function logs",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Management & Monitoring</h1>
          <p className="text-muted-foreground">
            Admin tools for email automation, testing, and monitoring
          </p>
        </div>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList>
            <TabsTrigger value="manual">Manual Controls</TabsTrigger>
            <TabsTrigger value="test">Email Testing</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="cron">Cron Jobs</TabsTrigger>
          </TabsList>

          {/* Manual Controls Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Manual Completion Email
                </CardTitle>
                <CardDescription>
                  Send completion email for a specific session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    placeholder="e.g., 91dfe71f-44d1-4e44-ba8c-c9c684c4071b"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleManualCompletion}
                  disabled={isLoading || !sessionId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Completion Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Manual Feedback Reminders
                </CardTitle>
                <CardDescription>
                  Trigger feedback reminder emails (day 3 or day 7)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderType">Reminder Type</Label>
                  <Select value={reminderType} onValueChange={(v: any) => setReminderType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day3">Day 3 Reminder</SelectItem>
                      <SelectItem value="day7">Day 7 Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleManualReminder}
                  disabled={isLoading}
                  variant="secondary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reminders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Testing Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Send Test Email
                </CardTitle>
                <CardDescription>
                  Preview and test email templates with sample data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSendTestEmail}
                  disabled={isLoading || !testEmail}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Completion Email
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Email Preview</h4>
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <p className="text-sm"><strong>Subject:</strong> Your PRISM Results Are Ready! 🎯</p>
                    <p className="text-sm"><strong>From:</strong> PRISM Personality</p>
                    <p className="text-sm text-muted-foreground">
                      Includes results link, personality overview, and feedback survey invitation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Edge Function Logs
                  </CardTitle>
                  <CardDescription>
                    Recent email-related edge function invocations
                  </CardDescription>
                </div>
                <Button onClick={fetchEdgeFunctionLogs} variant="outline" size="sm">
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {emailLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No logs available. Click Refresh to load.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {emailLogs.map((log: any, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-md">
                        {log.level === 'error' ? (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">{log.evt}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.at).toLocaleString()}
                            </span>
                          </div>
                          {log.msg && (
                            <p className="text-sm text-muted-foreground">{log.msg}</p>
                          )}
                          {log.payload && (
                            <details className="text-xs mt-1">
                              <summary className="cursor-pointer text-muted-foreground">
                                View details
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cron Jobs Tab */}
          <TabsContent value="cron" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Cron Job Execution History
                  </CardTitle>
                  <CardDescription>
                    Recent cron job runs and their status
                  </CardDescription>
                </div>
                <Button onClick={fetchCronLogs} variant="outline" size="sm">
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {cronLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No cron logs available. Click Refresh to load.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cronLogs.map((log: any, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-md">
                        {log.status === 'succeeded' ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">{log.jobname}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.start_time).toLocaleString()}
                            </span>
                          </div>
                          {log.return_message && (
                            <p className="text-sm text-muted-foreground">{log.return_message}</p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>Job ID: {log.jobid}</span>
                            <span>Status: {log.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Jobs</CardTitle>
                <CardDescription>Active cron job schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Daily Feedback Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Schedule: Every day at 10:00 AM UTC
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">MV Refresh - Engagement</p>
                      <p className="text-sm text-muted-foreground">
                        Schedule: Every 1 minute
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailManagement;
