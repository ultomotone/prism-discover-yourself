import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import InfoElementLayout from "@/components/InfoElementLayout";

const Signals = () => {
  const elements = [
    { 
      code: "Ti", 
      name: "Structural Logic", 
      path: "/ti",
      desc: "Make it make sense",
      details: "Seeks internal consistency and logical frameworks. Asks 'Does this fit together logically?' and builds systematic understanding.",
      examples: "Debugging code, creating taxonomies, spotting logical inconsistencies in arguments"
    },
    { 
      code: "Te", 
      name: "Pragmatic Logic", 
      path: "/te",
      desc: "What works in the real world",
      details: "Focused on practical results and efficiency. Asks 'What gets results?' and optimizes for measurable outcomes.",
      examples: "Project management, process optimization, metrics-driven decision making"
    },
    { 
      code: "Fi", 
      name: "Relational Ethics", 
      path: "/fi",
      desc: "Does this fit who I am?",
      details: "Evaluates alignment with personal values and authenticity. Asks 'Is this true to who I am?' and maintains identity consistency.",
      examples: "Career choices based on values, authentic self-expression, personal boundary setting"
    },
    { 
      code: "Fe", 
      name: "Interpersonal Dynamics", 
      path: "/fe",
      desc: "What's happening between us?",
      details: "Attunes to group dynamics and emotional climate. Asks 'How are we all feeling?' and manages collective emotional states.",
      examples: "Reading room atmosphere, team morale management, social harmony facilitation"
    },
    { 
      code: "Ni", 
      name: "Convergent Synthesis", 
      path: "/ni",
      desc: "Where is this heading?",
      details: "Sees long-term trajectories and underlying patterns. Asks 'What's the deeper trend?' and anticipates future convergence.",
      examples: "Strategic planning, trend forecasting, seeing the 'big picture' development"
    },
    { 
      code: "Ne", 
      name: "Divergent Exploration", 
      path: "/ne",
      desc: "What else could this be?",
      details: "Generates alternative interpretations and potential connections. Asks 'What if?' and explores creative possibilities.",
      examples: "Brainstorming sessions, creative problem-solving, seeing potential in people or situations"
    },
    { 
      code: "Si", 
      name: "Experiential Memory", 
      path: "/si",
      desc: "Is this sustainable?",
      details: "Maintains stability and consistent quality. Asks 'Can we keep this up?' and preserves what works well.",
      examples: "Routine maintenance, quality control, creating comfortable environments"
    },
    { 
      code: "Se", 
      name: "Kinesthetic Responsiveness", 
      path: "/se",
      desc: "What can I move now?",
      details: "Responds to immediate opportunities and physical realities. Asks 'What needs action right now?' and acts decisively.",
      examples: "Crisis response, seizing opportunities, hands-on problem solving"
    }
  ];

  return (
    <InfoElementLayout>
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <a href="/about" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dimensionality" className="flex items-center gap-2">
                Next: Dimensionality
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-6">
              Signals: Information Elements
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              The eight distinct "languages" your mind uses to process information. You use all eight—just in different intensities and with different levels of skill.
            </p>
          </div>

          {/* Key Concept */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">How Information Elements Work</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-6">
                Think of these as different mental "channels" for processing the world around you. Some people naturally tune into logical patterns (Ti), others focus on group dynamics (Fe), and still others scan for immediate opportunities (Se).
              </p>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                <p className="text-accent font-semibold text-center">
                  Important: Everyone uses all eight elements, but with different strengths and developmental levels (dimensionality).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* The Eight Elements */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">The Eight Information Elements</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {elements.map((element, index) => (
                <Link key={index} to={element.path}>
                  <Card className="prism-hover-lift prism-shadow-card h-full cursor-pointer transition-transform hover:scale-105">
                    <CardContent className="p-8">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 prism-gradient-secondary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white font-bold text-lg">{element.code}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-1">
                          {element.name}
                        </h3>
                        <p className="text-accent font-medium italic">
                          "{element.desc}"
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {element.details}
                    </p>
                    
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-semibold text-primary text-sm mb-2">Real-world examples:</h4>
                      <p className="text-sm text-muted-foreground">{element.examples}</p>
                    </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* In Your PRISM Profile */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">In Your PRISM Profile</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Strength Rating</h3>
                  <p className="text-muted-foreground mb-4">
                    How often and intensely you use each element in daily life. Higher strength means this signal is more central to how you operate.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Dimensionality Level</h3>
                  <p className="text-muted-foreground mb-4">
                    How sophisticated and adaptable your use of each element is, rated from 1D (basic) to 4D (highly developed).
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-secondary font-medium text-center">
                  Together, strength and dimensionality create your unique cognitive signature—your personal pattern of information processing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/about" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </a>
            </Button>
            <Button variant="assessment" asChild>
              <a href="/dimensionality" className="flex items-center gap-2">
                Next: Dimensionality
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </InfoElementLayout>
  );
};

export default Signals;