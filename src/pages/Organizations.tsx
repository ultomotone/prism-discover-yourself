import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Users, MessageSquare, TrendingUp, Target, User, Compass, Lightbulb, 
  DollarSign, UserCog, Search, BookOpen, Rocket, ChevronDown, 
  ArrowRight, Calculator, Download, Play, CheckCircle, BarChart3,
  Clock, Mail, Phone
} from "lucide-react";
import { LearnMoreModal } from "@/components/organizations/modals/LearnMoreModal";
import { ROICalculatorModal } from "@/components/organizations/modals/ROICalculatorModal";
import { CadenceKitModal } from "@/components/organizations/modals/CadenceKitModal";

const Organizations = () => {
  const [learnMoreModal, setLearnMoreModal] = useState<{ isOpen: boolean; type: string }>({
    isOpen: false,
    type: ""
  });
  const [roiModalOpen, setRoiModalOpen] = useState(false);
  const [cadenceModalOpen, setCadenceModalOpen] = useState(false);
  const [outcomesExpanded, setOutcomesExpanded] = useState(false);
  const [includedExpanded, setIncludedExpanded] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openLearnMore = (type: string) => {
    setLearnMoreModal({ isOpen: true, type });
  };

  const closeLearnMore = () => {
    setLearnMoreModal({ isOpen: false, type: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="shadow-lg"
          onClick={() => window.open('https://calendly.com/prismpersonality/pilot-review', '_blank')}
        >
          Book a Pilot Review
        </Button>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Applied Behavioral Science for Repeatable Pipeline
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            PRISM aligns SDR/BDR motion to how buyers buy—compressing cycles and increasing win consistency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={() => window.open('https://calendly.com/prismpersonality/pilot-review', '_blank')}
            >
              Book a Pilot Review
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open('/resources/academic-summary.pdf', '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Download the Academic Summary
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            <button 
              onClick={() => scrollToSection('core-alignments')}
              className="text-primary hover:underline"
            >
              See how Core Alignments shape buyer messaging ↓
            </button>
          </p>
        </div>
      </section>

      {/* Evidence-Based Sales Enablement */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Evidence‑Based Sales Enablement for RevOps</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              <strong>PRISM</strong> is an academic‑grade behavioral diagnostics system packaged for revenue operations. 
              It translates personality and interaction signals into enablement assets your SDR/BDR teams can use 
              immediately—cadences, talk tracks, channel selection, and rep‑to‑buyer matching—so pipeline moves 
              faster with higher win consistency.
            </p>
          </div>
          
          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
            <p className="text-lg font-medium">
              Front‑of‑house: research‑driven. Back‑of‑house: revenue outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* The RevOps Problem We Solve */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">The RevOps Problem We Solve</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <p>Forecast misses from inconsistent top‑of‑funnel quality</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <p>Long ramp times and manager‑dependent coaching</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <p>"One‑size‑fits‑all" cadences that stall on modern buyers</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <p>Fragmented enablement content and shadow playbooks</p>
              </div>
            </div>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">PRISM Solution</h3>
              <p className="text-muted-foreground">
                <strong>PRISM</strong> aligns people, process, and platforms around how <em>your</em> buyers 
                prefer to engage—so qualification tightens, cycles compress, and retention rises.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Outcomes Snapshot */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Outcomes Snapshot</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ramp Time ↓</h3>
              <p className="text-sm text-muted-foreground">
                Via matched talk tracks and channels
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Stage Conversion ↑</h3>
              <p className="text-sm text-muted-foreground">
                Through archetype‑specific discovery & objections
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Clock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Cycle Time ↓</h3>
              <p className="text-sm text-muted-foreground">
                By channel selection keyed to buyer preference
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Retention & Expansion ↑</h3>
              <p className="text-sm text-muted-foreground">
                With motivators & risk flags passed to CS
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How PRISM Works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">How PRISM Works (Org Rollout)</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="text-lg font-semibold">Diagnose (2 weeks)</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Import CRM/SEP data</li>
                <li>• Run assessments</li>
                <li>• Map buyer archetypes to ICP</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="text-lg font-semibold">Calibrate (2–4 weeks)</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Build archetype cadences</li>
                <li>• Create talk tracks & objection matrices</li>
                <li>• Train managers and SDR/BDR</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <h3 className="text-lg font-semibold">Operationalize (ongoing)</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Weekly learning loops</li>
                <li>• A/B testing</li>
                <li>• PSA governance</li>
              </ul>
            </Card>
          </div>
          
          <div className="text-center">
            <Button variant="outline" onClick={() => alert('Rollout timeline drawer coming soon')}>
              View rollout timeline
            </Button>
          </div>
        </div>
      </section>

      {/* The People System Architect */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The People System Architect™ (PSA)</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <strong>The role that installs and maintains PRISM across your revenue stack.</strong>
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">What the PSA Does</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Designs buyer‑aligned motion (SDR/BDR → AE → CS)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Standardizes enablement assets by buyer archetype</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Owns instrumentation: stage criteria & conversion gates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Partners with RevOps to automate routing, scoring, reporting</span>
                </li>
              </ul>
            </div>
            
            <Card className="p-6 bg-primary/5">
              <h3 className="text-lg font-semibold mb-4">Get the PSA Role Kit</h3>
              <p className="text-muted-foreground mb-4">
                Complete role definition, hiring criteria, and onboarding materials for the PSA position.
              </p>
              <Button variant="outline" onClick={() => window.open('/resources/psa-role-kit.pdf', '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Download the PSA Role Kit
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* What SDR/BDR Teams Actually Get */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">What SDR/BDR Teams Actually Get</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">Cadence Kits per archetype</h3>
                </div>
                <p className="text-muted-foreground">Email, phone, social, video sequences tailored to buyer personalities</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">Talk‑Track Library</h3>
                </div>
                <p className="text-muted-foreground">Openers, discovery prompts, objection angles, CTAs by archetype</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">Persona‑to‑Rep Matching</h3>
                </div>
                <p className="text-muted-foreground">Optional routing + coaching based on cognitive compatibility</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">Manager Console</h3>
                </div>
                <p className="text-muted-foreground">Scoreboard + call‑coaching prompts by archetype</p>
              </Card>
            </div>
            
            <div className="flex flex-col justify-center">
              <Card className="p-8 text-center bg-primary/5">
                <h3 className="text-xl font-semibold mb-4">See It In Action</h3>
                <p className="text-muted-foreground mb-6">
                  View a complete cadence kit for "The Analyst" archetype - including email sequences, 
                  call scripts, and objection handling.
                </p>
                <Button onClick={() => setCadenceModalOpen(true)}>
                  <Play className="mr-2 h-4 w-4" />
                  See a Cadence Kit
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Model */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ROI Model</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Example: Team of 10 SDRs; +25% meetings from archetype‑matched cadences ≈ ~$450k annualized at $25k ACV
            </p>
          </div>
          
          <Card className="p-8 max-w-2xl mx-auto text-center">
            <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Calculate Your ROI</h3>
            <p className="text-muted-foreground mb-6">
              See the potential impact on your pipeline with our interactive ROI calculator
            </p>
            <Button size="lg" onClick={() => setRoiModalOpen(true)}>
              <Calculator className="mr-2 h-4 w-4" />
              Run my numbers
            </Button>
          </Card>
        </div>
      </section>

      {/* Academic Sections */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Academic Foundation</h2>
            <p className="text-lg text-muted-foreground">
              The research and methodology behind PRISM's commercial applications
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Core Alignments */}
            <div id="core-alignments" className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4">Core Alignments</h3>
                  <p className="text-muted-foreground mb-4">
                    Core alignments represent fundamental cognitive orientations that shape how individuals 
                    process information and make decisions. Understanding these patterns allows for more 
                    effective communication and engagement strategies.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => openLearnMore('core-alignments')}>
                    Learn more
                  </Button>
                </Card>
              </div>
              <Card className="p-6 bg-primary/5">
                <h4 className="font-semibold mb-3 text-primary">What this means for RevOps</h4>
                <p className="text-sm text-muted-foreground">
                  We adjust messaging & outreach by alignment—analytical buyers get data-driven openers, 
                  while relationship-oriented buyers respond to social proof and testimonials.
                </p>
              </Card>
            </div>

            {/* Dimensionality */}
            <div id="dimensionality" className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4">Dimensionality</h3>
                  <p className="text-muted-foreground mb-4">
                    Our 1D–4D skill/adaptability model maps cognitive flexibility and operational capability. 
                    This framework helps identify appropriate complexity levels for different buyer interactions.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => openLearnMore('dimensionality')}>
                    Learn more
                  </Button>
                </Card>
              </div>
              <Card className="p-6 bg-primary/5">
                <h4 className="font-semibold mb-3 text-primary">What this means for RevOps</h4>
                <p className="text-sm text-muted-foreground">
                  Senior buyers need different proof than operators—C-suite wants strategic impact while 
                  practitioners need tactical details and implementation roadmaps.
                </p>
              </Card>
            </div>

            {/* Signals */}
            <div id="signals" className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4">Signals (Information Elements)</h3>
                  <p className="text-muted-foreground mb-4">
                    Key information elements that different cognitive types prioritize when evaluating 
                    solutions. These signals guide content creation and objection handling strategies.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => openLearnMore('signals')}>
                    Learn more
                  </Button>
                </Card>
              </div>
              <Card className="p-6 bg-primary/5">
                <h4 className="font-semibold mb-3 text-primary">What this means for RevOps</h4>
                <p className="text-sm text-muted-foreground">
                  Objection handling & proof points per signal—data-driven buyers need ROI calculations, 
                  while harmony-focused buyers need consensus-building approaches.
                </p>
              </Card>
            </div>

            {/* More sections would follow the same pattern */}
          </div>
        </div>
      </section>

      {/* Programs & Services */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Programs & Services</h2>
            <p className="text-lg text-muted-foreground">
              Three clear tracks to get you from assessment to operational excellence
            </p>
          </div>

          {/* Recommended Starting Point */}
          <Card className="mb-12 p-6 border-2 border-primary/20 bg-primary/5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">🌟 Recommended Starting Point</h3>
              <p className="text-muted-foreground">Not sure which service fits? Start here for expert guidance.</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card className="border-primary/40">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-6 w-6 text-primary" />
                    <CardTitle>Owner/Leader Discovery</CardTitle>
                  </div>
                  <CardDescription>Snapshot of leadership signals and growth areas.</CardDescription>
                  <Badge variant="outline">20m · 49 credits</Badge>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => openLearnMore('owner-discovery')}
                  >
                    Learn more
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Card>

          {/* Service Tracks */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Track A - Leadership */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Track A — Leadership & Org Clarity</h3>
              <p className="text-sm text-muted-foreground mb-6">
                For CEOs/Founders/Heads of RevOps to align leadership signals with operating cadence.
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Leadership Debrief</h4>
                  <p className="text-sm text-muted-foreground mb-2">Deep dive on leadership style and blind spots.</p>
                  <Badge variant="outline" className="mb-2">60m</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => openLearnMore('leadership-debrief')}
                  >
                    Learn more
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Leader Coaching & Training</h4>
                  <p className="text-sm text-muted-foreground mb-2">Ongoing coaching and training for leaders.</p>
                  <Badge variant="outline" className="mb-2">Varies</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => openLearnMore('leader-coaching')}
                  >
                    Learn more
                  </Button>
                </div>
              </div>
            </Card>

            {/* Track B - Team Dynamics */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Track B — Team Dynamics & Collaboration</h3>
              <p className="text-sm text-muted-foreground mb-6">
                For intact teams to reduce friction and improve execution.
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Team Compass Workshop</h4>
                  <p className="text-sm text-muted-foreground mb-2">Interactive session for teams up to eight people.</p>
                  <Badge variant="outline" className="mb-2">90m</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => openLearnMore('team-compass')}
                  >
                    Learn more
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Team Performance Sprint</h4>
                  <p className="text-sm text-muted-foreground mb-2">Two‑month sprint to raise team effectiveness.</p>
                  <Badge variant="outline" className="mb-2">2 months</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => openLearnMore('team-sprint')}
                  >
                    Learn more
                  </Button>
                </div>
              </div>

              {/* Team Outcomes Collapsible */}
              <Collapsible open={outcomesExpanded} onOpenChange={setOutcomesExpanded} className="mt-6">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    Team outcomes
                    <ChevronDown className={`h-4 w-4 transition-transform ${outcomesExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="text-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Fewer crossed wires; better feedback loops</p>
                        <p className="text-muted-foreground text-xs">Clear communication patterns reduce misunderstandings and improve collaboration.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clearer roles based on strengths and dimensionality</p>
                        <p className="text-muted-foreground text-xs">Assign responsibilities that align with natural abilities and development levels.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Faster decisions under pressure</p>
                        <p className="text-muted-foreground text-xs">Teams understand how each member responds to stress and can adapt accordingly.</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* What's Included Collapsible */}
              <Collapsible open={includedExpanded} onOpenChange={setIncludedExpanded} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    What's included
                    <ChevronDown className={`h-4 w-4 transition-transform ${includedExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="text-sm space-y-1">
                    <p>• Team Assessment + Group Report</p>
                    <p>• Workshop</p>
                    <p>• PRISM in practice (communication, conflict, decisions)</p>
                    <p>• Manager toolkit</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Track C - Revenue Enablement */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Track C — Revenue Enablement</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Designed to map cognition to commercial conversations and pipeline creation.
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Sales Persona Play</h4>
                  <p className="text-sm text-muted-foreground mb-2">Align sales tactics to customer cognition.</p>
                  <Badge variant="outline" className="mb-2">45m</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCadenceModalOpen(true)}
                  >
                    See a Cadence Kit
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Manager: Coaching by Persona</h4>
                  <p className="text-sm text-muted-foreground mb-2">Coaching framework tailored to manager profiles.</p>
                  <Badge variant="outline" className="mb-2">60m</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('/resources/manager-toolkit.pdf', '_blank')}
                  >
                    Download Manager Toolkit
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing & Offer */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Pricing & Offer (Organization)</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Pilot (30 Days)</h3>
              <p className="text-muted-foreground text-sm">Prove value with initial cohort</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Quarterly Rollout (90 Days)</h3>
              <p className="text-muted-foreground text-sm">Full team implementation</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Annual Scale</h3>
              <p className="text-muted-foreground text-sm">Enterprise-wide deployment</p>
            </Card>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">Risk Reversal</h3>
            <p className="text-green-700">
              If the pilot doesn't hit agreed conversion lifts, extend or credit the fee.
            </p>
          </div>
          
          <Button 
            size="lg"
            onClick={() => window.open('https://calendly.com/prismpersonality/pilot-review', '_blank')}
          >
            Book a Pilot Review
          </Button>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">FAQs</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is this a personality test?</h3>
              <p className="text-muted-foreground">No—this is an operational layer that translates cognitive patterns into actionable sales strategies.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Will reps feel labeled?</h3>
              <p className="text-muted-foreground">Buyer‑first matching is the focus; rep matching is optional and emphasizes strengths.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Privacy concerns?</h3>
              <p className="text-muted-foreground">Role‑based access controls; opt‑in assessments; data remains within your environment.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Already have enablement tools?</h3>
              <p className="text-muted-foreground">We standardize and measure existing content, adding cognitive targeting to what you already have.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Sales Motion?</h2>
          <p className="text-xl opacity-90 mb-8">
            Book a pilot review to see how PRISM can align your team's approach to how buyers actually buy.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.open('https://calendly.com/prismpersonality/pilot-review', '_blank')}
          >
            Book a Pilot Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Modals */}
      <LearnMoreModal 
        isOpen={learnMoreModal.isOpen} 
        onClose={closeLearnMore} 
        type={learnMoreModal.type} 
      />
      
      <ROICalculatorModal 
        isOpen={roiModalOpen} 
        onClose={() => setRoiModalOpen(false)} 
      />
      
      <CadenceKitModal 
        isOpen={cadenceModalOpen} 
        onClose={() => setCadenceModalOpen(false)} 
      />
    </div>
  );
};

export default Organizations;