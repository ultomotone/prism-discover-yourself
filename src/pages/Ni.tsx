import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";

const Ni = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/fe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fe
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/ne">
              Next: Ne
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Eye className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Ni – Pattern Forecaster</h1>
              <p className="text-xl text-muted-foreground">Introverted Intuition</p>
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
                Introverted Intuition (Ni) in PRISM is the cognitive process oriented toward patterns, meanings, and temporal connections that lie beneath the surface of immediate reality. Ni turns one's focus inward and forward/backward in time: it's constantly synthesizing information into a cohesive understanding of how things really work and where they are headed. While a sensor might notice what is here and now, Ni notices the invisible threads – the cause-and-effect dynamics, symbolisms, or future implications.
              </p>
              <p>
                An Ni user often experiences sudden insights or gut feelings about events: they "just know" how something will unfold or what an underlying issue is, even if they can't initially articulate why. This is because Ni operates unconsciously in large part, collecting data and processing it in the background until a clear vision emerges.
              </p>
              <p>
                At its core, Ni is about pattern recognition over time. It perceives life almost like a story or a mosaic: discrete happenings form a bigger picture or trend. Strong Ni users have an innate sense that every moment is part of a continuum – today's choices echo yesterday's events and shape tomorrow's outcomes. This gives Ni a strategic, anticipatory character.
              </p>
              <p>
                For example, an Ni-heavy individual might meet someone new and almost immediately sense how that person will fit into their life, or foresee potential conflicts in the relationship long before any surface evidence. They are often drawn to archetypes and metaphors as ways of understanding experiences (the language of symbols resonates with Ni, since symbols compress complex meaning).
              </p>
              <p>
                Ni has been described as feeling "outside of time." When someone engages Ni, they may appear abstracted or lost in thought – indeed they are mentally removed from the present moment, scanning the past for lessons or projecting scenarios into the future. This can yield profound foresight. A mature Ni user can sometimes predict outcomes with uncanny accuracy, not by magic but by deeply internalizing how events tend to progress.
              </p>
              <p>
                Crucially, Ni's insights are holistic and often feel detached from specific details. A person strong in Ni might struggle at times to explain their conclusions because they didn't follow a step-by-step logic – instead, they saw an entire pattern "all at once." This can make Ni seem mysterious or "otherworldly" to those who rely more on explicit reasoning or sensory evidence.
              </p>
              <p>
                In PRISM's context, Ni is conceived not as mystical but as a sophisticated information metabolism that integrates experience, imagination, and insight to guide action. It's like an internal guidance system tuned to long-term and hidden variables. Ni at its best provides a sense of direction and profound understanding – a compass pointing to true north amid the chaos of sensory data.
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
                The acuity of Ni – how well it can forecast and find meaning – depends on its cognitive dimensionality, i.e. the number of information parameters (Experience, Norms, Situation, Time) it can integrate. Different people wield Ni with different levels of depth:
              </p>
              
              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">1D Ni (Experience-only)</h4>
                  <p>
                    At this basic level, Ni draws only on personal, direct experiences to generate its intuitions. The person may have a few potent gut feelings or lessons learned, but their intuitive worldview is limited to what they themselves have observed in life. Consequently, 1D Ni can be quite narrow or even naive. For example, someone with 1D Ni might correctly foresee outcomes in familiar scenarios but they falter outside those scenarios. If something unprecedented happens, they have no internal precedent to guide them.
                  </p>
                  <p>
                    They might make wild guesses or freeze up when asked to envision a future unlike anything they've seen. In novel situations, a 1D Ni user is prone to incorrect patterns – they might assume a current situation will mimic the only vaguely similar thing they remember, even if context differs, leading to misjudgment.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">2D Ni (Experience + Norms)</h4>
                  <p>
                    With two dimensions, Ni starts to incorporate collective and taught knowledge about patterns and meanings. The person not only uses their own experiences but also understands general "rules of thumb" about how things go. For instance, they might have learned through books, education or society that economies boom and bust in cycles, or that "people often regret quick decisions" – things they perhaps haven't lived personally but accept as standard truth.
                  </p>
                  <p>
                    A 2D Ni user can learn from others' experiences; they might listen to elders' advice on life stages and use that to foresee their own trajectory. They can function adequately in predicting or interpreting events that follow well-known patterns or established theory. However, their foresight remains conservative and rote. They work within known frameworks.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">3D Ni (Experience + Norms + Situation)</h4>
                  <p>
                    At three dimensions, Ni becomes significantly more adaptive and inventive. The person combines their own experiences, generalized knowledge, and the specifics of the current context in forming their insights. This means their intuition can handle novel input by analogizing it to something known or tweaking a known pattern to fit unusual circumstances.
                  </p>
                  <p>
                    3D Ni users are the ones who often surprise others with spot-on predictions in scenarios that aren't textbook. They observe subtle cues in the present and integrate them on the fly with what they know. For example, a 3D Ni emergency physician might notice an atypical combination of symptoms in a patient and intuit a diagnosis that "doesn't usually happen" but fits this particular case.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">4D Ni (Experience + Norms + Situation + Time)</h4>
                  <p>
                    At full dimensionality, Ni incorporates the elusive time parameter, granting it a deep, long-range and transferrable vision. A 4D Ni user has an intuitive grasp of how patterns play out over extended timeframes – they can mentally project the current situation years or decades ahead with striking accuracy, because they see not only the immediate situational factors but how those will evolve and interact with future changes.
                  </p>
                  <p>
                    4D Ni also has what we might call temporal transference: the ability to take an understanding from one era or context and apply it to another with minimal concrete commonalities. The "time" dimension also implies Ni can fast forward or rewind situations internally. A person with 4D Ni often reports imagining future scenarios in vivid detail – essentially running mental simulations.
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
                Ni's character and influence depend greatly on which functional block it occupies. Below we describe how Ni tends to manifest when it is in the Core Drive, Internal Critic, Hidden Potential, or Instinctive Self positions of a personality:
              </p>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Core (Ego Block – Leading or Creative Ni)</h4>
                  <p>
                    When Ni is part of the Core Drive, it operates as a principal strength and guiding force for the personality. Core-Ni individuals live by insight and vision. If Ni is Leading (1st function), the person's primary mode of thinking is intuitive pattern-seeking; they view the world through a farsighted, interpretive lens. Such a person (e.g. an INTJ or INFJ in MBTI terms) is often described as a visionary strategist or seer.
                  </p>
                  <p>
                    They trust their gut sense of direction immensely – sometimes to the point of appearing stubborn or unorthodox, since they might ignore what seems obvious to others in favor of what their inner vision tells them is really happening. If Ni is Creative (2nd function), it's slightly less dominant but still a wellspring of strength that supports the leading function.
                  </p>
                  <p>
                    Core Ni manifests as confident foresight and deep interpretations. Such individuals often find meaning in everything; they naturally read between the lines and sometimes need to remember others don't do that as much. Others may experience Core-Ni people as wise beyond their years or "old souls," often turning to them for perspective on tough questions.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Critic (Super-Ego Block – Role or Vulnerable Ni)</h4>
                  <p>
                    When Ni falls into the Internal Critic block, the individual tends to have a fraught or dismissive relationship with intuition and long-term thinking. If Ni is the Role (3rd function), the person is aware that "looking ahead" or reading into things is sometimes necessary, and they can do it to a limited extent, but it's not comfortable or reliable for them.
                  </p>
                  <p>
                    They might play the role of a planner or visionary when circumstances force it, but it feels like acting. For example, an ESFP or ESTP might try to outline a 5-year plan because their job demands it, but privately they feel out of their depth and maybe a bit phony doing so. They prefer immediate action and concrete data; having to hypothesize about unseen meanings or distant futures makes them uneasy.
                  </p>
                  <p>
                    If Ni is Vulnerable (4th function, the weakest), then it is essentially a blind spot or Achilles' heel. The person has minimal grasp of Ni-type processing and usually devalues it. They live almost entirely "in the now" or by practical concerns and tend to scoff at protracted theorizing or questions of destiny.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Hidden (Super-Id Block – Suggestive or Mobilizing Ni)</h4>
                  <p>
                    In the Hidden Potential block, Ni is yearned for and developing, even if it's not initially strong. If Ni is Suggestive (5th function), the individual has a deep, often unspoken longing for guidance, vision, or meaning from outside themselves. They value Ni highly – they are drawn to people or information that provide a sense of direction, interpretation, or long-term perspective that they feel they lack.
                  </p>
                  <p>
                    A classic example is an ESFP or ISFP who might appear very present-focused and spontaneous, but quietly they may feel a void of long-term purpose or an understanding of the "bigger picture." They love when someone comes into their life who can articulate a vision or give them insightful advice about where things are headed.
                  </p>
                  <p>
                    If Ni is Mobilizing (6th function), the person has a latent knack for intuition that develops with encouragement and experience. Early on, Ni-mobilizing folks might not seem very foresightful; they could even avoid deep introspection or long-term planning in youth. However, life has a way of activating this function as they mature or face challenges where intuition is needed.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Instinct (Id Block – Ignoring or Demonstrative Ni)</h4>
                  <p>
                    With Ni in the Instinctive Self, the person possesses significant intuitive ability, but it operates in the background and without value emphasis. If Ni is Ignoring (7th function), the individual actually has a solid implicit grasp of patterns and long-term implications, but they choose not to focus on it, because their priorities lie elsewhere.
                  </p>
                  <p>
                    A classic case would be an ENTP or ENFP who are capable of foresight – in fact, if pressed, they might articulate a very accurate sense of where something is heading – but their preference is to keep exploring ideas or experiences in the moment rather than closing down to one interpretation or outcome.
                  </p>
                  <p>
                    If Ni is Demonstrative (8th function), the person wields Ni effortlessly and extensively, but entirely in support of other functions and without conscious emphasis or pride. They may not even realize how good their Ni is because it's always been second nature. An example might be an ISTJ or ISFJ who often have a very steady, low-key intuition about long-term matters.
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
                The strength expression of Ni – how overtly and energetically one applies their intuition – can vary widely, and it gives clues to an individual's comfort and habit with this function.
              </p>
              
              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">High Strength Expression</h4>
                  <p>
                    High strength expression of Ni is seen in people who are overtly future-focused, contemplative, and interpretive on a regular basis. These individuals frequently talk about why things are happening and where things are going. They might be the friend who constantly analyzes the plot of a TV show for deeper symbolism or who is always two steps ahead in thinking about life plans.
                  </p>
                  <p>
                    In conversation, they often use language of prediction or meaning: "If we do this, then next year…," "The real reason behind this is…," "I suspect that this trend will lead to…." They are comfortable with abstraction and may actually prefer it over concrete discussion.
                  </p>
                  
                  <div className="mt-4">
                    <h5 className="font-semibold">Signs of Strong Ni Expression:</h5>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Having long-term plans or visions that are revisited often</li>
                      <li>Frequently engaging in reflective or imaginative activities</li>
                      <li>Being drawn to big-picture or strategic roles in work and life</li>
                      <li>Usually presenting as calm and deliberate</li>
                      <li>Enjoying solitary thought and being difficult to distract when "tuned in"</li>
                      <li>Having an air of wisdom or mystery</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Low Strength Expression</h4>
                  <p>
                    Low strength expression of Ni manifests as a person who rarely verbalizes or acts on intuitive hunches. It's not necessarily that they lack intuition entirely (everyone has some), but they don't rely on it much and might even ignore it. Such individuals are markedly present-oriented or focused on concrete specifics.
                  </p>
                  
                  <div className="mt-4">
                    <h5 className="font-semibold">Signs include:</h5>
                    <ul className="list-disc pl-6 mt-2">
                      <li>A tendency to short-term planning only</li>
                      <li>Taking things at face value rather than reading into subtext</li>
                      <li>A preference for reacting to events rather than anticipating them</li>
                      <li>Seldom speculating about the future or hidden meanings in conversation</li>
                      <li>Often appearing very practical or spontaneous</li>
                      <li>Getting surprised more often by outcomes</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Context-Dependent Expression</h4>
                  <p>
                    Some individuals have medium or context-dependent Ni expression. They might not consider themselves intuitive generally, but in a specific field where they have a lot of knowledge, they suddenly show strong Ni usage. For example, a doctor who in daily life is very here-and-now might inside the hospital develop keen prognostic intuition about patients.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Dynamic Nature:</p>
                  <p>
                    From PRISM's dynamic approach, strength can change. Under stress, even a typically low-Ni person might have a sudden burst of intuition. Conversely, exhaustion or emotional overload can suppress even a strong Ni user's expression. Emotional overlays, such as those measured by Neuroticism, can also influence Ni's flavor: a high-anxiety person might experience Ni as racing thoughts of future catastrophe, whereas a very stable person might wield Ni in a more optimistic and controlled manner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/fe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fe
            </a>
          </Button>
          <Button asChild>
            <a href="/ne">
              Next: Ne
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Ni;