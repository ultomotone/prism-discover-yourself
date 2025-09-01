import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, RotateCcw, Link, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AssessmentResponse } from "./AssessmentForm";
import { supabase } from "@/lib/supabase/client";
import { ResultsV2 } from "./ResultsV2";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { trackAssessmentComplete, trackResultsViewed } from "@/lib/analytics";

interface AssessmentCompleteProps {
  responses: AssessmentResponse[];
  sessionId: string;
  onReturnHome: () => void;
  onTakeAgain?: () => void;
}


export function AssessmentComplete({ responses, sessionId, onReturnHome, onTakeAgain }: AssessmentCompleteProps) {
  console.log('🔵 AssessmentComplete component rendered with:');
  console.log('🔵 Responses count:', responses?.length || 0);
  console.log('🔵 Session ID:', sessionId);
  
  // Early return if missing required props
  if (!sessionId) {
    console.error('🔴 AssessmentComplete: Missing sessionId');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Error: Missing session information</p>
          <button onClick={onReturnHome} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  const [scoring, setScoring] = useState<any | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [shareToken, setShareToken] = useState<string>('');

  useEffect(() => {
    const fetchShareToken = async () => {
      if (!sessionId) return;
      
      try {
        // Get the share token for secure link generation
        const { data: sessionData } = await supabase
          .from('assessment_sessions')
          .select('share_token')
          .eq('id', sessionId)
          .single();
        
        if (sessionData?.share_token) {
          setShareToken(sessionData.share_token);
        }
      } catch (error) {
        console.error('Error fetching share token:', error);
      }
    };
    
    fetchShareToken();
  }, [sessionId]);

  useEffect(() => {
    const submitAndScore = async () => {
      if (!sessionId) return;
      
      console.log('🔄 Starting assessment scoring for session:', sessionId);
      setLoadingScore(true);
      setScoreError(null);
      
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log('🔄 Proceeding with scoring, user authenticated:', !!user);

        // Try to get scores using the new SQL function first (for authenticated users only)
        let scoresData = null;
        let scoresError = null;
        
        if (user) {
          const result = await supabase.rpc('get_user_assessment_scores', { p_session_id: sessionId });
          scoresData = result.data;
          scoresError = result.error;
        } else {
          // For anonymous users, skip the SQL function and go straight to edge function
          scoresError = new Error('Anonymous user - using edge function');
        }

        // Use finalizeAssessment edge function for proper completion and scoring
        const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
          body: { session_id: sessionId, responses }
        });

        if (error) {
          // Surface HTTP status and context for better debugging
          const status = error?.context?.status || 'unknown';
          throw new Error(`${error.message || 'finalize failed'} (status ${status})`);
        }

        if (data?.error) {
          setScoreError(data.error);
        } else if (data?.ok && data?.profile) {
          console.log('✅ Assessment finalized successfully:', data);
          setScoring(data.profile);
          
          // Track assessment completion
          trackAssessmentComplete(sessionId, responses?.length || 0);
          
          // Track results viewed
          trackResultsViewed(sessionId, data.profile?.type_code);
          
          // Store share token for URL generation
          if (data.share_token) {
            setShareToken(data.share_token);
          }
        } else {
          throw new Error(data?.error || 'Invalid response from scoring service');
        }
      } catch (err) {
        console.error('💥 Assessment scoring failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Assessment scoring failed';
        setScoreError(errorMessage);
      } finally {
        setLoadingScore(false);
      }
    };
    
    submitAndScore();
  }, [sessionId]);

  const resultsUrl = shareToken 
    ? `${window.location.origin}/results/${sessionId}?token=${shareToken}`
    : `${window.location.origin}/results/${sessionId}`;

  const copyResultsLink = async () => {
    try {
      await navigator.clipboard.writeText(resultsUrl);
      toast({
        title: "Secure link copied!",
        description: "Your private results link has been copied to your clipboard.",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = resultsUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Secure link copied!",
        description: "Your private results link has been copied to your clipboard.",
      });
    }
  };

  const downloadPDF = async () => {
    const node = document.getElementById('results-content');
    if (!node) return;
    
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210, pageHeight = 297;
    const imgProps = pdf.getImageProperties(img);
    const imgWidth = pageWidth, imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    pdf.addImage(img, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    
    // If content taller than one page, slice and add more pages
    let remaining = imgHeight - pageHeight;
    let y = 0;
    while (remaining > 0) {
      pdf.addPage();
      y += pageHeight;
      pdf.addImage(img, "PNG", 0, -y, imgWidth, imgHeight);
      remaining -= pageHeight;
    }
    
    pdf.save("PRISM_Profile.pdf");
  };

  if (scoreError === 'scoring') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="text-center py-8">
          <p className="text-destructive mb-4">Scoring failed. Try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loadingScore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Scoring your PRISM profile…</p>
        </div>
      </div>
    );
  }

  if (scoreError) {
    // Show auth prompt if the error is related to authentication
    if (scoreError.includes('Authentication required') || scoreError.includes('Access denied')) {
      return (
        <div className="min-h-screen bg-background">
          <div className="py-8 px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-primary mb-4">Assessment Complete!</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Your responses have been saved. Create an account to access your detailed results.
              </p>
              
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="text-destructive mb-4">
                    <p className="text-sm">{scoreError}</p>
                  </div>
                  <div className="space-y-3">
                    <Button onClick={onReturnHome} className="w-full">
                      Sign Up for Full Results
                    </Button>
                    <Button onClick={onReturnHome} variant="outline" className="w-full">
                      Return Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    // Show generic error for other types of errors
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">We saved your responses.</p>
              <p className="text-sm mt-1 text-destructive">{scoreError}</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Retry Results
              </Button>
              <Button 
                onClick={onReturnHome} 
                variant="outline" 
                className="w-full"
              >
                Return Home
              </Button>
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <p className="font-medium mb-1">Session ID:</p>
                <code className="text-muted-foreground">{sessionId}</code>
                <Button
                  onClick={() => {
                    const diagnostics = {
                      session_id: sessionId,
                      error: scoreError,
                      timestamp: new Date().toISOString()
                    };
                    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
                    toast({ title: "Diagnostics copied to clipboard" });
                  }}
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scoring) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="font-semibold mb-2">No results yet</h3>
            <p className="text-muted-foreground mb-4">We couldn't find a score payload.</p>
            <Button onClick={onReturnHome} className="mt-4">Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Assessment Complete!</h1>
          <p className="text-xl text-muted-foreground">
            Your comprehensive PRISM personality profile is ready.
          </p>
        </div>

        <div id="results-content" className="space-y-6">
          {/* Enhanced Results with V2 Component */}
          {scoring?.top_types && scoring?.strengths ? (
            <ResultsV2 profile={scoring} />
          ) : (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Profile Results</h2>
                <p className="text-muted-foreground mb-4">
                  Profile data is being processed. Please try refreshing the page.
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <p>Available fields: {Object.keys(scoring || {}).join(', ')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shareable Link */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Link className="h-4 w-4" />
                  <h3 className="font-semibold">Save Your Results</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Bookmark this link to access your results anytime
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-sm flex-1 truncate">{resultsUrl}</code>
                  <Button 
                    onClick={copyResultsLink} 
                    variant="ghost" 
                    size="sm"
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={downloadPDF} 
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Report
                </Button>
                
                {onTakeAgain && (
                  <Button 
                    onClick={onTakeAgain} 
                    variant="outline" 
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Assessment
                  </Button>
                )}
                
                <Button 
                  onClick={onReturnHome} 
                  variant="outline" 
                  size="lg"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}