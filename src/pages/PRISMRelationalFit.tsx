import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Heart, TrendingUp, TrendingDown, Users, Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RelationalFitHero from '@/components/relational/RelationalFitHero';
import { StateOscillationMatrix } from '@/components/relational/StateOscillationMatrix';

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
      influence: "Partners' typical regulation vs. stress. Dominant N− states (good regulation) enhance harmony; dominant N+ states (stress) strain interactions."
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
        definition: "A layer describing each partner's typical state balance (N+, N0, N−). N− indicates frequent calm/regulated states (lifts fit); N+ indicates stress/reactivity (lowers fit). This overlay adjusts fit based on day‑to‑day moods and regulation."
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

        {/* Interactive Tool CTA */}
        <section className="mb-12">
          <Card className="prism-shadow-card border-2 border-rf-teal/30 bg-gradient-to-br from-rf-teal/5 to-rf-gold/5">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rf-teal/10 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-rf-teal" />
              </div>
              <CardTitle className="text-2xl text-rf-teal">Try the Interactive Relational Fit Tool</CardTitle>
              <CardDescription className="text-lg">
                Explore the complete 16×16 compatibility heatmap and get detailed analysis for any type pair
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-background/60 rounded-lg">
                  <h4 className="font-semibold text-rf-navy mb-2">16×16 Heatmap</h4>
                  <p className="text-sm text-muted-foreground">Interactive grid showing all 256 type combinations with color-coded compatibility scores</p>
                </div>
                <div className="p-4 bg-background/60 rounded-lg">
                  <h4 className="font-semibold text-rf-navy mb-2">Detailed Analysis</h4>
                  <p className="text-sm text-muted-foreground">Complete breakdown of Core Alignment, lanes, and specific relationship guidance</p>
                </div>
                <div className="p-4 bg-background/60 rounded-lg">
                  <h4 className="font-semibold text-rf-navy mb-2">Actionable Habits</h4>
                  <p className="text-sm text-muted-foreground">7-day experiments tailored to strengthen your specific type combination</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-rf-teal hover:bg-rf-teal/90 text-rf-teal-foreground"
                  onClick={() => navigate('/relational-fit')}
                >
                  Launch Interactive Tool
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/relational-fit/heatmap')}
                >
                  View Heatmap Directly
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table of Contents */}
        <nav id="toc" className="mb-8 p-4 border border-border rounded-lg bg-muted/30">
          <div className="font-semibold mb-3">On this page</div>
          <ol className="ml-5 space-y-1 text-sm">
            <li><a href="#overview" className="text-primary hover:underline">Overview</a></li>
            <li><a href="#state-example" className="text-primary hover:underline">State Oscillations Example</a></li>
            <li>
              <a href="#fit-dimensions" className="text-primary hover:underline">PRISM Fit Dimensions</a>
              <ul className="ml-4 mt-1 space-y-1">
                <li><a href="#core-alignment" className="text-primary hover:underline">Core Alignment (Level-1 fit)</a></li>
                <li><a href="#state-overlay" className="text-primary hover:underline">State Overlay (N+/N0/N–)</a></li>
                <li><a href="#trait-modifiers" className="text-primary hover:underline">Trait Modifiers (Big Five)</a></li>
                <li><a href="#supply-demand" className="text-primary hover:underline">Supply ↔ Demand Balance</a></li>
                <li><a href="#fit-bands" className="text-primary hover:underline">Fit Bands (Supportive • Stretch • Friction)</a></li>
              </ul>
            </li>
            <li><a href="#flow" className="text-primary hover:underline">How It Works: 7-Step Flow</a></li>
            <li><a href="#examples" className="text-primary hover:underline">Examples</a></li>
            <li><a href="#definitions" className="text-primary hover:underline">Key Definitions</a></li>
          </ol>
        </nav>

        {/* TL;DR Section */}
        <section className="max-w-4xl mx-auto mb-8 p-4 border border-border rounded-lg text-center bg-muted/20">
          <h2 className="text-xl font-bold mb-2">PRISM Relational Fit — TL;DR</h2>
          <p className="text-muted-foreground">
            We estimate how two people connect using five layers: <strong>Core Alignment</strong> (baseline type match), 
            <strong> State Overlay</strong> (N+/N0/N– regulation), <strong> Trait Modifiers</strong> (Big Five), 
            <strong> Supply↔Demand</strong> (what you give vs. need), and a simple <strong> Fit Band</strong> (Supportive • Stretch • Friction).
          </p>
        </section>

        {/* Visual Key */}
        <section className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-3 justify-center flex-wrap mb-3">
            <span className="px-3 py-2 rounded-full bg-rf-supportive/20 border border-rf-supportive/30 text-sm">
              🟩 Supportive
            </span>
            <span className="px-3 py-2 rounded-full bg-rf-stretch/20 border border-rf-stretch/30 text-sm">
              🟨 Stretch
            </span>
            <span className="px-3 py-2 rounded-full bg-rf-friction/20 border border-rf-friction/30 text-sm">
              🟥 Friction
            </span>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Colors reflect the overall roll-up after weighting Core, State, Traits, and Supply↔Demand.
          </p>
        </section>

        {/* Overview */}
        <section id="overview" className="mb-12">
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
                <strong>State Overlay (N+/N0/N–)</strong> adds a dynamic layer of each person&apos;s current emotional/cognitive state. 
                Daily mood and regulation affect fit: effective emotion regulation promotes emotional stability and relationship resilience.
                N− (calm) lifts fit; N+ (stress) lowers fit.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>Trait Modifiers (Big Five Overlays)</strong> further adjust fit through personality dimensions that 
                influence how partners communicate and handle conflict. Supply–Demand Balance considers what each partner 
                brings vs. needs, requiring balance where each partner&apos;s supply meets the other&apos;s demand.
              </p>
              <p className="text-lg leading-relaxed italic text-muted-foreground">
                PRISM does not prescribe relationships; it highlights patterns so you can choose wiser.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* State Oscillations Example */}
        <section id="state-example" className="max-w-4xl mx-auto mb-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Relational Fit = Core Alignment × State Oscillations</h2>
            <p className="text-muted-foreground">
              People don't stay in one mode. PRISM models each person's top states and how often they happen, then maps how those states interact.
              That's your practical, day-to-day fit—not just a label.
            </p>

            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(120 75% 45%)" }} />
                Reg+ (N−) lifts fit
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(60 75% 45%)" }} />
                Reg0 (N0) neutral
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0 75% 45%)" }} />
                Reg− (N+) lowers fit
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Example: IEI ↔ SLE (dual) — state-pair map</h3>
              <p className="text-sm text-muted-foreground">
                We weight the IEI's and SLE's common states by frequency, compute the nudge for each pairing,
                and roll that into the overall fit band alongside core alignment.
              </p>
            </div>

            <StateOscillationMatrix 
              aName="IEI" 
              bName="SLE" 
              aMix={{ Nminus: 0.45, N0: 0.35, Nplus: 0.20 }}
              bMix={{ Nminus: 0.35, N0: 0.40, Nplus: 0.25 }}
            />
          </div>
        </section>

        {/* State Oscillations Section */}
        <section id="state-overlay" className="max-w-4xl mx-auto mb-12">
          <div className="p-6 border border-border rounded-lg bg-muted/30">
            <h3 className="text-2xl font-bold mb-4 text-center">State Oscillations (why "one state" is never the full story)</h3>
            <p className="text-muted-foreground mb-4">
              In real life we don't stay in one mode. PRISM models each person's top 2–3 recurring states and how often they happen. 
              We use the Neuroticism overlay codes but show friendly labels:
            </p>
            
            <div className="space-y-2 mb-4">
              <p><strong>Reg+ (N−)</strong> = calm / well-regulated</p>
              <p><strong>Reg0 (N0)</strong> = neutral</p>
              <p><strong>Reg− (N+)</strong> = stressed / reactive</p>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Key idea:</strong> Fit isn't just "your type vs their type." It's also which state you're both in at the same time. 
              So we compute a state-pair map (your most common states × their most common states) and weight that by how often those pairings actually occur.
            </p>
            
            <div className="border border-border rounded-lg p-4 bg-background">
              <h4 className="font-semibold mb-2">Example (LIE × ESI)</h4>
              <div className="text-sm space-y-2">
                <p><strong>LIE State Mix:</strong> Reg0 50%, Reg+ 35%, Reg− 15%</p>
                <p><strong>ESI State Mix:</strong> Reg+ 55%, Reg0 30%, Reg− 15%</p>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>What this means:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Their most frequent pairing is LIE Reg0 × ESI Reg+ → usually smooth: decisions land and care stays warm.</li>
                  <li>Less common but important: LIE Reg− × ESI Reg+ → ESI can steady things briefly, but set limits so support doesn't become burnout.</li>
                  <li>Rare friction: Reg− × Reg− → both depleted; hit pause, down-shift, and reschedule anything high-stakes.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <StateOscillationMatrix 
              aName="LIE"
              bName="ESI"
              aMix={{ Nminus: 0.35, N0: 0.50, Nplus: 0.15 }}
              bMix={{ Nminus: 0.55, N0: 0.30, Nplus: 0.15 }}
            />
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-6">
            <p className="text-sm mb-2">
              <strong>How we score it (simple version):</strong>
            </p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>We keep your Core Alignment (type-to-type baseline).</li>
              <li>For each state pairing, we apply state weights (Reg+ lifts fit a bit, Reg− lowers it a bit).</li>
              <li>We multiply by how often each pairing happens and sum it up → your practical fit (what you actually feel most days).</li>
              <li>We label the result as Supportive, Stretch, or Friction and show where the score comes from (top pairings + watch-outs).</li>
            </ul>
            <p className="text-sm mt-3 font-medium">
              <strong>Rule of thumb:</strong> More Reg+ and Reg0 in your common pairings → higher real-world fit. 
              More Reg− × Reg− time → more friction even for great core matches.
            </p>
          </div>
        </section>

        {/* Supply-Demand Grid */}
        <section id="supply-demand" className="max-w-4xl mx-auto mb-8">
          <h3 className="text-2xl font-bold text-center mb-4">Supply ↔ Demand Balance</h3>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Lane</th>
                    <th className="text-center p-3 font-medium">Person A supplies</th>
                    <th className="text-center p-3 font-medium">Person B needs</th>
                    <th className="text-center p-3 font-medium">Match</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted">
                    <td className="p-3">Structure / Clarity</td>
                    <td className="text-center p-3">High</td>
                    <td className="text-center p-3">Medium</td>
                    <td className="text-center p-3">🟩</td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="p-3">Care / Boundaries</td>
                    <td className="text-center p-3">Low</td>
                    <td className="text-center p-3">High</td>
                    <td className="text-center p-3">🟨</td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="p-3">Energy / Initiation</td>
                    <td className="text-center p-3">High</td>
                    <td className="text-center p-3">Low</td>
                    <td className="text-center p-3">🟩</td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="p-3">Sensing / Timing</td>
                    <td className="text-center p-3">Low</td>
                    <td className="text-center p-3">Low</td>
                    <td className="text-center p-3">🟥</td>
                  </tr>
                  <tr>
                    <td className="p-3">Insight / Meaning</td>
                    <td className="text-center p-3">Medium</td>
                    <td className="text-center p-3">Medium</td>
                    <td className="text-center p-3">🟩</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 text-center text-muted-foreground text-sm border-t border-muted">
              Green = supply meets demand; Yellow = partial; Red = unmet or mismatched.
            </div>
          </Card>
        </section>

        {/* Relationship Summary Card */}
        <section className="max-w-4xl mx-auto mb-8">
          <Card className="p-4 border-2">
            <CardHeader className="pb-2">
              <CardTitle>Relationship Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><strong>Core Alignment:</strong> High (adjacent–complementary)</li>
                <li><strong>State Overlay:</strong> Mostly N− / N0 → uplift; occasional N+ dips lower fit</li>
                <li><strong>Trait Modifiers:</strong> High Agreeableness (+), Moderate Conscientiousness (+), Low Neuroticism (+)</li>
                <li><strong>Supply↔Demand:</strong> 3 lanes green, 1 yellow (Care/Boundaries), 1 red (Sensing/Timing)</li>
                <li><strong>Fit Band:</strong> 🟨 Stretch → close to 🟩 with pacing rituals</li>
              </ul>
              <div className="mt-3 text-sm text-muted-foreground">
                <strong>Two tiny habits:</strong> (1) 15-min weekly pacing sync. (2) "Pause word" when values feel overridden.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fit Dimensions Table */}
        <section id="fit-dimensions" className="mb-12">
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
        <section id="fit-bands" className="mb-12">
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
        <section id="flow" className="mb-12">
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
                description: "N− lifts capacity to supply and tolerance for unmet demand. N+ shrinks supply and inflates demand."
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
        <section id="examples" className="mb-12">
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
                    <p className="text-sm text-muted-foreground">A: 65% N− (Reg+), 25% N0, 10% N+ (Reg−)</p>
                    <p className="text-sm text-muted-foreground">B: 55% N− (Reg+), 30% N0, 15% N+ (Reg−)</p>
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
                    <p className="text-sm text-muted-foreground">A: 25% N− (Reg+), 35% N0, 40% N+ (Reg−) (under stress)</p>
                    <p className="text-sm text-muted-foreground">B: 60% N− (Reg+), 25% N0, 15% N+ (Reg−)</p>
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
        <section id="definitions" className="mb-12">
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