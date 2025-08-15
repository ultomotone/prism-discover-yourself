import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";

const Dimensionality = () => {
  const dimensions = [
    {
      level: "1D",
      title: "Narrow & Rule-Bound",
      subtitle: "Works with explicit guidance",
      color: "bg-red-100 border-red-200 text-red-700",
      description: "You have a basic, foundational understanding of this information element. You can use it effectively in familiar contexts with clear rules or guidelines.",
      characteristics: [
        "Follows established patterns and procedures",
        "Works best with clear instructions or frameworks",
        "May feel uncertain when rules aren't explicit",
        "Benefits from external structure and guidance"
      ],
      examples: "Following a recipe exactly, using well-learned formulas, applying standard procedures"
    },
    {
      level: "2D",
      title: "Reliable in Familiar Contexts",
      subtitle: "Solid within known domains",
      color: "bg-orange-100 border-orange-200 text-orange-700",
      description: "You have developed competence in this element within your familiar areas. You can handle routine applications and recognize when something doesn't fit the usual pattern.",
      characteristics: [
        "Comfortable with well-practiced applications",
        "Recognizes deviations from the norm",
        "Can adapt within familiar boundaries",
        "Builds confidence through experience"
      ],
      examples: "Managing familiar types of projects, troubleshooting known issues, teaching others basics"
    },
    {
      level: "3D",
      title: "Adapts to Audience & Situation",
      subtitle: "Flexible and contextually aware",
      color: "bg-blue-100 border-blue-200 text-blue-700",
      description: "You can adjust your use of this element based on the situation and the people involved. You read context well and modify your approach accordingly.",
      characteristics: [
        "Tailors approach to different situations",
        "Reads contextual cues effectively",
        "Adapts communication style to audience",
        "Balances multiple perspectives"
      ],
      examples: "Explaining complex ideas differently to different audiences, adjusting leadership style to team needs"
    },
    {
      level: "4D",
      title: "Time-Savvy & Domain-Portable",
      subtitle: "Sophisticated and self-correcting",
      color: "bg-green-100 border-green-200 text-green-700",
      description: "You have mastery of this element that transcends specific contexts. You can see long-term patterns, transfer insights across domains, and self-correct automatically.",
      characteristics: [
        "Sees long-term patterns and trajectories",
        "Transfers insights across different domains",
        "Self-corrects and iterates naturally",
        "Mentors others in developing this element"
      ],
      examples: "Strategic thinking across industries, pattern recognition in complex systems, intuitive expertise"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <a href="/signals" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Signals
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/blocks" className="flex items-center gap-2">
                Next: Block Dynamics
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-6">
              Dimensionality: Skill & Adaptability
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              How broad, adaptable, and portable each information element is across contexts. Think of it as the sophistication of your mental tools—from basic competence to domain-transcending mastery.
            </p>
          </div>

          {/* Key Concept */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Understanding Dimensionality</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-6">
                Dimensionality isn't about "good" versus "bad"—it's about the breadth and flexibility of your capabilities. A 1D element can be perfectly functional in its domain, while a 4D element operates with sophisticated awareness across multiple contexts.
              </p>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                <p className="text-accent font-semibold text-center">
                  Important: You can grow dimensionality with practice and experience. It's developmental, not fixed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* The Four Levels */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">The Dimensionality Continuum</h2>
            <div className="space-y-8">
              {dimensions.map((dim, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8">
                    <div className="flex items-start mb-6">
                      <div className="w-16 h-16 prism-gradient-primary rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                        <span className="text-white font-bold text-xl">{dim.level}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h3 className="text-2xl font-semibold text-primary">
                            {dim.title}
                          </h3>
                          <div className={`px-4 py-2 rounded-lg border ${dim.color} text-sm font-medium`}>
                            {dim.subtitle}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {dim.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-primary mb-3">Key Characteristics</h4>
                        <ul className="space-y-2">
                          {dim.characteristics.map((char, charIndex) => (
                            <li key={charIndex} className="flex items-start">
                              <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-sm text-muted-foreground">{char}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold text-primary text-sm mb-2">Example Applications</h4>
                        <p className="text-sm text-muted-foreground">{dim.examples}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Growth Potential */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Growing Your Dimensionality</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1→2</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Deliberate Practice</h3>
                  <p className="text-sm text-muted-foreground">
                    Gain experience through focused application in familiar contexts
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2→3</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Context Switching</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply your skills across different situations and audiences
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3→4</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Pattern Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect insights across domains and develop intuitive mastery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/signals" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Signals
              </a>
            </Button>
            <Button variant="assessment" asChild>
              <a href="/blocks" className="flex items-center gap-2">
                Next: Block Dynamics
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dimensionality;