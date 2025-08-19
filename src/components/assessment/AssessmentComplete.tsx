import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, RotateCcw, Link, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AssessmentResponse } from "./AssessmentForm";
import { supabase } from "@/integrations/supabase/client";
import { ResultsV2 } from "./ResultsV2";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AssessmentCompleteProps {
  responses: AssessmentResponse[];
  sessionId: string;
  onReturnHome: () => void;
  onTakeAgain?: () => void;
}


export function AssessmentComplete({ responses, sessionId, onReturnHome, onTakeAgain }: AssessmentCompleteProps) {
  const [scoring, setScoring] = useState<any | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) return;
      setLoadingScore(true);
      setScoreError(null);
      const { data, error } = await supabase.functions.invoke('score_prism', {
        body: { 
          session_id: sessionId
        },
      });
      if (error || !data || data.status !== 'success') {
        setScoreError(error?.message || data?.error || 'Scoring failed');
      } else {
        setScoring(data.profile);
      }
      setLoadingScore(false);
    };
    run();
  }, [sessionId]);

  const resultsUrl = `${window.location.origin}/results/${sessionId}`;

  const copyResultsLink = async () => {
    try {
      await navigator.clipboard.writeText(resultsUrl);
      toast({
        title: "Link copied!",
        description: "The results link has been copied to your clipboard.",
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
        title: "Link copied!",
        description: "The results link has been copied to your clipboard.",
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

  if (loadingScore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Analyzing your responses...</p>
        </div>
      </div>
    );
  }

  if (scoreError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-destructive mb-4">
              <p className="font-semibold">Error Processing Results</p>
              <p className="text-sm mt-1">{scoreError}</p>
            </div>
            <Button onClick={onReturnHome}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scoring || scoring.empty) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p>No scoring results available.</p>
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
          {scoring.top_types && scoring.strengths ? (
            <ResultsV2 profile={scoring} />
          ) : (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Profile Results</h2>
                <p className="text-muted-foreground">
                  Profile data is being processed. Please try refreshing the page.
                </p>
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