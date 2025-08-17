import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";

const Ne = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/ni">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ni
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/si">
              Next: Si
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Ne – Divergent Exploration</h1>
              <p className="text-xl text-muted-foreground">Extraverted Intuition</p>
            </div>
          </div>
        </div>

        <div className="grid gap-12 max-w-6xl mx-auto">
          {/* Narrative Definition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-primary rounded-full mr-3"></span>
                Narrative Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed">
              <p>
                Extraverted Intuition (Ne) is the cognitive element of possibilities, divergent ideas, and imaginative exploration. It scans the external world for what could be – hidden meanings, potential developments, or novel interpretations of a situation. In essence, Ne users see reality not just as it is, but as a springboard for numerous alternatives and innovations.
              </p>
              <p>
                This function thrives on novelty and open-mindedness: it continually asks "What if…?" and enjoys brainstorming, experimenting, and discovering unexpected links between concepts. From the PRISM perspective, Ne remains the mind's chief innovator – the source of creative hypotheses and out-of-the-box solutions – but unlike in static models, PRISM emphasizes that Ne's expression can expand or contract with context.
              </p>
              <p>
                When Ne is engaged, a person is curious, enthusiastic, and perceptive of latent potentials around them. They often come across as inventive and enthusiastic, easily shifting perspectives and inspiring others with their forward-looking ideas. However, Ne's free-ranging nature can also appear scattered or impractical if not balanced by other elements.
              </p>
              <p>
                At its best, Ne expands horizons for self and others – finding creative solutions and injecting inspiration – whereas at its worst it can chase too many rainbows, struggling to focus or follow through. The key identity of Ne is exploratory intuition: it revels in possibilities and invites change and variety into the psyche.
              </p>
            </CardContent>
          </Card>

          {/* Dimensionality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-secondary rounded-full mr-3"></span>
                Dimensionality (1D–4D)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                In PRISM, dimensionality describes how deeply and flexibly a person can process information with a function. Extraverted Intuition can operate at anywhere from one to four "dimensions" of cognition.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">1D Ne (Experience only)</h4>
                  <p>
                    At one-dimensional capacity, Ne relies solely on personal experience and simple pattern-recognition. The person may occasionally stumble on new ideas, but only based on things they've directly encountered. There is no sense of broader context or convention, so their ideas tend to be naive or idiosyncratic. They can imagine possibilities on a small scale but struggle with abstract or novel scenarios outside their familiar ground.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">2D Ne (Experience + Norms)</h4>
                  <p>
                    At two dimensions, Ne can use personal experience plus learned norms or common knowledge to generate ideas. The individual has a somewhat broader imagination informed by external sources. A 2D Ne user can brainstorm within familiar frameworks, suggesting alternatives they've seen others use or that are culturally accepted. They generate variations on known themes, but may not truly innovate beyond the templates they've learned.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">3D Ne (+ Situation)</h4>
                  <p>
                    A three-dimensional Ne adds situational flexibility. The person can adjust their ideation to the unique context of the moment, weaving personal insights, general knowledge, and current specifics into creative solutions. This level of Ne is much more agile and context-aware – it knows which wild idea would actually fit the problem at hand. They can improvise effectively and modify their approach as conditions change.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">4D Ne (+ Time)</h4>
                  <p>
                    At four dimensions, Ne gains a meta-perspective across time – the ability to not only generate contextually relevant ideas, but also project them forward and backward in time, seeing how possibilities play out in the long run. A 4D Ne user can connect the past, present, and future of an idea, with strategic creativity that produces options which are novel, contextually savvy, and sustainable or far-reaching.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Manifestation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-accent rounded-full mr-3"></span>
                Block Manifestation: Core, Critic, Hidden, Instinct
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                Extraverted Intuition can manifest very differently depending on which functional block it occupies in a person's psyche:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Core (Ego Block)</h4>
                  <p>
                    When Ne is in the Core block, it's a strength and valued driver. Ne-leading types effortlessly generate multiple perspectives and ideas about any situation, living in a "rich world of ideas and potential connections." They are quintessential brainstormers who trust the process of exploration and tend to keep options open. Such individuals are often recognized for their humor and inventiveness – making quick, clever connections and bringing a spirit of innovation to whatever they do.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-destructive">Critic (Super-Ego Block)</h4>
                  <p>
                    With Ne in the Critic block, it's a weak point and not inherently valued. Role Ne users can mimic idea-generation when necessary but find it awkward and straining – they treat Ne like a chore to check off. Vulnerable Ne individuals find abstract possibilities genuinely bewildering or irritating, often reacting to freewheeling brainstorming with frustration ("This is pointless speculation; let's deal with facts").
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-muted-foreground">Hidden (Super-Id Block)</h4>
                  <p>
                    With Ne in Hidden Potential, the individual values what Ne offers but has modest natural aptitude. Suggestive Ne users have a hunger for imagination and come alive when someone injects novel ideas into their world. Mobilizing Ne users try to cultivate more imaginative or adaptable approaches with conscious effort, often pushing themselves to be more open to new ideas and unusual opportunities.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary/70">Instinct (Id Block)</h4>
                  <p>
                    With Ne in the Instinctive block, it's a strong ability that operates in the background, largely outside ego identity. Ignoring Ne users can generate many ideas but choose not to indulge most of them, focusing instead on their singular vision. Demonstrative Ne users wield Ne almost unconsciously to assist others, often displaying surprising wit or inventive streaks while not identifying as "imaginative types."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strength Expression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-primary/80 rounded-full mr-3"></span>
                Strength Expression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed">
              <p>
                Strength expression refers to how intensely and confidently a person actually uses Ne in practice. Signs of well-developed and actively expressed Ne include:
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Rapid Ideation</h5>
                  <p className="text-sm">Generates ideas fluidly and frequently, can riff off one concept to produce many possibilities.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Embracing Novelty</h5>
                  <p className="text-sm">Actively seeks new experiences, concepts, and varied interests with enthusiasm for change and variety.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Connecting Dots</h5>
                  <p className="text-sm">Links disparate ideas, makes unusual analogies, finds hidden commonalities across different domains.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Optimism about Potential</h5>
                  <p className="text-sm">Readily envisions positive possibilities, sees opportunities in setbacks, maintains hopeful outlook.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Playful Creativity</h5>
                  <p className="text-sm">Enjoys intellectual play, approaches problems experimentally, comfortable breaking norms to test ideas.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Visible Curiosity</h5>
                  <p className="text-sm">Displays childlike curiosity with lots of "why?" and "what if?" questions, investigates purely from fascination.</p>
                </div>
              </div>

              <p>
                When Ne is well-developed and trusted, the individual comes off as imaginative, adaptable, and intellectually adventurous, consistently injecting new ideas into their life and the lives of others.
              </p>
            </CardContent>
          </Card>

          {/* State/Overlay Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-secondary/80 rounded-full mr-3"></span>
                State/Overlay Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                PRISM recognizes that Ne doesn't operate in a vacuum – its expression is influenced by temporary states and stable emotional overlays:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-green-600">Flow State</h4>
                  <p>
                    In flow state, Ne becomes a breathtaking force of creativity. The mind enters effortless idea generation where thoughts connect fluidly and one idea leads seamlessly to the next. The person may experience a creative high where time passes without notice. In flow, Ne is also more refined – ideas emerge coherently and on-target, not just random. This is Ne operating at its most potent and positively synchronized state.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-red-600">Stress State</h4>
                  <p>
                    Under acute stress, Ne's performance often degrades or distorts. For Ne users, high stress can disrupt the free associative process – thinking might become disorganized or chaotically overactive. Anxiety can turn Ne's gift of imagining outcomes into a curse of worrying about worst-case scenarios. They may catastrophize, envisioning every potential thing that could go wrong and having trouble making decisions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-orange-600">High Neuroticism Overlay (+)</h4>
                  <p>
                    With high anxiety or emotional volatility, Ne's character changes in tone. The person remains idea-rich, but many ideas center on threats, errors, or unexpected dangers. This manifests as chronic overthinking – continuously generating scenarios asking "What if this goes wrong?" Their Ne drives anxious contingency planning or second-guessing. Even positive opportunities might be met with flurries of doubts and fears about potential negative outcomes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-blue-600">Low Neuroticism Overlay (-)</h4>
                  <p>
                    With calm, emotional stability, Ne tends to play out in a more optimistic and exploratory fashion. Low neuroticism means less anxiety about unknowns, giving Ne freer rein to roam without negative bias. The person imagines possibilities but doesn't get spooked by them – they're less likely to fixate on dangers and more on opportunities. This combination often yields a buoyant visionary quality with cheerful, light creativity.
                  </p>
                </div>
              </div>

              <p>
                Understanding these state fluctuations helps individuals harness Ne when conditions are right and restore creative balance when stress or anxiety interfere with natural ideation processes.
              </p>
            </CardContent>
          </Card>

          {/* Development Arc */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-accent/80 rounded-full mr-3"></span>
                Development Arc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                How does Extraverted Intuition evolve over a person's lifetime? PRISM emphasizes that functions are not static talents set in childhood, but can grow, atrophy, or transform with experience and intentional development.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Early Childhood</h4>
                  <p>
                    Children with strong Ne potential may be notably imaginative – inventing complex pretend scenarios, asking endless "what if" questions, or displaying curiosity about everything. They might have many disparate interests and short attention spans, drawn to explore one idea after another. Conversely, children with weak Ne might focus on concrete reality, preferring familiar toys and showing little inclination for make-believe beyond copying real life.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Adolescence</h4>
                  <p>
                    During teen years, Core functions consolidate. If Ne is a core strength, by high school the person often leans heavily into it – choosing creative hobbies, gravitating to intellectual debates, or rebelling against routines. This can be a period of exuberant idea-generation but also friction with structured environments. Those with Ne vulnerabilities might struggle with tasks requiring brainstorming or abstract theorizing, leading them to compensate through rote learning or concrete subjects.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Early Adulthood (20s-30s)</h4>
                  <p>
                    Strong Ne users may channel ideation into tangible goals but often learn the limits of endless ideation without execution. Those with auxiliary Ne often find niches that use imagination in service of their passion. Individuals with weak Ne positions may face challenges requiring strategic foresight, leading them to either avoid Ne-heavy demands or be forced to exercise intuition through major life changes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Midlife (40s-50s)</h4>
                  <p>
                    Midlife often brings integration of less developed functions. Strong Ne users might slow down and develop more focus or depth. Those who had Ne as a blind spot may experience revolutionary openness – the classic story of exploring art classes or traveling after retirement, suddenly eager to experience possibilities they denied themselves before. Hidden Potential Ne often blooms after years of incubation through mentor experiences or life demands.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Late Adulthood (60s and beyond)</h4>
                  <p>
                    Strong Ne users often remain mentally youthful – their curiosity keeping them sharp and open-minded. They may turn more philosophical, reflecting on possibilities pursued or missed while distilling wisdom. Those with weak Ne may either feel freed from its pressure to experiment safely ("why not sign up for that improv class?") or double down on familiar patterns. Major life events can trigger latent functions at any age.
                  </p>
                </div>
              </div>

              <p>
                Throughout life, Ne's growth is tied to exposure and practice. PRISM encourages actively nurturing weaker functions over time through deliberate engagement in creative exercises, travel, brainstorming, or simply adopting a mindset of curiosity. The arc often goes from playful abundance (youth) → controlled application (adulthood) → balanced integration (midlife) → wise flexibility (age).
              </p>
            </CardContent>
          </Card>

          {/* Behavioral Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <span className="w-4 h-4 bg-primary/60 rounded-full mr-3"></span>
                Behavioral Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                To illustrate Ne in action, here are realistic scenarios showing how Extraverted Intuition might appear in different people, contexts, and levels of development:
              </p>

              <div className="space-y-8">
                <div className="border-l-4 border-primary pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-primary">Ne as Core Strength (Creative Innovator)</h4>
                  <p className="mb-3">
                    <strong>Maya</strong> leads a product design meeting for a tech startup. She listens to her team's initial concept and immediately starts sketching variations: "What if we target a different user base? Or use the same tech for an entirely new purpose? Actually, here's an off-the-wall idea – what if we gamify the experience?"
                  </p>
                  <p>
                    In half an hour, she presents five distinct approaches. Maya's colleagues are used to her prolific, spontaneous brainstorms. Not every idea sticks, but her creative energy sets the tone. She juggles multiple projects and pulls in seemingly unrelated inspiration – last week she drew an analogy from a documentary about ants that sparked a new app feature. Her Ne is clearly 4D and high-expression.
                  </p>
                </div>

                <div className="border-l-4 border-destructive pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-destructive">Ne Role Usage (Stretching to Ideate)</h4>
                  <p className="mb-3">
                    <strong>Damien</strong> is an operations manager known for efficiency and practical approaches. In a company workshop on "visionary leadership," he feels out of his element but doesn't want to stay silent. He offers a couple of safe suggestions – fairly conservative ones like adopting a procedure he read about in a trade journal.
                  </p>
                  <p>
                    While others excitedly pitch transformative ideas, Damien's contributions are measured and stilted. He later admits, "I'm not really an idea guy – I was just trying to participate." This is Ne in his Internal Critic block: he can generate a few notions when expected (using known templates), but it's clearly not his comfort zone.
                  </p>
                </div>

                <div className="border-l-4 border-red-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-red-600">Ne Vulnerable (Blind Spot)</h4>
                  <p className="mb-3">
                    <strong>Irina</strong> is a no-nonsense accountant who prides herself on pragmatism. When her imaginative daughter muses about various career paths and wild inventions, Irina sighs: "You should focus on something real that pays the bills. All these 'what-ifs' don't put food on the table."
                  </p>
                  <p>
                    Irina's lack of Ne is evident – she has difficulty entertaining hypotheticals. When a plan falls through, she feels genuinely stuck because she can't readily imagine alternatives. In ambiguous situations, she reacts by doubling down on routine tasks rather than brainstorming solutions. This exemplifies Ne at 1D/Painful: anything too abstract or unproven is met with dismissal or stress.
                  </p>
                </div>

                <div className="border-l-4 border-muted-foreground pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-muted-foreground">Ne Suggestive (Craving Ideas from Others)</h4>
                  <p className="mb-3">
                    <strong>Tariq</strong> is a diligent IT specialist who often feels something is missing in his work. He's good at maintaining systems but secretly admires the "big picture" thinkers. He befriends an ENTP coworker, Alex, who is always fiddling with new concepts. During lunch, Alex excitedly explains a radical software optimization approach.
                  </p>
                  <p>
                    Tariq finds himself captivated – this is the highlight of his day. He asks lots of questions, encouraging elaboration. When problems arise, Tariq goes straight to Alex: "Any ideas for a workaround? I bet you've got a clever angle." Tariq demonstrates Ne Suggestive: appreciating and relying on others' creativity to enrich his stable life.
                  </p>
                </div>

                <div className="border-l-4 border-blue-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-blue-600">Ne Mobilizing (Developing Creativity)</h4>
                  <p className="mb-3">
                    <strong>Elena</strong> (ISFJ) is a competent project manager who has always been practical and detail-driven. In her 30s, she feels her life has become too routine and that she's pigeonholed as "the organized one" but never "the idea person." Deciding to challenge herself, Elena enrolls in a creative writing workshop.
                  </p>
                  <p>
                    At first, she struggles with safe, familiar stories. But with feedback and encouragement, she begins trying more imaginative plots. She consciously adopts habits to spark Ne: visiting new places weekly to jolt herself out of comfort zones. Over time, friends notice she's more open to spontaneity and even pitches out-of-the-box work suggestions. This portrays Ne being consciously cultivated: initial tentativeness followed by growing confidence.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-purple-600">Ne Ignoring (Background Capability)</h4>
                  <p className="mb-3">
                    <strong>Viktor</strong> is a strategizing CEO known for his singular vision (strong Ni). In meetings, when his team brainstorms, he often appears impatient – he usually has a clear favorite direction already. However, if pressed, Viktor can enumerate several alternative plans off the top of his head.
                  </p>
                  <p>
                    He acknowledges other possibilities only to swiftly explain why his chosen path is better. In crises, colleagues have seen Viktor surprise them: when Plan A utterly fails, he almost immediately presents Plan B and C – ideas seemingly pulled from nowhere but that he'd been keeping in his back pocket. This illustrates Ne Ignoring – Viktor's mind is quite capable of generating multiple strategies (3D Ne), but he seldom shows them because he's fixated on his intuitive preference.
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-green-600">Ne Demonstrative (Unspoken Quirkiness)</h4>
                  <p className="mb-3">
                    <strong>Sandra</strong> is a conscientious nurse (ESFJ) who appears very traditional and routine-based. She runs her household efficiently and sticks to what's worked for years. Yet those close to her occasionally glimpse an unexpected side: her son mentions Sandra invented a fun bedtime storytelling game where they collaboratively make up fantastical tales.
                  </p>
                  <p>
                    At work, if a colleague is down, Sandra has a knack for saying something off-beat and funny that cheers them up. She never calls herself creative, but people are sometimes surprised by her quick wit or imaginative solutions to comfort patients. She treats these as no big deal, just part of being helpful. This is Ne Demonstrative: quietly strong and often channeled into supporting others, emerging most when it serves her valued ethos of caring.
                  </p>
                </div>
              </div>

              <p className="text-base italic mt-6">
                These examples showcase how Ne can range from the overt visionary leader to the subtle behind-the-scenes helper. PRISM's nuanced model allows us to understand each case as variations of the same fundamental intuition function, shaped by position, development, and state.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/ni">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ni
            </a>
          </Button>
          <Button asChild>
            <a href="/si">
              Next: Si
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Ne;