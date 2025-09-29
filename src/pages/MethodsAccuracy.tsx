import { Helmet } from "react-helmet";
import { BarChart3, Shield, Target, Users, FileText, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="prism-container max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">Methodology & Validation</Badge>
            <h1 className="prism-heading-xl mb-6">
              Methods & Accuracy
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Transparent methodology and validation approach showing how we measure prediction accuracy 
              against independent expert typing.
            </p>
          </div>

          {/* Study Design */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-6 h-6 text-primary" />
                <CardTitle>Study Design</CardTitle>
              </div>
              <CardDescription>
                Randomized, blinded comparison of first-pass predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="prism-body">
                Our validation study compares PRISM Dynamics' algorithmic predictions to independent 
                expert 1:1 typings conducted by trained practitioners:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Randomization:</strong> Participants randomly assigned to assessment order
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Blinding:</strong> Two independent expert raters conduct 1:1 typings without 
                    seeing algorithmic results
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Adjudication:</strong> Disagreements between raters resolved by senior practitioner
                  </div>
                </li>
              </ul>
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

          {/* Sample */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle>Sample Target</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="prism-body">
                <strong>Target n ≥ 300</strong> participants across:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Multiple</div>
                  <div className="text-sm text-muted-foreground">Geographies</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Balanced</div>
                  <div className="text-sm text-muted-foreground">Gender Distribution</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Diverse</div>
                  <div className="text-sm text-muted-foreground">Age Bands</div>
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
      
      <Footer />
    </div>
  );
};

export default MethodsAccuracy;
