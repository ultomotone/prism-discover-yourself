import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Header from "@/components/Header";

const StateOverlay = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <a href="/blocks" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Block Dynamics
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/assessment-methods" className="flex items-center gap-2">
                Next: Assessment Methods
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-6">
              State Overlay: The ± Factor
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              Your reactivity level at any given moment—a lens that explains why the same profile can look different from day to day. It changes expression, not your core wiring.
            </p>
          </div>

          {/* Key Concept */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Understanding the State Overlay</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-6">
                Think of the state overlay as an emotional and physiological "filter" that sits over your core personality pattern. When you're in a + (elevated) state, everything becomes more intense, reactive, and vigilant. In a - (steady) state, you're more measured, stable, and quick to recover.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                <p className="text-primary font-semibold text-center">
                  Critical insight: This is state, not trait. Your core pattern remains the same, but how it expresses can vary significantly based on your current overlay.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* The Two States */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">The Two Overlay States</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* + State */}
              <Card className="prism-hover-lift prism-shadow-card border-red-200">
                <CardContent className="p-8">
                  <div className="flex items-start mb-6">
                    <div className="w-16 h-16 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-red-700 mb-2">
                        + (Elevated Reactivity)
                      </h3>
                      <p className="text-red-600 font-medium">
                        Higher vigilance, more intense responses
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-3">Characteristics</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">More emotionally reactive and sensitive</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">Hyper-vigilant to threats or problems</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">Faster to take action, sometimes impulsively</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">More volatile mood swings</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">Heightened intensity in all responses</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary mb-3">Common Triggers</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• High stress or pressure</li>
                        <li>• Sleep deprivation</li>
                        <li>• Major life changes</li>
                        <li>• Conflict or tension</li>
                        <li>• Caffeine or stimulants</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-700 text-sm mb-2">Example</h4>
                      <p className="text-sm text-red-600">
                        A normally steady Ti-lead becomes argumentative and hypercritical, picking apart every detail in meetings and getting frustrated with perceived illogic.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* - State */}
              <Card className="prism-hover-lift prism-shadow-card border-green-200">
                <CardContent className="p-8">
                  <div className="flex items-start mb-6">
                    <div className="w-16 h-16 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                      <TrendingDown className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-green-700 mb-2">
                        - (Steady Reactivity)
                      </h3>
                      <p className="text-green-600 font-medium">
                        Calmer, more measured responses
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-3">Characteristics</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">More emotionally stable and even</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">Less reactive to stressors</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">More deliberate and thoughtful</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">Faster recovery from setbacks</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">More consistent mood and energy</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary mb-3">Supporting Factors</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Good sleep and rest</li>
                        <li>• Regular exercise</li>
                        <li>• Stable routines</li>
                        <li>• Low-conflict environments</li>
                        <li>• Mindfulness practices</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-700 text-sm mb-2">Example</h4>
                      <p className="text-sm text-green-600">
                        The same Ti-lead approaches problems methodically, listens to others' perspectives, and provides balanced analysis without getting defensive.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Impact on Core Functions */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">How State Overlay Affects Your Core Pattern</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">In + (Elevated) States</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Core functions</span>
                        <span className="text-muted-foreground"> become more rigid and intense</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Creative functions</span>
                        <span className="text-muted-foreground"> may shut down or become erratic</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Role functions</span>
                        <span className="text-muted-foreground"> create more anxiety and self-pressure</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Aspirational functions</span>
                        <span className="text-muted-foreground"> may trigger unexpectedly</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">In - (Steady) States</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Core functions</span>
                        <span className="text-muted-foreground"> operate smoothly and flexibly</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Creative functions</span>
                        <span className="text-muted-foreground"> develop and flourish with practice</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Role functions</span>
                        <span className="text-muted-foreground"> feel manageable and authentic</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-primary">Aspirational functions</span>
                        <span className="text-muted-foreground"> can be developed gradually</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practical Applications */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Working with Your State Overlay</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn to identify when you're in + or - states and how they affect your typical patterns
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Regulation</h3>
                  <p className="text-sm text-muted-foreground">
                    Develop strategies to shift toward steadier states when possible and appropriate
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Adaptation</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust your approach and expectations based on your current state overlay
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/blocks" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Block Dynamics
              </a>
            </Button>
            <Button variant="assessment" asChild>
              <a href="/assessment-methods" className="flex items-center gap-2">
                Next: Assessment Methods
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateOverlay;