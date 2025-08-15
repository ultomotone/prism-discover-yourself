import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowLeft, ArrowRight, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

const Blocks = () => {
  const [viewMode, setViewMode] = useState<'calm' | 'stress'>('calm');

  const blocks = {
    calm: [
      {
        name: "Core",
        subtitle: "Your signature strengths in motion",
        description: "These are your go-to mental processes—the information elements you naturally rely on and that feel most authentic to you.",
        characteristics: [
          "Feels natural and energizing to use",
          "Your most reliable problem-solving tools",
          "Where others see your distinctive strengths",
          "Source of confidence and competence"
        ],
        examples: "Your natural leadership style, how you approach complex problems, your instinctive decision-making process"
      },
      {
        name: "Creative/Hidden",
        subtitle: "Talents emerging with support",
        description: "These elements develop through learning and positive environments. They represent growth potential and emerging capabilities.",
        characteristics: [
          "Develops through experience and encouragement",
          "Requires supportive conditions to flourish",
          "Source of learning and skill development",
          "Can become quite sophisticated over time"
        ],
        examples: "Skills you've developed through mentorship, abilities that emerge in the right team environment"
      },
      {
        name: "Role/Critic",
        subtitle: "Image management and social expectations",
        description: "This is where you manage how others see you and try to meet social or professional expectations. Can create internal pressure.",
        characteristics: [
          "Focused on external validation",
          "Can feel effortful or draining",
          "Source of self-criticism and 'shoulds'",
          "Important for social functioning but taxing"
        ],
        examples: "Professional persona at work, trying to meet others' expectations, managing your reputation"
      },
      {
        name: "Aspirational/Instinct",
        subtitle: "Admired but underdeveloped",
        description: "You value these elements in others and may aspire to develop them, but they don't come naturally. Often triggered under pressure.",
        characteristics: [
          "You admire these qualities in others",
          "Can feel clumsy or uncertain when using",
          "May cause anxiety or self-doubt",
          "Important values but difficult execution"
        ],
        examples: "Qualities you wish you had more of, aspects you struggle with in relationships or work"
      }
    ],
    stress: [
      {
        name: "Core",
        subtitle: "Intensified under pressure",
        description: "Under stress, your core strengths can become overused or rigid, leading to tunnel vision or inflexibility.",
        characteristics: [
          "May become narrow or inflexible",
          "Overreliance on familiar approaches",
          "Difficulty seeing other perspectives",
          "Can create blind spots"
        ],
        examples: "Becoming overly controlling, analysis paralysis, forcing your style on others"
      },
      {
        name: "Creative/Hidden",
        subtitle: "May shut down or become inaccessible",
        description: "Elements that normally grow through support become harder to access under stress, limiting your adaptive capacity.",
        characteristics: [
          "Becomes less available under pressure",
          "Learning stops or reverses",
          "Reduced adaptability",
          "May revert to earlier patterns"
        ],
        examples: "Losing creativity under deadlines, social skills deteriorating when anxious"
      },
      {
        name: "Role/Critic",
        subtitle: "Heightened anxiety and self-pressure",
        description: "The pressure to maintain image and meet expectations intensifies, creating significant stress and self-criticism.",
        characteristics: [
          "Increased self-criticism",
          "Anxiety about others' judgments",
          "Perfectionism and overwork",
          "Impostor syndrome activation"
        ],
        examples: "Overworking to prove competence, harsh self-judgment, fear of being 'found out'"
      },
      {
        name: "Aspirational/Instinct",
        subtitle: "Emergency responses kick in",
        description: "Under extreme stress, these normally difficult elements may suddenly activate as desperate attempts to regain control.",
        characteristics: [
          "Sudden, uncharacteristic behaviors",
          "Often ineffective or awkward",
          "Emergency coping mechanisms",
          "Can surprise both you and others"
        ],
        examples: "Uncharacteristic aggression, sudden emotional outbursts, desperate control attempts"
      }
    ]
  };

  const currentBlocks = blocks[viewMode];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <a href="/dimensionality" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dimensionality
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/state-overlay" className="flex items-center gap-2">
                Next: State Overlay
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-6">
              Block Dynamics: How You Shift in Real Life
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              Your mental system reorganizes under different conditions. The same information elements behave differently when you're in flow versus under pressure.
            </p>
          </div>

          {/* Key Concept */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Understanding Block Dynamics</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-6">
                Your information elements don't exist in isolation—they form functional "blocks" that serve different purposes and respond differently to stress, flow, and normal conditions. This explains why you might be brilliant in some situations but struggle in others.
              </p>
              <div className="bg-warm/10 border border-warm/20 rounded-lg p-6">
                <p className="text-warm font-semibold text-center">
                  Key insight: Your blocks reorganize dynamically. What feels natural in calm moments may become rigid under pressure, while dormant capabilities might suddenly emerge.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Toggle Control */}
          <div className="flex justify-center mb-12">
            <Card className="prism-shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${viewMode === 'calm' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Calm/Flow State
                  </span>
                  <button
                    onClick={() => setViewMode(viewMode === 'calm' ? 'stress' : 'calm')}
                    className="flex items-center"
                  >
                    {viewMode === 'calm' ? (
                      <ToggleLeft className="h-8 w-8 text-primary" />
                    ) : (
                      <ToggleRight className="h-8 w-8 text-primary" />
                    )}
                  </button>
                  <span className={`font-medium ${viewMode === 'stress' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Stress/Pressure
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* The Four Blocks */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">
              Block Functions: {viewMode === 'calm' ? 'Calm & Flow States' : 'Under Stress & Pressure'}
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {currentBlocks.map((block, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8">
                    <div className="flex items-start mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                        viewMode === 'calm' ? 'prism-gradient-secondary' : 'prism-gradient-warm'
                      }`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-1">
                          {block.name}
                        </h3>
                        <p className="text-accent font-medium italic">
                          {block.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {block.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-primary text-sm mb-3">Key Characteristics</h4>
                      <ul className="space-y-2">
                        {block.characteristics.map((char, charIndex) => (
                          <li key={charIndex} className="flex items-start">
                            <div className="w-2 h-2 prism-gradient-accent rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                            <span className="text-sm text-muted-foreground">{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-semibold text-primary text-sm mb-2">Examples</h4>
                      <p className="text-sm text-muted-foreground">{block.examples}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Practical Application */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Using Block Dynamics</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Self-Awareness</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">Recognize your natural patterns in different states</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">Understand when you're operating from stress versus flow</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">Identify your growth areas and stress triggers</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Team Dynamics</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">Understand how team members change under pressure</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">Create supportive conditions for Creative block development</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">Design workflows that leverage Core blocks effectively</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/dimensionality" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dimensionality
              </a>
            </Button>
            <Button variant="assessment" asChild>
              <a href="/state-overlay" className="flex items-center gap-2">
                Next: State Overlay
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blocks;