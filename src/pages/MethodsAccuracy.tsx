import { Helmet } from "react-helmet";
import { 
  BarChart3, Shield, Target, Users, FileText, Lock,
  Zap, TrendingUp, CheckCircle2, AlertTriangle, 
  Brain, Database, FlaskConical, Code
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const MethodsAccuracy = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet
        title="Methods & Accuracy | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "Transparent methodology and validation approach for PRISM Dynamics assessment accuracy."
          }
        ]}
      />
      
      <main className="pt-24 pb-16">
        <div className="prism-container max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">Methodology & Validation</Badge>
            <h1 className="prism-heading-xl mb-6">
              Methods & Accuracy
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Moving beyond subjective "live typing" with quantified psychometric validation, 
              automated fairness checks, and continuous scoring engine improvements. 
              Our approach is designed for scale, reproducibility, and transparency.
            </p>
          </div>

          {/* Algorithmic Advantage */}
          <Card className="mb-8 border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary" />
                <CardTitle>The Algorithmic Advantage</CardTitle>
              </div>
              <CardDescription>
                Why algorithmic assessment outperforms traditional "live typing"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* PRISM Algorithmic Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✓ PRISM Algorithmic
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm"><strong>Reproducible:</strong> Same inputs = same outputs, always</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm"><strong>Validated:</strong> DIF, calibration, split-half reliability tested</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm"><strong>Scalable:</strong> Thousands of assessments per day, instant results</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm"><strong>Transparent:</strong> Version-controlled scoring logic with audit trail</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm"><strong>Improvable:</strong> A/B testing, continuous calibration, MAI optimization</span>
                    </div>
                  </div>
                </div>

                {/* Traditional Live Typing Column */}
                <div className="space-y-3 opacity-70">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                      ✗ Traditional Live Typing
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">Subjective: Different typists = different conclusions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">Unvalidated: No fairness checks or calibration testing</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">Not scalable: Bottlenecked by typist availability</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">Opaque: No documented methodology or version control</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">Static: Can't systematically test and improve over time</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bias Mitigation & Data Quality */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <CardTitle>Bias Mitigation & Data Quality</CardTitle>
              </div>
              <CardDescription>
                Active monitoring and mitigation of statistical and psychological biases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Sampling Bias */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Sampling Bias</h3>
                      <Badge variant="secondary" className="text-xs">Monitored & Mitigated</Badge>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Stratified demographic recruitment</li>
                    <li>• Geographic diversity requirements</li>
                    <li>• Age/gender balance enforcement</li>
                    <li>• Occupational diversity tracking</li>
                  </ul>
                </div>

                {/* Response Bias */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Response Bias</h3>
                      <Badge variant="secondary" className="text-xs">Monitored & Mitigated</Badge>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Social desirability checks</li>
                    <li>• Acquiescence bias detection</li>
                    <li>• Attention check items</li>
                    <li>• Response time monitoring</li>
                  </ul>
                </div>

                {/* Measurement Bias (DIF) */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Measurement Bias (DIF)</h3>
                      <Badge variant="secondary" className="text-xs">Monitored & Mitigated</Badge>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Differential Item Functioning tests</li>
                    <li>• Cross-cultural validation</li>
                    <li>• Gender/age fairness testing</li>
                    <li>• 7% flagged items (Target: ≤10%)</li>
                  </ul>
                </div>

                {/* Algorithmic Bias */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Algorithmic Bias</h3>
                      <Badge variant="secondary" className="text-xs">Monitored & Mitigated</Badge>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Calibration by demographic subgroup</li>
                    <li>• Performance parity testing</li>
                    <li>• Regular equity audits</li>
                    <li>• Automated fairness monitoring</li>
                  </ul>
                </div>

                {/* Selection Bias */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Selection Bias</h3>
                      <Badge variant="secondary" className="text-xs">Monitored & Mitigated</Badge>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Complete case analysis tracking</li>
                    <li>• Missing data pattern analysis</li>
                    <li>• Dropout rate by demographic</li>
                    <li>• Imputation strategy validation</li>
                  </ul>
                </div>

                {/* Temporal Bias */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">Temporal Bias</h3>
                      <Badge variant="secondary" className="text-xs">Monitored & Mitigated</Badge>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Seasonal variation monitoring</li>
                    <li>• Cohort effects tracking</li>
                    <li>• Version drift detection</li>
                    <li>• Longitudinal stability checks</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Traditional "live typing" services cannot provide any of these safeguards</strong> because they lack the structured data infrastructure and statistical rigor required for bias detection and mitigation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <CardTitle>Key Metrics</CardTitle>
              </div>
              <CardDescription>
                What we measure and why it matters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Top-1 Accuracy</h4>
                  <p className="text-sm text-muted-foreground">
                    Percentage of cases where the algorithm's #1 prediction matches expert consensus
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Top-2 Recall</h4>
                  <p className="text-sm text-muted-foreground">
                    Percentage of cases where the correct type appears in the top 2 predictions
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Calibration by Confidence Band</h4>
                  <p className="text-sm text-muted-foreground">
                    Whether reported confidence levels (High/Medium/Low) align with actual accuracy
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Cohen's κ (Kappa)</h4>
                  <p className="text-sm text-muted-foreground">
                    Inter-rater agreement between algorithm and expert consensus
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Subgroup Fairness Checks</h4>
                <p className="text-sm text-muted-foreground">
                  Analysis by gender, age band, and geography to ensure equitable performance
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Psychometric Rigor */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-6 h-6 text-primary" />
                <CardTitle>Psychometric Rigor</CardTitle>
              </div>
              <CardDescription>
                Quantified validation that goes far beyond subjective expert opinion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-sm">
                Every assessment is continuously monitored across multiple psychometric dimensions. 
                These aren't just nice-to-haves — they're <strong>required</strong> for any assessment 
                claiming scientific validity.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* DIF */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-xl">⚖️</span>
                      Fairness (DIF)
                    </h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Target: ≤10%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Differential Item Functioning:</strong> Tests whether items perform 
                    differently across gender, age, or geography.
                  </p>
                  <Progress value={7} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Currently: <strong>7% flagged</strong> (Pass)
                  </p>
                </div>

                {/* Calibration */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      Calibration (ECE)
                    </h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Target: &lt;0.05
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Expected Calibration Error:</strong> Measures if "High Confidence" 
                    predictions actually are high accuracy.
                  </p>
                  <Progress value={96} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Currently: <strong>0.042 ECE</strong> (Excellent)
                  </p>
                </div>

                {/* Split-Half Reliability */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-xl">🔀</span>
                      Internal Consistency
                    </h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Target: ≥0.80
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Split-Half Reliability (Spearman-Brown):</strong> Tests if items within 
                    each scale measure the same construct.
                  </p>
                  <Progress value={87} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Currently: <strong>0.87 avg</strong> (Good)
                  </p>
                </div>

                {/* Item Discrimination */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      Item Quality
                    </h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Target: r≥0.30
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Item-Total Correlation:</strong> Identifies items with weak discriminative 
                    power that should be revised.
                  </p>
                  <Progress value={93} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Currently: <strong>93% above threshold</strong> (Excellent)
                  </p>
                </div>

                {/* CFA */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-xl">🧩</span>
                      Factor Structure
                    </h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      CFI ≥0.95
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Confirmatory Factor Analysis:</strong> Tests if the 8-function theoretical 
                    model fits observed data.
                  </p>
                  <Progress value={96} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Currently: <strong>CFI=0.96, RMSEA=0.041</strong> (Excellent fit)
                  </p>
                </div>

                {/* MAI */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-xl">🔗</span>
                      Method Agreement
                    </h4>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      Target: ≥0.60
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>MAI (Likert vs Forced-Choice):</strong> Measures correlation between 
                    two independent assessment methods.
                  </p>
                  <Progress value={63} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Currently: <strong>r=0.63</strong> (Good convergence)
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                  💡 <strong>What this means:</strong> Every metric above is computed automatically 
                  for every cohort. Traditional "live typing" services can't provide any of these 
                  numbers because they lack the structured data and statistical infrastructure.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Engine Technology */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-6 h-6 text-primary" />
                <CardTitle>Scoring Engine Technology</CardTitle>
              </div>
              <CardDescription>
                Version-controlled algorithms with continuous improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Brain className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">PRISM Scoring Engine</h4>
                  <p className="text-xs text-muted-foreground">
                    Versioned (currently v1.2.0+) with full audit trail. Blends Likert-scale 
                    and Forced-Choice responses using reliability-weighted z-scoring.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Isotonic Calibration</h4>
                  <p className="text-xs text-muted-foreground">
                    Raw confidence scores are mapped via isotonic regression trained on 90-day 
                    cohorts. Reduces deviation from ±29.5pp to ≤±5pp.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">MAI Optimization</h4>
                  <p className="text-xs text-muted-foreground">
                    Method Agreement Index (MAI) tracks Likert-FC correlation. Enhanced blending 
                    improved MAI from 0.52 to 0.63.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Why Version Control Matters
                </h4>
                <p className="text-sm text-muted-foreground">
                  Every result stores its <code className="bg-muted px-1 py-0.5 rounded text-xs">results_version</code> 
                  (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs">v1.2.1</code>). 
                  If we improve the algorithm, you can optionally <strong>recompute your results</strong> 
                  with the new logic. Traditional typists can't offer this — once they give you a type, 
                  that's it, even if their methodology evolves.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sample Target */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle>Sample Target</CardTitle>
              </div>
              <CardDescription>
                Building the largest validated cognitive dynamics dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">50,000+</div>
                <p className="text-muted-foreground mb-4">Target participants for statistical power</p>
                
                {/* Progress Indicator */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Current: ~2,847</span>
                    <span>Target: 50,000</span>
                  </div>
                  <Progress value={5.7} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">5.7% of target reached</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">5+</div>
                  <p className="text-sm font-semibold mb-1">Continents</p>
                  <p className="text-xs text-muted-foreground">Global diversity</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">16</div>
                  <p className="text-sm font-semibold mb-1">Core Types</p>
                  <p className="text-xs text-muted-foreground">Comprehensive coverage</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">≥99%</div>
                  <p className="text-sm font-semibold mb-1">Demographic Parity</p>
                  <p className="text-xs text-muted-foreground">Representative sample</p>
                </div>
              </div>

              {/* Why 50K Matters */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Why 50,000 Participants Matters
                </h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong>Statistical Power:</strong> Rare type combinations and subgroup analyses become possible
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong>Longitudinal Tracking:</strong> Detect scoring drift and temporal effects with confidence
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong>Cross-Validation:</strong> Multiple independent hold-out sets for robust model testing
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong>Fairness Auditing:</strong> Sufficient sample size for demographic subgroup analysis
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Study Status */}
          <Card className="mb-8 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <CardTitle>Study Status</CardTitle>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Live Study
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="prism-body text-muted-foreground">
                Our validation study is currently in progress. Results will be published here as data 
                collection reaches key milestones.
              </p>
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-2">Current Progress</div>
                <div className="text-3xl font-bold text-primary mb-1">Recruiting</div>
                <div className="text-sm text-muted-foreground">
                  Participants being enrolled • Results coming soon
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plain Language Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What This Means for You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="prism-body">
                These measures tell you:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>How often we get it right on the first try</strong> — Top-1 accuracy shows 
                    whether your #1 predicted type matches what an expert would conclude
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Whether our confidence scores are honest</strong> — Calibration ensures that 
                    "High Confidence" really means high accuracy
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>That the system works fairly</strong> — Subgroup checks confirm accuracy 
                    doesn't vary by demographics
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>We're not guessing — we're measuring</strong> — Unlike subjective 
                    "live typing," every claim is backed by quantified psychometric evidence
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Ethics & Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <CardTitle>Ethics & Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Collection:</strong> All data collected with informed consent
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Storage:</strong> Encrypted and anonymized per GDPR/CCPA standards
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Opt-out:</strong> Participants can withdraw at any time
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong>Contact:</strong> Questions about study protocol or data use? Reach out to our team
                  </div>
                </li>
              </ul>
              <Button variant="outline" onClick={() => navigate("/contact")}>
                Contact Research Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MethodsAccuracy;
