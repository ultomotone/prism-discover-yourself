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
                Extraverted Sensing (Se) is the cognitive element of immediacy, impact, and real-world engagement. It attunes the mind to what is happening right now in the physical environment – the sights, sounds, textures, and tangible opportunities of the moment. Se users scan their surroundings for actionable information: what can be seen, touched, or done in the present context. In essence, Se perceives reality in high-definition detail and responds with decisive action. It thrives on intensity and concreteness; an Se-driven person feels energized by direct engagement with life – whether that means seizing a chance, taking a risk, or rising to meet a challenge head-on.
              </p>
              <p>
                From the PRISM perspective, Se remains the psyche's chief executor – the source of boldness, presence, and "doing" – but unlike static models, PRISM emphasizes that Se's expression can expand or contract with context. When Se is engaged, a person tends to be grounded, alert, and forceful in their approach. They often come across as confident, action-oriented, and tuned into the here-and-now, readily stepping up to handle practical needs or lead in chaotic situations.
              </p>
              <p>
                However, Se's focus on the immediate can also skew toward impulsivity or bluntness if not balanced by other elements; it may drive a person to act first, think later, potentially leading to conflicts or short-sighted decisions. PRISM views Se as an adaptive, dynamic process: its level of assertiveness and realism will be shaped by a person's experience, emotional state, and development. At its best, Se brings vitality, courage, and pragmatism – cutting through delay and turning plans into action – whereas at its worst it can become aggressive, reckless, or domineering, charging ahead without regard for nuance or long-term consequences.
              </p>
              <p>
                The key identity of Se is immersive sensing: it roots the psyche in the real world, pushing to experience and influence the environment directly.
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
              <p>
                In PRISM, dimensionality describes how deeply and flexibly a person can process information with a function. Extraverted Sensing, like any element, can operate at anywhere from one to four "dimensions" of cognition depending on the individual. Below is how Se might express at each capability level – Experience, Norms, Situation, and Time:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">1D Se (Experience only)</h4>
                  <p className="mb-3">
                    At one-dimensional capacity, Se relies solely on personal experience and simple sensory reactions. The person may occasionally act on impulse or notice concrete details, but only based on situations they've personally encountered before. There is little sense of broader context or social convention, so their actions can be naive or poorly timed.
                  </p>
                  <p className="mb-3">
                    For example, a 1D Se user might exert force or speak bluntly in a situation simply because "it worked for me last time," without considering if it's appropriate now. They can handle very familiar, routine physical tasks ("I've done this one way and I'll keep doing it that way") yet struggle to adapt when something falls outside their narrow scope of experience.
                  </p>
                  <p>
                    If something hasn't been encountered firsthand, 1D Se has difficulty knowing how to respond – the person often appears either passive or awkwardly brash, because they lack any guide beyond their limited past. In short, one-dimensional Se is simplistic and literal in its approach to the real world, easily overmatched by unfamiliar demands.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">2D Se (Experience + Norms)</h4>
                  <p className="mb-3">
                    At two dimensions, Se can use personal experience plus learned norms or common rules to guide action. The individual has a somewhat broader grasp of how to behave or assert themselves, having absorbed basic cultural expectations. They'll remember what one is "supposed to do" in a given physical situation – not just their own trial-and-error.
                  </p>
                  <p className="mb-3">
                    For instance, a 2D Se user might know standard etiquette for assertiveness ("shake hands firmly," "maintain eye contact") or follow playbook strategies in sports or work. This means their engagement with the world is less idiosyncratic than the 1D person; they can imitate socially accepted levels of force or initiative.
                  </p>
                  <p>
                    However, their understanding is still limited. They tend to apply rules rigidly, without nuanced adjustment for context. Since situational factors aren't fully accounted for yet, a 2D Se person may use the same tone of authority in every scenario because "that's how one shows confidence," failing to notice when a lighter touch is needed.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">3D Se (+ Situation)</h4>
                  <p className="mb-3">
                    A three-dimensional Se adds situational flexibility to the above. Now the person can adjust their engagement to the unique context of the moment. They weave personal insights and social norms together with an awareness of current conditions. A 3D Se user reads the room and improvises effectively: they might dial their intensity up or down depending on who's present and what's happening right now.
                  </p>
                  <p className="mb-3">
                    In practice, someone with 3D Se can tailor their approach: they'll pick up on power dynamics or mood and respond accordingly. Perhaps they'll take command in a crisis at work, but let others lead in areas outside their expertise, demonstrating an adaptability that 2D lacks.
                  </p>
                  <p>
                    This level of Se produces competent, situationally aware doers – people who can negotiate a deal by sensing when to push hard and when to concede, or athletes who adjust their strategy dynamically during a game. What's still missing at 3D is the long-range view. These individuals excel in the here-and-now, but may not automatically consider how today's actions set the stage for next year.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">4D Se (+ Time)</h4>
                  <p className="mb-3">
                    At four dimensions, Se gains a meta-perspective across time. This is the fullest expression: the ability not only to act in context, but also to anticipate how current actions will play out in the future. A 4D Se user can connect the past, present, and future in the realm of action. They recall patterns from extensive experience, heed social/cultural norms, adapt to the moment, and project outcomes forward.
                  </p>
                  <p className="mb-3">
                    For example, a 4D Se individual might not only handle a negotiation firmly in the moment, but also set things up to secure an advantage months down the line. They understand momentum: when to advance, when to hold back, because they can envision the trajectory of events.
                  </p>
                  <p>
                    Four-dimensional Se at its peak makes the individual a formidable executor and catalyst: they spot opportunities to achieve tangible goals that others miss, and they have an instinct for how a current push could shape events beyond the here-and-now. Notably, in Socionics terms, Se in a leading position is typically 4D – PRISM holds that while type gives a starting dimensionality, life experience can deepen any function's scope over time.
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
                Block Manifestations (Core, Critic, Hidden, Instinct)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                Extraverted Sensing can manifest very differently in behavior depending on which functional block it occupies in a person's psyche. PRISM divides the psyche into four blocks – Core Drive, Internal Critic, Hidden Potential, and Instinctive Self – analogous to Socionics' Ego, Super-Ego, Super-Id, and Id, but viewed more dynamically. Below we explore Se's characteristic "personality" in each block position:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Core Drive (Ego Block – Leading or Creative function)</h4>
                  <p className="mb-3">
                    If Se resides in the Core block, it is a strength and a valued driver of the personality. In the Leading (Base) position, Se operates as an unconscious yet powerful 4D lens shaping how the person sees the world. Se-leading types (for example, SLE/ESTp and SEE/ESFp in Socionics) effortlessly stay attuned to the concrete reality around them and readily take action.
                  </p>
                  <p className="mb-3">
                    Such individuals are quintessential doers: present them with a situation, and they'll instinctively size up the physical realities and opportunities – who's in charge, what resources are available, what immediate steps need doing – and then act. They trust the process of direct engagement and tend to be decisive, often preferring to handle things now rather than wait.
                  </p>
                  <p>
                    In the Creative (Auxiliary) position, Se is still strong (typically 3D) and actively used, but in service of another leading function. Here, Se provides drive and realism to complement the dominant element. Overall, Se in Core makes one a pragmatic go-getter – grounded in the present, quick to capitalize on opportunities, and enlivened by the chance to make things happen.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Internal Critic (Super-Ego Block – Role or Vulnerable function)</h4>
                  <p className="mb-3">
                    When Se is located in the Critic block, it is a weak point for the person and not inherently valued – meaning they do not fully trust or enjoy this mode of cognition. In the Role (3rd) position, Se is somewhat performative and superficial. The individual can mimic a bit of assertiveness or "real-world" engagement when necessary, but it's not comfortable or authentic for them.
                  </p>
                  <p className="mb-3">
                    In the Vulnerable (4th) position, Se is essentially blind or painful for the person. These individuals have great difficulty handling immediate pressure or force beyond the familiar or expected. If plans suddenly change, or a situation demands spur-of-the-moment decisiveness, they can feel at a loss – even threatened.
                  </p>
                  <p>
                    In sum, Se in the Internal Critic block ranges from a reluctant, surface-level push (Role) to a profound lack of physical agency (Vulnerable). These folks function best in stable, low-conflict environments; too much immediate pressure or sensory chaos causes either forced, awkward involvement or outright shutdown.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Hidden Potential (Super-Id Block – Suggestive or Mobilizing function)</h4>
                  <p className="mb-3">
                    With Se in the Hidden Potential block, the individual values what Se offers – vigor, decisiveness, experiential richness – but has only modest natural aptitude with it. This element represents a growth edge or a quality they crave and admire. In the Suggestive (5th) position, Se is something the person seeks from others as support. They have a kind of soft spot or hunger for Se's brand of energy.
                  </p>
                  <p className="mb-3">
                    In the Mobilizing (6th) position, Se is a latent ability the person tries to cultivate with effort. Here, the individual is often aware that being more bold, present, or physically engaged would benefit them, and they make conscious attempts to develop that side.
                  </p>
                  <p>
                    In both Suggestive and Mobilizing positions, Se is respected and desired: these individuals truly believe in the value of courage, experience, and taking action. Often later in life, they become more well-rounded by actively seeking out what they once avoided.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Instinctive Self (Id Block – Ignoring or Demonstrative function)</h4>
                  <p className="mb-3">
                    If Se falls in the Instinctive block, it is a strong (often 3D or 4D) ability that operates in the background, largely outside the person's ego identity. The individual can use Se effectively, but they tend to downplay or compartmentalize it, since it's not part of what they consciously value or "brag about."
                  </p>
                  <p className="mb-3">
                    In the Ignoring (7th) position, these individuals are actually capable of being assertive or handling high-intensity moments, often at a 3-dimensional level, but they choose not to indulge it most of the time. In the Demonstrative (8th) position, Se is a 4D unconscious strength that the individual wields almost unconsciously, often to assist others or ensure completeness.
                  </p>
                  <p>
                    In sum, Se in the Instinctive Self block grants a quiet competence and resilience to personalities that otherwise might seem gentle or rule-bound. It's like an emergency tool in their kit: highly effective, used sparingly, and put away once the job is done.
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
            <CardContent className="space-y-6">
              <p>
                Strength expression in PRISM refers to how intensely and confidently a person actually uses Se in practice. Having a high dimensional potential for Se is one thing, but displaying it outwardly is another. Here we outline signs that Se is well-developed and actively expressed in someone's behavior:
              </p>

              <div className="grid gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Decisive Action</h5>
                    <p>The person moves quickly from perception to action. In conversation or at work, a strong Se user often says "Alright, let's do it now" or immediately starts implementing an idea. They rarely hesitate or overthink when something needs to be done – you'll see them spontaneously taking charge of tasks or making on-the-spot decisions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Physical Confidence</h5>
                    <p>A well-developed Se often manifests as an assured physical presence. These individuals appear comfortable in their own skin and in a variety of environments. They might have erect posture, steady eye contact, and an ease in using body language to make a point. Others tend to sense that pragmatic, no-nonsense aura – the person who will step forward and handle things if nobody else does.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Enjoyment of Challenges</h5>
                    <p>Strong Se users typically thrive on competition and challenge. They get a charge from situations that test their mettle – be it a sport, a high-stakes business negotiation, or even a friendly debate that gets a bit heated. Instead of shrinking away, they lean in. Importantly, they tend to stay composed under pressure; what paralyzes others can invigorate someone with robust Se.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Sensory Adventurousness</h5>
                    <p>A powerful Se is drawn to rich sensory experiences. These individuals actively seek new sights, sounds, flavors, and sensations. They may love traveling to vibrant, bustling places, trying exotic foods, or engaging in hands-on hobbies that immerse them in the moment. A key sign is that they are not timid about the unknown – their attitude is often "I'll try anything once!"</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Practical Resourcefulness</h5>
                    <p>Well-expressed Se shows up in immediate problem-solving ability. Give a strong Se type a practical dilemma, and they will instinctively start working with whatever is at hand to fix it. This hands-on, fix-it-now mentality demonstrates that their sensing function isn't just perceiving issues – it's driving them to resolve those issues in real time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h5 className="font-medium">Assertive Presence</h5>
                    <p>Perhaps the most outward sign of strong Se is an assertive, influential presence in social and professional settings. These individuals don't shy away from speaking up or asserting their needs. They can be persuasive through sheer conviction and action – they demonstrate leadership rather than just talking about it. This confident assertiveness can be inspiring to others.</p>
                  </div>
                </div>
              </div>

              <p className="mt-6">
                In everyday terms, if Se is well-developed and trusted, the individual comes off as energetic, pragmatic, and bold – consistently injecting momentum into their life and the lives of others. They tackle challenges head-on and seem unfazed by the need to get their hands dirty. If Se is weak or suppressed, by contrast, the person may seem passive, overly cautious, or disconnected from what's going on around them.
              </p>
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
              <p>
                PRISM recognizes that cognitive functions like Se don't operate in a vacuum – their expression is influenced by one's temporary state (e.g. being in flow or under stress) and by more stable emotional overlays (like trait anxiety or confidence levels). Here's how Extraverted Sensing tends to behave under different internal conditions:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Flow State</h4>
                  <p className="mb-3">
                    In a flow state, Se can become a breathtaking force of effective action. When fully engaged and at ease, the Se-user's mind and body enter a mode of effortless responsiveness. They aren't consciously thinking about every step – they are the action. Athletes often describe this as "the zone": time seems to slow down, and their movements or decisions happen with perfect timing.
                  </p>
                  <p className="mb-3">
                    For an Se-dominant person, this might mean a day at work or on the field where everything clicks – they see every opening and capitalize seamlessly. The experience is exhilarating and empowering: the individual feels fully alive and present, reacting to the environment with precision and grace.
                  </p>
                  <p>
                    In flow, Se is also remarkably accurate – because the person isn't second-guessing or distracted, their impulses align closely with what the situation needs. This is Se operating at its most potent and positively synchronized: the individual is embodying their actions, fully in tune with reality and unimpeded by doubt or hesitation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Stress State</h4>
                  <p className="mb-3">
                    Under acute stress, Se's performance often degrades or distorts. For someone who normally relies on Se, high stress can disrupt their confident spontaneity – their ability to act swiftly and effectively may falter. One common reaction is for the person to push even harder but less strategically: they might become reckless or confrontational, trying to force a solution when patience or nuance is actually needed.
                  </p>
                  <p className="mb-3">
                    Another pattern is the opposite: if the stress is overwhelming, even a typically bold individual can experience a sort of shutdown or paralysis. They're so flooded by pressure that they can't muster their usual willpower – the result can be an uncharacteristic passivity or confusion in a crisis.
                  </p>
                  <p>
                    In essence, stress makes Se either scatter (too many panicked impulses, no focus) or stall out. Recovery often involves stepping away to let their nervous system calm down, or getting support from others who can help them regain perspective. Once the stress passes or is managed, an Se-user's natural courage and resourcefulness can reboot.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">High Neuroticism Overlay (+)</h4>
                  <p className="mb-3">
                    With a high-anxiety or emotionally volatile temperament (what PRISM would label a "+" emotional overlay), Se's character changes in tone. A person who is both Se-inclined and high in neuroticism often uses their action-oriented mind in a vigilant, tense way. They remain capable and in-the-moment, but many of their perceptions and impulses will focus on threats or errors.
                  </p>
                  <p className="mb-3">
                    This can manifest as a kind of hyper-vigilance: the individual is always keyed up about what might go wrong in the immediate environment. This overlay can make them reactive and edgy – they may become easily irritated or angered, their temper on a short fuse, because they're internally bracing for impact at all times.
                  </p>
                  <p>
                    Another effect is on confidence: high neuroticism can inject self-doubt into an Se user's normally decisive style. They might hesitate or second-guess themselves more, leading to a jerky stop-start pattern in their behavior. The person may acknowledge, "I know I come on strong, I just constantly feel on edge."
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Low Neuroticism Overlay (–)</h4>
                  <p className="mb-3">
                    With a calm, emotionally stable disposition ("–" overlay), Se tends to play out in a more optimistic and relaxed fashion. Low neuroticism means less anxiety about unknowns or potential failures, which gives Se freer rein to roam without negative bias. An Se user with this overlay will generally approach situations with confidence and poise.
                  </p>
                  <p className="mb-3">
                    This overlay allows them to stay in the positive zone of Se: they see challenges as exciting rather than terrifying. In brainstorming solutions or jumping into a new experience, they assume things will work out (or that they can make them work). Because they aren't occupied by worry, they can actually enjoy the process of confronting life's hurdles.
                  </p>
                  <p>
                    Overall, a "–" overlay provides a buffer of calm where Se's natural boldness can shine. The individual can be fully present and engaged with reality, taking bold steps and indulging in adventures, while handling setbacks or surprises with grace. Life is approached as an opportunity to be embraced rather than a threat to manage.
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