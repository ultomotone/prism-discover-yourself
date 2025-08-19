import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResultsV2 } from "@/components/assessment/ResultsV2";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '@/components/Header';

export default function Results() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
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

        // First check if the session exists and is completed
        const { data: sessionData, error: sessionError } = await supabase
          .from('assessment_sessions')
          .select('completed_at')
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          setError('Assessment session not found');
          setLoading(false);
          return;
        }

        if (!sessionData.completed_at) {
          setError('Assessment not completed yet');
          setLoading(false);
          return;
        }

        // Try to get existing profile first
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (profileData && !profileError) {
          setScoring(profileData);
          setLoading(false);
          return;
        }

        // If no profile exists, generate it
        const { data, error } = await supabase.functions.invoke('score_prism', {
          body: { session_id: sessionId },
        });

        if (error || !data || data.status !== 'success') {
          setError(error?.message || data?.error || 'Failed to load results');
        } else {
          setScoring(data.profile);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching results:', err);
      } finally {
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
          {/* Results */}
          <ResultsV2 profile={scoring} />

          {/* Support Section */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Need More Support?</h2>
              <p className="text-muted-foreground mb-6">
                Get personalized coaching and deeper insights into your PRISM results
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
              <Button 
                onClick={() => window.open('https://chatgpt.com/g/g-68a233600af0819182cfa8c558a63112-prism-personality-ai-coach', '_blank')}
                size="lg"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                PRISM AI Coach
              </Button>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}