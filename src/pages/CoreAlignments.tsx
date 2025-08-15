import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { ArrowLeft, ArrowRight, Users, Target, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const CoreAlignments = () => {
  const coreAlignments = [
    {
      name: "Innovative Harmonizers",
      formerly: "Alpha Core Alignment",
      icon: <Zap className="h-8 w-8 text-primary" />,
      archetype: "Enthusiastic explorers who seek out new ideas and shared comfort",
      coreValues: "Openness to possibilities and intellectual playfulness",
      characteristics: "These types create a relaxed, merry atmosphere where hierarchy is low and everyone is welcome. Group gatherings tend to be lighthearted – filled with jokes, creative chatter, shared hobbies, and a 'family-like' inclusive spirit.",
      prismPerspective: "PRISM emphasizes that they are not limited to being carefree idealists 24/7. Under acute stress they might tap into uncharacteristic assertiveness or focus. Life experience can teach them to 'buckle down' with practicality and structure when needed.",
      types: [
        "ILE (ENTp) – Explorative Visionary",
        "SEI (ISFp) – Comfort Curator",
        "ESE (ESFj) – Connector",
        "LII (INTj) – Conceptual Analyst"
      ]
    },
    {
      name: "Driven Idealists",
      formerly: "Beta Core Alignment", 
      icon: <Target className="h-8 w-8 text-primary" />,
      archetype: "Intense crusaders motivated by vision, loyalty, and impact",
      coreValues: "Mission, unity, and honor",
      characteristics: "In group settings, Driven Idealists generate a charged, enthusiastic atmosphere. They bond by sharing emotional experiences and unite under symbols and slogans that represent their cause. There's often a 'tribal' mindset – a strong sense of who is 'us' vs. 'them'.",
      prismPerspective: "PRISM shows that these individuals are more dynamic than the stereotype of an always-aggressive zealot. The same type who is a charismatic leader at a rally might display a gentler, reflective side in private moments, toggling between quiet idealism and rousing zeal as circumstances require.",
      types: [
        "SLE (ESTp) – Tactical Commander",
        "IEI (INFp) – Visionary Dreamer",
        "EIE (ENFj) – Inspirational Orator",
        "LSI (ISTj) – Principled Guardian"
      ]
    },
    {
      name: "Pragmatic Realists", 
      formerly: "Gamma Core Alignment",
      icon: <Users className="h-8 w-8 text-primary" />,
      archetype: "Hard-nosed yet principled achievers who keep their eyes on the prize",
      coreValues: "Efficacy and authenticity",
      characteristics: "When Pragmatic Realists come together, the mood is focused, candid, and enterprising. Conversations gravitate toward practical matters – plans, business ideas, career goals, strategies for solving problems. The atmosphere is no-nonsense and meritocratic: show your true self and prove your value.",
      prismPerspective: "PRISM reframes their traits in a more constructive, developmental light. They are not one-dimensional 'money machines' but often care deeply about self-improvement and community improvement – approaching it in a practical, accountable manner. They can learn flexibility, patience, and forgiveness while maintaining their backbone of ambition and realism.",
      types: [
        "SEE (ESFp) – Charismatic Operator",
        "ILI (INTp) – Strategic Forecaster",
        "LIE (ENTj) – Executive Strategist",
        "ESI (ISFj) – Loyal Protector"
      ]
    },
    {
      name: "Humanitarian Stabilizers",
      formerly: "Delta Core Alignment",
      icon: <Heart className="h-8 w-8 text-primary" />,
      archetype: "Conscientious facilitators who cultivate stability, growth, and well-being for all",
      coreValues: "Steady improvement and ethical sincerity", 
      characteristics: "Among a group of Humanitarian Stabilizers, you'll notice a low-pressure, cooperative atmosphere. They foster egalitarian friendship where everyone's input is respected, and decisions are made through calm discussion and consensus. They excel at creating supportive, stable environments where people can flourish.",
      prismPerspective: "PRISM challenges the stereotype that they are simplistic or unambitious. They often take initiative in their own style – becoming mentors, guides, or quiet influencers who spark change without needing loud fanfare. They blend imagination with realism, believing in a better future while handling the practical steps to get there.",
      types: [
        "IEE (ENFp) – Possibility Catalyst",
        "SLI (ISTp) – Practical Craftsman",
        "LSE (ESTj) – Structured Organizer",
        "EII (INFj) – Ethical Counselor"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            PRISM Core Alignments
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Understanding core alignments – groupings of four personality types with shared values – is crucial in both classical Socionics and its modern evolution under the PRISM model.
          </p>
        </section>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Renamed and Refined</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              In Socionics, each core alignment consists of four types that share the same valued cognitive elements, creating natural "ideological common ground" among them. Members of a core alignment communicate easily and feel an innate camaraderie, while those from different core alignments often clash or misunderstand each other due to differing priorities.
            </p>
            <p className="text-muted-foreground">
              Traditionally, these groups were named Alpha, Beta, Gamma, and Delta core alignments. However, PRISM updates and renames these core alignment definitions to make them more accessible and nuanced for both general audiences and professionals. Each new name captures the archetypal essence of the group while PRISM's dynamic approach adds insight into how individuals can grow and adapt beyond static stereotypes.
            </p>
          </CardContent>
        </Card>

        {/* Core Alignments */}
        <div className="space-y-8">
          {coreAlignments.map((coreAlignment, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center gap-3 mb-2">
                  {coreAlignment.icon}
                  <div>
                    <CardTitle className="text-2xl">{coreAlignment.name}</CardTitle>
                    <CardDescription className="text-base">
                      (formerly {coreAlignment.formerly})
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-primary">Archetype</h4>
                  <p className="text-muted-foreground">{coreAlignment.archetype}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-primary">Core Values</h4>
                  <p className="text-muted-foreground">{coreAlignment.coreValues}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-primary">Group Characteristics</h4>
                  <p className="text-muted-foreground">{coreAlignment.characteristics}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-primary">Types in this Core Alignment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {coreAlignment.types.map((type, typeIndex) => (
                      <div key={typeIndex} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm text-muted-foreground">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-primary">PRISM's Nuanced Perspective</h4>
                  <p className="text-muted-foreground">{coreAlignment.prismPerspective}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Each of these four PRISM core alignments offers a distinct strength and perspective, updated from the old Alpha–Delta nomenclature to be more intuitive. By renaming the groups and enriching their descriptions, PRISM makes the concepts accessible to the public while preserving depth for professionals.
            </p>
            <p className="text-muted-foreground">
              Understanding these core alignments can improve teamwork, communication, and personal growth: people can better appreciate why certain values or styles resonate between some and conflict with others, and how to leverage each core alignment's strengths.
            </p>
            <p className="text-muted-foreground">
              PRISM's dynamic approach reminds us that personality is not static. Even as we identify with a particular core alignment's core values, we can adapt, learn, and integrate qualities from other core alignments over time. The updated core alignment definitions serve as guiding archetypes, not pigeonholes.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <Button variant="outline" asChild>
            <Link to="/about" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Link>
          </Button>
          
          <Button asChild>
            <Link to="/assessment" className="flex items-center gap-2">
              Take Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Sources */}
        <Card className="mt-8 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              <strong>Sources:</strong> The above definitions and insights are synthesized from PRISM's advanced literature and comparative analyses with Socionics, particularly the <em>Core Alignment Groups in Socionics vs. PRISM: A Deep Dive</em> whitepaper, which provides an in-depth exploration of how PRISM reinterprets each core alignment for greater nuance and real-world applicability.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CoreAlignments;