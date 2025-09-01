import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Mail, Clock, TrendingUp, TrendingDown, ArrowRight, Download, Eye } from "lucide-react";

interface HistoryRecord {
  session_id: string;
  created_at: string;
  type_code: string;
  overlay: string;
  run_index: number;
  top_types: any;
  email_mask?: string;
  prev_session_id?: string;
  deltas?: {
    strengths: Record<string, number>;
    dimensions: Record<string, number>;
    neuro: {
      mean: number;
      z: number;
      overlay_from: string;
      overlay_to: string;
    };
    type: {
      from: string;
      to: string;
    };
    reasons: string[];
  };
}

interface ComparisonResult {
  from: {
    session_id: string;
    type: string;
    overlay: string;
    created_at: string;
    run_index: number;
  };
  to: {
    session_id: string;
    type: string;
    overlay: string;
    created_at: string;
    run_index: number;
  };
  deltas: {
    strengths: Record<string, number>;
    dimensions: Record<string, number>;
    neuro: {
      mean: number;
      z: number;
      overlay_from: string;
      overlay_to: string;
    };
    type_changed: boolean;
  };
}

const FUNCTIONS = ["Ti", "Te", "Fi", "Fe", "Ni", "Ne", "Si", "Se"];

const History = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'email' | 'otp' | 'history'>('email');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonResult | null>(null);
  const [personKey, setPersonKey] = useState<string | null>(null);

  const hashPersonKey = async (normalizedEmail: string) => {
    // Client-side hash matching server logic
    const saltConfig = await supabase
      .from('scoring_config')
      .select('value')
      .eq('key', 'hash_salt')
      .single();
    
    const salt = (saltConfig.data?.value as any)?.value || 'default_salt';
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}|${normalizedEmail}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/history`
        }
      });

      if (error) throw error;

      toast({
        title: "Verification code sent",
        description: "Check your email for the 6-digit code",
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'magiclink'
      });

      if (error) throw error;

      // Generate person_key and fetch history
      const normalizedEmail = email.trim().toLowerCase();
      const key = await hashPersonKey(normalizedEmail);
      setPersonKey(key);
      
      await fetchHistory(key);
      setStep('history');
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (key: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('session_id, created_at, type_code, overlay, run_index, top_types, email_mask, prev_session_id, deltas')
        .eq('person_key', key)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type cast the data to match our interface
      const typedData = (data || []).map(item => ({
        ...item,
        deltas: item.deltas as HistoryRecord['deltas']
      }));

      setHistory(typedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your assessment history",
        variant: "destructive"
      });
    }
  };

  const compareRuns = async (sessionA: string, sessionB: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('compare_runs', {
        body: { session_a: sessionA, session_b: sessionB }
      });

      if (error) throw error;

      setSelectedComparison(data.comparison);
    } catch (error: any) {
      toast({
        title: "Comparison failed",
        description: "Unable to compare these assessments",
        variant: "destructive"
      });
    }
  };

  const getLatestComparison = async () => {
    if (!personKey || history.length < 2) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('compare_runs', {
        body: { person_key: personKey, latest: true }
      });

      if (error) throw error;

      setSelectedComparison(data.comparison);
    } catch (error: any) {
      toast({
        title: "Comparison failed",
        description: "Unable to compare latest assessments",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (step === 'history' && history.length >= 2) {
      getLatestComparison();
    }
  }, [history, step]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDelta = (value: number, label: string) => {
    if (Math.abs(value) < 0.1) return null;
    
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{label} {isPositive ? '+' : ''}{value.toFixed(2)}</span>
      </div>
    );
  };

  if (step === 'email') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="prism-container py-16">
          <div className="max-w-md mx-auto">
            <Card className="prism-shadow-card">
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="prism-heading-md">Access Your PRISM History</CardTitle>
                <p className="text-muted-foreground">
                  Enter your email to securely view your assessment history and track changes over time.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  />
                </div>
                <Button 
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll send a secure 6-digit code to verify your identity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="prism-container py-16">
          <div className="max-w-md mx-auto">
            <Card className="prism-shadow-card">
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="prism-heading-md">Enter Verification Code</CardTitle>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={(e) => e.key === 'Enter' && handleOtpSubmit()}
                    className="text-center text-lg tracking-wider"
                  />
                </div>
                <Button 
                  onClick={handleOtpSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="w-full"
                >
                  Back to Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container py-8">
        <div className="mb-8">
          <h1 className="prism-heading-lg mb-2">Your PRISM History</h1>
          <p className="text-muted-foreground">
            Track your assessment results and see how they've changed over time.
          </p>
        </div>

        {history.length === 0 ? (
          <Card className="prism-shadow-card">
            <CardContent className="text-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="prism-heading-sm mb-2">No assessments found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any assessments linked to this email address.
              </p>
              <Button onClick={() => window.open('/assessment', '_blank')}>
                Take Your First Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-1">
              <Card className="prism-shadow-card">
                <CardHeader>
                  <CardTitle>Assessment Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((record, index) => (
                      <div key={record.session_id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                          {index < history.length - 1 && <div className="w-px h-8 bg-muted mt-2" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                              Run #{record.run_index}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(record.created_at)}
                            </span>
                          </div>
                          <div className="font-medium text-sm">
                            {record.type_code}
                          </div>
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => compareRuns(history[index].session_id, history[0].session_id)}
                              className="mt-2 h-6 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Compare to latest
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison */}
            <div className="lg:col-span-2">
              {selectedComparison ? (
                <Card className="prism-shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Assessment Comparison</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Run #{selectedComparison.from.run_index}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>Run #{selectedComparison.to.run_index}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Type Change */}
                    <div>
                      <h4 className="font-medium mb-2">Type & Overlay</h4>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-sm">
                          {selectedComparison.from.type}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={selectedComparison.deltas.type_changed ? "default" : "outline"} className="text-sm">
                          {selectedComparison.to.type}
                        </Badge>
                        {!selectedComparison.deltas.type_changed && (
                          <span className="text-xs text-green-600">Stable</span>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Function Strengths */}
                    <div>
                      <h4 className="font-medium mb-3">Function Strength Changes</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {FUNCTIONS.map(func => {
                          const delta = selectedComparison.deltas.strengths[func];
                          return (
                            <div key={func} className="text-center">
                              <div className="font-medium text-sm mb-1">{func}</div>
                              {renderDelta(delta, "")}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Neuroticism */}
                    <div>
                      <h4 className="font-medium mb-2">Overlay & Neuroticism</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          {selectedComparison.deltas.neuro.overlay_from} → {selectedComparison.deltas.neuro.overlay_to}
                        </span>
                        {renderDelta(selectedComparison.deltas.neuro.z, "z-score")}
                      </div>
                    </div>

                    {/* Reasons */}
                    {history[0]?.deltas?.reasons && history[0].deltas.reasons.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Likely Reasons for Changes</h4>
                          <Alert>
                            <AlertDescription>
                              <ul className="space-y-1">
                                {history[0].deltas.reasons.map((reason, i) => (
                                  <li key={i} className="text-sm">• {reason}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="prism-shadow-card">
                  <CardContent className="text-center py-16">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="prism-heading-sm mb-2">Select assessments to compare</h3>
                    <p className="text-muted-foreground">
                      Choose two assessments from your timeline to see detailed changes.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;