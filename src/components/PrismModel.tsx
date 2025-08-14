import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const PrismModel = () => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const segments = [
    {
      id: "red",
      name: "Director",
      color: "from-red-500 to-red-600",
      traits: ["Results-focused", "Decisive", "Competitive", "Direct"],
      description: "Natural leaders who drive results and thrive in competitive environments."
    },
    {
      id: "blue", 
      name: "Thinker",
      color: "from-blue-500 to-blue-600",
      traits: ["Analytical", "Systematic", "Quality-focused", "Methodical"],
      description: "Detail-oriented professionals who excel at analysis and quality control."
    },
    {
      id: "green",
      name: "Supporter", 
      color: "from-green-500 to-green-600",
      traits: ["Collaborative", "Patient", "Supportive", "Steady"],
      description: "Team players who build consensus and maintain harmony in groups."
    },
    {
      id: "yellow",
      name: "Inspirer",
      color: "from-yellow-400 to-yellow-500",
      traits: ["Enthusiastic", "Optimistic", "Persuasive", "Social"],
      description: "Charismatic communicators who motivate and inspire others."
    }
  ];

  return (
    <section className="prism-section">
      <div className="prism-container">
        <div className="text-center mb-16">
          <h2 className="prism-heading-lg text-primary mb-6">
            The PRISM Model
          </h2>
          <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
            Discover your unique blend of four behavioral styles. Click on each segment 
            to explore how different personality types contribute to team success.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive PRISM Diagram */}
          <div className="relative">
            <div className="relative w-80 h-80 mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Top Triangle - Director (Red) */}
                <path
                  d="M 100 20 L 170 90 L 30 90 Z"
                  className={`cursor-pointer transition-all duration-300 ${
                    activeSegment === "red" 
                      ? "fill-red-500 stroke-red-600 stroke-2 drop-shadow-lg" 
                      : "fill-red-400 hover:fill-red-500"
                  }`}
                  onClick={() => setActiveSegment(activeSegment === "red" ? null : "red")}
                />
                
                {/* Right Triangle - Thinker (Blue) */}
                <path
                  d="M 170 90 L 180 180 L 100 100 Z"
                  className={`cursor-pointer transition-all duration-300 ${
                    activeSegment === "blue" 
                      ? "fill-blue-500 stroke-blue-600 stroke-2 drop-shadow-lg" 
                      : "fill-blue-400 hover:fill-blue-500"
                  }`}
                  onClick={() => setActiveSegment(activeSegment === "blue" ? null : "blue")}
                />
                
                {/* Bottom Triangle - Supporter (Green) */}
                <path
                  d="M 100 180 L 30 110 L 170 110 Z"
                  className={`cursor-pointer transition-all duration-300 ${
                    activeSegment === "green" 
                      ? "fill-green-500 stroke-green-600 stroke-2 drop-shadow-lg" 
                      : "fill-green-400 hover:fill-green-500"
                  }`}
                  onClick={() => setActiveSegment(activeSegment === "green" ? null : "green")}
                />
                
                {/* Left Triangle - Inspirer (Yellow) */}
                <path
                  d="M 30 90 L 20 180 L 100 100 Z"
                  className={`cursor-pointer transition-all duration-300 ${
                    activeSegment === "yellow" 
                      ? "fill-yellow-400 stroke-yellow-500 stroke-2 drop-shadow-lg" 
                      : "fill-yellow-300 hover:fill-yellow-400"
                  }`}
                  onClick={() => setActiveSegment(activeSegment === "yellow" ? null : "yellow")}
                />
                
                {/* Center Circle */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r="15" 
                  className="fill-white stroke-gray-300 stroke-2"
                />
              </svg>
              
              {/* Labels */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-white">
                Director
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-white">
                Thinker
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-white">
                Supporter
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-white">
                Inspirer
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div>
            {activeSegment ? (
              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  {(() => {
                    const segment = segments.find(s => s.id === activeSegment);
                    return segment ? (
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-4">
                          {segment.name}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {segment.description}
                        </p>
                        <div>
                          <h4 className="font-semibold text-primary mb-3">Key Traits:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {segment.traits.map((trait, index) => (
                              <div key={index} className="flex items-center">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${segment.color} mr-2`}></div>
                                <span className="text-sm text-muted-foreground">{trait}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Explore the PRISM Model
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click on any segment of the PRISM to learn about different behavioral styles. 
                    Most people are a unique blend of multiple styles.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {segments.map((segment) => (
                      <button
                        key={segment.id}
                        onClick={() => setActiveSegment(segment.id)}
                        className={`p-3 rounded-lg text-left hover:scale-105 transition-all duration-200 bg-gradient-to-r ${segment.color} text-white`}
                      >
                        <div className="font-semibold">{segment.name}</div>
                        <div className="text-xs opacity-90">{segment.traits[0]}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrismModel;