import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, RotateCcw } from "lucide-react";
import { AssessmentResponse } from "./AssessmentForm";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AssessmentCompleteProps {
  responses: AssessmentResponse[];
  sessionId: string;
  onReturnHome: () => void;
  onTakeAgain?: () => void;
}

const FUNCS = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"];

const pctFromZ = (z: number): number => {
  // Approx. normal CDF -> percentile (0..100)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z*z/2);
  let p = 1 - d * (1.330274*t - 1.821256*t**2 + 1.781478*t**3 - 0.356564*t**4 + 0.3193815*t**5);
  if (z < 0) p = 1 - p;
  return Math.round(p * 100);
};

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
        body: { session_id: sessionId },
      });
      if (error || !data || data.status !== 'success') {
        // @ts-ignore
        setScoreError(error?.message || data?.error || 'Scoring failed');
      } else {
        setScoring((data as any).profile);
      }
      setLoadingScore(false);
    };
    run();
  }, [sessionId]);

  const downloadPDF = async () => {
    const node = document.getElementById('resultsCard');
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

  const renderDimensionalityChips = (level: number) => {
    const total = 4;
    const filled = Math.max(0, Math.min(total, level || 0));
    const dots = [];
    
    for (let i = 0; i < total; i++) {
      dots.push(
        <span 
          key={i}
          className={`inline-block w-2 h-2 rounded-full ${
            i < filled ? 'bg-primary' : 'bg-muted'
          }`} 
        />
      );
    }
    
    return (
      <div className="flex gap-1 items-center" title={`Dimensionality: ${filled}/4`}>
        {dots}
      </div>
    );
  };

  const renderFunctionBar = (label: string, value: number, maxValue = 5) => {
    const percentage = Math.max(0, Math.min(100, Math.round((value / maxValue) * 100)));
    
    return (
      <div className="mb-3" key={label}>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span>{value?.toFixed ? value.toFixed(2) : value}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-2 bg-primary transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
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

  if (!scoring) {
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

  const p = scoring;
  const blocks = p.blocks || {};
  const n = p.neuroticism || {};
  const nPct = (Number.isFinite(n.z) ? pctFromZ(n.z) : null);
  const v = p.validity || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="prism-heading-lg text-primary mb-4">Assessment Complete!</h1>
          <p className="text-xl text-muted-foreground">
            Your comprehensive PRISM personality profile is ready.
          </p>
        </div>

        <Card id="resultsCard" className="prism-shadow-card max-w-5xl mx-auto">
          <CardContent className="p-8">
            {/* Type Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 mb-8 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-primary">{p.type}</h2>
              <span className="text-lg text-muted-foreground">{p.base}-{p.creative}</span>
              <span className="sm:ml-auto text-sm bg-accent/10 px-3 py-1 rounded-full">
                Confidence: <strong>{p.confidence}</strong>
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Function Strengths */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Function Strengths</h3>
                {FUNCS.map(f => renderFunctionBar(f, p.strengths?.[f] ?? 0))}
              </div>

              {/* Dimensionality */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Dimensionality (1–4)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {FUNCS.map(f => (
                    <div key={f} className="p-4 border rounded-xl bg-background/50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-lg">{f}</span>
                        {renderDimensionalityChips(p.dimensions?.[f])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Blocks */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Information Metabolism Blocks</h3>
                {renderFunctionBar("Core", blocks.Core || 0, Math.max(1, blocks.Core || 1))}
                {renderFunctionBar("Critic", blocks.Critic || 0, Math.max(1, blocks.Critic || 1))}
                {renderFunctionBar("Hidden", blocks.Hidden || 0, Math.max(1, blocks.Hidden || 1))}
                {renderFunctionBar("Instinct", blocks.Instinct || 0, Math.max(1, blocks.Instinct || 1))}
              </div>

              {/* Neuroticism */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Neuroticism Overlay</h3>
                <div className="space-y-3 text-sm bg-background/50 p-4 rounded-xl border">
                  <div className="flex justify-between">
                    <span>Raw mean:</span>
                    <strong>{(n.raw_mean ?? 0).toFixed ? n.raw_mean.toFixed(2) : n.raw_mean} (1–7)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Z-score:</span>
                    <strong>
                      {(n.z ?? 0).toFixed ? n.z.toFixed(2) : n.z}
                      {nPct !== null && <span className="text-muted-foreground"> (~{nPct}th percentile)</span>}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Overlay:</span>
                    <strong className="text-accent">
                      {p.neuroticism?.overlay || (p.type.endsWith("+") ? "+" : "–")}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-primary">Recommended Next Steps</h3>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-relaxed">
                <li>Lean into your top two functions for high-leverage work this month.</li>
                <li>Pick one lower-dimension function to practice deliberately (short, repeatable exercises).</li>
                <li>Use the block signals: <strong className="text-foreground">Core</strong> for primary roles; <strong className="text-foreground">Critic</strong> for guardrails; <strong className="text-foreground">Hidden</strong> for growth edges; <strong className="text-foreground">Instinct</strong> under pressure.</li>
              </ul>
            </div>

            {/* Validity Checks */}
            <div className={`border rounded-xl p-4 mb-8 ${
              (v.inconsistency >= 1.0 || (v.sd_index || 0) >= 4.3) 
                ? 'border-destructive bg-destructive/5' 
                : 'border-muted bg-background/30'
            }`}>
              <h3 className="text-xl font-semibold mb-4 text-primary">Validity Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span>Inconsistency (pairs):</span>
                  <div className="text-right">
                    <strong>{(v.inconsistency ?? 0).toFixed(2)}</strong>
                    <div className="text-xs text-muted-foreground">{"<"} 1.0 good</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Social desirability index:</span>
                  <div className="text-right">
                    <strong>{(v.sd_index ?? 0).toFixed(2)}</strong>
                    <div className="text-xs text-muted-foreground">{"<"} 4.3 good</div>
                  </div>
                </div>
              </div>
              {(v.inconsistency >= 1.5 || (v.sd_index || 0) >= 4.6) && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Caution: Responses may be biased or inconsistent. Consider retaking the assessment for more reliable results.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={downloadPDF} 
                size="lg"
                className="flex items-center gap-2 prism-gradient-primary"
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
  );
}