import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

const Fe = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/fi">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fi
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/ni">
              Next: Ni
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Fe – Interpersonal Dynamics</h1>
              <p className="text-xl text-muted-foreground">Extraverted Feeling</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Narrative Definition */}
          <Card>
            <CardHeader>
              <CardTitle>Narrative Definition</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Extraverted Feeling (Fe) in PRISM is the cognitive process attuned to the human atmosphere – it reads and influences the emotional "weather" in a group. An Fe-oriented mind is constantly monitoring interpersonal dynamics: who is comfortable or uneasy, who needs encouragement, how the overall mood is trending. Fe users empathize readily and often adjust their own expression to foster harmony. They tend to openly communicate feelings (smiles, reassuring words, warm tones) as a way to affect those around them.
              </p>
              <p>
                The focus is on collective morale and connection – ensuring that everyone feels included, heard, and uplifted. Whereas its counterpart (Introverted Feeling) cares for personal or a few individuals' feelings, Fe works broadly to manage group emotions. For example, at a gathering with newcomers, an Fe-driven person will feel responsible for welcoming them and making them comfortable, instinctively seeing it as their role to get everyone "on the same wavelength" emotionally.
              </p>
              <p>
                This element strives for external harmony as an end in itself: decisions and values are evaluated by their impact on people as a whole. In practice, strong Fe can make someone appear socially adept – sensitive to etiquette, quick to smooth over conflicts, and eager to create a positive, cooperative environment. They often serve as the "emotional glue" in teams or families, aligning individual needs with group well-being.
              </p>
              <p>
                However, Fe is not just about being nice or agreeable; it's a sophisticated radar and response system for interpersonal energy. Healthy Fe leads with genuine warmth, altruism, and consensus-building. In contrast, strained Fe may manifest as people-pleasing (sacrificing one's own needs too much) or excessive concern with social approval. Overall, Fe in PRISM represents the outward-facing empath – a mode of cognition devoted to understanding and guiding the hearts of others, thereby maintaining social harmony.
              </p>
            </CardContent>
          </Card>

          {/* Dimensionality */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensionality (1D–4D)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Fe's effectiveness depends on its dimensionality, i.e. how many "learning lenses" – personal Experience, social Norms, situational Adaptability, and Time foresight – it can draw on. Lower-dimensional Fe is limited and rigid, whereas higher-dimensional Fe is more insightful and adaptive.
              </p>
              
              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">1D Fe (Experience-only)</h4>
                  <p>
                    The person relies purely on firsthand experiences to guide social behavior. They remember what they have felt or seen in the past and apply those few templates, often in a simplistic way. If they've learned one approach to, say, comforting a friend, they will use that method every time. But when faced with a new social situation for which they have no personal precedent, 1D Fe users can feel utterly lost or respond inappropriately. They may fail to "read the room" or default to awkward clichés because they lack both broader social knowledge and flexibility.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">2D Fe (Experience + Norms)</h4>
                  <p>
                    In addition to personal experience, the person has internalized common social norms and rules. This adds a layer of "as one should" knowledge: they know what is conventionally polite, what emotional responses are expected in various situations, etc. A 2D Fe user can therefore learn from others' examples or cultural guidelines without personally living through every scenario. For instance, they might follow etiquette at a wedding or console someone by mimicking socially-taught condolences. Within normal contexts, their Fe appears adequate: they greet people properly, say thank you, and generally meet baseline expectations. However, their emotional engagement remains somewhat formulaic.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">3D Fe (Experience + Norms + Situation)</h4>
                  <p>
                    Here Fe gains true situational intelligence. The person not only remembers experiences and follows social norms, but can also size up the unique emotional context of the moment and adjust accordingly. 3D Fe users demonstrate social creativity: they draw on a rich toolbox of learned and lived knowledge, then modify their approach to fit the here-and-now. For example, a 3D Fe manager leading a team meeting can sense if morale is low on a particular day and spontaneously inject a joke or supportive comment to lift spirits – even if it deviates from the usual protocol.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">4D Fe (Experience + Norms + Situation + Time)</h4>
                  <p>
                    At full dimensionality, Fe becomes a far-reaching strategic empathy. The person not only handles immediate dynamics expertly, but also anticipates how emotional scenarios will unfold over time. They have a long-term sense of cause and effect in the social realm: how today's words might impact relationships next week or next year. This foresight allows them to guide group dynamics proactively. For instance, a 4D Fe community leader might intuit that a small misunderstanding, if left unaddressed, could snowball into conflict – so they mediate early, before tensions grow.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Manifestation */}
          <Card>
            <CardHeader>
              <CardTitle>Block Manifestation: Core, Critic, Hidden, Instinct</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Fe's character will look different depending on which functional block it occupies in a personality's structure. PRISM defines four dynamic blocks – Core Drive, Internal Critic, Hidden Potential, Instinctive Self – corresponding to how traditional Model A ordered the eight functions.
              </p>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Core (Ego Block – Leading or Creative Fe)</h4>
                  <p>
                    When Fe is in the Core Drive of a personality, it is a principal strength and a valued compass. Core-Fe individuals live in feeling. If Fe is Leading (the very first function), the person's primary approach to life is through empathizing and bonding – they instinctively take charge of group feelings. They are often charismatic connectors, social organizers, or caretakers setting a warm tone. Example: An ESFJ-type teacher (Fe leading) will greet each student with enthusiasm, remember birthdays, and defuse classroom tensions with ease – her day is guided by maintaining positive rapport.
                  </p>
                  <p>
                    If Fe is Creative (second function), it works hand-in-hand with another dominant process but is still highly fluent. These people might not always lead with emotion, but they readily tap into Fe to support their goals. For instance, an ENFJ (Fe-Ni) visionary might primarily focus on a long-term mission (Ni), yet constantly use Fe to rally others around that vision, reading their audience and persuading with heartfelt conviction.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Critic (Super-Ego Block – Role or Vulnerable Fe)</h4>
                  <p>
                    In the Internal Critic position, Fe is comparatively weak and usually not valued, which leads to tension and self-consciousness around Fe matters. If Fe is the Role (3rd function), the person is aware of social expectations but finds fulfilling them burdensome. They might put on a polite or friendly face in public because they know "it's expected" (say, an IT specialist consciously smiling through a customer service shift), but this Fe act is tiring and shallow for them.
                  </p>
                  <p>
                    If Fe is Vulnerable (4th, the weakest function), it is essentially a blind spot or sore spot. The person lacks both skill and comfort in Fe's realm. They may be genuinely baffled by emotional nuances, appear cold or tactless without meaning to, and become anxious or defensive when pushed into "heart-to-heart" scenarios.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Hidden (Super-Id Block – Suggestive or Mobilizing Fe)</h4>
                  <p>
                    In the Hidden Potential positions, Fe is yearned for and nurtured rather than fully mature initially. If Fe is Suggestive (5th function), the person unconsciously craves positive emotional input from others. They greatly value a warm, supportive atmosphere – it energizes and completes them – yet they don't generate it well themselves. You might see this in a normally reserved individual who comes alive around an upbeat, affectionate friend; the friend's Fe essentially "feeds" them what they lack.
                  </p>
                  <p>
                    If Fe is Mobilizing (6th function), the person has a nascent talent for it that blooms later or under guidance. In youth they might appear a bit emotionally awkward or indifferent, but through life experiences, their Fe "switch" flips on and starts developing. This often happens in transformative moments: for example, a highly logical person might discover in their 30s that supporting a friend through a crisis awakened a compassionate leader in them they never knew existed.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Instinct (Id Block – Ignoring or Demonstrative Fe)</h4>
                  <p>
                    In the Instinctive Self, Fe is operational in the background – strong but largely unrecognized or unvalued by the person. If Fe is Ignoring (7th function), the individual actually can handle emotional dynamics competently, but they prefer not to. This position is often the "inverse" of the core. For example, a very logical, pragmatic type might have Ignoring Fe: they are capable of empathy and sometimes surprise others by being quite insightful or comforting in a crisis, but they generally minimize the role of feelings in their decisions and worldview.
                  </p>
                  <p>
                    When Fe is Demonstrative (8th function), it is as powerful as the leading function in raw capacity, yet the person is mostly unaware of how much they utilize it. They wield Fe effortlessly in service of their other aims, but attach no ego to it. People with Demonstrative Fe often provide emotional support or set a pleasant tone as a byproduct of what they do, all while insisting that interpersonal stuff doesn't concern them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strength Expression */}
          <Card>
            <CardHeader>
              <CardTitle>Strength Expression</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Strength expression refers to how actively and forcefully Fe is used by an individual, which can vary even at similar skill levels. High strength expression of Fe is evident in people who seem to live and breathe social interaction – they frequently initiate contact, vocalize emotions, and influence group mood with intensity.
              </p>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold">Signs of Strong Fe Expression:</h4>
                  <ul className="list-disc pl-6">
                    <li>Being the one to organize get-togethers or check in on everyone's feelings</li>
                    <li>Readily offering hugs or compliments</li>
                    <li>Stepping into a mediator role during conflicts</li>
                    <li>Projecting an approachable, caring aura</li>
                    <li>Having high emotional intelligence in practice (noticing subtle facial cues)</li>
                    <li>An inspiring or uplifting quality that boosts morale</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Low Fe Expression:</h4>
                  <p>
                    A person with low Fe expression might be perfectly kind-hearted yet rarely verbalize it. They could sit in a meeting and mostly stay factual or task-focused, only occasionally offering a supportive remark. They may prefer to show caring through actions (like doing a favor) rather than overt emotional display. Others might perceive them as neutral or reserved in affect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State/Overlay Modulation */}
          <Card>
            <CardHeader>
              <CardTitle>State & Overlay Shifts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Fe does not operate in a vacuum; its expression and effectiveness are highly sensitive to a person's temporary state and emotional overlays. PRISM builds this into its model by recognizing that factors like stress, mood, and emotional overlays can modulate how Fe functions.
              </p>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold">In Flow State (Positive)</h4>
                  <p>
                    When individuals feel safe, confident, and supported, their Fe often amplifies in a healthy way: they become more giving and perceptive. A person who might be shy in public could become the gentle heartbeat of a small group in a relaxed setting – cracking jokes, doling out hugs, intuitively coordinating the group's enjoyment. In flow, Fe users also recover faster from small social missteps; they feel attuned and thus resilient.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Under Stress (Negative)</h4>
                  <p>
                    A typically warm individual, when overwhelmed by stress or negative emotions, might experience a kind of Fe collapse or overcompensation. Some become hyper-sensitive and reactive – they may misread neutral comments as personal slights, or swing between emotional outbursts and withdrawals. Their Fe, which normally radiates outward, might turn inward as worry: "Do people hate me? I feel everyone's upset!"
                  </p>
                  <p>
                    There's also the phenomenon of Fe overdrive in stress: some Fe users double-down on trying to fix harmony, but in a panicked, clumsy way. They might incessantly apologize or attempt to "make everyone happy" to an extreme, which paradoxically can annoy or overwhelm others.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Emotional Overlays</h4>
                  <p>
                    Emotional overlays such as baseline anxiety (Neuroticism) or mood disorders also color Fe's operation. A high-Neuroticism Fe user may constantly second-guess social interactions. Their Fe is active, but tinged with fear: "Did I offend them? Are they mad at me?" On the flip side, a very emotionally stable (low Neuroticism) person with Fe might exert a more steady and calming Fe influence – they don't get flustered easily and can soothe others without absorbing the negativity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developmental Arc */}
          <Card>
            <CardHeader>
              <CardTitle>Developmental Arc</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                The journey of Fe over a person's development is a rich demonstration of PRISM's emphasis on growth and plasticity. Fe, perhaps more than some elements, matures through social learning and life experience – as one accumulates emotional encounters (joys, sorrows, conflicts, intimacies), one's Fe can deepen significantly.
              </p>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Early Life (Childhood through Adolescence)</h4>
                  <p>
                    Fe often manifests in a relatively unidimensional way. Children who favor Fe may show it as simple friendliness or distress at discord. For example, a child with strong Fe might be the "peacemaker" on the playground, quick to say sorry or hug a crying friend. But their understanding of complex emotions is limited to personal experience (1D or 2D Fe) – a young teen might earnestly comfort a friend in a way that's comforting to them, but miss what the friend uniquely needs.
                  </p>
                  <p>
                    Adolescence is crucial for Fe development: as one navigates friendships, romance, and group identity, the Internal Critic voices become loud. A teen with Fe in the Critic block might feel painfully aware of not fitting in or of saying "the wrong thing," which can motivate them either to practice Fe behaviors or to become cynical about emotions as a defense.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Young Adulthood (20s)</h4>
                  <p>
                    The Core block functions typically solidify. If Fe is core, this is when it truly steps into its own. A person in their twenties with dominant Fe will refine their style: maybe they learn through a few social errors what authenticity means (no longer just cheerleading, but listening too), or they encounter diversity in college/work that teaches them new emotional norms (expanding from 2D to 3D).
                  </p>
                  <p>
                    Many Fe users at this stage start integrating the normative dimension – understanding broad cultural expectations – with their personal touch. For instance, an Fe-leading individual might intern in customer service and learn professional empathy scripts, adding that to their natural kindness.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Mid-Life (30s and 40s)</h4>
                  <p>
                    Often brings a broadening of Fe through career and family. If Fe is a Hidden Potential (5th/6th) function for someone, this is the period it frequently activates. For example, an engineer who largely ignored emotions in his 20s might, upon becoming a parent in his 30s, suddenly tap into a well of Fe for nurturing his children – learning to be gentle, storytelling, encouraging – and find unexpected fulfilment in it.
                  </p>
                  <p>
                    For those with Fe in Core, mid-life can be a time of mastery and potential challenge: they often take on leadership roles that demand emotional intelligence (managing a team, raising a family, etc.), which further hone their Fe into a more strategic 4D form. However, this is also when they must guard against Fe fatigue – many in caretaking roles experience a mid-life crisis of "who takes care of me?"
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Later Life (50s and beyond)</h4>
                  <p>
                    An interesting trend is reconciliation with Fe in later life for Thinking types: an analytics-driven person might reach their 50s or 60s and, having achieved many logical goals, begin to appreciate the primacy of relationships and community. They often describe "melting" or softening emotionally – perhaps grandchildren or retirement friendships coax out a latent Fe they had sidelined.
                  </p>
                  <p>
                    A fully mature Fe – often seen in wise elders, seasoned leaders, or long-practicing counselors – has a particular balance to it. These individuals have seen many emotional cycles and thus use Fe with a calm, patient hand. Early on, Fe might have been about pleasing others or avoiding rejection; later, it evolves into truly serving others and guiding with integrity.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">Key Developmental Theme:</p>
                <p>
                  The evolution from "external harmony at all costs" to "authentic harmony through growth" – a developmental refinement of Fe's purpose. Unlike a static type model, PRISM views Fe as a capacity that can evolve: from the budding empath of youth who feels everything but doesn't know what to do, to the skilled diplomat of mid-life who navigates feeling and reason, to perhaps the quiet sage of later years who emanates understanding.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/fi">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fi
            </a>
          </Button>
          <Button asChild>
            <a href="/ni">
              Next: Ni
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Fe;