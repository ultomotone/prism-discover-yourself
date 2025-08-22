import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, ExternalLink, Copy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResultsV2 } from "@/components/assessment/ResultsV2";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '@/components/Header';

export default function Results() {
  console.log('🟢 Results component mounted');
  const { sessionId } = useParams();
  console.log('🔍 Session ID from params:', sessionId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scoring, setScoring] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get share token from URL params (for secure access)
        const urlParams = new URLSearchParams(window.location.search);
        const shareToken = urlParams.get('token');

        // First check if the session exists
        console.log('Fetching session data for:', sessionId);
        const { data: sessionData, error: sessionError } = await supabase
          .from('assessment_sessions')
          .select('completed_at, share_token, status')
          .eq('id', sessionId)
          .maybeSingle();

        console.log('Session data:', sessionData, 'Session error:', sessionError);

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Assessment session not found: ' + sessionError.message);
          setLoading(false);
          return;
        }

        if (!sessionData) {
          setError('No session found with the provided ID');
          setLoading(false);
          return;
        }

        // Enhanced routing - don't depend on email, check if completed
        if (!sessionData.completed_at && sessionData.status !== 'completed') {
          setError('Assessment not completed yet');
          setLoading(false);
          return;
        }

        // Use share token from URL or session data for access
        const validToken = shareToken || sessionData.share_token;

        // Try to get profile data using secure RPC with versioned URL to break cache
        const version = urlParams.get('v') || 'v1.1';
        
        console.log('Calling get_profile_by_session with:', {
          sessionId,
          validToken,
          shareToken,
          sessionToken: sessionData.share_token
        });
        
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_profile_by_session', {
            p_session_id: sessionId,
            p_share_token: validToken || ''
          });

        console.log('Profile data received:', profileData);
        console.log('Profile error:', profileError);

        if (profileError || !profileData) {
          console.error('Profile fetch failed:', profileError);
          // Show recovery UI instead of hard error
          setLoading(false);
          setError('recovery_needed');
          return;
        }

        // Check if we have an invalid UNK result and force re-scoring
        if (profileData.type_code === 'UNK') {
          console.log('Detected UNK result, triggering re-score with updated algorithm');
          
          console.time('PRISM rescore');
          console.log('[PRISM] rescore payload', { session_id: sessionId, force_recompute: true });
          
          // Force re-scoring with new algorithm
          const { data, error } = await supabase.functions.invoke('score_prism', {
            body: { session_id: sessionId, force_recompute: true },
          });

          console.timeEnd('PRISM rescore');
          console.log('[PRISM] rescore result', JSON.stringify(data, null, 2));

          if (error || !data || data.status !== 'success') {
            console.error('[PRISM] rescore failed', error || data?.error);
            setError(error?.message || data?.error || 'Failed to re-score results');
          } else {
            setScoring(data.profile);
          }
          setLoading(false);
          return;
        }

        setScoring(profileData);
        setLoading(false);
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching results:', err);
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  // Load Stripe script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Auto-download PDF when results are loaded
  useEffect(() => {
    if (scoring && !loading && !error) {
      // Add a small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        console.log('Auto-downloading PDF for session:', sessionId);
        downloadPDF();
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [scoring, loading, error, sessionId]);

  const downloadPDF = async () => {
    try {
      const node = document.getElementById('results-content');
      if (!node) {
        console.error('Results content not found');
        return;
      }
      
      // More robust canvas options for various browsers
      const canvas = await html2canvas(node, { 
        scale: 2, 
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: node.scrollWidth,
        height: node.scrollHeight
      });
      
      const img = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210, pageHeight = 297;
      const imgProps = pdf.getImageProperties(img);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
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
      
      const fileName = scoring?.type_code ? `PRISM_Profile_${scoring.type_code}.pdf` : "PRISM_Profile.pdf";
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again or use a different browser.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Enhanced error handling with recovery UI
    if (error === 'recovery_needed') {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md">
              <CardContent className="text-center py-8">
                <div className="mb-4">
                  <p className="font-semibold">We found your submission but need a minute to render.</p>
                  <p className="text-sm mt-1 text-muted-foreground">Your responses are safely stored.</p>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      // Trigger a retry by calling fetchResults again
                      const retry = async () => {
                        const fetchResults = async () => {
                          // Retry logic here... (same as above)
                          window.location.reload(); // Simple retry for now
                        };
                        await fetchResults();
                      };
                      retry();
                    }} 
                    className="w-full"
                  >
                    Retry Loading
                  </Button>
                  <Button 
                    onClick={() => window.open('mailto:support@prismassessment.com?subject=Results%20Recovery&body=Session%20ID:%20' + sessionId, '_blank')}
                    variant="outline" 
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                  <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                    Go Home
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-muted rounded text-xs">
                  <p className="font-medium mb-1">Session ID:</p>
                  <code className="text-muted-foreground">{sessionId}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Regular error display
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <div className="text-destructive mb-4">
                <p className="font-semibold">Unable to Load Results</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <div className="space-y-2">
                <Button onClick={() => navigate('/assessment')} className="w-full">
                  Take Assessment
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!scoring) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <p>No results available for this session.</p>
              <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        {/* Header with back button */}
        <div className="max-w-4xl mx-auto mb-8">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Your PRISM Results</h1>
            <p className="text-xl text-muted-foreground">
              Your comprehensive personality profile
            </p>
          </div>
        </div>

        <div id="results-content" className="space-y-6">
          {/* Enhanced Results */}
          <ResultsV2 profile={scoring} />

          {/* Show retest banner for low confidence or close calls */}
          {(scoring?.fit_band === 'Low' || (scoring?.top_gap && scoring.top_gap < 3)) && (
            <Card className="max-w-4xl mx-auto border-amber-200 bg-amber-50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-amber-800 mb-2">Consider a Retest</h3>
                <p className="text-amber-700 mb-4">
                  Your results show a close call between types. Consider retesting in 30 days for a clearer picture.
                </p>
                <Button 
                  onClick={() => navigate('/assessment')}
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  Take New Assessment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Type Guard Notice */}
          {scoring?.invalid_combo_flag && (
            <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <p className="text-blue-700 text-sm">
                  ⚡ We filtered an implausible combo to avoid a mistype. See scoring notes for details.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Support Section */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Support PRISM</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Help us run the assessment, refine the algorithms, and publish open research. 
                Every contribution keeps the lights on and improves personality science.
              </p>
              
              <p className="text-sm text-muted-foreground mb-6">
                If PRISM helped you see yourself clearer, toss a coin to your typologist 🪙
              </p>
              
              <div className="flex justify-center">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: `<stripe-buy-button
                      buy-button-id="buy_btn_1RxsnID9AJFeFtOvkMbrRpMA"
                      publishable-key="pk_live_q3JAuI9omI8O6TFmtfpQyq0p">
                    </stripe-buy-button>`
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Section */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Continue Your Journey</h2>
              <p className="text-muted-foreground mb-6">
                Use our AI Coach to dive deeper into your personality insights
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={() => window.open('https://chatgpt.com/g/g-68a233600af0819182cfa8c558a63112-prism-personality-ai-coach', '_blank')}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  PRISM AI Coach
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Community Invitation */}
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Join Our Community</h2>
              </div>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Connect with thousands of like-minded individuals exploring their personality journey. 
                Share insights, ask questions, and deepen your understanding of PRISM and personality theory.
              </p>
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={() => window.open('https://www.skool.com/your-personality-blueprint/about?ref=931e57f033d34f3eb64db45f22b1389e', '_blank')}
                  size="lg"
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark mx-auto"
                >
                  <Users className="h-4 w-4" />
                  Join Personality Blueprint Community
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Free to join • Expert discussions • Type-focused groups
                </p>
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
                
                <Button 
                  onClick={() => navigate('/assessment')} 
                  variant="outline" 
                  size="lg"
                >
                  Take New Assessment
                </Button>

                <Button
                  onClick={() => {
                    // Get share token from URL or current session
                    const urlParams = new URLSearchParams(window.location.search);
                    const shareToken = urlParams.get('token');
                    const resultsUrl = shareToken 
                      ? `${window.location.origin}/results/${sessionId}?token=${shareToken}`
                      : window.location.href;
                    
                    navigator.clipboard.writeText(resultsUrl).then(() => {
                      toast({
                        title: "Results link copied!",
                        description: "Save this secure link to return to your results anytime.",
                      });
                    }).catch(() => {
                      // Fallback for browsers that don't support clipboard API
                      const textArea = document.createElement('textarea');
                      textArea.value = resultsUrl;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      toast({
                        title: "Results link copied!",
                        description: "Save this secure link to return to your results anytime.",
                      });
                    });
                  }}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Save Results Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}