import InfoElementLayout from "@/components/InfoElementLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Archive } from "lucide-react";

const Si = () => {
  return (
    <InfoElementLayout>
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/ne">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ne
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/se">
              Next: Se
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Archive className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Si – Experiential Memory</h1>
              <p className="text-xl text-muted-foreground">Introverted Sensing</p>
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
                Introverted Sensing (Si) is the cognitive element focused on physical reality as it is experienced internally – comfort, stability, and the detailed memory of sensations. Si is attuned to the quality of life and the consistency of environments. It pays attention to how things feel – both the tangible feel (sensory impressions like textures, smells, flavors) and the inner bodily sense (well-being or discomfort).
              </p>
              <p>
                Someone using Si strongly is concerned with maintaining homeostasis: preserving health, routine, and familiar comforts so that life runs smoothly and pleasantly. In practical terms, Si entails noticing subtle details of the immediate experience (a slight change in room temperature, the exact flavor balance of a favorite recipe) and recalling past sensory experiences with rich detail.
              </p>
              <p>
                From the PRISM perspective, Si represents the mind's capacity to anchor itself in what is known, tried, and true. It's about creating a stable internal archive of experiences – "how things have always been" – and using that to ensure present and future comfort. Unlike its extroverted counterpart Se, which seeks active engagement with the external immediate world, Si turns inward to refine the internal impression of what has been perceived.
              </p>
              <p>
                At its best, Si provides stability, comfort, and a rich appreciation for the present moment (and the past's lessons). At its worst, Si can become overly rigid or stuck – resistant to change, obsessed with minor comforts, or bogged down by nostalgia and habit. Overall, Si is the part of cognition that says "let's keep things running smoothly and remember what keeps us safe and well."
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
                Introverted Sensing can operate at varying depths of processing, from a simple one-dimensional awareness of personal sensations to a four-dimensional mastery that accounts for context and time.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">1D Si (Experience only)</h4>
                  <p>
                    At the one-dimensional level, Si is limited to personal, direct experiences of comfort and discomfort. The person knows what they have felt or liked in the past, but lacks awareness of broader principles of health or commonly accepted routines. It's purely "I've experienced X, so I react to X." This can result in a somewhat naive approach to well-being – remembering isolated experiences but not adapting beyond them.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">2D Si (Experience + Norms)</h4>
                  <p>
                    Two-dimensional Si adds an awareness of collective norms and standard practices to personal experience. The individual not only relies on what they've felt, but also learns from external sources what "one is supposed to do" for comfort, health, and stability. They might adopt routines because family, culture, or experts recommend them. This broader knowledge makes their Si more reliable and socially adjusted than 1D, though still somewhat inflexible.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">3D Si (+ Situation)</h4>
                  <p>
                    At three dimensions, Si gains contextual flexibility in how comfort and stability are managed. The person can tailor their routines and sensory management to the specific situation and environment. A 3D Si user is skilled at maintaining a comfortable atmosphere even in novel situations – they can adapt their familiar patterns to new contexts while preserving the essential quality of comfort and well-being.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">4D Si (+ Time)</h4>
                  <p>
                    Four-dimensional Si incorporates a meta-awareness of time and long-term cycles into one's sensing and comfort-seeking. The person perceives how the past, present, and future link together in terms of physical states and needs. They have a far-reaching sense of maintenance and tradition, can project into the future and anticipate how current actions will affect future well-being. This is Si at its most profound – creating an atmosphere of comfort and familiarity that transcends the moment.
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
                The role Si plays in someone's psyche dramatically affects how it shows up in behavior. Here's how Si manifests in each block:
              </p>

              <div className="space-y-8">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Core (Ego Block – Leading or Creative)</h4>
                  <div className="space-y-4">
                    <p>
                      When Si is in the Core block, it is a principal strength and deeply valued by the individual. In the Leading (Base) position, Si serves as the fundamental lens through which the person interprets life. Si-leading types (like SEI/ISFp or SLI/ISTp in Socionics, roughly corresponding to ISFJ/ISFP and ISTJ/ISTP) put comfort, quality of experience, and inner stability at the forefront.
                    </p>
                    <p>
                      Such a person instinctively knows how to make themselves and others comfortable – it's almost like a 4D radar always scanning for physical ease or distress. They accumulate an impressive store of experiential knowledge: remembering what remedies helped which ailment, which route is most pleasant, how each family member likes their breakfast. They take pride in nurturing well-being and often become natural caretakers, hosts, or detail-oriented craftspersons.
                    </p>
                    <p>
                      In the Creative (Auxiliary) position, Si is still robust (3D) and actively used, but supports another leading function. For example, an ESTJ (LSE, Te-Si) pursues efficiency but uses Si to ensure processes are sustainable and well-regulated. They might implement new work systems while creating clear routines and ergonomic setups so everyone can follow comfortably.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-destructive">Critic (Super-Ego Block – Role or Vulnerable)</h4>
                  <div className="space-y-4">
                    <p>
                      With Si in the Critic block, matters of comfort, routine, and sensory well-being become weak spots or points of friction. In the Role (3rd) position, Si is something the person can mimic or force themselves to do, but it doesn't come naturally or give joy. Types like ILE (ENTp) or LIE (ENTj) – very idea- or goal-driven personalities – often neglect their own comfort in pursuit of projects or intellect.
                    </p>
                    <p>
                      They know health and rest are important (because others have drilled it into them), so they make periodic attempts at "doing the Si thing." An ENTJ might set New Year's resolutions for healthier routines but internally it feels like a chore. They treat Si as maintenance that must be done grudgingly, often doing the bare minimum to check the box.
                    </p>
                    <p>
                      In the Vulnerable (4th) position, Si is a serious blind spot. Types like ILI (INTp) or LIE (ENTj) who live in abstract realms are often oblivious to their physical state until something goes wrong. They might work through exhaustion, skip meals while focused, or have very high tolerance for uncomfortable environments simply because they're not paying attention to discomfort signals. They may dismiss comfort as trivial or "weak," like to think of themselves as low-maintenance, but often undermine their own maintenance to the point of crisis.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-muted-foreground">Hidden (Super-Id Block – Suggestive or Mobilizing)</h4>
                  <div className="space-y-4">
                    <p>
                      When Si is in the Hidden Potential block, the person appreciates the value of comfort and stability but isn't skilled at achieving it alone. In the Suggestive (5th) position, Si is a desired help from outside. Types like IEE (ENFp) or EIE (ENFj) are typically driven by ideas or emotions, and their lives can be hectic or high-strung. Yet they yearn for calm and coziness.
                    </p>
                    <p>
                      An ENFP always juggling projects might absolutely adore visiting their ISFJ friend's home, where everything is warm, inviting, and the tea is served just right. They visibly relax – it's like a balm for their overstimulated mind. They unconsciously seek relationships or environments that supply steadiness, responding with grateful wonder when receiving gentle caretaking or ambient stability.
                    </p>
                    <p>
                      In the Mobilizing (6th) position, Si is an ability the person tries to develop over time. Types like LII/INTj or LIE/ENTj typically are intellectual or goal-driven people who realize that improving attention to health and comfort would enhance their effectiveness. They might take on Si as a project: reading about minimalist living, experimenting with cooking, approaching it analytically at first but gradually transforming their lifestyle.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary/70">Instinct (Id Block – Ignoring or Demonstrative)</h4>
                  <div className="space-y-4">
                    <p>
                      With Si in the Instinctive block, the person has strong capacity for Si that operates in the background, largely unacknowledged in their identity. In the Ignoring (7th) position, Si is the counterpart to an Se- or Ne-focused ego. Types like SEE (ESFp) or IEE (ENFp) generally chase external experiences or ideas and aren't thought of as homebodies, yet because Si is 3D for them, they do have the ability to manage comfort when they see fit.
                    </p>
                    <p>
                      An ESFp might lead a fast-paced social life but when they crash, they actually know how to recuperate quite well – spending days "off the grid" relaxing or knowing exactly which indulgent foods help them recover. Because Si is unvalued, they don't plan life around it, but it kicks in as an auxiliary system when their body demands it.
                    </p>
                    <p>
                      In the Demonstrative (8th) position, Si is a 4D strength used freely but without ego attachment. Types like IEI (INFp) or EIE (ENFj) might seem not particularly concerned with practicalities outwardly, but those close to them notice they have a knack for low-key nurturing and aesthetics. They instinctively provide comforts when needed, consistently weaving comfort and care into their behavior while downplaying their skill. Unvalued strong Si is like a safety net – reliably there when needed, but kept in the background.
                    </p>
                  </div>
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
                For Introverted Sensing, strength expression reveals itself in how vividly and reliably a person actually employs this comfort-centric function. Signs of strong Si expression include:
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Routine Mastery</h5>
                  <p className="text-sm">Maintains steady, effective routines for daily living with well-regulated schedules and tried-and-true methods.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Sensory Detail Attention</h5>
                  <p className="text-sm">Finely attuned to sensory information, noticing and acting on subtle environmental details to optimize comfort.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Health & Wellness Awareness</h5>
                  <p className="text-sm">In tune with body signals, knows what energizes vs. tires them, maintains consistent health-supporting habits.</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold mb-2">Personal Comfort Skills</h5>
                  <p className="text-sm">Skilled at creating comfort for self and others through cooking, decorating, organizing, and environmental optimization.</p>
                </div>
              </div>

              <p>
                When Si is well-developed and wielded with confidence, life around that person tends to be organized, comfortable, and mindful of the lessons of the past. They come across as grounded, nurturing, and consistent.
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
                The expression of Introverted Sensing can be significantly influenced by transient states like flow or stress, as well as emotional overlays like neuroticism levels.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-green-600">Flow State</h4>
                  <p>
                    In flow state, Si manifests as harmonious immersion in present experience. The person becomes completely attuned to what they're doing in a serene, enjoyable way – whether it's an artist mixing paint colors, a gardener tending plants, or a baker working with familiar dough. Si flow is quietly joyful and steady, creating an aura of calm productivity where everything feels perfectly in place.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-red-600">Stress State</h4>
                  <p>
                    Under stress, Si can either go into overdrive or collapse. Those who value Si may react to chaos by over-applying routines or clinging rigidly to familiar comforts. Those who don't normally value Si might suddenly become aware of physical discomforts they usually ignore, or crave basic comfort like never before. Stress can also distort Si's normal functioning, making typically balanced users hypersensitive to minor discomforts or causing them to neglect basic needs entirely.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-orange-600">High Neuroticism Overlay (+)</h4>
                  <p>
                    With a high neurotic (anxious, emotionally volatile) overlay, Si's natural concern for safety and comfort can become tinged with worry and obsessive caution. An Si-inclined person who is also very high in neuroticism might constantly fret about health and routine to an unhealthy degree – interpreting minor body signals as big issues, over-planning and over-controlling their environment, or sticking to rigid schedules where any deviation causes anxiety. This is basically Si's detail focus amplified by anxiety, leading to perfectionism or ritualistic behavior as a coping mechanism.
                  </p>
                  <p>
                    High neuroticism can cause even a strong Si user to lose confidence in their routines, constantly second-guessing ("Did I lock the door? Did I cook this thoroughly?"). Rather than enjoying their comfortable habits, they might become enslaved to them, feeling that if they don't follow them perfectly, disaster looms.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-blue-600">Low Neuroticism Overlay (-)</h4>
                  <p>
                    A low neuroticism (calm, emotionally stable) overlay tends to make Si's expression more easy-going and resilient. A person with strong Si and low anxiety will maintain their routines and comfort, but won't panic if something disrupts them – they'll just pragmatically adjust. Low neuroticism allows them to be present and relaxed in their sensory experiences, handling physical crises with steady nerves.
                  </p>
                  <p>
                    Low-N overlay provides a buffer where comfort doesn't have to mean perfection – the person can tolerate a range of conditions without freaking out. They enjoy their routines but aren't enslaved by them, deriving even more pleasure from Si because they can fully relax into it without intrusive worry.
                  </p>
                </div>
              </div>

              <p>
                Understanding these state fluctuations helps individuals manage Si more effectively – recognizing when dire premonitions occur during exhausted states, or when to deliberately create better conditions for Si to function optimally.
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
                The development of Introverted Sensing over the lifespan often involves increasing self-awareness of physical needs, refinement of routines, and sometimes a significant shift in how much one values comfort and tradition.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Childhood</h4>
                  <p>
                    Young children with strong Si tendencies can often be identified by their preference for familiarity and routine. They might get very attached to certain foods, toys, or bedtime rituals, have keen sensory memory, and are usually easy to soothe with physical comfort. In contrast, children with weak Si may seem unfazed by irregular schedules or minor injuries, often needing reminders about bodily needs like eating or using the bathroom.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Adolescence</h4>
                  <p>
                    During teenage years, Si-strong adolescents may either lean into their nature (becoming the "mom friend" with snacks and first-aid) or temporarily rebel against it to fit in. They often develop keen aesthetic sense and prefer cozy gatherings over loud clubs. Si-weak teens typically have notoriously messy rooms, irregular sleep, and might only eat junkfood, brushing off parental attempts to impose structure. Late adolescence often brings some awareness that neglecting basics has consequences.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Early Adulthood (20s-30s)</h4>
                  <p>
                    This period often demands independent practical life management. Those with strong Si usually adjust well to "adulting" – they cook with skill, keep orderly spaces, and maintain stable lifestyles. They might be drawn to careers valuing consistent procedure. Early adulthood is frequently a wake-up call for low-Si individuals, who may struggle with basic habits until reality enforces some growth through consequences like illness or burnout.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Mid-Life & Beyond</h4>
                  <p>
                    Middle age often sees Si users refining their mastery further, becoming the reliable pillars of their families and communities. They may develop expert-level skills in areas like cooking, home maintenance, or health management. For those who previously neglected Si, mid-life crises or health scares often force a reckoning with physical needs, sometimes leading to dramatic lifestyle changes toward greater stability and self-care.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-3 text-primary">Elder Years</h4>
                  <p>
                    In later life, strong Si often manifests as wisdom about sustainable living and deep appreciation for life's simple pleasures. Elder Si users become repositories of traditional knowledge and family memories. Even those who developed Si later may find great satisfaction in finally living according to their body's needs and creating comfortable, meaningful environments in their retirement years.
                  </p>
                </div>
              </div>

              <p>
                PRISM emphasizes that Si development is not fixed by type – life experiences, necessity, and conscious effort can significantly enhance one's relationship with comfort, routine, and sensory awareness at any stage. The key is recognizing where you are in this developmental journey and what growth might serve you best.
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
                Here are illustrative scenarios showcasing Introverted Sensing in different contexts and levels of development, demonstrating how Si might appear in daily life:
              </p>

              <div className="space-y-8">
                <div className="border-l-4 border-primary pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-primary">Si as Core Comforter (Steady Caregiver)</h4>
                  <p className="mb-3">
                    <strong>Marian</strong> is a 52-year-old nurse renowned for her calming presence. Her Si is well-honed and valued – she remembers each patient's preferences ("Mrs. Lopez likes an extra blanket and her tea with honey in the evening") and ensures they are met. Her cart is always stocked with necessities plus comfort items that others forget.
                  </p>
                  <p>
                    Colleagues notice that when things get hectic, Marian sticks to her routines – checking vitals methodically, speaking gently – which grounds everyone. At home, her house is cozy with homemade soup aromas, and she maintains a set schedule. Her grandchildren love visiting because they know exactly how warm and inviting it will be. Marian exemplifies Si in the core: consistent, nurturing, rich with practical memory used to maintain well-being for herself and others.
                  </p>
                </div>

                <div className="border-l-4 border-destructive pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-destructive">Si Role in Action (Conscientious Obligations)</h4>
                  <p className="mb-3">
                    <strong>Dev</strong> is a software developer (ENTP) who primarily lives in his head but tries to be "healthy" because he knows he should. Each morning, he forces himself up for a jog and bland cereal – not something he enjoys, but there's an inner voice nagging that he ought to. At work, he keeps a standing desk and water bottle, having heard it's good, yet often forgets to drink until parched.
                  </p>
                  <p>
                    His apartment tends toward disarray, but once monthly in guilt-driven flurries he deep-cleans and tries to "get organized," only for it to slowly slide back. When friends visit, Dev hastily straightens up and lights a scented candle – not because he particularly cares, but he's aware it's expected. This reflects Si as Role function: making effort to imitate good habits, but it's rote and inconsistent.
                  </p>
                </div>

                <div className="border-l-4 border-red-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-red-600">Si Vulnerable (Neglect until Breaking Point)</h4>
                  <p className="mb-3">
                    <strong>Alicia</strong> is a driven corporate lawyer (ENTJ) who seemingly runs on coffee and adrenaline. She still largely ignores her body's signals: realizing at 4 PM she hasn't eaten all day, working through migraines with painkillers, insisting she's fine. Her home is a place she "barely knows" – spoiled food in the fridge, laundry piled up because she buys new shirts instead of washing.
                  </p>
                  <p>
                    Alicia genuinely doesn't notice mess or bodily discomfort until it's extreme. One day she nearly collapses in a meeting – turns out she had 102°F fever but kept pushing through deadlines. Forced to rest, she's miserable: bored with downtime, lacking soothing routines, snapping at her spouse's care. This highlights Si vulnerable: very high threshold for noticing physical needs, lacking coping strategies when confronted with them.
                  </p>
                </div>

                <div className="border-l-4 border-muted-foreground pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-muted-foreground">Si Suggestive (Yearning for Rest and Warmth)</h4>
                  <p className="mb-3">
                    <strong>Noah</strong> is a high-strung theater actor (ENFJ) whose life is a whirlwind of rehearsals and social events. He loves the excitement but secretly feels overstimulated and burnt out. Noah finds himself increasingly drawn to his friend Ben's lifestyle – Ben has this snug apartment with plants, a cat, and always seems to have homemade muffins or soup on hand.
                  </p>
                  <p>
                    Whenever Noah visits, he melts into the couch and sighs, "It's so peaceful here." He jokingly calls Ben's place his "sanctuary." At his own apartment, things are disorganized and he hardly cooks – it doesn't feel homey. This shows Si suggestive: Noah craves the tranquility and comfort he doesn't naturally cultivate, actively seeking it from his friend and feeling immense relief when he receives it.
                  </p>
                </div>

                <div className="border-l-4 border-blue-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-blue-600">Si Mobilizing (Learning to Slow Down)</h4>
                  <p className="mb-3">
                    <strong>Tara</strong> is an INTJ architect, brilliant at her job but historically oblivious to self-care. At 35, chronic stress symptoms (insomnia, back pain) force her to approach this as a design problem – systematically. She reads up on health, buys ergonomic gadgets, schedules "Gym – Tuesday/Friday 6 PM" and "Meal Prep Sunday" into her planner.
                  </p>
                  <p>
                    At first, these are just tasks to tick off. Gym visits are awkward; cooking is messy. But Tara sticks to it and gradually notices improvement. Six months later, colleagues notice her increased energy. A friend finds her peacefully trimming bonsai plants – a patience-cultivating hobby. "Old me wouldn't recognize this," Tara laughs. This shows Si mobilizing: through deliberate effort, developing appreciation for well-being maintenance.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-purple-600">Si Ignoring (Strong but Backgrounded)</h4>
                  <p className="mb-3">
                    <strong>Carlos</strong> is an ESFP event planner who lives a very active, social life. On the surface, he thrives on chaos – late nights, loud venues, constant engagement. However, those close notice: when he takes breaks, he switches fully into rest mode. After intense weeks, Carlos might vanish for weekends at his parents' country house, sleeping in, strolling in pajamas, cooking childhood comfort foods.
                  </p>
                  <p>
                    When an outdoor festival he's organizing gets hit by unexpected rain and wind, while others panic, Carlos rapidly adjusts – securing tents, passing out hot drinks he had quietly prepared based on gut feeling. This reflects ignoring Si: Carlos can manage comfort expertly when needed, but usually puts focus on excitement and connection, "ignoring" Si until circumstances require it.
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-6">
                  <h4 className="font-semibold text-xl mb-3 text-green-600">Si Demonstrative (Unassuming Homemaker Traits)</h4>
                  <p className="mb-3">
                    <strong>Elaine</strong> is an INFJ therapist known for insightful, empathetic counsel. What many don't see is how her demonstrative Si supports her work. Her office is softly lit with comfortable chairs, plush throws, and subtle jasmine tea scent. New clients often comment, "I feel safe here." Elaine just smiles – to her, it's natural.
                  </p>
                  <p>
                    When her best friend (ENTJ) lost his father and was spiraling, Elaine invited him to stay. She didn't offer therapy talk – instead, she quietly made sure he ate homemade meals, took evening walks, had a comfortable bed. Her friend later said this practical care helped him recover balance more than any advice. Elaine brushed off praise: "I just did what anyone would do." This shows demonstrative Si: unconscious proficiency in creating comfort that greatly benefits others, yet she remains modest about it.
                  </p>
                </div>
              </div>

              <p className="text-base italic mt-6">
                Through these examples, we see Si wear many hats: the devoted caregiver, the professional learning to heed their body, the friend whose quiet acts go under the radar. Si can be a lifestyle, lifeline, or latent talent, enriching our understanding of how humans create meaning, stability, and connection in life.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/ne">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ne
            </a>
          </Button>
          <Button asChild>
            <a href="/se">
              Next: Se
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </InfoElementLayout>
  );
};

export default Si;