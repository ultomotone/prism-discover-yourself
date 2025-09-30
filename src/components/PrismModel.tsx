import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, Zap, Shield, ArrowRight, Users, Heart } from "lucide-react";

const PrismModel = () => {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const navigate = useNavigate();

  const informationElements = [
    {
      id: "ti",
      name: "Ti",
      fullName: "Introverted Thinking",
      title: "Structural Logic",
      description: "Internal framework building - organizing ideas into coherent systems",
      color: "bg-[#4F46E5]", // Blue
      traits: ["Logical consistency", "Internal frameworks", "Principled reasoning", "Analytical depth"]
    },
    {
      id: "te", 
      name: "Te",
      fullName: "Extraverted Thinking",
      title: "Pragmatic Logic",
      description: "External effectiveness - optimizing processes and achieving concrete results",
      color: "bg-[#0891B2]", // Cyan/Teal
      traits: ["Practical efficiency", "Goal achievement", "Process optimization", "Results-focused"]
    },
    {
      id: "fi",
      name: "Fi",
      fullName: "Introverted Feeling",
      title: "Relational Ethics",
      description: "Personal values and authentic relationships - staying true to inner compass",
      color: "bg-[#E11D48]", // Rose/Red
      traits: ["Personal authenticity", "Deep values", "Individual empathy", "Moral integrity"]
    },
    {
      id: "fe",
      name: "Fe",
      fullName: "Extraverted Feeling",
      title: "Interpersonal Dynamics",
      description: "Group harmony and emotional atmosphere - reading and influencing collective mood",
      color: "bg-[#EC4899]", // Pink
      traits: ["Group harmony", "Emotional attunement", "Social connection", "Collective mood"]
    },
    {
      id: "ni",
      name: "Ni",
      fullName: "Introverted Intuition", 
      title: "Convergent Synthesis",
      description: "Pattern recognition over time - synthesizing complex information into unified insights",
      color: "bg-[#9333EA]", // Purple
      traits: ["Future insights", "Pattern synthesis", "Deep convergence", "Visionary clarity"]
    },
    {
      id: "ne",
      name: "Ne",
      fullName: "Extraverted Intuition",
      title: "Divergent Exploration", 
      description: "Possibility generation - exploring connections and potential in the external world",
      color: "bg-[#7C3AED]", // Violet (slightly different from Ni)
      traits: ["Possibility exploration", "Creative connections", "Brainstorm generation", "Adaptive innovation"]
    },
    {
      id: "si",
      name: "Si",
      fullName: "Introverted Sensing",
      title: "Experiential Memory",
      description: "Personal experience anchoring - maintaining stability through familiar patterns",
      color: "bg-[#059669]", // Emerald/Green
      traits: ["Stability maintenance", "Experience-based wisdom", "Comfort preservation", "Reliable consistency"]
    },
    {
      id: "se",
      name: "Se", 
      fullName: "Extraverted Sensing",
      title: "Kinesthetic Responsiveness",
      description: "Real-time awareness - responding dynamically to immediate environmental demands",
      color: "bg-[#D97706]", // Amber/Orange
      traits: ["Real-time adaptability", "Present awareness", "Dynamic response", "Immediate action"]
    }
  ];

  const prismFeatures = [
    {
      icon: Brain,
      title: "Information Elements",
      description: "The fundamental signals your mind uses to process reality",
      link: "/signals",
      gradient: "prism-gradient-secondary"
    },
    {
      icon: Users,
      title: "Core Alignments",
      description: "How your cognitive functions naturally combine to form your type",
      link: "/disambiguation",
      gradient: "prism-gradient-primary"
    },
    {
      icon: BarChart3, 
      title: "Dimensionality",
      description: "How broad and adaptable each signal is in different contexts",
      link: "/dimensionality",
      gradient: "prism-gradient-accent"
    },
    {
      icon: Zap,
      title: "Block Dynamics", 
      description: "How your mental system reorganizes under stress, calm, or flow",
      link: "/blocks",
      gradient: "prism-gradient-warm"
    },
    {
      icon: Shield,
      title: "State Overlay",
      description: "How emotional reactivity shapes your day-to-day expression",
      link: "/state-overlay", 
      gradient: "prism-gradient-primary"
    },
    {
      icon: Heart,
      title: "Relational Fit",
      description: "Understand compatibility dynamics and relational exchange patterns",
      link: "/prism-relational-fit",
      gradient: "prism-gradient-secondary"
    }
  ];

  return (
    <section className="prism-section">
      <div className="prism-container">
        <div className="text-center mb-16">
          <h2 className="prism-heading-lg text-primary mb-6">
            The PRISM Dynamics™ Information System
          </h2>
          <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto">
            PRISM Dynamics™ maps how you process information—through Information Elements, Core Alignments, 
            Dimensionality, Block Dynamics, State Overlay, and Relational Fit—to predict your best-fit type.
          </p>
        </div>

        {/* Information Elements Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-primary text-center mb-8">
            8 Information Elements
          </h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Click any element to learn more about how it processes information
          </p>
          
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {informationElements.map((element) => (
              <button
                key={element.id}
                onClick={() => setActiveElement(activeElement === element.id ? null : element.id)}
                className={`p-4 rounded-xl text-white transition-all duration-300 prism-hover-lift ${
                  activeElement === element.id 
                    ? "ring-2 ring-white ring-opacity-50 scale-105" 
                    : "hover:scale-105"
                } ${element.color}`}
              >
                <div className="text-2xl font-bold">{element.name}</div>
                <div className="text-sm opacity-90">{element.title}</div>
              </button>
            ))}
          </div>

          {/* Active Element Details */}
          {activeElement && (
            <Card className="prism-shadow-card prism-appear">
              <CardContent className="p-8">
                {(() => {
                  const element = informationElements.find(e => e.id === activeElement);
                  return element ? (
                    <div className="text-center">
                      <div className={`w-16 h-16 ${element.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <span className="text-2xl font-bold text-white">{element.name}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-primary mb-2">
                        {element.fullName}
                      </h3>
                      <p className="text-lg text-secondary font-medium mb-4">
                        {element.title}
                      </p>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        {element.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto mb-6">
                        {element.traits.map((trait, index) => (
                          <div key={index} className="flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${element.color} mr-2`}></div>
                            <span className="text-sm text-muted-foreground">{trait}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline-primary" asChild>
                        <a href={`/${element.id}`}>Learn More About {element.name}</a>
                      </Button>
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* PRISM Framework Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {prismFeatures.map((feature, index) => (
            <Card key={index} className="prism-hover-lift border-2 border-primary/10">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <Button variant="ghost" size="sm" asChild>
                  <a href={feature.link} className="flex items-center gap-1">
                    Explore <ArrowRight className="h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">
                Discover Your Information Processing Profile
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Take the comprehensive PRISM Dynamics assessment to understand your unique cognitive signature, 
                dimensionality levels, and how you adapt under different conditions.
              </p>
              <Button 
                variant="assessment" 
                size="lg"
                onClick={() => navigate('/assessment')}
              >
                Start the Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PrismModel;