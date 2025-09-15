import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, Brain, Shield, CheckCircle, Users, AlertTriangle, ChevronDown, Target, Zap, TrendingUp, BarChart3, Mail, ArrowRight, Loader2 } from "lucide-react";
import { SystemStatusIndicator } from "@/components/SystemStatusIndicator";
import { useEmailSessionManager } from "@/hooks/useEmailSessionManager";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface AssessmentIntroProps {
  onStart: () => void;
}

export function AssessmentIntro({ onStart }: AssessmentIntroProps) {
  const [isDifferencesOpen, setIsDifferencesOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [showEmailContinue, setShowEmailContinue] = useState(false);
  const [email, setEmail] = useState('');
  const { startAssessmentSession, isLoading } = useEmailSessionManager();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const sessionData = await startAssessmentSession(email);
    if (sessionData) {
      if (sessionData.existing_session) {
        // Resume existing session
        navigate(`/assessment?resume=${sessionData.session_id}`);
      } else {
        // Start new session with email
        navigate(`/assessment?start=true&session=${sessionData.session_id}`);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="prism-heading-lg text-primary mb-6">
              Welcome to the PRISM Assessment
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Personality, Regulation, Information, System, Mapping
            </p>
            
            {/* System Status Indicator */}
            <div className="flex justify-center">
              <SystemStatusIndicator />
            </div>
          </div>

          {/* Introduction */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Brain className="h-6 w-6 text-accent mr-3" />
                <h2 className="text-2xl font-semibold text-primary">About This Assessment</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                This questionnaire is designed to create a detailed PRISM profile based on your responses, including dimensionality scores, information element strengths, and personality state/context indicators.
              </p>
              
              <h3 className="text-xl font-semibold text-primary mb-4">The assessment is structured in several parts:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>Core PRISM Personality Assessment</strong> – Questions based on Socionics Model A and the PRISM mechanics to measure your cognitive preferences and behavioral tendencies.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>Dimensionality & Expression</strong> – Measures the strength, flexibility, and situational expression of each information element.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>State & Context Checks</strong> – Captures your current stress, mood, and focus to refine accuracy.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>Optional Research Questions</strong> – Demographics, life context, and self-perception questions to support model improvement and academic study.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How PRISM Differs */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Target className="h-6 w-6 text-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">How PRISM Differs</h2>
              </div>
              
              <p className="text-muted-foreground mb-6">
                <strong>Short answer: yes—with nuance.</strong> PRISM is hybrid: it blends normative Likert data with ipsative (forced-choice) signals, adds state-aware controls, and outputs both absolute, sample-invariant "fit" and relative "share". Most personality tests are purely normative and don't separate stable preference from situational expression.
              </p>

              <Collapsible open={isDifferencesOpen} onOpenChange={setIsDifferencesOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left">
                    <span className="text-lg font-medium text-primary">Key Differences from Typical Tests</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDifferencesOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-primary">Hybrid Scoring</h4>
                          <p className="text-sm text-muted-foreground">We combine Likert items with forced-choice trade-offs. The ipsative layer dampens "agree-with-everything" styles and sharpens which functions you actually prefer when choices conflict.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-primary">Bias & Validity Controls</h4>
                          <p className="text-sm text-muted-foreground">We compute social-desirability index, inconsistency pairs, and person-mean centering. These guard against inflated profiles without changing the raw data.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-primary">State-Aware Overlay</h4>
                          <p className="text-sm text-muted-foreground">We factor short-term state (stress, sleep, time pressure, mood, focus) into an N+/– overlay and confidence, so you can tell "core preference" from "current pressure."</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <BarChart3 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-primary">Absolute vs. Relative</h4>
                          <p className="text-sm text-muted-foreground">We report an absolute fit (0–100) calibrated to fixed criteria and a relative share % across the 16 types.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-primary">Retest Intelligence</h4>
                        <p className="text-sm text-muted-foreground">When you take it again, we show deviations and why (e.g., "Stress +2, Sleep –2; Fe −0.6; overlay flipped to N+"), not just a new label.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center italic text-muted-foreground">
                    "Most tests give a static snapshot. PRISM shows both your core type and how it expresses today—with clear retest deltas."
                  </div>
                  
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Frequently Asked Questions</h2>
              </div>
              
              <Collapsible open={isFAQOpen} onOpenChange={setIsFAQOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left">
                    <span className="text-lg font-medium text-primary">Common Questions About PRISM</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isFAQOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Is PRISM ipsative?</h4>
                      <p className="text-sm text-muted-foreground">Partly. PRISM is hybrid: it combines normative Likert items with forced-choice trade-offs. The ipsative layer reduces response bias and clarifies priorities between competing functions.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary mb-2">How is PRISM "invariance-oriented"?</h4>
                      <p className="text-sm text-muted-foreground">We compute an absolute fit score against fixed criteria (usage, depth, forced-choice support, conflict penalties). This is designed to be stable across samples. A separate share % shows how your result ranks among types for you.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Does PRISM handle bias and state?</h4>
                      <p className="text-sm text-muted-foreground">Yes. We track social desirability and inconsistency and add a state overlay (N+/–) that reflects current pressure/steadiness, so guidance adjusts without rewriting your core type.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Can I compare runs?</h4>
                      <p className="text-sm text-muted-foreground">Yes. We show what changed and why—function and dimension deltas, overlay shift, and likely contributors (e.g., stress/sleep). Your history stays linked privately via hashed email.</p>
                    </div>
                  </div>
                  
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Time & Format */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Time Required</h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Approximately <strong className="text-primary animate-pulse bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-[0_0_10px_hsl(var(--primary))] glow-text">35–55 minutes</strong>
              </p>
            </CardContent>
          </Card>

          {/* Confidentiality */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Confidentiality</h2>
              </div>
              <p className="text-muted-foreground">
                Your responses will be kept confidential and used only for generating your profile and, if you choose, for aggregated research purposes. No personally identifying information will be shared without your explicit consent.
              </p>
            </CardContent>
          </Card>

          {/* Voluntary Participation */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-6 w-6 text-accent mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Voluntary Participation</h2>
              </div>
              <p className="text-muted-foreground">
                You may skip any optional research questions. Skipping will not affect your profile results.
              </p>
            </CardContent>
          </Card>

          {/* Ready section */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Ready to Begin?</h2>
              <p className="text-muted-foreground mb-6">
                When you're ready to start your PRISM assessment, you can either continue a saved assessment or start fresh.
              </p>
              
              {!showEmailContinue ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="text-xl px-12 py-4 touch-manipulation cursor-pointer mb-4"
                      onClick={(e) => {
                        console.log('Start Assessment button clicked', e);
                        e.preventDefault();
                        e.stopPropagation();
                        onStart();
                      }}
                      onTouchStart={() => console.log('Touch start on button')}
                      type="button"
                    >
                      Start New Assessment
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailContinue(true)}
                      className="text-base px-8 py-3"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Continue Saved Assessment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-2">Continue Your Assessment</h3>
                    <p className="text-muted-foreground">Enter your email to resume a saved assessment or start a new one</p>
                  </div>
                  
                  <form onSubmit={handleEmailContinue} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={isLoading || !email.trim()}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            Continue Assessment
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmailContinue(false)}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}