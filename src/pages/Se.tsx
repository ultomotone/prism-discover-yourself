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

          {/* State/Overlay Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                State/Overlay Effects (Flow, Stress, +/− Overlays)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                PRISM recognizes that Se doesn't operate in a vacuum – its expression is influenced by temporary states and stable emotional overlays:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Flow State</h4>
                  <p className="text-sm mb-3">
                    In flow state, Se becomes a breathtaking force of effective action. When fully engaged and at ease, the Se-user's mind and body enter a mode of effortless responsiveness. Athletes often describe this as "the zone": time seems to slow down, and movements or decisions happen with perfect timing.
                  </p>
                  <p className="text-sm">
                    In flow, Se is remarkably accurate – because the person isn't second-guessing or distracted, their impulses align closely with what the situation needs. This is Se operating at its most potent and positively synchronized: the individual is embodying their actions, fully in tune with reality and unimpeded by doubt or hesitation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Stress State</h4>
                  <p className="text-sm mb-3">
                    Under acute stress, Se's performance often degrades or distorts. For someone who normally relies on Se, high stress can disrupt their confident spontaneity. One common reaction is to push even harder but less strategically: they might become reckless or confrontational, trying to force a solution when patience is needed.
                  </p>
                  <p className="text-sm">
                    Another pattern is shutdown: if stress is overwhelming, even a typically bold individual can experience paralysis. For individuals who don't value Se, stress might further suppress whatever little real-world engagement they had, causing them to retreat entirely.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">High Neuroticism Overlay (+)</h4>
                  <p className="text-sm mb-3">
                    With high anxiety or emotional volatility, Se's character becomes vigilant and tense. The person remains capable and in-the-moment, but many perceptions and impulses focus on threats or errors. This manifests as hyper-vigilance: constantly keyed up about what might go wrong in the immediate environment.
                  </p>
                  <p className="text-sm">
                    This overlay can make them reactive and edgy – easily irritated or angered, with their temper on a short fuse. Even positive experiences get colored by worry, and self-doubt can inject hesitation into normally decisive behavior.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Low Neuroticism Overlay (–)</h4>
                  <p className="text-sm mb-3">
                    With emotional stability, Se tends to play out in a more optimistic and relaxed fashion. Low neuroticism means less anxiety about unknowns, giving Se freer rein without negative bias. The individual approaches situations with confidence and poise.
                  </p>
                  <p className="text-sm">
                    This overlay allows them to stay in Se's positive zone: seeing challenges as exciting rather than terrifying. Because they aren't occupied by worry, they can actually enjoy confronting life's hurdles and bounce back quickly from mistakes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developmental Arc */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                Developmental Arc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                PRISM emphasizes that Se is not static but can grow, atrophy, or transform with experience and intentional development:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Early Childhood</h4>
                  <p className="text-sm mb-3">
                    Children with strong Se potential may be notably active and explorative – always on the move, climbing, grabbing objects, testing physical limits. They often show fearless curiosity and engage in rough-and-tumble play.
                  </p>
                  <p className="text-sm">
                    Children with weak Se will likely be more passive or sensitive in physical settings – preferring familiar, gentle play and shying away from loud or aggressive activities. They might cling to routine and get easily upset by sudden changes or sensory overload.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Adolescence</h4>
                  <p className="text-sm mb-3">
                    If Se is a core strength, by high school the person often leans heavily into it – through sports, outdoor adventures, social parties, or outlets that allow hands-on influence. This can be a period of exuberant challenge-seeking and testing authority.
                  </p>
                  <p className="text-sm">
                    Meanwhile, teens with Se in suggestive positions might gravitate toward Se-strong peers, while those with vulnerable Se likely avoid typical high school competitions or physical confrontations.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Early Adulthood (20s–30s)</h4>
                  <p className="text-sm mb-3">
                    Strong Se users typically dive into work or lifestyles that allow them to be active and in control. This is when their natural drive can yield significant results, but also when the limits of pure hustle become evident.
                  </p>
                  <p className="text-sm">
                    For those with Se in Hidden Potential, this period can bring longing to break out – spurring them to travel, date more, or take on physically challenging hobbies to "not let life pass by."
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Midlife (40s–50s)</h4>
                  <p className="text-sm mb-3">
                    Around midlife, individuals often reevaluate how they've been using Se. Those who always led with Se might desire to channel it more meaningfully rather than just for intensity's sake, becoming more selective and strategic.
                  </p>
                  <p className="text-sm">
                    For those who had Se as a blind spot, midlife can be revolutionary – experiencing bursts of openness or wanderlust, suddenly booking adventures or asserting themselves in previously avoided situations.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Late Adulthood (60s and beyond)</h4>
                  <p className="text-sm mb-3">
                    The intensity of earlier decades naturally declines as the body may not handle constant action as before. Healthy development means adapting Se to new reality – finding "softer" versions of interests while maintaining engagement with life.
                  </p>
                  <p className="text-sm">
                    For those who undervalued Se historically, late adulthood is sometimes when they finally allow themselves to cultivate postponed pleasures or adventures, finding new zest for life through previously unexplored physical engagement.
                  </p>
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