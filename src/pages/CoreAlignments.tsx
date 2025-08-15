import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { ArrowLeft, ArrowRight, Users, Target, Zap, Heart, List } from "lucide-react";
import { Link } from "react-router-dom";

const CoreAlignments = () => {
  const coreAlignments = [
    {
      id: "innovative-harmonizers",
      name: "Innovative Harmonizers",
      formerly: "Alpha Core Alignment",
      icon: <Zap className="h-8 w-8 text-primary" />,
      archetype: "Enthusiastic explorers who seek out new ideas and shared comfort. This group embodies playful creativity, warm sociability, and a positive, inclusive outlook. They thrive on novelty and harmony, balancing imaginative brainstorms with an easygoing, supportive vibe.",
      coreValues: "Openness to possibilities and intellectual playfulness. Innovative Harmonizers prize explorative thinking and brainstorming (valuing Intuition over strict Sensation), and they enjoy exchanging theories or inventive ideas for fun.\n\nThey combine this with a love of personal comfort and present-moment enjoyment, making sure everyone feels at ease (a hallmark of their valued Sensing). Socially, they emphasize warmth, humor, and inclusive friendship, courtesy of valuing empathetic Feeling and principled Thinking in equal measure – debates and discussions are approached as friendly games rather than serious fights.",
      characteristics: "These types create a relaxed, merry atmosphere where hierarchy is low and everyone is welcome. Group gatherings tend to be lighthearted – filled with jokes, creative chatter, shared hobbies, and a 'family-like' inclusive spirit.\n\nMaintaining good vibes and group harmony is paramount: conflict, heavy negativity, or forceful authority displays are usually sidestepped or downplayed in favor of keeping things convivial. They are often democratic and open-minded, happy to consider multiple viewpoints (strong Ne/Si influence) as long as it keeps the environment positive and interesting.\n\nRigid schedules or aggressive pushiness (which relate to functions they don't value) make them uncomfortable, so they prefer flexible plans and gentle encouragement over hard coercion.",
      prismPerspective: "Innovative Harmonizers still shine as curious, friendly creators, but PRISM emphasizes that they are not limited to being carefree idealists 24/7. Context can prompt these individuals to stretch beyond their usual comfort.\n\nFor example, under acute stress they might tap into their opposite traits, showing uncharacteristic assertiveness or focus (a temporary shift toward more hard-driving energy). Likewise, life experience – say, an inventive entrepreneur from this quadra having to run a business – can teach an Innovative Harmonizer to 'buckle down' with practicality and structure (developing a usually unvalued trait like disciplined logic, Te).\n\nPRISM highlights these adaptations: at heart they remain improvisational, curiosity-driven harmonizers, but mature members can overcome their conflict-aversion and lack of focus when needed. In essence, PRISM retains this quadra's core of creativity, flexibility, and conviviality, while showing that they can integrate realism and assertiveness as personal growth calls for it.\n\nAn Innovative Harmonizer at their best still brings people together in positive, idea-rich environments, yet also knows how to get serious to reach goals when the situation demands – they evolve from simply 'fun-loving' into capable of blending imagination with a bit of discipline for greater impact.",
      types: [
        "ILE (ENTp) – Explorative Visionary",
        "SEI (ISFp) – Comfort Curator",
        "ESE (ESFj) – Connector",
        "LII (INTj) – Conceptual Analyst"
      ]
    },
    {
      id: "driven-idealists",
      name: "Driven Idealists",
      formerly: "Beta Core Alignment", 
      icon: <Target className="h-8 w-8 text-primary" />,
      archetype: "Intense crusaders motivated by vision, loyalty, and impact. This group is defined by passionate energy and a strong sense of purpose – they are the natural champions of causes and communities. Driven Idealists combine boldness and idealism, rallying around convictions and inspiring others through their fervor and camaraderie.",
      coreValues: "Mission, unity, and honor. Driven Idealists value having a clear vision or belief to fight for, guided by future-oriented intuition and decisive will (Ni/Se). They thrive when pursuing big goals or noble causes that give life meaning.\n\nEqually, they esteem group loyalty and shared principles – a commitment to their 'tribe' or inner circle. This comes from valuing emotional expressiveness (Fe) paired with structural integrity (Ti): they often foster tight-knit communities with strong bonds, codes of honor, and even rituals or traditions that reinforce belonging.\n\nIn this atmosphere, hierarchy and leadership tend to emerge naturally. Driven Idealists are comfortable with clear roles and authoritative structure if it serves the group's aim (they are more accepting of ranked order and rules than other quadras).\n\nThey also have a dramatic, all-or-nothing approach to life's challenges: half-measures or idle dilly-dallying don't sit well with them. Instead, they prefer direct action, courage, and wholehearted commitment, often displaying personal bravery and a willingness to confront obstacles head-on for the sake of their ideals.",
      characteristics: "In group settings, Driven Idealists generate a charged, enthusiastic atmosphere. They bond by sharing emotional experiences – whether it's the exhilaration of a team victory, the pathos of a common struggle, or the pride of participating in a grand vision.\n\nEveryone is encouraged to get involved with passion: you'll see these types singing fight songs together, engaging in spirited debates, or uniting under symbols and slogans that represent their cause. There's often a 'tribal' mindset – a strong sense of who is 'us' vs. 'them'.\n\nNew people are quickly sized up and, if deemed aligned, welcomed fervently into the fold; if not, they may find it hard to breach the group's fortress of loyalty. This quadra's culture is high-energy, competitive yet camaraderie-driven – they may playfully spar or challenge each other to excel, seeing conflict (friendly or even aggressive) as a way to toughen bonds and clarify loyalties.\n\nWhat outsiders might view as intensity or even zealousness, insiders experience as inspiring dedication and brotherhood. However, they can be impatient with hesitation or ambiguity: a Driven Idealist group will push for decisive stands and can grow frustrated with too much open-ended brainstorming or people who 'sit on the fence' instead of choosing a side.",
      prismPerspective: "PRISM agrees that Driven Idealists are visionary firebrands – think of them as 'crusaders' for what they believe in. However, it refines this picture by showing that these individuals are more dynamic and multifaceted than the stereotype of an always-aggressive zealot. Context plays a big role in how strongly their intensity shows.\n\nFor example, the very same Beta type who is a charismatic leader at a rally might display a gentler, reflective side in private moments – enjoying one-on-one conversations or creative daydreaming when they're not in 'battle mode'. An INFp (IEI) in this group, typically a soft-spoken dreamer, can suddenly transform into a passionate poet or a loyal lieutenant when inspired by a movement – essentially toggling between quiet idealism and rousing zeal as circumstances require.\n\nPRISM thus frames Driven Idealists as adaptive: they always have an inner intensity, but it can be channeled constructively or destructively depending on maturity and situation. A healthy member of this quadra learns to balance fierce group loyalty with personal integrity – in other words, they stand for their cause without becoming blindly tribal or intolerant.\n\nAdditionally, PRISM's integration of broader personality traits (like emotional stability) highlights that not all Driven Idealists look the same: one ENFj (EIE) might be an excitable firebrand rallying crowds, while another ENFj with a calmer temperament leads in a quiet, steady way – yet both still share the same core values of purpose and camaraderie, just expressing them differently.\n\nIn short, PRISM preserves this quadra's love of passion, purpose, and brotherhood, but it cautions against one-size-fits-all labels. With self-awareness and growth, a Driven Idealist can learn to collaborate and empathize beyond their 'clan,' channeling their conviction into inclusive leadership rather than domination. They remain purpose-driven idealists at heart, but PRISM shows they can also develop empathy, restraint, and openness – making them capable of inspiring others without overpowering them.",
      types: [
        "SLE (ESTp) – Tactical Commander",
        "IEI (INFp) – Visionary Dreamer",
        "EIE (ENFj) – Inspirational Orator",
        "LSI (ISTj) – Principled Guardian"
      ]
    },
    {
      id: "pragmatic-realists",
      name: "Pragmatic Realists", 
      formerly: "Gamma Core Alignment",
      icon: <Users className="h-8 w-8 text-primary" />,
      archetype: "Hard-nosed yet principled achievers who keep their eyes on the prize. This quadra is all about practical results, personal responsibility, and realistic goals. Pragmatic Realists combine long-term strategy with down-to-earth execution. They are driven to turn visions into tangible outcomes, valuing efficiency, honesty, and loyalty – making things work in the real world.",
      coreValues: "Efficacy and authenticity. Pragmatic Realists prize effective action and concrete success above idle speculation – they value what works. Guided by foresight and willpower (strong Ni/Se), they focus on long-term gains and strategic thinking: this group is naturally inclined to plan ahead, anticipate future trends, and position themselves (and their allies) to capitalize on opportunities.\n\nThey demand grounded logic and proof (valuing Te): new ideas must demonstrate real-world merit or usefulness before earning their commitment. In personal ethos, they also hold integrity and trustworthiness in high regard (valuing Fi). Once a person proves their loyalty or competence, a Pragmatic Realist will reciprocate with strong loyalty in turn, forming tight alliances.\n\nHowever, their sense of ethics isn't sentimental – it's justice-oriented and merit-based. They believe each individual should pull their own weight, and they won't hesitate to hold others accountable for failing promises or betraying trust.\n\nIn this quadra's culture, there is a 'earn your place' mentality: respect and trust are gained through actions and reliability. They often emphasize self-improvement and accountability – continually bettering oneself and one's situation is expected, and excuses for incompetence or disloyalty wear thin quickly.",
      characteristics: "When Pragmatic Realists come together, the mood is focused, candid, and enterprising. Conversations gravitate toward practical matters – plans, business ideas, career goals, strategies for solving problems, or sharing useful life lessons. There's enjoyment in trading tips about finance, health, or skill-building – anything that can yield tangible benefit and progress.\n\nSocially, they tend to have a serious or matter-of-fact tone. They can certainly relax and enjoy friends, but even their socializing often has purpose (like networking with trusted colleagues or discussing meaningful topics one-on-one at a big party rather than mingling aimlessly). The atmosphere they prefer is no-nonsense and meritocratic: show your true self and prove your value.\n\nThey may form close-knit networks of reliable allies rather than broad, casual friend groups – quality over quantity. Outsiders or new ideas aren't rejected outright, but they must prove themselves useful or trustworthy to be welcomed into the inner circle.\n\nCompared to more idealistic quadras, Pragmatic Realists come off as worldly and maybe a bit cynical – they're quick to spot flaws or scams and won't sugarcoat their critique. Yet, among those they respect, they are extremely loyal and supportive, going to great lengths to help a friend or partner achieve a mutual goal. The underlying vibe is 'we're in this together, let's get results'.",
      prismPerspective: "PRISM recognizes Pragmatic Realists as exactly that – grounded go-getters focused on results – but it also broadens their portrait by highlighting the diversity and growth potential within this group. In classical Socionics, Gamma quadra was sometimes painted as the most 'adult' or materialistic group (all about business, money, and self-interest). PRISM acknowledges that these types do excel at cutting through nonsense to achieve outcomes, but it reframes Gamma traits in a more constructive, developmental light.\n\nIndividuals in this quadra are fundamentally driven by efficacy (getting things done right) and authenticity (staying true to one's values/loyalties). That drive can manifest in very positive ways – such as entrepreneurial success, championing reform in a broken system, or steadfastly supporting loved ones – or if unchecked, it can degenerate into workaholism or cynicism (e.g. becoming so focused on goals that one loses trust in others or neglects life's joys).\n\nPRISM stresses that Pragmatic Realists are not one-dimensional 'money machines.' In fact, they often care deeply about self-improvement and even community improvement – they just approach it in a practical, accountable manner. Many will spearhead personal growth initiatives or self-help programs (which sounds a bit like Delta quadra's style) because they take responsibility for making life better, not just for themselves but for those they care about.\n\nImportantly, PRISM highlights that there is no single mold for a Pragmatic Realist. Two individuals of this quadra can look quite different. For example, one ESFp (SEE) might be a brash, hard-driving entrepreneur embodying the forceful, fast-paced side of this group's nature, while another ESFp with a gentler disposition and more patience could almost resemble a Delta-like supportive mentor, focusing on people and long-term well-being.\n\nBoth share the same core Gamma values of productivity and loyalty, but their style and attitude vary due to personal development. PRISM openly embraces such subtype variation and 'cusp' personalities – individuals who have developed some tendencies of a neighboring quadra.\n\nFor instance, an ENTj (LIE) from this quadra who has worked to cultivate more empathy and present-moment appreciation might start to exhibit some Delta quadra vibes (enjoying comfort, exploring new ideas collaboratively) even though their fundamental cognitive wiring remains Gamma. Rather than seeing this as contradictory, PRISM sees personality as a continuum: Pragmatic Realists can learn flexibility, patience, and forgiveness from their Delta counterparts, just as other quadras might learn realism and decisiveness from Pragmatic Realists.\n\nIn summary, PRISM keeps this quadra's backbone of ambition, realism, and loyalty, but enriches their definition by accounting for emotional development and context. A mature Pragmatic Realist at their best will integrate just enough openness, humor, or softness (traits not typically in their forte) to avoid becoming a ruthless caricature.\n\nAnd under stress, even these tough types might surprise you – they could momentarily retreat into the comforts of their opposite quadra (for example, a normally driven ENTj procrastinating with trivial cozy routines when overwhelmed, a fleeting lapse into Alpha/Delta-like indulgence). By charting these dynamic states, PRISM presents Pragmatic Realists as real human beings who adapt, not unchanging efficiency machines. They remain results-focused realists, but with many shades and the capacity to grow, balance, and even occasionally lighten up, given the right circumstances.",
      types: [
        "SEE (ESFp) – Charismatic Operator",
        "ILI (INTp) – Strategic Forecaster",
        "LIE (ENTj) – Executive Strategist",
        "ESI (ISFj) – Loyal Protector"
      ]
    },
    {
      id: "humanitarian-stabilizers",
      name: "Humanitarian Stabilizers",
      formerly: "Delta Core Alignment",
      icon: <Heart className="h-8 w-8 text-primary" />,
      archetype: "Conscientious facilitators who cultivate stability, growth, and well-being for all. This quadra is characterized by steady, supportive efforts to build a better life – for themselves and their community. Humanitarian Stabilizers are ethical optimists: responsible, down-to-earth people with an eye for improvement and a heart for helping. They blend practical organization with compassionate values, seeking gradual progress that benefits everyone.",
      coreValues: "Steady improvement and ethical sincerity. Humanitarian Stabilizers value doing what's right and what works in the long run. They emphasize integrity, trust, and personal values (valuing Fi strongly) – decisions must feel morally sound and considerate of others' well-being.\n\nAt the same time, they prize usefulness and competence (valuing Te): they want their work and relationships to actually improve life in tangible ways. This combination yields a highly conscientious outlook: they tend to be diligent, reliable, and oriented toward sustainable results that align with their principles.\n\nAdditionally, they share the Ne/Si intuitive-sensing pairing with the Alpha group, which means they appreciate openness to possibilities and ideas (Ne) balanced with comfort, stability, and practicality (Si). In simple terms, they are open-minded but not reckless – willing to explore new approaches if it seems useful and humane, and patient enough to implement changes gradually.",
      characteristics: "Among a group of Humanitarian Stabilizers, you'll notice a low-pressure, cooperative atmosphere. These types generally eschew harshness or aggression – they aren't fond of high-conflict, competitive environments (they have weak tolerance for domineering Se force). Instead, they foster a sense of egalitarian friendship: everyone's input is respected, and decisions might be made through calm discussion and consensus.\n\nThere's often a modest, no-frills quality to their gatherings – they can be warm and friendly, but not flashy or hyper-intense. Think of a close-knit club or a community volunteer group where people quietly help each other improve; that's the Delta spirit. They are serious about their commitments and values, yet relaxed in interpersonal style – preferring encouragement over command, and personal authenticity over strict protocol.\n\nIn teams, they often emerge as the supportive backbone: the colleague who makes sure everyone is heard and the project stays on track ethically, or the friend who organizes get-togethers and gently includes the shy newcomer. They may not seek the spotlight, but they excel at creating supportive, stable environments where people can flourish.\n\nOutsiders might sometimes perceive them as 'boring' or overly nice, especially compared to the flashier, high-energy quadras. However, this underrates their quiet strength. These individuals often have a reservoir of patience, resilience, and resourcefulness that keeps groups and projects going when others would burn out. They also have their own kind of creativity: a gentle ingenuity that introduces novel ideas or improvements in a way that everyone can get on board with (subtle Ne at work).",
      prismPerspective: "PRISM views Humanitarian Stabilizers as 'ethical caretakers' and steady builders – the folks who keep things running and growing in a humane way. While Socionics' traditional take sometimes labels this quadra as the most modest and low-key (the people who are good-natured but can fade into the background), PRISM challenges the stereotype that they are simplistic or unambitious. It highlights the quiet versatility and adaptability of these types.\n\nFor instance, even a usually calm, methodical ESTj (LSE) in this group can step up with surprising assertiveness in a crisis, tapping into an unvalued aggressive streak (Se) when urgency calls for it. Likewise, an ENFp (IEE) who is normally gentle might momentarily don a charismatic, rally-the-troops persona (more typical of Beta quadra) to unite others around an important value or cause.\n\nPRISM underscores that these folks are not 'just passive helpers.' They often take initiative in their own style – becoming mentors, guides, or quiet influencers who spark change without needing loud fanfare. They introduce new ideas (thanks to their Ne openness) in approachable, inclusive ways, proving that one can be innovative and stable at the same time.\n\nAnother key nuance PRISM adds is recognizing the range of personalities within this quadra. Humanitarian Stabilizers aren't all cookie-cutter do-gooders. One INFj (EII) in this quadra might indeed be very traditional, reserved, and cautious, while another INFj with a more adventurous streak or an 'extroverted' subtype could be more outgoing and experimental – almost Alpha-like in their playful curiosity.\n\nBoth would still be recognizably Delta in their core values (seeking sincerity, usefulness, and comfort for all), but their life experiences and traits produce different flavors of the same theme. This aligns with PRISM's goal of avoiding one-size-fits-all labels; even the most cooperative, modest Stabilizer might have a rebellious or ambitious streak hiding in them.\n\nIn fact, PRISM points out that Deltas and Gammas (Humanitarian Stabilizers and Pragmatic Realists) have more in common than one might think – they share the same Te/Fi value pairing for productivity and ethics, differing primarily in tempo and focus. Gammas push for big results now with a fast, decisive tempo, whereas Deltas favor gradual growth and personal well-being, moving at a patient pace.\n\nUnderstanding this continuum allows PRISM to guide individuals in learning from each other: a Stabilizer can borrow a page from the Realist's book to be more decisive when opportunity knocks, and a Realist can learn from the Stabilizer's patience and people-focus for long-term teamwork.\n\nOverall, PRISM retains this quadra's image as ethical, growth-oriented facilitators, but gives them credit for a complexity that earlier models might have overlooked. These 'quiet optimists' blend imagination with realism – they believe in a better future but also handle the practical steps to get there – and with time and support, they prove adept at achieving enduring positive change in their communities.\n\nRather than being boring do-gooders, they emerge as the steady innovators, ensuring that lofty ideas (theirs or others') take root and flourish in reality.",
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

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <List className="h-6 w-6" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreAlignments.map((alignment, index) => (
                <a
                  key={alignment.id}
                  href={`#${alignment.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 prism-transition group"
                >
                  {alignment.icon}
                  <div>
                    <div className="font-semibold group-hover:text-primary prism-transition">
                      {alignment.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      (formerly {alignment.formerly})
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Updated PRISM Core Alignments (Renamed and Refined)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Understanding core alignments – groupings of four personality types with shared values – is crucial in both classical Socionics and its modern evolution under the PRISM model. In Socionics, each core alignment consists of four types that share the same valued cognitive elements (two perception and two judgment functions), creating natural "ideological common ground" among them. Members of a core alignment communicate easily and feel an innate camaraderie, while those from different core alignments often clash or misunderstand each other due to differing priorities.
            </p>
            <p className="text-muted-foreground">
              Traditionally, these groups were named Alpha, Beta, Gamma, and Delta core alignments. However, PRISM updates and renames these core alignment definitions to make them more accessible and nuanced for both general audiences and professionals. Each new name captures the archetypal essence of the group while PRISM's dynamic approach adds insight into how individuals in each core alignment can grow and adapt beyond static stereotypes.
            </p>
            <p className="text-muted-foreground">
              Below are the four PRISM core alignments with their updated scope, renamed lexicon, and in-depth definitions:
            </p>
          </CardContent>
        </Card>

        {/* Core Alignments */}
        <div className="space-y-12">
          {coreAlignments.map((coreAlignment, index) => (
            <section key={index} id={coreAlignment.id} className="scroll-mt-24">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center gap-3 mb-2">
                    {coreAlignment.icon}
                    <div>
                      <CardTitle className="text-3xl">{coreAlignment.name}</CardTitle>
                      <CardDescription className="text-base">
                        (formerly {coreAlignment.formerly})
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h4 className="font-semibold text-xl mb-4 text-primary">Archetype</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">{coreAlignment.archetype}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-xl mb-4 text-primary">Core Values</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">{coreAlignment.coreValues}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-xl mb-4 text-primary">Types in this Core Alignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {coreAlignment.types.map((type, typeIndex) => (
                        <div key={typeIndex} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-muted-foreground font-medium">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-xl mb-4 text-primary">Group Characteristics</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">{coreAlignment.characteristics}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-xl mb-4 text-primary">PRISM's Nuanced Perspective</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">{coreAlignment.prismPerspective}</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>

        {/* Key Insights */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Each of these four PRISM core alignments – Innovative Harmonizers, Driven Idealists, Pragmatic Realists, and Humanitarian Stabilizers – offers a distinct strength and perspective, updated from the old Alpha–Delta nomenclature to be more intuitive. By renaming the groups and enriching their descriptions, PRISM makes the concepts accessible to the public while preserving depth for professionals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In practice, understanding these core alignments can improve teamwork, communication, and personal growth: people can better appreciate why certain values or styles resonate between some and conflict with others, and how to leverage each core alignment's strengths.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Moreover, PRISM's dynamic approach reminds us that personality is not static. Even as we identify with a particular core alignment's core values, we can adapt, learn, and integrate qualities from other core alignments over time. The updated core alignment definitions thus serve as guiding archetypes, not pigeonholes – they describe central tendencies and "home bases" for personalities, while encouraging a holistic view of human potential that spans all four corners of the psychological landscape.
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Sources:</strong> The above definitions and insights are synthesized from PRISM's advanced literature and comparative analyses with Socionics, particularly the <em>Core Alignment Groups in Socionics vs. PRISM: A Deep Dive</em> whitepaper, which provides an in-depth exploration of how PRISM reinterprets each core alignment for greater nuance and real-world applicability.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CoreAlignments;