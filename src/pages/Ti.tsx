import InfoElementLayout from "@/components/InfoElementLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Cog } from "lucide-react";

const Ti = () => {
  return (
    <InfoElementLayout>
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/signals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Signals
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/te">
              Next: Te
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Cog className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Ti – Structural Logic</h1>
              <p className="text-xl text-muted-foreground">Introverted Thinking</p>
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
                Introverted Thinking (Ti) in PRISM represents the drive to structure and analyze the world through internal logic. It is the cognitive process concerned with organizing information into coherent systems, ensuring that ideas and facts all fit within a consistent framework. Ti focuses on principles, categories, and classifications: a Ti-oriented mind naturally seeks to define terms precisely and understand the underlying rules that make a system hold together.
              </p>
              <p>
                Those who favor Ti tend to rely on their own mental criteria for truth. They question assumptions and evaluate incoming information against an inner "yardstick" of logic. Rather than taking external claims at face value, a Ti user will scrutinize and refine concepts until they internally make sense. There is often a pride in intellectual clarity – Ti-dominant individuals may even derive an aesthetic satisfaction from elegantly structured theories, models, or plans that demonstrate internal congruence.
              </p>
              <p>
                In essence, Ti is about why and how things work in principle. It is an inward compass for reasoning that prizes consistency over consensus, and depth of understanding over quick utility.
              </p>
              <p>
                Someone with strong Ti typically appears analytical and principled in their thinking. They enjoy solving puzzles or deconstructing arguments, often by breaking problems down into components and examining the logical relationships involved. They are likely to be precise in speech or writing, carefully defining concepts to avoid confusion. Ti imparts a certain mental independence: the person trusts their own reasoning and may be unmoved by emotional or authority-based appeals if those contradict their logical framework.
              </p>
              <p>
                When faced with a complex issue, a Ti-oriented individual will methodically categorize the facts, eliminate contradictions, and reorganize ideas until a clear, logical picture emerges. This thorough, inside-out understanding means that Ti types often develop elaborate mental maps of how something works (from scientific theories to the mechanics of a hobby or organization). They can seem immersed in thought – evaluating pros and cons, rules and exceptions – all in service of achieving internal consistency and structural order in their knowledge.
              </p>
            </CardContent>
          </Card>

          {/* Dimensionality Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                Dimensionality Mapping (1D–4D)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                In PRISM, each function's capability is described in terms of four cognitive dimensions – Experience, Norms, Situation, and Time – which Ti can embody to varying degrees.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">1D Ti (Experience Only)</h4>
                  <p>
                    A 1-dimensional Ti means the person's logical reasoning is limited to firsthand experience. They can apply logic in concrete situations they've personally encountered, but only in those familiar contexts. Their understanding is narrow and inflexible – if they haven't seen a principle in action themselves, they have trouble trusting or using it.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">2D Ti (Experience + Norms)</h4>
                  <p>
                    With 2-dimensional Ti, the individual supplements experience with norms – commonly learned rules or textbook methods. They know logical formulas and have been taught general principles, allowing them to reason through routine tasks by applying those learned rules. However, when confronted with novel situations outside those bounds, their logic can falter.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">3D Ti (Experience + Norms + Situation)</h4>
                  <p>
                    Moving to 3-dimensional Ti adds situational adaptability. At this level, a person not only knows the rules but can also adjust their thinking dynamically to the context. They improvise and refine their logic in real time, tailoring general principles to fit the unique situation, handling a broader range of problems with flexible, context-aware analysis.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">4D Ti (All Dimensions + Time)</h4>
                  <p>
                    A 4-dimensional Ti is fully realized structural thinking, incorporating Time (foresight) on top of all prior dimensions. Here the individual's Ti draws on rich experience, established logic, situational agility, and an intuitive sense of how logical systems play out over the long term. At 4D, Ti becomes a powerhouse of insight, capable of constructing complex, far-reaching models with confidence.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Manifestation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-3"></span>
                Block Manifestation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                In PRISM's model, Ti's character depends on which block (position) it occupies in the psyche's structure. The four state-based blocks – Core, Critic, Hidden, and Instinct – indicate distinct cognitive roles for the function.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">Core (Core Drive Position)</h4>
                  <p>
                    Ti in the Core position operates as a defining strength and lens for the individual. When Ti is Core, it is highly developed (3D or 4D) and valued – the person both is good at it and cares about it. Ti becomes an unconscious "program" running through almost all perceptions and decisions. They instinctively impose logical order on experiences, automatically filtering and interpreting the world via structural logic.
                  </p>
                  <p>
                    Such individuals can quickly spot inconsistencies in arguments and categorize incoming information effortlessly. With Ti-Core, there is confidence and identity in being analytical – they often assume that making sense of things logically is universally important. They take pride in principled thinking and will reliably bring clarity and organization to chaos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary">Critic (Internal Critic Position)</h4>
                  <p>
                    Ti in the Critic position corresponds to a weak, often problematic role where the function is not well-developed and not truly valued. Here, Ti becomes a source of internal critique and insecurity rather than strength. If someone has Ti in this Critic block, they typically know that meticulous logic is not their forte – and this awareness makes them self-conscious or defensive about it.
                  </p>
                  <p>
                    Their Ti is usually 1D or 2D – limited to basic logic or memorized rules. They can handle simple, familiar logical tasks but struggle with analytical problems requiring flexibility or depth. Prolonged use of Ti causes mental fatigue and stress, so they avoid it when possible, creating a cycle where lack of use keeps it weak and further dents confidence.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-accent">Hidden (Hidden Potential Position)</h4>
                  <p>
                    With Ti in the Hidden block, the person has a paradoxical relationship with this function: they are not skilled in Ti, often operating at 1D or 2D, yet they yearn for and idealize the clarity it could bring. Ti here is a valued weakness – something the individual "is not good at but cares about."
                  </p>
                  <p>
                    They show curiosity and appreciation for logical structure, often admiring analytical people or feeling relief when someone steps in to organize a messy situation rationally. They tend to seek external help for logical tasks and can experience pleasure when working with strong Ti users, soaking up explanations with enthusiasm.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-muted-foreground">Instinct (Instinctive Self Position)</h4>
                  <p>
                    Ti in the Instinct block manifests as an innate talent that the individual uses easily yet underplays in importance. In this configuration, Ti is strong (often 3D or even 4D) but not valued – the person is objectively good at logical analysis but doesn't "count it" as part of who they are or what matters to them.
                  </p>
                  <p>
                    Ti operates almost automatically and unconsciously when needed, but stays in the background of the personality. They might routinely solve logical problems as a knee-jerk reaction but feel little investment or pride in that role, often dismissing it as "just common sense."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strength Expression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                Strength Expression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                How can we tell when someone has a strong, fluent Ti? There are several hallmark behaviors and skills that indicate high Ti proficiency:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>They habitually identify logical inconsistencies and errors in reasoning with little effort</li>
                <li>They are excellent at categorization and defining terms precisely</li>
                <li>Their explanations tend to be structured and methodical, breaking complex ideas into logical sequences</li>
                <li>They maintain intricate mental models or taxonomies internally</li>
                <li>They show consistency in decisions and beliefs, applying reasoning universally</li>
                <li>They demonstrate detachment in decision-making, prioritizing impersonal criteria</li>
                <li>In problem-solving, they show patience and thoroughness, methodically analyzing root causes</li>
                <li>They can work with complex rule sets or systems relatively easily</li>
                <li>Their communication reveals Ti mastery through precise language and if-then statements</li>
              </ul>
              <p>
                All these behaviors point to a comfort and fluency in Ti's mode of thinking. Such individuals come across as "naturally logical," bringing clarity and order wherever their cognition is applied.
              </p>
            </CardContent>
          </Card>

          {/* State & Overlay Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                State & Overlay Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                PRISM recognizes that the expression of Ti, like all functions, can be modulated by one's temporary state or enduring emotional "overlay."
              </p>
              
              <div>
                <h4 className="font-semibold">Optimal Conditions</h4>
                <p>
                  In optimal conditions – well-rested, not under pressure, perhaps in flow state – Ti manifests at its best. A Ti user in flow can be brilliantly analytical yet also creative, solving complex puzzles with ease or getting deeply absorbed in refining theory for hours without losing focus.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Under Stress</h4>
                <p>
                  Under stress or fatigue, Ti performance often deteriorates in two ways. One reaction is that Ti becomes rigid and nitpicky – the person anxiously doubles-down on trivial details, obsessively trying to regain logical control. Alternatively, severe stress can cause a shadow response where they abandon careful logic and act on impulse or emotion.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Emotional Overlays</h4>
                <p>
                  A person with high neuroticism will experience their Ti through a lens of anxiety and self-doubt more often, gravitating toward worst-case scenarios or being hypercritical of their own reasoning. In contrast, those with low neuroticism can employ Ti with more calm and confidence, trusting their reasoning and moving forward without excessive second-guessing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Developmental Arc */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-3"></span>
                Developmental Arc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The expression of Ti is shaped by developmental changes over the lifespan:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Early Childhood</h4>
                  <p>
                    Ti is present only in rudimentary form. Analytically inclined children might show it by categorizing toys, asking endless "why" questions to understand causality, or demonstrating a strong need for things to be fair and make sense according to their small frameworks.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Adolescence</h4>
                  <p>
                    Those inclined toward Ti start gaining Experience and Norms dimensions through education and life lessons. They learn general logical rules and formulas, getting excited when formal systems align with how their mind works. However, their Ti may be mostly 2D at this stage.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Adulthood</h4>
                  <p>
                    Through higher education or professional training, Ti-users often continue to grow. Real-world problem-solving adds the Situational dimension as they encounter varied challenges that force them to adapt their logical approach, developing 3D Ti by learning to calibrate principles to context.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Mid-Career and Beyond</h4>
                  <p>
                    By mid-career, if Ti has been continually engaged, many individuals attain 4D capacity. They've seen enough patterns over time to internalize foresight. Their Ti becomes seasoned, not just reacting to what's in front of them but anticipating future outcomes based on observed long-term patterns.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Qualitative Shifts with Age</h4>
                  <p>
                    Younger Ti users might be more adamant and black-or-white in their logic, while maturity often brings flexibility and philosophical recognition of logic's limits. A very Ti-heavy individual might deliberately cultivate empathy or spontaneity in later life, paradoxically making their Ti even more effective.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/signals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Signals
            </a>
          </Button>
          <Button asChild>
            <a href="/te">
              Next: Te
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </InfoElementLayout>
  );
};

export default Ti;