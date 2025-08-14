import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const Profiles = () => {
  const profiles = [
    { code: "ILE", name: "Exploratory inventor", combo: "Ne-Ti", desc: "sparks options, connects dots, prototypes fast." },
    { code: "LII", name: "Analytical architect", combo: "Ti-Ne", desc: "clarifies systems, defines principles, refines models." },
    { code: "ESE", name: "Social energizer", combo: "Fe-Si", desc: "lifts morale, nurtures comfort and steady rhythm." },
    { code: "SEI", name: "Calm harmonizer", combo: "Si-Fe", desc: "stabilizes, senses needs, fosters ease and rapport." },
    { code: "LIE", name: "Strategic executor", combo: "Te-Ni", desc: "sets goals, optimizes processes, ships outcomes." },
    { code: "ILI", name: "Foresight analyst", combo: "Ni-Te", desc: "anticipates trends, stress-tests plans, sees trajectories." },
    { code: "SEE", name: "Dynamic driver", combo: "Se-Fi", desc: "mobilizes action, champions people, reads loyalties." },
    { code: "ESI", name: "Values guardian", combo: "Fi-Se", desc: "protects principles, sets boundaries, acts decisively." },
    { code: "LSI", name: "Systems enforcer", combo: "Ti-Se", desc: "defines standards, enforces clarity, moves decisively." },
    { code: "SLE", name: "Tactical leader", combo: "Se-Ti", desc: "commands situations, cuts through noise, iterates by doing." },
    { code: "EIE", name: "Vision communicator", combo: "Fe-Ni", desc: "rallies people around a message and direction." },
    { code: "IEI", name: "Insightful guide", combo: "Ni-Fe", desc: "senses undercurrents, frames meaning, calms storms." },
    { code: "LSE", name: "Reliable organizer", combo: "Te-Si", desc: "plans, sequences, and keeps teams on track." },
    { code: "SLI", name: "Practical stabilizer", combo: "Si-Te", desc: "optimizes comfort, tools, and sustainable routines." },
    { code: "IEE", name: "Possibility catalyst", combo: "Ne-Fi", desc: "spots potential, nurtures growth, networks ideas." },
    { code: "EII", name: "Principle-centered coach", combo: "Fi-Ne", desc: "aligns choices with values, grows people gently." }
  ];

  const getGradientColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600", 
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-teal-500 to-teal-600",
      "from-red-500 to-red-600",
      "from-indigo-500 to-indigo-600",
      "from-pink-500 to-pink-600"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              PRISM Profiles (at a glance)
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Each profile is a prototype—use it as a lens, not a limit. Your full report includes dimensionality and block dynamics that tailor these notes to you.
            </p>
          </div>

          {/* Profiles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {profiles.map((profile, index) => (
              <Card key={profile.code} className="prism-hover-lift prism-shadow-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getGradientColor(index)} flex items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-sm">{profile.code}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {profile.name}
                  </h3>
                  <div className="text-sm text-accent font-medium mb-3">
                    ({profile.combo})
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {profile.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              variant="assessment" 
              size="lg"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
            >
              Take the Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;