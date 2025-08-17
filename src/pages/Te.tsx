import InfoElementLayout from "@/components/InfoElementLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";

const Te = () => {
  return (
    <InfoElementLayout>
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/ti">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ti
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/fi">
              Next: Fi
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Target className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Te – Pragmatic Logic</h1>
              <p className="text-xl text-muted-foreground">Extraverted Thinking</p>
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
                Extraverted Thinking (Te) is the pragmatic, outcome-oriented side of logical thinking. It's the cognitive element focused on external facts, efficiency, and getting results in the real world. If Ti builds an internal blueprint, Te constructs and implements that blueprint externally, asking: "What works? How can we do this better or faster?"
              </p>
              <p>
                Te minds are attuned to concrete evidence and productivity. They trust objective measurements – data, proven methods, observable outcomes – as the basis for decision-making. Key themes of Te include optimizing processes, organizing resources, and executing plans in a sensible order. Those who favor Te tend to have a no-nonsense, managerial thinking style: they set goals, outline steps, track progress, and adjust tactics to ensure the job gets done effectively.
              </p>
              <p>
                They often take on roles as coordinators or problem-solvers in group settings because they naturally identify inefficiencies or factual errors and move to correct them. In contrast to introverted thinking, which cares about internal consistency, Te is more concerned with practical accuracy and usefulness – it asks, "Does this idea actually work out there in the world?"
              </p>
              <p>
                A person strong in Te will typically accumulate a wealth of factual knowledge in their areas of interest. They enjoy learning "how-to" information, technical details, or any guidelines that can improve competence. Being competent and informed is important to them – they often pride themselves on having the right data or method at hand. Te also drives a sense of accountability and measurement; Te types like to quantify and keep score.
              </p>
              <p>
                Because Te deals in externals, it also influences communication style: Te users are often direct, stating facts bluntly and expecting others to appreciate the clarity. They value objectivity – personal feelings or abstract musings take a back seat to empirical evidence and goals. In summary, Te is the mind's engineer and executive: factual, methodical, and oriented toward making things happen in the most effective way possible.
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
                The capability of Te ranges from rudimentary to masterful depending on its dimensional depth:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">1D Te (Experience Only)</h4>
                  <p>
                    Te manifests as very basic practical know-how strictly limited to what the person has personally done or seen. They know one reliable way to accomplish a task and stick rigidly to that method. If a problem falls outside their small toolkit, they're often lost – their sense of how to achieve goals doesn't extend beyond familiar scenarios.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">2D Te (Experience + Norms)</h4>
                  <p>
                    Adds knowledge of conventional methods. The person has learned standard procedures, rules of thumb, or expert advice. They can be solid technicians when handling routine tasks, following checklists and applying best practices, but struggle with improvising improvements or dealing with unique obstacles.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">3D Te (Experience + Norms + Situation)</h4>
                  <p>
                    Empowers the individual to tailor their approach to immediate context. They don't just apply one-size-fits-all rules; they scan the environment and tweak methods to maximize efficiency here and now. This flexibility means they handle novelty much better and are adept at troubleshooting under pressure.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">4D Te (All Dimensions + Time)</h4>
                  <p>
                    Represents fully realized pragmatic intellect. The person not only adapts in the moment but also projects forward in time. They can anticipate how processes will unfold, foresee obstacles, and plan for long-range efficiency. This is the expert engineer or executive who designs systems that will stand the test of tomorrow.
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
                Let's explore how Te appears in each PRISM block position – Core, Critic, Hidden, and Instinct – noting the distinct behaviors and attitudes that emerge.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">Core (Core Drive Position)</h4>
                  <p>
                    In the Core position, Te is a dominant strength and value – essentially part of their core identity. Te-Core individuals operate as living engines of efficiency and competence. This function is so ingrained that they manage external tasks almost reflexively through a logical, task-oriented lens. They automatically organize their environment and often assume responsibility for making sure things "make sense" in practical terms.
                  </p>
                  <p>
                    Because Te is both strong and valued here, using it feels satisfying and empowering; these individuals like being effective and take pride in their expertise or organizational skill. They often end up in leadership or specialist roles where their factual knowledge and decisiveness shine. Internally, their thoughts often revolve around productivity – there's a running mental checklist or goals being refined at all times.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary">Critic (Internal Critic Position)</h4>
                  <p>
                    Te in the Critic position is a weak spot that the person does not enjoy focusing on, yet likely feels judged by. Someone with Te as a Critic function typically finds the realms of efficiency and factual organizing to be burdensome and anxiety-provoking. They might cope by developing a facade of competence when needed, but it's a strained effort.
                  </p>
                  <p>
                    Their actual Te skill tends to be low-dimensional; they can follow simple procedures but become overwhelmed by complex, multi-step tasks or strict schedules. When forced into Te-heavy situations, they grow tense and frustrated. They often avoid taking charge of planning or decision-making based on facts, frequently delegating such tasks away whenever possible.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-accent">Hidden (Hidden Potential Position)</h4>
                  <p>
                    With Te in the Hidden block, the individual is not naturally adept at logical efficiency, but they truly admire and desire it. This is the person who might say, "I wish I were more organized" or "I love it when things are well-planned," yet their own life is somewhat chaotic or scattershot.
                  </p>
                  <p>
                    They feel relieved and grateful when others provide structure or take over logistics for them. They tend to be suggestible in this domain, readily following advice from those skilled in Te. They might buy productivity apps or read time management books, but struggle to sustain these efforts without support. However, they don't react with aversion – instead of "I hate dealing with this," they say, "I wish I were better at this."
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-muted-foreground">Instinct (Instinctive Self Position)</h4>
                  <p>
                    If Te lies in the Instinctive Self block, the individual is innately good at pragmatic thinking and organization, yet sees it as second nature rather than a point of pride. People with Instinctual Te effortlessly keep track of schedules or fix practical issues without much thought, but often shrug it off as "no big deal."
                  </p>
                  <p>
                    Te here is strong but not valued – they don't particularly identify with being a "logical planner" nor prioritize it as essential to their ego. They might surprise others with their competence behind the scenes, handling logistics flawlessly while appearing focused on other matters. They typically won't boast about these abilities and may downplay them as "common sense."
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
                Signs of a person with strong Te are usually visible in how effectively and efficiently they handle real-world tasks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Organizational acumen – they keep their environment, schedule, or plans in orderly shape</li>
                <li>Focus on facts and evidence in conversation, citing relevant data and concrete examples</li>
                <li>Decision-making that is decisive yet flexible – they move to implement once they have enough data</li>
                <li>Reliability in execution – if they say they'll do something by a certain time, they usually do</li>
                <li>Natural gravitation toward leadership roles in group settings</li>
                <li>Adept problem-solving, especially for logistics or strategy problems</li>
                <li>Straightforward and succinct communication style</li>
                <li>Habit of accumulating and sharing practical knowledge in their domain</li>
                <li>Confidence in handling external tasks – others come to them when something needs to be done correctly</li>
              </ul>
              <p>
                Proficiency in Te is evident through a person's competence in action: they consistently translate ideas into viable plans, execute those plans well, base their judgments on facts, and seem to have an internal compass for what will or won't work in reality.
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
                The performance of Te, being an outward-facing function, can be strongly affected by situational pressures and emotional overlays:
              </p>
              
              <div>
                <h4 className="font-semibold">Flow State</h4>
                <p>
                  In a flow state or positive groove, a Te user becomes a powerhouse of productivity. They tackle their to-do list with vigor, swiftly problem-solve unexpected issues, and coordinate with others seamlessly. They may even experience enjoyment from checking off tasks and seeing concrete results accumulate.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Under Stress</h4>
                <p>
                  Under stress, Te can take a sharp turn. A typically organized individual might start making uncharacteristic errors, develop tunnel vision fixating on one success metric, or experience executive dysfunction where their internal "project manager goes offline." In extreme cases, they might abandon their Te approach altogether and make impulsive, emotion-based decisions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Emotional Overlays</h4>
                <p>
                  A high-neuroticism (Te⁺) person often has their efficiency tinged with worry, leading to double-checking everything and difficulty delegating. Under negative emotional states, they might become excessively rigid, clinging to plans even when circumstances have changed. Conversely, low neuroticism (Te⁻) individuals tend to stay pragmatic and steady, continuing to focus on solutions with a clear head.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Mood Effects</h4>
                <p>
                  Positive mood can make Te users more flexible and inspirational, while negative mood might turn them authoritarian and micromanaging. Extreme stress can also cause loss of typical assertiveness, leading to apathetic chaos when emotional energy is drained.
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
                The growth of Te over a lifetime often follows a trajectory from learning basic discipline to mastering strategic execution:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Childhood</h4>
                  <p>
                    Even future Te powerhouses start small: maybe keeping their room in order, doing chores, and learning factual tidbits about their interests. A child with Te proclivity might show early signs like organizing toys by category, correcting other kids with "that's not how it's done," or being very aware of rules and compliance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Adolescence</h4>
                  <p>
                    Te development usually involves internalizing Norms through schooling – learning standard methods in various domains. A teenager with budding Te might take on managing school clubs or figuring out the best study methods. However, teenaged Te is often rule-bound and can be inflexible, not yet learning where to bend rules or innovate.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Early Adulthood</h4>
                  <p>
                    Real-life challenges force Te users to add Situational adaptability. University or early career becomes a crucible for Te – through trial and error, they learn to fine-tune their efficiency to different contexts. Many encounter failure that teaches invaluable lessons about flexibility and contingency planning.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Mid-Career</h4>
                  <p>
                    By mid-career (30s and 40s), continuous Te use can make someone quite formidable. They've seen enough patterns to anticipate outcomes, marking development of the Time dimension. They might mentor younger colleagues, drawing on foresight built from experience. This indicates 4D Te in action.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Later Life Development</h4>
                  <p>
                    Te can continue to refine into one's 50s and 60s as long as they remain engaged. Even those initially weak in Te can improve significantly in mid-life due to career demands or family responsibilities. Ideally, by later adulthood, individuals have a balanced view where Te becomes a servant, not master, of one's goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/ti">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ti
            </a>
          </Button>
          <Button asChild>
            <a href="/fi">
              Next: Fi
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </InfoElementLayout>
  );
};

export default Te;