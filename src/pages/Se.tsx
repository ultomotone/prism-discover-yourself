import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";

const Se = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/si">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Si
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/signals">
              Back to Signals
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Se – Kinesthetic Responsiveness</h1>
              <p className="text-xl text-muted-foreground">Extraverted Sensing</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Narrative Definition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                Narrative Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Extraverted Sensing (Se) is the cognitive element of immediacy, impact, and real-world engagement. It attunes the mind to what is happening right now in the physical environment – the sights, sounds, textures, and tangible opportunities of the moment. Se users scan their surroundings for actionable information: what can be seen, touched, or done in the present context.
              </p>
              <p>
                In essence, Se perceives reality in high-definition detail and responds with decisive action. It thrives on intensity and concreteness; an Se-driven person feels energized by direct engagement with life – whether that means seizing a chance, taking a risk, or rising to meet a challenge head-on.
              </p>
              <p>
                From the PRISM perspective, Se remains the psyche's chief executor – the source of boldness, presence, and "doing" – but unlike static models, PRISM emphasizes that Se's expression can expand or contract with context. When Se is engaged, a person tends to be grounded, alert, and forceful in their approach.
              </p>
              <p>
                However, Se's focus on the immediate can also skew toward impulsivity or bluntness if not balanced by other elements. PRISM views Se as an adaptive, dynamic process: at its best, Se brings vitality, courage, and pragmatism – cutting through delay and turning plans into action – whereas at its worst it can become aggressive, reckless, or domineering.
              </p>
            </CardContent>
          </Card>

          {/* Dimensionality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                Dimensionality (1D–4D)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                In PRISM, dimensionality describes how deeply and flexibly a person can process information with a function. Se can operate at anywhere from one to four "dimensions" of cognition:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">1D Se (Experience only)</h4>
                  <p className="text-sm">
                    At one-dimensional capacity, Se relies solely on personal experience and simple sensory reactions. The person may occasionally act on impulse or notice concrete details, but only based on situations they've personally encountered before. There is little sense of broader context or social convention, so their actions can be naive or poorly timed.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">2D Se (Experience + Norms)</h4>
                  <p className="text-sm">
                    At two dimensions, Se can use personal experience plus learned norms or common rules to guide action. The individual has a somewhat broader grasp of how to behave or assert themselves, having absorbed basic cultural expectations. However, they tend to apply rules rigidly, without nuanced adjustment for context.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">3D Se (+ Situation)</h4>
                  <p className="text-sm">
                    A three-dimensional Se adds situational flexibility. Now the person can adjust their engagement to the unique context of the moment. They read the room and improvise effectively, choosing their battles and spotting opportunities by paying attention to subtle environmental cues. What's still missing is the long-range view.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">4D Se (+ Time)</h4>
                  <p className="text-sm">
                    At four dimensions, Se gains a meta-perspective across time. This is the fullest expression: the ability not only to act in context, but also to anticipate how current actions will play out in the future. Their engagement isn't just reactive – it's strategic, connecting past, present, and future in the realm of action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Manifestations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-3"></span>
                Block Manifestations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Se manifests differently depending on which functional block it occupies in a person's psyche:
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Core Drive (Ego Block)</h4>
                  <p className="text-sm">
                    If Se resides in the Core block, it is a strength and a valued driver of the personality. In the Leading position, Se operates as an unconscious yet powerful 4D lens. Se-leading types effortlessly stay attuned to concrete reality and readily take action. In the Creative position, Se is still strong and actively used in service of another leading function.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Internal Critic (Super-Ego Block)</h4>
                  <p className="text-sm">
                    When Se is in the Critic block, it is a weak point and not inherently valued. In the Role position, Se is performative and superficial – the person can mimic assertiveness when necessary but it's not comfortable. In the Vulnerable position, Se is essentially blind or painful, making direct confrontation or urgent action extremely disorienting.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Hidden Potential (Super-Id Block)</h4>
                  <p className="text-sm">
                    With Se in the Hidden Potential block, the individual values what Se offers but has only modest natural aptitude. In the Suggestive position, Se is something sought from others as support. In the Mobilizing position, Se is a latent ability the person tries to cultivate with conscious effort.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Instinctive Self (Id Block)</h4>
                  <p className="text-sm">
                    If Se falls in the Instinctive block, it is a strong ability that operates in the background, outside the person's ego identity. In the Ignoring position, Se is used when needed but not savored. In the Demonstrative position, Se is wielded unconsciously to assist others, though the person doesn't tout it as part of their identity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strength Expression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-muted-foreground rounded-full mr-3"></span>
                Strength Expression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Strength expression refers to how intensely and confidently a person actually uses Se in practice. Signs of well-developed and actively expressed Se include:
              </p>

              <div className="grid gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Decisive Action</h5>
                    <p className="text-sm text-muted-foreground">Moves quickly from perception to action, rarely hesitating when something needs to be done.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Physical Confidence</h5>
                    <p className="text-sm text-muted-foreground">Displays an assured physical presence with comfortable body language and groundedness.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Enjoyment of Challenges</h5>
                    <p className="text-sm text-muted-foreground">Thrives on competition and challenge, staying composed under pressure.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Sensory Adventurousness</h5>
                    <p className="text-sm text-muted-foreground">Drawn to rich sensory experiences and new physical adventures.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Practical Resourcefulness</h5>
                    <p className="text-sm text-muted-foreground">Instinctively problem-solves with immediate, hands-on solutions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Assertive Presence</h5>
                    <p className="text-sm text-muted-foreground">Comfortable asserting needs and setting boundaries, demonstrating leadership through action.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/si">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Si
            </a>
          </Button>
          <Button asChild>
            <a href="/signals">
              Back to Signals
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Se;