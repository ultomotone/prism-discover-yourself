import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Target, 
  Database, 
  BarChart3, 
  FileText, 
  Settings,
  Lightbulb,
  Shield,
  Eye,
  MessageSquare
} from "lucide-react";
import Header from "@/components/Header";

interface Metrics {
  totalAssessments: number;
  completionRate: number;
  confidenceDistribution: { [key: string]: number };
}

export default function Roadmap() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalAssessments: 0,
    completionRate: 0,
    confidenceDistribution: {}
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Total started sessions (any session that exists)
        const { count: totalStartedCount } = await supabase
          .from('assessment_sessions')
          .select('*', { count: 'exact', head: true });

        // Total completed assessments - sessions with completed_at timestamp
        const { count: completedCount } = await supabase
          .from('assessment_sessions')
          .select('*', { count: 'exact', head: true })
          .not('completed_at', 'is', null);

        // Confidence distribution - get unique profiles per session to avoid duplicates
        const { data: confidenceData } = await supabase
          .from('profiles')
          .select('confidence, session_id')
          .not('confidence', 'is', null);

        // Remove duplicates by session_id, keeping the most recent entry
        const uniqueConfidenceData = (confidenceData as any[])?.reduce((acc: any, item: any) => {
          if (!acc[item.session_id] && item.confidence) {
            acc[item.session_id] = item.confidence;
          }
          return acc;
        }, {} as { [sessionId: string]: string }) || {};

        const confidenceDistribution = Object.values(uniqueConfidenceData).reduce<{ [key: string]: number }>((acc, confidence) => {
          if (typeof confidence === 'string') {
            acc[confidence] = (acc[confidence] || 0) + 1;
          }
          return acc;
        }, {});

        // Calculate completion rate and ensure it doesn't exceed 100%
        const rawCompletionRate = totalStartedCount ? 
          Math.round((completedCount || 0) / totalStartedCount * 100) : 0;
        const cappedCompletionRate = Math.min(rawCompletionRate, 100);

        console.log('Completion rate calculation:', {
          totalStarted: totalStartedCount,
          completed: completedCount,
          rawRate: rawCompletionRate,
          cappedRate: cappedCompletionRate
        });

        setMetrics({
          totalAssessments: completedCount || 0,
          completionRate: cappedCompletionRate,
          confidenceDistribution
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  const highModerateConfidence = Object.entries(metrics.confidenceDistribution)
    .filter(([key]) => key === 'High' || key === 'Moderate')
    .reduce((sum, [_, count]) => sum + count, 0);

  const totalConfidenceAssessments = Object.values(metrics.confidenceDistribution).reduce((sum, count) => sum + count, 0);
  const confidencePercentage = totalConfidenceAssessments ? 
    Math.round(highModerateConfidence / totalConfidenceAssessments * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 space-y-12">
        {/* Hero Section */}
        <section id="hero" className="text-center space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-4">PRISM Roadmap</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Version launched August 18, 2025 (v2.x)
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: 2025-08-18
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg">
              <Link to="/assessment">Take the Assessment</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/results">View Your Results</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="outline" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {metrics.totalAssessments} Total Assessments
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {metrics.completionRate}% Completion Rate
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              {confidencePercentage}% High/Moderate Confidence
            </Badge>
          </div>
        </section>

        <Separator />

        {/* Now → Ship */}
        <section id="now-ship" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Now → Ship</h2>
            <p className="text-lg text-muted-foreground">
              Focus: Results page v2 + Retest core trackability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  What you'll see on the site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Results Page v2</h4>
                  <p className="text-sm text-muted-foreground">
                    Top-3 type likelihoods (with confidence), dimensional highlights (coherent vs unique), 
                    blocks & overlay, dynamic narrative, PDF export.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Retest View (beta)</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare any two sessions side-by-side; see deltas for strengths, dimensionality, 
                    blocks, and overlay; stability badge.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Behind the scenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Data</h4>
                  <p className="text-sm text-muted-foreground">
                    profiles stores type_scores, top_types, dims_highlights, blocks_norm.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Retests</h4>
                  <p className="text-sm text-muted-foreground">
                    New view that pairs sessions per user and computes deltas + stability.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Validity indices (attention, inconsistency pairs, social desirability) 
                    surfaced in UI as "confidence".
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Success Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">≥80% completion rate, median duration 25–35 min</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">≥70% of users get High or Moderate confidence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">PDF export works across desktop & mobile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Milestone A - 100 Assessments */}
        <section id="milestone-100" className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">Milestone A — 100 Assessments</h2>
              <Badge variant="secondary">Goal: Iron out assessment efficacy</Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  What you'll see on the site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">"100 Reached" banner</h4>
                  <p className="text-sm text-muted-foreground">
                    Anonymized insights (type distribution, function heatmap).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Published Research Study</h4>
                  <p className="text-sm text-muted-foreground">
                    <Link to="/research/first-hundred-study" className="text-primary hover:text-primary/80 underline">
                      First 100 Assessments: PRISM v1.0 and v1.1 Analysis
                    </Link>
                    — Detailed analysis of cognitive-function coherence and typology distributions.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">"What we improved" notes</h4>
                  <p className="text-sm text-muted-foreground">
                    Item wording fixes, scale anchors, timing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Behind the scenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Item diagnostics</h4>
                  <p className="text-sm text-muted-foreground">
                    item-total r, option usage, time-to-respond outliers
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Scale reliability</h4>
                  <p className="text-sm text-muted-foreground">
                    internal consistency for function strength subscales
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Threshold tuning</h4>
                  <p className="text-sm text-muted-foreground">
                    refine 1D–4D mapping using empirical quartiles
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Validity gates</h4>
                  <p className="text-sm text-muted-foreground">
                    adjust thresholds for inconsistency and SD indices
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Retest pilot</h4>
                  <p className="text-sm text-muted-foreground">
                    first 20–30 retests analyzed for stability
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Success Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Median item-total r ≥ 0.30 across core scales</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">≥10% of completions are retests; test–retest r ≥ 0.70 (strength composites)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">&lt;10% flagged as "Low confidence"</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Milestone B - 500 Assessments */}
        <section id="milestone-500" className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">Milestone B — 500 Assessments</h2>
              <Badge variant="secondary">Goal: Introduce Character Trait Correlations for each type + calibrate</Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  What you'll see on the site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">New "Trait Correlations" section</h4>
                  <p className="text-sm text-muted-foreground">
                    On each type overview (e.g., "People with this result often score higher on X, lower on Y").
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Dashboard cards</h4>
                  <p className="text-sm text-muted-foreground">
                    Function usage distribution, overlay (+/–) mix, trait overlays.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Behind the scenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Trait module</h4>
                  <p className="text-sm text-muted-foreground">
                    Short trait battery (10–20 items) to anchor correlations
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Correlations</h4>
                  <p className="text-sm text-muted-foreground">
                    Compute Pearson r between traits and (a) type one-hot, (b) function strength indices, (c) dimensionality
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Calibration</h4>
                  <p className="text-sm text-muted-foreground">
                    Re-weight type likelihood engine if trait signals add predictive value
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Retest variance/invariance</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantify within-person variance; confirm invariance across sessions/states
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Success Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Stable trait↔function correlations (|r| ≥ 0.20) replicated across folds</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Retest SEM small enough to display "likely true change" bands</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Clear, human-readable trait blurbs per type (no Big-Five jargon on the surface)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Milestone C - 1000 Assessments */}
        <section id="milestone-1000" className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">Milestone C — 1000 Assessments</h2>
              <Badge variant="secondary">Goal: Public release of findings</Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  What you'll see on the site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Findings page</h4>
                  <p className="text-sm text-muted-foreground">
                    Method, reliability, validity, trait correlations, retest invariance
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interactive visualizations</h4>
                  <p className="text-sm text-muted-foreground">
                    Type distribution, function heatmap, dimensionality by type, stability over time
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Whitepaper PDF</h4>
                  <p className="text-sm text-muted-foreground">
                    Methods + stats + limitations
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Behind the scenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Pre-registered analysis plan</h4>
                  <p className="text-sm text-muted-foreground">
                    & final parameter locks
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Norms update</h4>
                  <p className="text-sm text-muted-foreground">
                    For overlay (z-scores), dimensional thresholds, and validity gates
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">API version tag</h4>
                  <p className="text-sm text-muted-foreground">
                    (e.g., score_prism v2.x) for backward compatibility
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Success Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Peer/industry review of methods section</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Public dashboards load &lt;2s and protect privacy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Clear guidance for teams (non-hiring use)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Ongoing */}
        <section id="ongoing" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ongoing (Always-On)</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Shield className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <h4 className="font-medium mb-1">Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  No selling data; encryption at rest; minimal PII; opt-out & delete.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Eye className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <h4 className="font-medium mb-1">Accessibility</h4>
                <p className="text-sm text-muted-foreground">
                  Keyboard + screen-reader friendly UI; PDF alt text.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Users className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <h4 className="font-medium mb-1">Community</h4>
                <p className="text-sm text-muted-foreground">
                  Retest prompts at 90 days; anonymized insights shared monthly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <TrendingUp className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <h4 className="font-medium mb-1">Growth</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous improvement based on user feedback and data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Implementation Checklist */}
        <section id="implementation" className="space-y-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="implementation">
              <AccordionTrigger className="text-xl font-bold">
                Implementation Checklist (Dev)
              </AccordionTrigger>
              <AccordionContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Data model (Supabase SQL)</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`-- Pair sessions per user for retest analytics
create view if not exists v_retest_pairs as
select
  a.user_id,
  a.session_id as session_id_1, b.session_id as session_id_2,
  a.created_at as t1, b.created_at as t2,
  a.type_code as type_1, b.type_code as type_2,
  a.strengths as strengths_1, b.strengths as strengths_2,
  a.dimensions as dimensions_1, b.dimensions as dimensions_2,
  a.blocks_norm as blocks_1, b.blocks_norm as blocks_2,
  a.overlay as overlay_1, b.overlay as overlay_2
from profiles a
join profiles b
  on a.user_id = b.user_id and b.created_at > a.created_at;

-- Simple stability index (per pair)
create view if not exists v_retest_deltas as
select
  user_id, session_id_1, session_id_2, t1, t2,
  (select sqrt(sum( ( (s2.value::numeric) - (s1.value::numeric) )^2 ))
   from jsonb_each_text(strengths_1) s1
   join jsonb_each_text(strengths_2) s2 using (key)
  ) as strength_delta,
  (select count(*) from jsonb_each_text(dimensions_1) d1
    join jsonb_each_text(dimensions_2) d2 using (key)
   where d1.value <> d2.value) as dim_change_ct,
  (type_1 <> type_2) as type_changed
from v_retest_pairs;`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Notes</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Stability score (0–100):</strong> normalize strength_delta via cohort percentiles (invert & cap).</li>
                      <li>• <strong>Dimensional drift:</strong> count of functions changing ≥1D; flag when exceeding true-change band.</li>
                      <li>• <strong>Type movement:</strong> if Top-1 flips but Top-2 within 5 fit-points, label "adjacent-type oscillation".</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator />

        {/* Results Page v2 */}
        <section id="results-v2" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Results Page v2 (What to finish)</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Top-3 cards (Fit + Share) with confidence and overlay on the primary</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Dimensional chips (1–4) with green (coherent) and blue (unique)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm">Blocks + overlay card with brief glossary</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm">Narrative module (2+ paragraphs per type) + flow/stress bullets</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm">Retest tab: session selector, deltas, and stability badge</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Export PDF (single-click, branded)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* KPI Dashboard */}
        <section id="kpi-dashboard" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">KPI Dashboard (Admin)</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">Total assessments</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Completion rate</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reliability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confidencePercentage}%</div>
                <p className="text-xs text-muted-foreground">High/Moderate</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Traits (500+)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* What's Next */}
        <section id="next" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">What we're building next / How you can help</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  What we're building next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Results page v2 with Top-3, highlights, and PDF</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm">Retest tracking (compare any two sessions)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">At 100: publish early accuracy & improvements</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">At 500: trait correlations by type + calibration</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">At 1000: public findings, interactive dashboards, whitepaper</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  How you can help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span className="text-sm">Take the assessment, share your Top-3 + overlay</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span className="text-sm">Retest after major life changes (we'll show your delta)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span className="text-sm">Opt-in to the short trait module (helps our correlations)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/assessment">Take the Assessment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/results">View Your Results</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}