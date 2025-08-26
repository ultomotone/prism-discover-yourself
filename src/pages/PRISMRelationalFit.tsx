import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Heart, TrendingUp, TrendingDown, Users, Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRISMRelationalFit = () => {
  const navigate = useNavigate();

  const fitDimensions = [
    {
      dimension: "Core Alignment (Level-1 fit)",
      focus: "Baseline personality type complementarity",
      influence: "How fundamental styles or functions match. High alignment (e.g. shared values or complementary strengths) boosts comfort."
    },
    {
      dimension: "State Overlay (N+/N0/N–)",
      focus: "Current emotional/cognitive state weighting",
      influence: "Partners' typical positivity vs. stress. Dominant N+ states (good emotion regulation) enhance harmony; dominant N– states (stress) strain interactions."
    },
    {
      dimension: "Trait Modifiers (Big Five)",
      focus: "Personality trait impacts (OCEAN)",
      influence: "Big Five traits tweak fit. Agreeableness and conscientiousness generally raise fit; high neuroticism lowers it."
    },
    {
      dimension: "Supply ↔ Demand Balance",
      focus: "Roles/qualities given vs. needed by each partner",
      influence: "Partners succeed when each other's strengths (supply) meet needs (demand). Mismatched or unmet demands lead to tension."
    },
    {
      dimension: "Fit Band (Supportive/Stretch/Friction)",
      focus: "Overall interaction category",
      influence: "Simple color-coded outcome: Supportive = high synergy and mutual support; Stretch = manageable differences requiring effort; Friction = major conflicts and stress."
    }
  ];

  const definitions = [
    {
      term: "Complementarity",
      definition: "The principle that one person's behavior or traits evoke or 'complement' the other's. Complementarity can be opposite (e.g. dominant–submissive) or parallel (e.g. warm–warm) and underpins whether styles match."
    },
    {
      term: "Core Alignment",
      definition: "The baseline compatibility from each person's core personality type or dominant style. High core alignment means both partners' main approaches naturally fit together."
    },
    {
      term: "State Overlay",
      definition: "A layer describing each partner's typical state balance (N+, N0, N–). N+ indicates frequent positive/reactive states; N– indicates stress/negativity. This overlay adjusts fit based on day‑to‑day moods and regulation."
    },
    {
      term: "Trait Modifiers",
      definition: "The influence of Big Five personality traits on fit. For example, high agreeableness or conscientiousness tends to strengthen fit, while high neuroticism tends to weaken it."
    },
    {
      term: "Supply–Demand Balance",
      definition: "A descriptor of what each partner provides vs. seeks in the relationship. Supply = strengths, roles, or supports one offers; Demand = what one expects or needs from the other. Good fit requires each partner's supply to satisfy the other's demand."
    },
    {
      term: "Fit Band",
      definition: "A categorical label (Supportive, Stretch, or Friction) representing overall relationship quality. Supportive (green) indicates smooth synergy; Stretch (yellow) indicates workable but challenging differences; Friction (red) indicates significant misalignment or conflict."
    },
    {
      term: "Supportive Fit",
      definition: "The highest-band outcome where partners mutually reinforce and feel comfortable together (akin to the Socionics duality concept)."
    },
    {
      term: "Stretch Fit",
      definition: "A moderate-band outcome where partners have noticeable differences, requiring effort and growth but not outright conflict."
    },
    {
      term: "Friction Fit",
      definition: "The lowest-band outcome marked by frequent conflict or misunderstanding (e.g. both partners highly neurotic or with opposing goals)."
    }
  ];

  const supplyDemandLanes = [
    "Structure/Clarity (planning, decisioning)",
    "Care/Boundaries (values, empathy, conflict limits)",
    "Energy/Initiation (momentum, push)",
    "Sensing/Timing (tempo, comfort, pacing)",
    "Insight/Meaning (patterning, shared 'why')"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet 
        title="PRISM Relational Fit — Multi-Layer Compatibility Analysis"
        meta={[
          {
            name: "description",
            content: "Understand relationship compatibility through PRISM's multi-layered model: Core Alignment, State Overlay, Big Five traits, and Supply-Demand balance for Supportive, Stretch, or Friction fits."
          }
        ]}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-2"
          >
            Take Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">PRISM Relational Fit</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A multi-layered model that gauges how well two people connect by analyzing Core Alignment, 
            State Overlay, Trait Modifiers, and Supply-Demand Balance.
          </p>
        </section>

        {/* Overview */}
        <section className="mb-12">
          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                How PRISM Relational Fit Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed">
                The PRISM relational-fit model layers multiple factors to gauge how well two people connect. 
                <strong> Core Alignment</strong> is the Level-1 fit or baseline compatibility between their underlying 
                personality types and roles. People tend to feel secure when their partner complements their preferred style.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>State Overlay (N+/N0/N–)</strong> adds a dynamic layer of each person's current emotional/cognitive state. 
                Daily mood and regulation affect fit: effective emotion regulation promotes emotional stability and relationship resilience.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>Trait Modifiers (Big Five Overlays)</strong> further adjust fit through personality dimensions that 
                influence how partners communicate and handle conflict. Supply–Demand Balance considers what each partner 
                brings vs. needs, requiring balance where each partner's supply meets the other's demand.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Fit Dimensions Table */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">PRISM Fit Dimensions</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full space-y-4">
              {fitDimensions.map((dimension, index) => (
                <Card key={index} className="prism-shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{dimension.dimension}</CardTitle>
                    <CardDescription className="font-medium">{dimension.focus}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{dimension.influence}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Fit Bands */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Fit Bands</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="prism-shadow-card border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="w-6 h-6" />
                  Supportive Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 leading-relaxed">
                  Partners strongly complement and reinforce each other. Core types align, positive states prevail, 
                  and supplies meet demands. Resembles the "dual" or ideal complementary relation.
                </p>
              </CardContent>
            </Card>

            <Card className="prism-shadow-card border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-yellow-700">
                  <AlertTriangle className="w-6 h-6" />
                  Stretch Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-600 leading-relaxed">
                  Moderate differences exist requiring adjustment or growth. Not inherently bad, but requires effort. 
                  Partners may need to compromise around their different styles.
                </p>
              </CardContent>
            </Card>

            <Card className="prism-shadow-card border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700">
                  <XCircle className="w-6 h-6" />
                  Friction Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 leading-relaxed">
                  Significant misalignment with opposing styles or chronic negative states causing conflict. 
                  Partners often encounter misunderstandings and must actively work on harmony.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Supply-Demand Lanes */}
        <section className="mb-12">
          <Card className="prism-shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                Supply ↔ Demand Balance
              </CardTitle>
              <CardDescription>
                PRISM analyzes 5 key role-based lanes where partners supply and demand different qualities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supplyDemandLanes.map((lane, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground">{lane}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                A good lane means each person's supply meets the other's demand. A weak lane means both demand 
                the same thing, or one supplies what the other doesn't value.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 7-Step Flow */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works: 7-Step Flow</h2>
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Core Alignment Baseline",
                description: "Score how complementary the two core types are. Strong complements start high, adjacent start mid, opposing start low."
              },
              {
                step: 2,
                title: "Build Supply–Demand Grid",
                description: "For each of the 5 role lanes, mark each person's Supply vs the other's Demand."
              },
              {
                step: 3,
                title: "Weigh by Regulation State",
                description: "N+ lifts capacity to supply and tolerance for unmet demand. N– shrinks supply and inflates demand."
              },
              {
                step: 4,
                title: "Apply Trait Nudges",
                description: "Agreeableness/Conscientiousness nudge lanes up. High Neuroticism nudges down."
              },
              {
                step: 5,
                title: "Proximity-to-Dual Check",
                description: "Compare current Supply–Demand pattern to the ideal complementary pattern for their core types."
              },
              {
                step: 6,
                title: "Roll-up to Fit Band",
                description: "Determine if the relationship falls into Supportive, Stretch, or Friction category."
              },
              {
                step: 7,
                title: "Generate Guidance",
                description: "Output overall band, what you do best together, watch-outs, and 2-3 tiny habits for improvement."
              }
            ].map((item) => (
              <Card key={item.step} className="prism-shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Examples</h2>
          <div className="space-y-8">
            {/* Example A */}
            <Card className="prism-shadow-card border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">Example A: "Close to Dual" & Well-Regulated</CardTitle>
                <CardDescription>LIE (A) × ESI (B) - Supportive Fit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">States:</h4>
                    <p className="text-sm text-muted-foreground">A: 65% N+, 25% N0, 10% N–</p>
                    <p className="text-sm text-muted-foreground">B: 55% N+, 30% N0, 15% N–</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Traits:</h4>
                    <p className="text-sm text-muted-foreground">A: High Conscientiousness</p>
                    <p className="text-sm text-muted-foreground">B: High Agreeableness, Average Neuroticism</p>
                  </div>
                </div>
                <div className="bg-green-50/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Result: Supportive (Green)</h4>
                  <p className="text-green-600 text-sm mb-2"><strong>We shine at:</strong> Turning ideas into action with steady care and boundaries.</p>
                  <p className="text-green-600 text-sm mb-2"><strong>Watch-out:</strong> A can over-accelerate; B may withdraw when values feel ignored.</p>
                  <p className="text-green-600 text-sm"><strong>Two habits:</strong> (1) 15-min weekly "pace + priorities" sync. (2) "Red-flag word" both can use to pause and re-center values vs. speed.</p>
                </div>
              </CardContent>
            </Card>

            {/* Example B */}
            <Card className="prism-shadow-card border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-700">Example B: Same Core Types, A Often Shifts State</CardTitle>
                <CardDescription>LIE (A) × ESI (B) - Stretch Fit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">States:</h4>
                    <p className="text-sm text-muted-foreground">A: 25% N+, 35% N0, 40% N– (under stress)</p>
                    <p className="text-sm text-muted-foreground">B: 60% N+, 25% N0, 15% N–</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Traits:</h4>
                    <p className="text-sm text-muted-foreground">A: Average Conscientiousness, Higher Neuroticism</p>
                    <p className="text-sm text-muted-foreground">B: High Agreeableness</p>
                  </div>
                </div>
                <div className="bg-yellow-50/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-700 mb-2">Result: Stretch (Yellow)</h4>
                  <p className="text-yellow-600 text-sm mb-2"><strong>We shine at:</strong> Values-anchored support when we slow the tempo.</p>
                  <p className="text-yellow-600 text-sm mb-2"><strong>Watch-out:</strong> Planning/deciding stalls when A is depleted; B over-extends emotional labor.</p>
                  <p className="text-yellow-600 text-sm"><strong>Two habits:</strong> (1) Put Structure "on rails" (shared checklist + time block). (2) B protects a boundary ("I can listen 20 min, then we pick one next step").</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Definitions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Key Definitions</h2>
          <div className="space-y-4">
            {definitions.map((def, index) => (
              <Card key={index} className="prism-shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{def.term}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{def.definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12">
          <Card className="prism-shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold mb-4">Discover Your Relational Fit</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Take the PRISM assessment to understand your core type, state patterns, and how you connect with others.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/assessment')}
                className="text-lg px-8"
              >
                Take PRISM Assessment
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default PRISMRelationalFit;